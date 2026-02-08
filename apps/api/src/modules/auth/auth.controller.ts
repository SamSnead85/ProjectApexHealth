import {
  Controller, Post, Body, Get, UseGuards, Request,
  HttpCode, HttpStatus, Put, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto, CreateUserDto, ChangePasswordDto, RefreshTokenDto } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user and receive JWT tokens' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto.email, dto.password);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const result = await this.authService.refreshToken(dto.refreshToken);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@CurrentUser() user: any) {
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.authService.changePassword(user.id, dto.currentPassword, dto.newPassword);
    return {
      success: true,
      message: 'Password changed successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'org_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  async createUser(@CurrentUser() currentUser: any, @Body() dto: CreateUserDto) {
    const user = await this.authService.createUser({
      ...dto,
      organizationId: dto.organizationId || currentUser.organizationId,
    });
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('system_admin', 'org_admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List users in the organization' })
  async listUsers(@CurrentUser() user: any) {
    const users = await this.authService.getUsersByOrganization(user.organizationId);
    return {
      success: true,
      data: users.map(u => ({
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
      timestamp: new Date().toISOString(),
    };
  }
}
