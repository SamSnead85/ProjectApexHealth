import {
  IsString, IsUUID, IsEnum, IsOptional, IsNumber, IsArray,
  IsDateString, IsInt, Min, Max, ValidateNested, ArrayMinSize,
  MinLength, MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════════════════
// Service Line DTO (nested in CreateClaimDto)
// ═══════════════════════════════════════════════════════

export class CreateServiceLineDto {
  @ApiProperty({ example: 1, description: 'Line number (sequential)' })
  @IsInt()
  @Min(1)
  lineNumber: number;

  @ApiProperty({ example: '99213', description: 'CPT/HCPCS procedure code' })
  @IsString()
  @MaxLength(20)
  procedureCode: string;

  @ApiProperty({ example: 'Office/outpatient visit, est patient, 20-29 min' })
  @IsString()
  @MaxLength(500)
  procedureDescription: string;

  @ApiPropertyOptional({ example: ['25'], description: 'Procedure modifiers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modifiers?: string[];

  @ApiPropertyOptional({ example: '0510', description: 'Revenue code (institutional claims)' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  revenueCode?: string;

  @ApiProperty({ example: '11', description: 'Place of service code' })
  @IsString()
  @MaxLength(5)
  placeOfServiceCode: string;

  @ApiProperty({ example: '2026-01-15', description: 'Service date' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ example: 1, description: 'Number of units' })
  @IsInt()
  @Min(1)
  units: number;

  @ApiProperty({ example: 150.00, description: 'Charged amount' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  chargedAmount: number;
}

// ═══════════════════════════════════════════════════════
// Diagnosis Code DTO
// ═══════════════════════════════════════════════════════

export class DiagnosisCodeDto {
  @ApiProperty({ example: 'J06.9', description: 'ICD-10 code' })
  @IsString()
  @MaxLength(20)
  code: string;

  @ApiProperty({ example: 'Acute upper respiratory infection, unspecified' })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({ example: 'ICD10', enum: ['ICD10', 'ICD9'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'other', enum: ['principal', 'admitting', 'other'] })
  @IsOptional()
  @IsString()
  qualifier?: string;
}

// ═══════════════════════════════════════════════════════
// Create Claim DTO
// ═══════════════════════════════════════════════════════

export class CreateClaimDto {
  @ApiProperty({ enum: ['professional', 'institutional', 'dental', 'pharmacy', 'vision'] })
  @IsEnum(['professional', 'institutional', 'dental', 'pharmacy', 'vision'])
  type: string;

  @ApiPropertyOptional({ enum: ['edi_837', 'portal', 'fhir', 'paper', 'api'], default: 'api' })
  @IsOptional()
  @IsEnum(['edi_837', 'portal', 'fhir', 'paper', 'api'])
  source?: string;

  // ─── Patient / Subscriber ─────────────────────────
  @ApiProperty({ description: 'Member UUID' })
  @IsUUID()
  memberId: string;

  @ApiProperty({ example: 'SUB-001234' })
  @IsString()
  @MaxLength(50)
  subscriberId: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MaxLength(100)
  patientFirstName: string;

  @ApiProperty({ example: 'Smith' })
  @IsString()
  @MaxLength(100)
  patientLastName: string;

  @ApiProperty({ example: '1985-06-15' })
  @IsDateString()
  patientDob: string;

  @ApiProperty({ example: 'M', enum: ['M', 'F', 'U'] })
  @IsString()
  @MaxLength(10)
  patientGender: string;

  @ApiProperty({ example: 'PLAN-GOLD-001' })
  @IsString()
  @MaxLength(50)
  memberPlanId: string;

  // ─── Rendering Provider ───────────────────────────
  @ApiProperty({ description: 'Rendering provider UUID' })
  @IsUUID()
  renderingProviderId: string;

  @ApiProperty({ example: '1234567890', description: '10-digit NPI' })
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  renderingProviderNpi: string;

  @ApiProperty({ example: 'Dr. Jane Wilson' })
  @IsString()
  @MaxLength(200)
  renderingProviderName: string;

  // ─── Billing Provider (optional) ──────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  billingProviderId?: string;

  @ApiPropertyOptional({ example: '0987654321' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  billingProviderNpi?: string;

  @ApiPropertyOptional({ example: 'ABC Medical Group' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  billingProviderName?: string;

  // ─── Facility (optional) ──────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiPropertyOptional({ example: 'Metro General Hospital' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  facilityName?: string;

  @ApiProperty({ example: '11', description: 'Place of service code' })
  @IsString()
  @MaxLength(5)
  placeOfServiceCode: string;

  // ─── Dates ────────────────────────────────────────
  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  serviceFromDate: string;

  @ApiProperty({ example: '2026-01-15' })
  @IsDateString()
  serviceToDate: string;

  // ─── Diagnosis ────────────────────────────────────
  @ApiProperty({ example: 'J06.9' })
  @IsString()
  @MaxLength(20)
  primaryDiagnosisCode: string;

  @ApiProperty({ example: 'Acute upper respiratory infection, unspecified' })
  @IsString()
  @MaxLength(500)
  primaryDiagnosisDescription: string;

  @ApiPropertyOptional({ type: [DiagnosisCodeDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisCodeDto)
  additionalDiagnosisCodes?: DiagnosisCodeDto[];

  // ─── Service Lines ────────────────────────────────
  @ApiProperty({ type: [CreateServiceLineDto], description: 'At least one service line required' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateServiceLineDto)
  serviceLines: CreateServiceLineDto[];

  // ─── EDI Reference ────────────────────────────────
  @ApiPropertyOptional({ example: 'EDI-REF-20260115-001' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  ediReferenceNumber?: string;
}

// ═══════════════════════════════════════════════════════
// Search Claims DTO
// ═══════════════════════════════════════════════════════

export class SearchClaimsDto {
  @ApiPropertyOptional({ description: 'Free text search (claim number, patient name, provider)' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ example: 'CLM-2026-000001' })
  @IsOptional()
  @IsString()
  claimNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiPropertyOptional({
    enum: ['received', 'validated', 'pending_info', 'in_review', 'priced', 'adjudicated',
      'approved', 'denied', 'partially_approved', 'appealed', 'paid', 'voided', 'suspended'],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  status?: string[];

  @ApiPropertyOptional({ enum: ['professional', 'institutional', 'dental', 'pharmacy', 'vision'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: '2026-01-01', description: 'Filter from date (received)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31', description: 'Filter to date (received)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 0, description: 'Minimum charged amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountMin?: number;

  @ApiPropertyOptional({ example: 100000, description: 'Maximum charged amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountMax?: number;

  @ApiPropertyOptional({ enum: ['approve', 'deny', 'review', 'pend'] })
  @IsOptional()
  @IsString()
  aiRecommendation?: string;

  @ApiPropertyOptional({ description: 'Assigned processor user ID' })
  @IsOptional()
  @IsUUID()
  assignedTo?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 25, minimum: 1, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 25;

  @ApiPropertyOptional({
    default: 'receivedDate',
    enum: ['receivedDate', 'claimNumber', 'status', 'totalChargedAmount', 'patientLastName', 'createdAt'],
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'receivedDate';

  @ApiPropertyOptional({ default: 'desc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

// ═══════════════════════════════════════════════════════
// Deny Claim DTO
// ═══════════════════════════════════════════════════════

export class DenyClaimDto {
  @ApiProperty({ example: 'CO-4', description: 'Denial reason code (CARC)' })
  @IsString()
  @IsNotEmpty()
  denialReasonCode: string;

  @ApiProperty({ example: 'The procedure code is inconsistent with the modifier used' })
  @IsString()
  @IsNotEmpty()
  denialReasonDescription: string;

  @ApiPropertyOptional({ description: 'Additional notes for denial' })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ═══════════════════════════════════════════════════════
// Pend Claim DTO
// ═══════════════════════════════════════════════════════

export class PendClaimDto {
  @ApiProperty({ example: 'Missing operative report for CPT 27447' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Specific information requested' })
  @IsOptional()
  @IsString()
  informationRequested?: string;
}

// ═══════════════════════════════════════════════════════
// Add Note DTO
// ═══════════════════════════════════════════════════════

export class AddNoteDto {
  @ApiProperty({ example: 'Verified member eligibility for date of service' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiPropertyOptional({ enum: ['internal', 'system', 'adjudication', 'appeal'], default: 'internal' })
  @IsOptional()
  @IsEnum(['internal', 'system', 'adjudication', 'appeal'])
  noteType?: string = 'internal';
}

// ═══════════════════════════════════════════════════════
// Assign Processor DTO
// ═══════════════════════════════════════════════════════

export class AssignProcessorDto {
  @ApiProperty({ description: 'User ID of the processor to assign' })
  @IsUUID()
  processorId: string;

  @ApiProperty({ example: 'Jane Smith' })
  @IsString()
  @IsNotEmpty()
  processorName: string;
}

// ═══════════════════════════════════════════════════════
// Batch Adjudication DTO
// ═══════════════════════════════════════════════════════

export class BatchAdjudicationDto {
  @ApiProperty({ description: 'Array of claim IDs to adjudicate', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  claimIds: string[];
}
