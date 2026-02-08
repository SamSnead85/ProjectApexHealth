import {
  IsString, IsOptional, IsUUID, IsBoolean, IsInt,
  IsDateString, IsArray, IsEnum, IsObject, IsIP, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  FAILED_LOGIN = 'FAILED_LOGIN',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  BREAK_GLASS = 'BREAK_GLASS',
}

export class CreateAuditLogDto {
  @ApiPropertyOptional({ description: 'User ID performing the action' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Email of the user', example: 'admin@apexhealth.com' })
  @IsString()
  userEmail: string;

  @ApiProperty({ description: 'Role of the user', example: 'org_admin' })
  @IsString()
  userRole: string;

  @ApiProperty({ description: 'Organization ID' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ enum: AuditAction, description: 'Action performed' })
  @IsEnum(AuditAction)
  action: AuditAction;

  @ApiProperty({ description: 'Type of resource accessed', example: 'member' })
  @IsString()
  resourceType: string;

  @ApiPropertyOptional({ description: 'ID of the specific resource' })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({ description: 'Whether PHI was accessed', default: false })
  @IsOptional()
  @IsBoolean()
  phiAccessed?: boolean;

  @ApiPropertyOptional({ description: 'List of PHI fields accessed', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phiFields?: string[];

  @ApiProperty({ description: 'IP address of the client', example: '192.168.1.1' })
  @IsString()
  ipAddress: string;

  @ApiProperty({ description: 'User agent string' })
  @IsString()
  userAgent: string;

  @ApiProperty({ description: 'HTTP method', example: 'GET' })
  @IsString()
  requestMethod: string;

  @ApiProperty({ description: 'Request URL path', example: '/api/members/123' })
  @IsString()
  requestPath: string;

  @ApiProperty({ description: 'HTTP response status code', example: 200 })
  @IsInt()
  responseStatus: number;

  @ApiPropertyOptional({ description: 'Additional details' })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiProperty({ description: 'Session identifier' })
  @IsString()
  sessionId: string;
}

export class SearchAuditDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ description: 'Filter by action', enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ description: 'Filter by resource type' })
  @IsOptional()
  @IsString()
  resourceType?: string;

  @ApiPropertyOptional({ description: 'Filter by PHI access' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  phiAccessed?: boolean;

  @ApiPropertyOptional({ description: 'Filter by organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Start date for date range filter' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'End date for date range filter' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}
