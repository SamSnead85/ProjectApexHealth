import {
  Controller, Post, Get, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PriorAuthService } from './prior-auth.service';
import {
  CreatePriorAuthDto, SearchPriorAuthDto, ReviewPriorAuthDto,
  AttachDocumentsDto, AssignReviewerDto,
} from './dto/prior-auth.dto';

@ApiTags('prior-auth')
@Controller('prior-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PriorAuthController {
  constructor(private readonly priorAuthService: PriorAuthService) {}

  // ─── Submit PA Request ───────────────────────────────────

  @Post()
  @ApiOperation({
    summary: 'Submit a prior authorization request',
    description: 'Creates a new PA with auto-generated auth number and SLA tracking.',
  })
  @ApiResponse({ status: 201, description: 'Prior authorization created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(
    @Body() dto: CreatePriorAuthDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.priorAuthService.create(dto, user.sub, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Search PAs ──────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Search prior authorizations with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of prior authorizations' })
  async search(
    @Query() dto: SearchPriorAuthDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.priorAuthService.search(dto, user.organizationId);
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

  // ─── Dashboard Stats ────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get prior authorization dashboard statistics' })
  @ApiResponse({ status: 200, description: 'PA dashboard statistics' })
  async getStats(@CurrentUser() user: any) {
    const result = await this.priorAuthService.getStats(user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Overdue PAs ─────────────────────────────────────────

  @Get('overdue')
  @ApiOperation({ summary: 'Get prior authorizations past SLA deadline' })
  @ApiResponse({ status: 200, description: 'List of overdue PAs' })
  async getOverdue(@CurrentUser() user: any) {
    const result = await this.priorAuthService.getOverduePAs(user.organizationId);
    return {
      success: true,
      data: result,
      count: result.length,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── PA Detail ───────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get prior authorization detail by ID' })
  @ApiResponse({ status: 200, description: 'Prior authorization detail' })
  @ApiResponse({ status: 404, description: 'PA not found' })
  async findById(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    const result = await this.priorAuthService.findById(id, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Review Decision ─────────────────────────────────────

  @Post(':id/review')
  @Roles('system_admin', 'org_admin', 'medical_director', 'claims_supervisor')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit review decision for a prior authorization',
    description: 'Approve, partially approve, deny, or request additional info.',
  })
  @ApiResponse({ status: 200, description: 'Review decision recorded' })
  @ApiResponse({ status: 400, description: 'Invalid review state or missing fields' })
  @ApiResponse({ status: 404, description: 'PA not found' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewPriorAuthDto,
    @CurrentUser() user: any,
  ) {
    const userName = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email;
    const result = await this.priorAuthService.review(
      id, dto, user.sub, userName, user.organizationId,
    );
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Attach Documents ────────────────────────────────────

  @Post(':id/documents')
  @ApiOperation({ summary: 'Attach clinical documents to a prior authorization' })
  @ApiResponse({ status: 200, description: 'Documents attached' })
  @ApiResponse({ status: 404, description: 'PA not found' })
  @HttpCode(HttpStatus.OK)
  async attachDocuments(
    @Param('id') id: string,
    @Body() dto: AttachDocumentsDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.priorAuthService.attachDocuments(id, dto, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Assign Reviewer ─────────────────────────────────────

  @Put(':id/assign')
  @Roles('system_admin', 'org_admin', 'claims_supervisor')
  @ApiOperation({ summary: 'Assign a reviewer to a prior authorization' })
  @ApiResponse({ status: 200, description: 'Reviewer assigned, PA moved to in_review' })
  @ApiResponse({ status: 404, description: 'PA not found' })
  async assignReviewer(
    @Param('id') id: string,
    @Body() dto: AssignReviewerDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.priorAuthService.assignReviewer(id, dto, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }
}
