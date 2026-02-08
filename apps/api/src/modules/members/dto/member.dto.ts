import {
  IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray,
  IsUUID, IsEmail, IsDateString, IsObject, ValidateNested,
  Min, Max, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MemberAddressDto {
  @ApiProperty({ example: '456 Oak Ave' })
  @IsString()
  line1: string;

  @ApiPropertyOptional({ example: 'Apt 3B' })
  @IsOptional()
  @IsString()
  line2?: string;

  @ApiProperty({ example: 'Springfield' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'IL' })
  @IsString()
  @MaxLength(5)
  state: string;

  @ApiProperty({ example: '62704' })
  @IsString()
  @MaxLength(10)
  zip: string;
}

export class CreateMemberDto {
  @ApiProperty({ example: 'MBR-2024-00001', description: 'Plan-assigned member ID' })
  @IsString()
  memberId: string;

  @ApiProperty({ example: 'SUB-2024-00001' })
  @IsString()
  subscriberId: string;

  @ApiPropertyOptional({ enum: ['self', 'spouse', 'child', 'domestic_partner', 'other'], default: 'self' })
  @IsOptional()
  @IsEnum(['self', 'spouse', 'child', 'domestic_partner', 'other'])
  relationship?: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ example: 'Marie' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: '1985-06-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiPropertyOptional({ enum: ['male', 'female', 'other', 'unknown'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'unknown'])
  gender?: string;

  @ApiPropertyOptional({ description: 'SSN (will be encrypted at rest)' })
  @IsOptional()
  @IsString()
  ssn?: string;

  @ApiPropertyOptional({ example: 'jane.doe@email.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(555) 123-4567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ type: MemberAddressDto })
  @ValidateNested()
  @Type(() => MemberAddressDto)
  address: MemberAddressDto;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  terminationDate?: string;

  @ApiProperty({ description: 'Plan UUID' })
  @IsUUID()
  planId: string;

  @ApiProperty({ example: 'Gold PPO 500' })
  @IsString()
  planName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ example: 'Acme Corporation' })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({ description: 'PCP Provider UUID' })
  @IsOptional()
  @IsUUID()
  pcpProviderId?: string;

  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  @IsOptional()
  @IsString()
  pcpProviderName?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {}

export class SearchMemberDto {
  @ApiPropertyOptional({ description: 'General search query (name, member ID)' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  planId?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'terminated', 'cobra', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'terminated', 'cobra', 'pending'])
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

  @ApiPropertyOptional({ default: 'lastName' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
