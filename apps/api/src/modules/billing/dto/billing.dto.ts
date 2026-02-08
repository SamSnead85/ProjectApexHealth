import {
  IsString, IsOptional, IsEnum, IsNumber, IsArray, IsUUID,
  IsDateString, IsObject, ValidateNested, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class InvoiceLineItemDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  category: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiProperty({ example: 250.0 })
  @IsNumber()
  @Min(0)
  totalPrice: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  memberCount?: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ enum: ['employer_group', 'member', 'provider', 'broker'] })
  @IsEnum(['employer_group', 'member', 'provider', 'broker'])
  entityType: string;

  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiProperty({ example: 'Acme Corporation' })
  @IsString()
  entityName: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  invoiceDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: '2024-01-01' })
  @IsDateString()
  periodStartDate: string;

  @ApiProperty({ example: '2024-01-31' })
  @IsDateString()
  periodEndDate: string;

  @ApiProperty({ type: [InvoiceLineItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceLineItemDto)
  lineItems: InvoiceLineItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  adjustmentAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchInvoiceDto {
  @ApiPropertyOptional({ description: 'Search by invoice number or entity name' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void'] })
  @IsOptional()
  @IsEnum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'void'])
  status?: string;

  @ApiPropertyOptional({ enum: ['employer_group', 'member', 'provider', 'broker'] })
  @IsOptional()
  @IsEnum(['employer_group', 'member', 'provider', 'broker'])
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;

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

export class ProcessPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiProperty({ enum: ['claim_payment', 'premium', 'refund', 'adjustment', 'capitation', 'withhold', 'bonus'] })
  @IsEnum(['claim_payment', 'premium', 'refund', 'adjustment', 'capitation', 'withhold', 'bonus'])
  transactionType: string;

  @ApiProperty({ enum: ['ach', 'wire', 'check', 'eft', 'credit_card'] })
  @IsEnum(['ach', 'wire', 'check', 'eft', 'credit_card'])
  paymentMethod: string;

  @ApiProperty({ example: 5000.0 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty()
  @IsString()
  payerEntityType: string;

  @ApiProperty()
  @IsUUID()
  payerEntityId: string;

  @ApiProperty()
  @IsString()
  payerEntityName: string;

  @ApiProperty()
  @IsString()
  payeeEntityType: string;

  @ApiProperty()
  @IsUUID()
  payeeEntityId: string;

  @ApiProperty()
  @IsString()
  payeeEntityName: string;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  checkNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eftTraceNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchPaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoiceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'processing', 'completed', 'failed', 'reversed', 'refunded'] })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed', 'reversed', 'refunded'])
  status?: string;

  @ApiPropertyOptional({ enum: ['claim_payment', 'premium', 'refund', 'adjustment', 'capitation', 'withhold', 'bonus'] })
  @IsOptional()
  @IsEnum(['claim_payment', 'premium', 'refund', 'adjustment', 'capitation', 'withhold', 'bonus'])
  transactionType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountMin?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  amountMax?: number;

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

export class GeneratePremiumInvoicesDto {
  @ApiProperty({ description: 'Employer group ID' })
  @IsString()
  groupId: string;

  @ApiProperty({ example: '2024-01', description: 'Billing period (YYYY-MM)' })
  @IsString()
  period: string;
}
