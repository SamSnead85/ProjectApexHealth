import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getQueueToken } from '@nestjs/bull';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimEntity } from './entities/claim.entity';
import { ClaimServiceLineEntity } from './entities/claim-service-line.entity';

// ─── Mock Repositories ─────────────────────────────

const mockClaimRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  createQueryBuilder: jest.fn(),
  count: jest.fn(),
};

const mockServiceLineRepository = {
  create: jest.fn(),
  save: jest.fn(),
};

const mockQueue = {
  add: jest.fn(),
};

const ORG_ID = '00000000-0000-0000-0000-000000000001';

// ─── Test Claim Factory ─────────────────────────────

function makeClaim(overrides: Partial<ClaimEntity> = {}): ClaimEntity {
  return {
    id: 'claim-001',
    organizationId: ORG_ID,
    claimNumber: 'CLM-2024-000001',
    type: 'professional',
    status: 'received',
    source: 'portal',
    memberId: 'AHP100001',
    patientFirstName: 'James',
    patientLastName: 'Wilson',
    patientDob: '1985-03-15',
    patientGender: 'male',
    memberPlanId: 'PPO-GOLD-2024',
    renderingProviderNpi: '1234567890',
    renderingProviderName: 'Dr. Sarah Johnson',
    placeOfServiceCode: '11',
    serviceFromDate: new Date().toISOString().split('T')[0],
    serviceToDate: new Date().toISOString().split('T')[0],
    receivedDate: new Date().toISOString().split('T')[0],
    primaryDiagnosisCode: 'M54.5',
    primaryDiagnosisDescription: 'Low back pain',
    additionalDiagnosisCodes: [],
    totalChargedAmount: 225,
    totalAllowedAmount: 0,
    totalPaidAmount: 0,
    totalMemberResponsibility: 0,
    totalDeductible: 0,
    totalCopay: 0,
    totalCoinsurance: 0,
    aiConfidenceScore: null,
    aiRecommendation: null,
    aiFlags: [],
    aiAnalysis: null,
    adjudicationRules: [],
    notes: [],
    adjustmentCodes: [],
    serviceLines: [{
      id: 'line-001',
      lineNumber: 1,
      procedureCode: '99214',
      procedureDescription: 'Office visit, established, moderate',
      units: 1,
      chargedAmount: 225,
      allowedAmount: 0,
      paidAmount: 0,
      status: 'pending',
    }],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as any;
}

describe('ClaimsService', () => {
  let service: ClaimsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClaimsService,
        { provide: getRepositoryToken(ClaimEntity), useValue: mockClaimRepository },
        { provide: getRepositoryToken(ClaimServiceLineEntity), useValue: mockServiceLineRepository },
        { provide: getQueueToken('claims-processing'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ClaimsService>(ClaimsService);
  });

  describe('findById', () => {
    it('should find a claim by ID', async () => {
      const claim = makeClaim();
      mockClaimRepository.findOne.mockResolvedValue(claim);

      const result = await service.findById('claim-001', ORG_ID);

      expect(result).toBeDefined();
      expect(result.claimNumber).toBe('CLM-2024-000001');
      expect(mockClaimRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'claim-001', organizationId: ORG_ID },
        }),
      );
    });

    it('should throw NotFoundException when claim does not exist', async () => {
      mockClaimRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent', ORG_ID))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('adjudicate', () => {
    it('should reject adjudication on already-adjudicated claims', async () => {
      const claim = makeClaim({ status: 'approved' });
      mockClaimRepository.findOne.mockResolvedValue(claim);

      await expect(service.adjudicate('claim-001', ORG_ID))
        .rejects.toThrow(BadRequestException);
    });

    it('should only adjudicate claims in received or validated status', async () => {
      const claim = makeClaim({ status: 'denied' });
      mockClaimRepository.findOne.mockResolvedValue(claim);

      await expect(service.adjudicate('claim-001', ORG_ID))
        .rejects.toThrow(BadRequestException);
    });

    it('should successfully adjudicate a valid claim', async () => {
      const claim = makeClaim({ status: 'received' });
      mockClaimRepository.findOne
        .mockResolvedValueOnce(claim) // First call for adjudicate -> findById
        .mockResolvedValueOnce({ ...claim, status: 'adjudicated' }); // Second call after save
      mockClaimRepository.save.mockResolvedValue(claim);

      const result = await service.adjudicate('claim-001', ORG_ID);

      expect(mockClaimRepository.save).toHaveBeenCalled();
    });
  });

  describe('approve', () => {
    it('should approve a claim in in_review status', async () => {
      const claim = makeClaim({ status: 'in_review' });
      mockClaimRepository.findOne
        .mockResolvedValueOnce(claim)
        .mockResolvedValueOnce({ ...claim, status: 'approved' });
      mockClaimRepository.save.mockResolvedValue({ ...claim, status: 'approved' });

      const result = await service.approve('claim-001', 'user-1', 'Admin', ORG_ID);

      expect(mockClaimRepository.save).toHaveBeenCalled();
    });

    it('should reject approval of already denied claims', async () => {
      const claim = makeClaim({ status: 'denied' });
      mockClaimRepository.findOne.mockResolvedValue(claim);

      await expect(service.approve('claim-001', 'user-1', 'Admin', ORG_ID))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('claim status transitions', () => {
    it('should not allow moving from paid to received', async () => {
      const claim = makeClaim({ status: 'paid' });
      mockClaimRepository.findOne.mockResolvedValue(claim);

      await expect(service.adjudicate('claim-001', ORG_ID))
        .rejects.toThrow(BadRequestException);
    });
  });
});
