import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserEntity } from './entities/user.entity';

// ─── Mocks ──────────────────────────────────────────

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn(),
};

const ORG_ID = '00000000-0000-0000-0000-000000000001';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 'user-001',
    email: 'test@apexhealth.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'org_admin',
    organizationId: ORG_ID,
    department: 'IT',
    title: 'Admin',
    passwordHash: '$2b$12$hashedpassword',
    isActive: true,
    mfaEnabled: false,
    failedLoginAttempts: 0,
    lockedUntil: undefined,
    lastLoginAt: null,
    passwordChangedAt: new Date(),
    permissions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as UserEntity;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should throw UnauthorizedException for unknown email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login('unknown@test.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for locked accounts', async () => {
      const user = makeUser({
        lockedUntil: new Date(Date.now() + 15 * 60 * 1000), // Locked for 15 more minutes
      });
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.login('test@apexhealth.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const user = makeUser();
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login('test@apexhealth.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should increment failed login attempts on wrong password', async () => {
      const user = makeUser({ failedLoginAttempts: 3 });
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login('test@apexhealth.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ failedLoginAttempts: 4 }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const user = makeUser({ failedLoginAttempts: 4 });
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(service.login('test@apexhealth.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should return tokens on successful login', async () => {
      const user = makeUser();
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login('test@apexhealth.com', 'correctpassword');

      expect(result).toBeDefined();
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@apexhealth.com');
    });

    it('should reset failed attempts on successful login', async () => {
      const user = makeUser({ failedLoginAttempts: 3 });
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      await service.login('test@apexhealth.com', 'correctpassword');

      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          failedLoginAttempts: 0,
          lockedUntil: undefined,
        }),
      );
    });

    it('should throw for accounts without password hash', async () => {
      const user = makeUser({ passwordHash: undefined as any });
      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(service.login('test@apexhealth.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('JWT token generation', () => {
    it('should include correct payload in JWT', async () => {
      const user = makeUser({ role: 'claims_processor' });
      mockUserRepository.findOne.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      await service.login('test@apexhealth.com', 'correctpassword');

      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-001',
          email: 'test@apexhealth.com',
          role: 'claims_processor',
          organizationId: ORG_ID,
        }),
      );
    });
  });
});
