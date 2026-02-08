import {
  IsString, IsOptional, IsEnum, IsUUID, IsDateString,
  IsNumber, IsObject, ValidateNested, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EligibilityStatus, MemberRelationship } from '../entities/member-eligibility.entity';
import { EnrollmentEventType } from '../entities/enrollment-event.entity';

// ─── Verify Eligibility ────────────────────────────

export class VerifyEligibilityDto {
  @ApiPropertyOptional({ description: 'Member ID to look up directly' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Subscriber ID for dependent lookup' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'Member first name for demographic lookup' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Member last name for demographic lookup' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Service date to check eligibility for (defaults to today)' })
  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @ApiPropertyOptional({ description: 'Specific service type code to check benefits for' })
  @IsOptional()
  @IsString()
  serviceTypeCode?: string;

  @ApiPropertyOptional({ description: 'Provider NPI for network check' })
  @IsOptional()
  @IsString()
  providerNpi?: string;
}

// ─── Eligibility Response (not a DTO, but returned by the service) ──

export class EligibilityResponse {
  eligible: boolean;
  memberId: string;
  subscriberId: string;
  memberName: string;
  status: EligibilityStatus;
  planInfo: {
    planId: string;
    planName: string;
    planType: string;
    groupId?: string;
  };
  coverageDates: {
    effectiveDate: string;
    terminationDate?: string;
  };
  benefits?: Record<string, any>;
  accumulators: {
    individualDeductible?: { used: number; limit: number };
    familyDeductible?: { used: number; limit: number };
    individualOopMax?: { used: number; limit: number };
    familyOopMax?: { used: number; limit: number };
  };
  relationship: MemberRelationship;
  verifiedAt: string;
  transactionId: string;
}

// ─── Enroll Member ─────────────────────────────────

export class EnrollMemberDto {
  @ApiProperty({ description: 'Type of enrollment event' })
  @IsEnum(EnrollmentEventType)
  type: EnrollmentEventType;

  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'Subscriber ID' })
  @IsString()
  subscriberId: string;

  @ApiPropertyOptional({ description: 'Group ID' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiProperty({ description: 'Benefit plan ID to enroll into' })
  @IsUUID()
  planId: string;

  @ApiProperty({ description: 'Effective date of coverage (YYYY-MM-DD)' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ description: 'Relationship to subscriber' })
  @IsOptional()
  @IsEnum(MemberRelationship)
  relationship?: MemberRelationship;
}

// ─── Terminate Member ──────────────────────────────

export class TerminateMemberDto {
  @ApiProperty({ description: 'Member ID to terminate' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'Termination reason', enum: ['voluntary', 'involuntary', 'non_payment', 'death', 'loss_of_eligibility', 'cobra_exhausted', 'other'] })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'Effective date of termination (YYYY-MM-DD)' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ description: 'Additional notes about the termination' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ─── Search Members ────────────────────────────────

export class SearchMembersDto {
  @ApiPropertyOptional({ description: 'Member ID' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Subscriber ID' })
  @IsOptional()
  @IsString()
  subscriberId?: string;

  @ApiPropertyOptional({ description: 'First name (partial match)' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name (partial match)' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Date of birth (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Eligibility status filter', enum: EligibilityStatus })
  @IsOptional()
  @IsEnum(EligibilityStatus)
  status?: EligibilityStatus;

  @ApiPropertyOptional({ description: 'Plan ID filter' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;
}

// ─── Update Accumulators ───────────────────────────

export class UpdateAccumulatorsDto {
  @ApiPropertyOptional({ description: 'Amount to add to individual deductible used' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  deductibleAmount?: number;

  @ApiPropertyOptional({ description: 'Amount to add to individual OOP max used' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oopAmount?: number;

  @ApiPropertyOptional({ description: 'Amount to add to family deductible used' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  familyDeductibleAmount?: number;

  @ApiPropertyOptional({ description: 'Amount to add to family OOP max used' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  familyOopAmount?: number;

  @ApiPropertyOptional({ description: 'Claim ID that triggered this update' })
  @IsOptional()
  @IsString()
  claimId?: string;
}
