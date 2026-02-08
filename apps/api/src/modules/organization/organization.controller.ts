import {
  Controller, Get, Post, Put, Patch, Param, Query, Body,
  UseGuards, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam,
} from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import {
  CreateOrganizationDto, UpdateOrganizationDto, SearchOrganizationDto,
} from './dto/organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles('system_admin')
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Organization created successfully' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Organization slug already exists' })
  async create(@Body() dto: CreateOrganizationDto) {
    const org = await this.organizationService.create(dto);
    return {
      success: true,
      data: org,
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'List organizations with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organizations retrieved' })
  async list(@Query() params: SearchOrganizationDto) {
    const result = await this.organizationService.list(params);
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

  @Get(':id')
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const org = await this.organizationService.findById(id);
    return {
      success: true,
      data: org,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('slug/:slug')
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'Get organization by slug' })
  @ApiParam({ name: 'slug', description: 'Organization slug' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found' })
  async findBySlug(@Param('slug') slug: string) {
    const org = await this.organizationService.findBySlug(slug);
    return {
      success: true,
      data: org,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'Update an organization' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Organization not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() user: any,
  ) {
    // Org admins can only update their own organization
    if (user.role !== 'system_admin' && user.organizationId !== id) {
      return {
        success: false,
        message: 'You can only update your own organization',
        timestamp: new Date().toISOString(),
      };
    }

    const org = await this.organizationService.update(id, dto);
    return {
      success: true,
      data: org,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/modules')
  @Roles('system_admin')
  @ApiOperation({ summary: 'Update licensed modules for an organization' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Modules updated' })
  async updateModules(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('modules') modules: string[],
  ) {
    const org = await this.organizationService.updateModules(id, modules);
    return {
      success: true,
      data: { id: org.id, licensedModules: org.licensedModules },
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id/settings')
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'Get organization settings' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings retrieved' })
  async getSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'system_admin' && user.organizationId !== id) {
      return {
        success: false,
        message: 'You can only view your own organization settings',
        timestamp: new Date().toISOString(),
      };
    }

    const settings = await this.organizationService.getSettings(id);
    return {
      success: true,
      data: settings,
      timestamp: new Date().toISOString(),
    };
  }

  @Patch(':id/settings')
  @Roles('system_admin', 'org_admin')
  @ApiOperation({ summary: 'Update organization settings' })
  @ApiParam({ name: 'id', description: 'Organization UUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Settings updated' })
  async updateSettings(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() settings: Record<string, any>,
    @CurrentUser() user: any,
  ) {
    if (user.role !== 'system_admin' && user.organizationId !== id) {
      return {
        success: false,
        message: 'You can only update your own organization settings',
        timestamp: new Date().toISOString(),
      };
    }

    const updated = await this.organizationService.updateSettings(id, settings);
    return {
      success: true,
      data: updated,
      timestamp: new Date().toISOString(),
    };
  }
}
