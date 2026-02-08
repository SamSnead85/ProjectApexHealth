import {
  IsString, IsOptional, IsEnum, IsNumber, IsDateString,
  Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadEdiDto {
  @ApiProperty({ enum: ['270', '271', '276', '277', '278', '834', '835', '837P', '837I', '820', '999'] })
  @IsEnum(['270', '271', '276', '277', '278', '834', '835', '837P', '837I', '820', '999'])
  transactionType: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GenerateEdiDto {
  @ApiProperty({ enum: ['270', '271', '837P', '835', '834'] })
  @IsEnum(['270', '271', '837P', '835', '834'])
  transactionType: string;

  @ApiProperty({ description: 'Structured data to generate X12 from', type: 'object' })
  data: Record<string, any>;
}

export class ValidateEdiDto {
  @ApiProperty({ description: 'Raw X12 content to validate' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'SNIP level to validate (1-7)', default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(7)
  snipLevel?: number;
}

export class SearchEdiDto {
  @ApiPropertyOptional({ enum: ['270', '271', '276', '277', '278', '834', '835', '837P', '837I', '820', '999'] })
  @IsOptional()
  @IsEnum(['270', '271', '276', '277', '278', '834', '835', '837P', '837I', '820', '999'])
  transactionType?: string;

  @ApiPropertyOptional({ enum: ['inbound', 'outbound'] })
  @IsOptional()
  @IsEnum(['inbound', 'outbound'])
  direction?: string;

  @ApiPropertyOptional({ enum: ['received', 'parsing', 'parsed', 'validated', 'processing', 'processed', 'error', 'rejected'] })
  @IsOptional()
  @IsEnum(['received', 'parsing', 'parsed', 'validated', 'processing', 'processed', 'error', 'rejected'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

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
