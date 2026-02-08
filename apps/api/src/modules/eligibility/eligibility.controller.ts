import {
  Controller, Post, Get, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EligibilityService } from './eligibility.service';
import {
  VerifyEligibilityDto, EnrollMemberDto, TerminateMemberDto,
  SearchMembersDto, UpdateAccumulatorsDto,
} from './dto/eligibility.dto';

@ApiTags('eligibility')
@Controller('eligibility')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EligibilityController {
  constructor(private readonly eligibilityService: EligibilityService) {}

  // ─── Real-time Eligibility Verification ──────────────────

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify member eligibility (EDI 270/271)',
    description: 'Real-time eligibility check. Look up by member ID, subscriber ID, or demographics.',
  })
  @ApiResponse({ status: 200, description: 'Eligibility verification response' })
  @ApiResponse({ status: 400, description: 'Invalid inquiry parameters' })
  async verifyEligibility(
    @Body() dto: VerifyEligibilityDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.verifyEligibility(dto, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Member Search ───────────────────────────────────────

  @Get('members')
  @ApiOperation({ summary: 'Search members by various criteria' })
  @ApiResponse({ status: 200, description: 'Paginated list of member eligibility records' })
  async searchMembers(
    @Query() dto: SearchMembersDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.searchMembers(dto, user.organizationId);
    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Member Detail ───────────────────────────────────────

  @Get('members/:id')
  @ApiOperation({ summary: 'Get member eligibility detail' })
  @ApiResponse({ status: 200, description: 'Member eligibility detail' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getMember(
    @Param('id') memberId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.getMemberEligibility(memberId, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Accumulators ────────────────────────────────────────

  @Get('members/:id/accumulators')
  @ApiOperation({ summary: 'Get member accumulators (deductibles, OOP max)' })
  @ApiResponse({ status: 200, description: 'Current accumulator values' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getAccumulators(
    @Param('id') memberId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.getAccumulators(memberId, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('members/:id/accumulators')
  @Roles('system_admin', 'org_admin', 'claims_processor', 'claims_supervisor')
  @ApiOperation({ summary: 'Update member accumulators after claim payment' })
  @ApiResponse({ status: 200, description: 'Updated accumulator values' })
  async updateAccumulators(
    @Param('id') memberId: string,
    @Body() dto: UpdateAccumulatorsDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.updateAccumulators(
      memberId, dto, user.organizationId,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Enrollment ──────────────────────────────────────────

  @Post('enroll')
  @Roles('system_admin', 'org_admin', 'claims_supervisor')
  @ApiOperation({ summary: 'Process enrollment event' })
  @ApiResponse({ status: 201, description: 'Enrollment event created and processed' })
  @ApiResponse({ status: 400, description: 'Invalid enrollment data' })
  async enroll(
    @Body() dto: EnrollMemberDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.enroll(dto, user.organizationId, user.sub);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Termination ─────────────────────────────────────────

  @Post('terminate')
  @Roles('system_admin', 'org_admin', 'claims_supervisor')
  @ApiOperation({ summary: 'Terminate member coverage' })
  @ApiResponse({ status: 200, description: 'Termination processed' })
  @ApiResponse({ status: 404, description: 'Member not found or not active' })
  async terminate(
    @Body() dto: TerminateMemberDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.terminate(dto, user.organizationId, user.sub);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Benefit Plans ───────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'List benefit plans for the organization' })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean, description: 'Filter to active plans only (default: true)' })
  @ApiResponse({ status: 200, description: 'List of benefit plans' })
  async listPlans(
    @CurrentUser() user: any,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActiveOnly = activeOnly !== 'false';
    const result = await this.eligibilityService.listBenefitPlans(user.organizationId, isActiveOnly);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get benefit plan detail' })
  @ApiResponse({ status: 200, description: 'Benefit plan details' })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(
    @Param('id') planId: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.eligibilityService.getBenefitPlan(planId, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
