import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EligibilityService } from './eligibility.service';
import { MemberEligibilityEntity, EligibilityStatus } from './entities/member-eligibility.entity';
import { BenefitPlanEntity } from './entities/benefit-plan.entity';
import { EnrollmentEventEntity } from './entities/enrollment-event.entity';

// ─── Mocks ──────────────────────────────────────────

const mockEligibilityRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockPlanRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockEnrollmentRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

const ORG_ID = '00000000-0000-0000-0000-000000000001';

function makeEligibility(overrides: Partial<MemberEligibilityEntity> = {}): MemberEligibilityEntity {
  return {
    id: 'elig-001',
    organizationId: ORG_ID,
    memberId: 'AHP100001',
    subscriberId: 'AHP100001',
    planId: 'PPO-GOLD-2024',
    coverageType: 'medical',
    status: EligibilityStatus.ACTIVE,
    effectiveDate: '2024-01-01',
    terminationDate: null,
    memberName: 'James Wilson',
    relationship: 'self',
    benefits: {
      medical: { covered: true, copay: 25, coinsurance: 20, authRequired: false },
    },
    accumulators: {
      individualDeductible: { applied: 250, limit: 1000, remaining: 750 },
      individualOOP: { applied: 800, limit: 5000, remaining: 4200 },
    },
    lastVerifiedAt: new Date().toISOString(),
    verificationSource: 'real_time',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

function makePlan(overrides: Partial<BenefitPlanEntity> = {}): BenefitPlanEntity {
  return {
    id: 'plan-001',
    organizationId: ORG_ID,
    planName: 'Apex PPO Gold',
    planId: 'PPO-GOLD-2024',
    planType: 'PPO',
    effectiveDate: '2024-01-01',
    isActive: true,
    metalLevel: 'gold',
    deductibles: { individualInNetwork: 1000 },
    oopMaximums: { individualInNetwork: 5000 },
    premiums: { employeeOnly: 450 },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

describe('EligibilityService', () => {
  let service: EligibilityService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EligibilityService,
        { provide: getRepositoryToken(MemberEligibilityEntity), useValue: mockEligibilityRepo },
        { provide: getRepositoryToken(BenefitPlanEntity), useValue: mockPlanRepo },
        { provide: getRepositoryToken(EnrollmentEventEntity), useValue: mockEnrollmentRepo },
      ],
    }).compile();

    service = module.get<EligibilityService>(EligibilityService);
  });

  describe('verifyEligibility', () => {
    it('should return eligible status for active member', async () => {
      const eligibility = makeEligibility();
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      const result = await service.verifyEligibility(
        { memberId: 'AHP100001', serviceDate: '2024-06-15' },
        ORG_ID,
      );

      expect(result).toBeDefined();
      expect(result.eligible).toBe(true);
      expect(result.memberId).toBe('AHP100001');
      expect(result.status).toBe(EligibilityStatus.ACTIVE);
      expect(result.transactionId).toMatch(/^ELG-/);
    });

    it('should return ineligible for unknown member', async () => {
      mockEligibilityRepo.findOne.mockResolvedValue(null);

      const result = await service.verifyEligibility(
        { memberId: 'UNKNOWN-001' },
        ORG_ID,
      );

      expect(result.eligible).toBe(false);
    });

    it('should return ineligible for terminated member', async () => {
      const eligibility = makeEligibility({
        status: EligibilityStatus.ACTIVE,
        terminationDate: '2024-03-01',
      });
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      const result = await service.verifyEligibility(
        { memberId: 'AHP100001', serviceDate: '2024-06-15' },
        ORG_ID,
      );

      // Service date is after termination date, so should be ineligible
      expect(result.eligible).toBe(false);
    });

    it('should return ineligible for inactive status', async () => {
      const eligibility = makeEligibility({
        status: EligibilityStatus.INACTIVE,
      });
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      const result = await service.verifyEligibility(
        { memberId: 'AHP100001', serviceDate: '2024-06-15' },
        ORG_ID,
      );

      expect(result.eligible).toBe(false);
    });

    it('should look up by subscriber ID when member ID not provided', async () => {
      const eligibility = makeEligibility();
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      await service.verifyEligibility(
        { subscriberId: 'AHP100001' },
        ORG_ID,
      );

      expect(mockEligibilityRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ subscriberId: 'AHP100001' }),
        }),
      );
    });

    it('should include accumulators in response', async () => {
      const eligibility = makeEligibility();
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      const result = await service.verifyEligibility(
        { memberId: 'AHP100001' },
        ORG_ID,
      );

      expect(result.accumulators).toBeDefined();
    });

    it('should generate unique transaction IDs', async () => {
      const eligibility = makeEligibility();
      const plan = makePlan();
      mockEligibilityRepo.findOne.mockResolvedValue(eligibility);
      mockPlanRepo.findOne.mockResolvedValue(plan);

      const result1 = await service.verifyEligibility(
        { memberId: 'AHP100001' },
        ORG_ID,
      );
      const result2 = await service.verifyEligibility(
        { memberId: 'AHP100001' },
        ORG_ID,
      );

      expect(result1.transactionId).not.toBe(result2.transactionId);
    });
  });
});
