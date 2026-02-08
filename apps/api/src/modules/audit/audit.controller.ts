import {
  Controller, Get, Param, Query, UseGuards,
  HttpStatus, NotFoundException, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { SearchAuditDto } from './dto/audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('system_admin', 'org_admin', 'auditor')
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Search audit logs with filtering and pagination' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit logs retrieved successfully' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' })
  async search(
    @Query() params: SearchAuditDto,
    @CurrentUser() user: any,
  ) {
    // Scope to organization unless system_admin
    if (user.role !== 'system_admin') {
      params.organizationId = user.organizationId;
    }

    const result = await this.auditService.search(params);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit dashboard statistics' })
  @ApiQuery({ name: 'dateFrom', required: true, description: 'Start date (ISO 8601)' })
  @ApiQuery({ name: 'dateTo', required: true, description: 'End date (ISO 8601)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Dashboard stats retrieved' })
  async getStats(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @CurrentUser() user: any,
  ) {
    const stats = await this.auditService.getDashboardStats(
      user.organizationId,
      dateFrom,
      dateTo,
    );
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get anomaly detection alerts' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Anomaly alerts retrieved' })
  async getAlerts(@CurrentUser() user: any) {
    const anomalies = await this.auditService.detectAnomalies(user.organizationId);
    return {
      success: true,
      data: anomalies,
      count: anomalies.length,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific audit log entry by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Audit log entry retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Audit log entry not found' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const entry = await this.auditService.findById(id);
    if (!entry) {
      throw new NotFoundException(`Audit log entry ${id} not found`);
    }

    // Ensure org-scoped access (unless system_admin)
    if (user.role !== 'system_admin' && entry.organizationId !== user.organizationId) {
      throw new NotFoundException(`Audit log entry ${id} not found`);
    }

    return {
      success: true,
      data: entry,
      timestamp: new Date().toISOString(),
    };
  }
}
