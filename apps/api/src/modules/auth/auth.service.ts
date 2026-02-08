import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { ROLE_PERMISSIONS, UserRole } from '@apex-health/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      this.logger.warn(`Login attempt with unknown email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check account lock
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${minutesRemaining} minutes.`);
    }

    // Verify password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set. Please use SSO or reset password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        this.logger.warn(`Account locked due to too many failed attempts: ${email}`);
      }
      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    // Generate tokens
    const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    this.logger.log(`User logged in: ${user.email} (${user.role})`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
        permissions,
        mfaEnabled: user.mfaEnabled,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async validateUser(userId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async createUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    organizationId: string;
    department?: string;
    title?: string;
  }): Promise<UserEntity> {
    const existing = await this.userRepository.findOne({
      where: { email: data.email.toLowerCase(), organizationId: data.organizationId },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists in this organization');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = this.userRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      organizationId: data.organizationId,
      department: data.department,
      title: data.title,
      passwordChangedAt: new Date(),
    });

    const saved = await this.userRepository.save(user);
    this.logger.log(`User created: ${saved.email} (${saved.role}) in org ${saved.organizationId}`);
    return saved;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.validateUser(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const permissions = ROLE_PERMISSIONS[user.role as UserRole] || [];
      const newPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        permissions,
      };

      return { accessToken: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (user.passwordHash) {
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordChangedAt = new Date();
    await this.userRepository.save(user);
    this.logger.log(`Password changed for user: ${user.email}`);
  }

  async getUsersByOrganization(organizationId: string): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }
}
