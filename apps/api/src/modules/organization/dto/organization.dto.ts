import {
  IsString, IsOptional, IsBoolean, IsArray, IsObject,
  IsEmail, IsUrl, MaxLength, MinLength, IsInt, Min, Max, IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum OrganizationType {
  PAYER = 'payer',
  PROVIDER = 'provider',
  EMPLOYER = 'employer',
  TPA = 'tpa',
  PBM = 'pbm',
  GOVERNMENT = 'government',
}

export class CreateOrganizationDto {
  @ApiProperty({ description: 'Organization name', example: 'Apex Health Insurance Co.' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'apex-health-insurance' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @ApiProperty({ enum: OrganizationType, description: 'Organization type' })
  @IsEnum(OrganizationType)
  type: OrganizationType;

  @ApiPropertyOptional({ description: 'Tax identification number', example: '12-3456789' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxId?: string;

  @ApiPropertyOptional({ description: 'National Provider Identifier', example: '1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  npi?: string;

  @ApiPropertyOptional({ description: 'CMS identifier' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cmsId?: string;

  @ApiPropertyOptional({ description: 'Street address line 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine1?: string;

  @ApiPropertyOptional({ description: 'Street address line 2' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine2?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'State / Province' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string;

  @ApiPropertyOptional({ description: 'ZIP / Postal code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;

  @ApiPropertyOptional({ description: 'Country', default: 'US' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Organization website' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ description: 'Organization settings (JSON)', default: {} })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Licensed feature modules', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  licensedModules?: string[];
}

export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}

export class SearchOrganizationDto {
  @ApiPropertyOptional({ description: 'Search by name (partial match)' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: OrganizationType, description: 'Filter by type' })
  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
