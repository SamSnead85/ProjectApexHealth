import {
  IsString, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray,
  IsUUID, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({ example: 'Lab Results - John Doe' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'Blood work results from annual checkup' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: ['claim_attachment', 'prior_auth', 'medical_record', 'id_card', 'eob', 'correspondence', 'contract', 'credentialing', 'compliance', 'other'],
  })
  @IsEnum(['claim_attachment', 'prior_auth', 'medical_record', 'id_card', 'eob', 'correspondence', 'contract', 'credentialing', 'compliance', 'other'])
  category: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  containsPhi?: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phiCategories?: string[];

  @ApiPropertyOptional({ description: 'Associated member UUID' })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional({ description: 'Associated claim UUID' })
  @IsOptional()
  @IsUUID()
  claimId?: string;

  @ApiPropertyOptional({ description: 'Associated prior auth UUID' })
  @IsOptional()
  @IsUUID()
  priorAuthId?: string;

  @ApiPropertyOptional({ description: 'Associated provider UUID' })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({ enum: ['public', 'internal', 'confidential', 'restricted'], default: 'internal' })
  @IsOptional()
  @IsEnum(['public', 'internal', 'confidential', 'restricted'])
  accessLevel?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedRoles?: string[];
}

export class SearchDocumentDto {
  @ApiPropertyOptional({ description: 'Search by title or file name' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    enum: ['claim_attachment', 'prior_auth', 'medical_record', 'id_card', 'eob', 'correspondence', 'contract', 'credentialing', 'compliance', 'other'],
  })
  @IsOptional()
  @IsEnum(['claim_attachment', 'prior_auth', 'medical_record', 'id_card', 'eob', 'correspondence', 'contract', 'credentialing', 'compliance', 'other'])
  category?: string;

  @ApiPropertyOptional({ enum: ['uploading', 'processing', 'active', 'archived', 'deleted'] })
  @IsOptional()
  @IsEnum(['uploading', 'processing', 'active', 'archived', 'deleted'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  claimId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  containsPhi?: boolean;

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
}
