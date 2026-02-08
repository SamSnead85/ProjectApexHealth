import {
  IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray,
  IsUUID, IsEmail, IsObject, ValidateNested, Min, Max,
  MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class AddressDto {
  @ApiProperty({ example: '123 Main St' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Suite 200' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Chicago' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'IL' })
  @IsString()
  @MaxLength(5)
  state: string;

  @ApiProperty({ example: '60601' })
  @IsString()
  @MaxLength(10)
  zip: string;

  @ApiPropertyOptional({ example: 41.8781 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -87.6298 })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}

export class CreateProviderDto {
  @ApiProperty({ example: '1234567890', description: 'National Provider Identifier' })
  @IsString()
  @MinLength(10)
  @MaxLength(10)
  npi: string;

  @ApiProperty({ enum: ['individual', 'organization', 'facility'] })
  @IsEnum(['individual', 'organization', 'facility'])
  type: string;

  @ApiPropertyOptional({ enum: ['preferred', 'standard', 'basic', 'out_of_network'] })
  @IsOptional()
  @IsEnum(['preferred', 'standard', 'basic', 'out_of_network'])
  networkTier?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Smith Medical Group' })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ example: 'Dr. John Smith, MD' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ example: 'MD' })
  @IsOptional()
  @IsString()
  credentials?: string;

  @ApiProperty({ example: 'Internal Medicine' })
  @IsString()
  specialty: string;

  @ApiPropertyOptional({ type: [String], example: ['Cardiology', 'Geriatrics'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subspecialties?: string[];

  @ApiPropertyOptional({ example: '207R00000X' })
  @IsOptional()
  @IsString()
  taxonomyCode?: string;

  @ApiPropertyOptional({ example: '(312) 555-0100' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '(312) 555-0101' })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiPropertyOptional({ example: 'dr.smith@clinic.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'https://smithclinic.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  contractId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractEffectiveDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contractTermDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  feeScheduleId?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  acceptingNewPatients?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  panelCapacity?: number;

  @ApiPropertyOptional({ example: 'A12345' })
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 'IL' })
  @IsOptional()
  @IsString()
  licenseState?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licenseExpirationDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deaNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deaExpirationDate?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  boardCertified?: boolean;

  @ApiPropertyOptional({ type: 'array' })
  @IsOptional()
  @IsArray()
  boardCertifications?: any[];

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  malpracticeInsurance?: any;

  @ApiPropertyOptional({ type: [String], example: ['English', 'Spanish'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hospitalAffiliations?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateProviderDto extends PartialType(CreateProviderDto) {}

export class SearchProviderDto {
  @ApiPropertyOptional({ description: 'General search query (name, NPI)' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiPropertyOptional({ description: 'Search radius in miles (requires zip or lat/lng)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  radiusMiles?: number;

  @ApiPropertyOptional({ description: 'Latitude for geo search' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude for geo search' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ enum: ['preferred', 'standard', 'basic', 'out_of_network'] })
  @IsOptional()
  @IsEnum(['preferred', 'standard', 'basic', 'out_of_network'])
  networkTier?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  acceptingNewPatients?: boolean;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'pending', 'suspended', 'terminated'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'pending', 'suspended', 'terminated'])
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ default: 'displayName' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

export class UpdateCredentialingDto {
  @ApiProperty({ enum: ['application_received', 'in_review', 'committee_review', 'approved', 'denied', 'expired'] })
  @IsEnum(['application_received', 'in_review', 'committee_review', 'approved', 'denied', 'expired'])
  credentialingStatus: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  credentialingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  recredentialingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
