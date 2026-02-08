import {
  IsString, IsOptional, IsEnum, IsNumber, IsArray, IsObject,
  ValidateNested, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class WorkflowStepDto {
  @ApiProperty({ example: 'step-1' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Validate Claim' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ['action', 'condition', 'delay', 'notification', 'api_call', 'transform'] })
  @IsEnum(['action', 'condition', 'delay', 'notification', 'api_call', 'transform'])
  type: string;

  @ApiProperty({ type: 'object' })
  @IsObject()
  config: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nextStepId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onSuccessStepId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onFailureStepId?: string;

  @ApiPropertyOptional({ type: 'object', example: { x: 100, y: 200 } })
  @IsOptional()
  @IsObject()
  position?: { x: number; y: number };
}

export class CreateWorkflowDto {
  @ApiProperty({ example: 'Auto-Adjudicate Low-Risk Claims' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Automatically processes claims under $500 with matching codes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'claims' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['manual', 'schedule', 'event', 'api'], default: 'manual' })
  @IsOptional()
  @IsEnum(['manual', 'schedule', 'event', 'api'])
  triggerType?: string;

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>;

  @ApiProperty({ type: [WorkflowStepDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkflowStepDto)
  steps: WorkflowStepDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateWorkflowDto extends PartialType(CreateWorkflowDto) {}

export class ExecuteWorkflowDto {
  @ApiPropertyOptional({ type: 'object', description: 'Input data for the workflow execution' })
  @IsOptional()
  @IsObject()
  input?: Record<string, any>;

  @ApiPropertyOptional({ type: 'object', description: 'Trigger-specific data' })
  @IsOptional()
  @IsObject()
  triggerData?: Record<string, any>;
}

export class SearchWorkflowDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: ['draft', 'active', 'inactive', 'archived'] })
  @IsOptional()
  @IsEnum(['draft', 'active', 'inactive', 'archived'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

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

export class SearchExecutionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workflowId?: string;

  @ApiPropertyOptional({ enum: ['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'] })
  @IsOptional()
  @IsEnum(['pending', 'running', 'completed', 'failed', 'cancelled', 'paused'])
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
}
