import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('claims-dashboard')
  @ApiOperation({ summary: 'Claims processing metrics dashboard' })
  @ApiResponse({ status: 200, description: 'Claims dashboard data returned' })
  async getClaimsDashboard(@CurrentUser() user: any) {
    const data = await this.analyticsService.getClaimsDashboard(user.organizationId);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('operational')
  @ApiOperation({ summary: 'Operational dashboard metrics' })
  @ApiResponse({ status: 200, description: 'Operational dashboard data returned' })
  async getOperationalDashboard(@CurrentUser() user: any) {
    const data = await this.analyticsService.getOperationalDashboard(user.organizationId);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('quality-measures')
  @ApiOperation({ summary: 'HEDIS and Star Rating quality measures' })
  @ApiResponse({ status: 200, description: 'Quality measures data returned' })
  async getQualityMeasures(@CurrentUser() user: any) {
    const data = await this.analyticsService.getQualityMeasures(user.organizationId);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('financial')
  @ApiOperation({ summary: 'Revenue and cost financial metrics' })
  @ApiResponse({ status: 200, description: 'Financial dashboard data returned' })
  async getFinancialDashboard(@CurrentUser() user: any) {
    const data = await this.analyticsService.getFinancialDashboard(user.organizationId);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
