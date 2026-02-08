import {
  IsString, IsOptional, IsEnum, IsUUID, IsDateString,
  IsNumber, IsArray, ValidateNested, IsObject,
  Min, Max, ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  PriorAuthStatus, PriorAuthUrgency, PriorAuthType,
} from '../entities/prior-auth.entity';

// ─── Requested Procedure DTO ───────────────────────

export class RequestedProcedureDto {
  @ApiProperty({ description: 'Procedure code (CPT/HCPCS)', example: '27447' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Code system (CPT, HCPCS, ICD-10-PCS)', example: 'CPT' })
  @IsString()
  codeSystem: string;

  @ApiProperty({ description: 'Procedure description', example: 'Total knee replacement' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Number of units requested' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Unit of measure' })
  @IsOptional()
  @IsString()
  unitOfMeasure?: string;

  @ApiPropertyOptional({ description: 'Requested start date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Requested end date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

// ─── Create Prior Auth ─────────────────────────────

export class CreatePriorAuthDto {
  @ApiProperty({ description: 'Urgency level', enum: PriorAuthUrgency })
  @IsEnum(PriorAuthUrgency)
  urgency: PriorAuthUrgency;

  @ApiProperty({ description: 'Authorization type', enum: PriorAuthType })
  @IsEnum(PriorAuthType)
  type: PriorAuthType;

  // Member info
  @ApiProperty({ description: 'Member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'Member full name' })
  @IsString()
  memberName: string;

  @ApiProperty({ description: 'Member date of birth' })
  @IsDateString()
  memberDob: string;

  @ApiPropertyOptional({ description: 'Plan ID' })
  @IsOptional()
  @IsUUID()
  planId?: string;

  // Requesting provider
  @ApiPropertyOptional({ description: 'Requesting provider ID' })
  @IsOptional()
  @IsString()
  requestingProviderId?: string;

  @ApiProperty({ description: 'Requesting provider NPI', example: '1234567890' })
  @IsString()
  requestingProviderNpi: string;

  @ApiProperty({ description: 'Requesting provider name' })
  @IsString()
  requestingProviderName: string;

  @ApiPropertyOptional({ description: 'Requesting provider specialty' })
  @IsOptional()
  @IsString()
  requestingProviderSpecialty?: string;

  // Servicing provider
  @ApiPropertyOptional({ description: 'Servicing provider ID' })
  @IsOptional()
  @IsString()
  servicingProviderId?: string;

  @ApiPropertyOptional({ description: 'Servicing provider NPI' })
  @IsOptional()
  @IsString()
  servicingProviderNpi?: string;

  @ApiPropertyOptional({ description: 'Servicing provider name' })
  @IsOptional()
  @IsString()
  servicingProviderName?: string;

  // Facility
  @ApiPropertyOptional({ description: 'Facility ID' })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Facility name' })
  @IsOptional()
  @IsString()
  facilityName?: string;

  // Diagnosis
  @ApiProperty({ description: 'Primary ICD-10 diagnosis code', example: 'M17.11' })
  @IsString()
  primaryDiagnosisCode: string;

  @ApiProperty({ description: 'Primary diagnosis description', example: 'Primary osteoarthritis, right knee' })
  @IsString()
  primaryDiagnosisDescription: string;

  @ApiPropertyOptional({ description: 'Additional diagnosis codes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalDiagnosisCodes?: string[];

  // Procedures
  @ApiProperty({ description: 'Requested procedures', type: [RequestedProcedureDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RequestedProcedureDto)
  requestedProcedures: RequestedProcedureDto[];

  // Clinical
  @ApiPropertyOptional({ description: 'Clinical notes supporting the request' })
  @IsOptional()
  @IsString()
  clinicalNotes?: string;
}

// ─── Search Prior Auth ─────────────────────────────

export class SearchPriorAuthDto {
  @ApiPropertyOptional({ description: 'Auth number' })
  @IsOptional()
  @IsString()
  authNumber?: string;

  @ApiPropertyOptional({ description: 'Status filter', enum: PriorAuthStatus })
  @IsOptional()
  @IsEnum(PriorAuthStatus)
  status?: PriorAuthStatus;

  @ApiPropertyOptional({ description: 'Urgency filter', enum: PriorAuthUrgency })
  @IsOptional()
  @IsEnum(PriorAuthUrgency)
  urgency?: PriorAuthUrgency;

  @ApiPropertyOptional({ description: 'Type filter', enum: PriorAuthType })
  @IsOptional()
  @IsEnum(PriorAuthType)
  type?: PriorAuthType;

  @ApiPropertyOptional({ description: 'Member ID' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Reviewer ID' })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional({ description: 'SLA status filter', enum: ['on_track', 'at_risk', 'overdue'] })
  @IsOptional()
  @IsString()
  slaStatus?: string;

  @ApiPropertyOptional({ description: 'Submitted after this date' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Submitted before this date' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

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

// ─── Review Prior Auth ─────────────────────────────

export class ReviewPriorAuthDto {
  @ApiProperty({ description: 'Review decision', enum: ['approved', 'partially_approved', 'denied', 'pending_info'] })
  @IsString()
  decision: string;

  @ApiPropertyOptional({ description: 'Review notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Denial reason (required if denied)' })
  @IsOptional()
  @IsString()
  denialReason?: string;

  @ApiPropertyOptional({ description: 'Denial reason code' })
  @IsOptional()
  @IsString()
  denialReasonCode?: string;

  @ApiPropertyOptional({ description: 'Approved units (for partial approvals)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  approvedUnits?: number;

  @ApiPropertyOptional({ description: 'Approved service start date' })
  @IsOptional()
  @IsDateString()
  approvedFromDate?: string;

  @ApiPropertyOptional({ description: 'Approved service end date' })
  @IsOptional()
  @IsDateString()
  approvedToDate?: string;
}

// ─── Attach Documents ──────────────────────────────

export class AttachDocumentsDto {
  @ApiProperty({ description: 'Array of document URLs or references' })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  documents: string[];

  @ApiPropertyOptional({ description: 'Additional notes about the documents' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ─── Assign Reviewer ───────────────────────────────

export class AssignReviewerDto {
  @ApiProperty({ description: 'Reviewer user ID' })
  @IsUUID()
  reviewerId: string;

  @ApiProperty({ description: 'Reviewer display name' })
  @IsString()
  reviewerName: string;
}
