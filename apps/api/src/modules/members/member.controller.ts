import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MemberService } from './member.service';
import { CreateMemberDto, UpdateMemberDto, SearchMemberDto } from './dto/member.dto';

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('members')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  async create(@Body() dto: CreateMemberDto, @CurrentUser() user: any) {
    const member = await this.memberService.create(dto, user.organizationId);
    return {
      success: true,
      data: member,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search members with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Member search results' })
  async search(@Query() params: SearchMemberDto, @CurrentUser() user: any) {
    const results = await this.memberService.search(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/360')
  @ApiOperation({ summary: 'Get Member 360 aggregated view' })
  @ApiParam({ name: 'id', description: 'Member UUID' })
  @ApiResponse({ status: 200, description: 'Member 360 view returned' })
  async getMember360(@Param('id') id: string, @CurrentUser() user: any) {
    const view = await this.memberService.getMember360(id, user.organizationId);
    return {
      success: true,
      data: view,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/care-team')
  @ApiOperation({ summary: 'Get member care team' })
  @ApiParam({ name: 'id', description: 'Member UUID' })
  @ApiResponse({ status: 200, description: 'Care team returned' })
  async getCareTeam(@Param('id') id: string, @CurrentUser() user: any) {
    const careTeam = await this.memberService.getCareTeam(id, user.organizationId);
    return {
      success: true,
      data: careTeam,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/alerts')
  @ApiOperation({ summary: 'Get member alerts' })
  @ApiParam({ name: 'id', description: 'Member UUID' })
  @ApiResponse({ status: 200, description: 'Alerts returned' })
  async getAlerts(@Param('id') id: string, @CurrentUser() user: any) {
    const alerts = await this.memberService.getAlerts(id, user.organizationId);
    return {
      success: true,
      data: alerts,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiParam({ name: 'id', description: 'Member UUID' })
  @ApiResponse({ status: 200, description: 'Member found' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const member = await this.memberService.findById(id, user.organizationId);
    return {
      success: true,
      data: member,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update member' })
  @ApiParam({ name: 'id', description: 'Member UUID' })
  @ApiResponse({ status: 200, description: 'Member updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    const member = await this.memberService.update(id, dto, user.organizationId);
    return {
      success: true,
      data: member,
      timestamp: new Date().toISOString(),
    };
  }
}
