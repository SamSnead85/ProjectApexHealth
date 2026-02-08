import {
  Controller, Post, Get, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse,
  ApiParam, ApiQuery,
} from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateClaimDto, SearchClaimsDto, DenyClaimDto,
  PendClaimDto, AddNoteDto, AssignProcessorDto,
} from './dto/claims.dto';

@ApiTags('claims')
@ApiBearerAuth()
@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  // ═══════════════════════════════════════════════════════
  // CREATE CLAIM
  // ═══════════════════════════════════════════════════════

  @Post()
  @Roles('system_admin', 'org_admin', 'claims_processor', 'claims_supervisor', 'provider')
  @RequirePermissions('claims:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new claim',
    description: 'Submit a new healthcare claim for processing. Claim number is auto-generated. ' +
      'Claim is automatically queued for validation after creation.',
  })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid claim data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createClaim(
    @Body() dto: CreateClaimDto,
    @CurrentUser() user: any,
  ) {
    const claim = await this.claimsService.create(dto, user.sub, user.organizationId);
    return {
      success: true,
      data: claim,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // SEARCH CLAIMS
  // ═══════════════════════════════════════════════════════

  @Get()
  @Roles(
    'system_admin', 'org_admin', 'claims_processor', 'claims_supervisor',
    'medical_director', 'auditor', 'analyst', 'provider', 'member', 'support',
  )
  @RequirePermissions('claims:view')
  @ApiOperation({
    summary: 'Search and filter claims',
    description: 'Retrieve a paginated list of claims with full search and filter capabilities. ' +
      'Supports filtering by status, type, date range, member, provider, amount, and AI recommendation.',
  })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  async searchClaims(
    @Query() params: SearchClaimsDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.claimsService.search(params, user.organizationId);
    return {
      success: true,
      data: result.data,
      meta: result.meta,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // DASHBOARD STATISTICS
  // ═══════════════════════════════════════════════════════

  @Get('stats')
  @Roles(
    'system_admin', 'org_admin', 'claims_supervisor',
    'medical_director', 'auditor', 'analyst',
  )
  @RequirePermissions('claims:view')
  @ApiOperation({
    summary: 'Get claims dashboard statistics',
    description: 'Retrieve aggregated statistics for the claims dashboard including status breakdown, ' +
      'financial totals, processing metrics, and 30-day trend data.',
  })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@CurrentUser() user: any) {
    const stats = await this.claimsService.getStats(user.organizationId);
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // GET CLAIM BY ID
  // ═══════════════════════════════════════════════════════

  @Get(':id')
  @Roles(
    'system_admin', 'org_admin', 'claims_processor', 'claims_supervisor',
    'medical_director', 'auditor', 'analyst', 'provider', 'member', 'support',
  )
  @RequirePermissions('claims:view')
  @ApiOperation({
    summary: 'Get claim details',
    description: 'Retrieve full claim details including service lines, adjudication results, ' +
      'AI analysis, notes, and adjustment codes.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Claim retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async getClaimById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const claim = await this.claimsService.findById(id, user.organizationId);
    return {
      success: true,
      data: claim,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // RUN AUTO-ADJUDICATION
  // ═══════════════════════════════════════════════════════

  @Post(':id/adjudicate')
  @Roles('system_admin', 'org_admin', 'claims_processor', 'claims_supervisor')
  @RequirePermissions('claims:adjudicate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Run auto-adjudication on a claim',
    description: 'Execute the rules engine against a claim. Evaluates timely filing, duplicates, ' +
      'procedure/diagnosis compatibility, eligibility, pricing, and more. Updates claim status and ' +
      'AI analysis accordingly.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Adjudication complete' })
  @ApiResponse({ status: 400, description: 'Claim cannot be adjudicated in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async adjudicateClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const claim = await this.claimsService.adjudicate(id, user.organizationId);
    return {
      success: true,
      data: claim,
      message: `Adjudication complete. Recommendation: ${claim.aiRecommendation}`,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // MANUAL APPROVE
  // ═══════════════════════════════════════════════════════

  @Post(':id/approve')
  @Roles('system_admin', 'org_admin', 'claims_supervisor', 'medical_director')
  @RequirePermissions('claims:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually approve a claim',
    description: 'Approve a claim that is in a reviewable status. If pricing has not been applied, ' +
      'it will be calculated automatically. All pending service lines are set to approved.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim approved' })
  @ApiResponse({ status: 400, description: 'Claim cannot be approved in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async approveClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const claim = await this.claimsService.approve(id, user.sub, userName, user.organizationId);
    return {
      success: true,
      data: claim,
      message: 'Claim approved successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // MANUAL DENY
  // ═══════════════════════════════════════════════════════

  @Post(':id/deny')
  @Roles('system_admin', 'org_admin', 'claims_supervisor', 'medical_director')
  @RequirePermissions('claims:approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually deny a claim',
    description: 'Deny a claim with a specific denial reason code (CARC). All pending service lines ' +
      'are set to denied with the provided reason.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim denied' })
  @ApiResponse({ status: 400, description: 'Claim cannot be denied in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async denyClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DenyClaimDto,
    @CurrentUser() user: any,
  ) {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const claim = await this.claimsService.deny(id, dto, user.sub, userName, user.organizationId);
    return {
      success: true,
      data: claim,
      message: 'Claim denied',
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // PEND FOR REVIEW
  // ═══════════════════════════════════════════════════════

  @Post(':id/pend')
  @Roles('system_admin', 'org_admin', 'claims_processor', 'claims_supervisor', 'medical_director')
  @RequirePermissions('claims:adjudicate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Pend a claim for additional review',
    description: 'Move a claim to pending status when additional information or review is needed. ' +
      'Includes reason and optionally the specific information requested.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim pended for review' })
  @ApiResponse({ status: 400, description: 'Claim cannot be pended in current status' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async pendClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PendClaimDto,
    @CurrentUser() user: any,
  ) {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const claim = await this.claimsService.pend(id, dto, user.sub, userName, user.organizationId);
    return {
      success: true,
      data: claim,
      message: 'Claim pended for review',
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // ADD NOTE
  // ═══════════════════════════════════════════════════════

  @Post(':id/notes')
  @Roles(
    'system_admin', 'org_admin', 'claims_processor', 'claims_supervisor',
    'medical_director', 'support',
  )
  @RequirePermissions('claims:view')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a processing note to a claim',
    description: 'Attach an internal, system, adjudication, or appeal note to a claim. ' +
      'Notes are immutable once added.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 201, description: 'Note added successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async addNote(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddNoteDto,
    @CurrentUser() user: any,
  ) {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const claim = await this.claimsService.addNote(id, dto, user.sub, userName, user.organizationId);
    return {
      success: true,
      data: claim,
      message: 'Note added successfully',
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════════════════
  // ASSIGN TO PROCESSOR
  // ═══════════════════════════════════════════════════════

  @Put(':id/assign')
  @Roles('system_admin', 'org_admin', 'claims_supervisor')
  @RequirePermissions('claims:adjudicate')
  @ApiOperation({
    summary: 'Assign a claim to a processor',
    description: 'Assign or reassign a claim to a specific claims processor for manual review.',
  })
  @ApiParam({ name: 'id', description: 'Claim UUID' })
  @ApiResponse({ status: 200, description: 'Claim assigned successfully' })
  @ApiResponse({ status: 404, description: 'Claim not found' })
  async assignProcessor(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignProcessorDto,
    @CurrentUser() user: any,
  ) {
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    const claim = await this.claimsService.assignProcessor(
      id, dto, user.sub, userName, user.organizationId,
    );
    return {
      success: true,
      data: claim,
      message: `Claim assigned to ${dto.processorName}`,
      timestamp: new Date().toISOString(),
    };
  }
}
