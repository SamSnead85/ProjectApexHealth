import {
  Controller, Get, Post, Put, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProviderService } from './provider.service';
import {
  CreateProviderDto, UpdateProviderDto,
  SearchProviderDto, UpdateCredentialingDto,
} from './dto/provider.dto';

@ApiTags('providers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('providers')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new provider' })
  @ApiResponse({ status: 201, description: 'Provider created successfully' })
  async create(@Body() dto: CreateProviderDto, @CurrentUser() user: any) {
    const provider = await this.providerService.create(dto, user.organizationId);
    return {
      success: true,
      data: provider,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('search')
  @ApiOperation({ summary: 'Search providers with filtering, geo-search, and pagination' })
  @ApiResponse({ status: 200, description: 'Provider search results' })
  async search(@Query() params: SearchProviderDto, @CurrentUser() user: any) {
    const results = await this.providerService.search(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get provider network statistics' })
  @ApiResponse({ status: 200, description: 'Network stats returned' })
  async getStats(@CurrentUser() user: any) {
    const stats = await this.providerService.getNetworkStats(user.organizationId);
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('npi/:npi')
  @ApiOperation({ summary: 'Find provider by NPI' })
  @ApiParam({ name: 'npi', description: 'National Provider Identifier' })
  @ApiResponse({ status: 200, description: 'Provider found' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findByNpi(@Param('npi') npi: string, @CurrentUser() user: any) {
    const provider = await this.providerService.findByNpi(npi, user.organizationId);
    return {
      success: true,
      data: provider,
      timestamp: new Date().toISOString(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({ status: 200, description: 'Provider found' })
  @ApiResponse({ status: 404, description: 'Provider not found' })
  async findById(@Param('id') id: string, @CurrentUser() user: any) {
    const provider = await this.providerService.findById(id, user.organizationId);
    return {
      success: true,
      data: provider,
      timestamp: new Date().toISOString(),
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update provider' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({ status: 200, description: 'Provider updated' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProviderDto,
    @CurrentUser() user: any,
  ) {
    const provider = await this.providerService.update(id, dto, user.organizationId);
    return {
      success: true,
      data: provider,
      timestamp: new Date().toISOString(),
    };
  }

  @Post(':id/credential')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update provider credentialing status' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({ status: 200, description: 'Credentialing status updated' })
  async updateCredentialing(
    @Param('id') id: string,
    @Body() dto: UpdateCredentialingDto,
    @CurrentUser() user: any,
  ) {
    const provider = await this.providerService.updateCredentialing(id, dto, user.organizationId);
    return {
      success: true,
      data: provider,
      timestamp: new Date().toISOString(),
    };
  }
}
