import {
  Controller, Get, Post, Body, Param, Query,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import {
  CreateInvoiceDto, SearchInvoiceDto, ProcessPaymentDto,
  SearchPaymentDto, GeneratePremiumInvoicesDto,
} from './dto/billing.dto';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ─── Invoices ────────────────────────────────────────

  @Post('invoices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @CurrentUser() user: any) {
    const invoice = await this.billingService.createInvoice(dto, user.organizationId);
    return {
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Search invoices with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Invoice search results' })
  async searchInvoices(@Query() params: SearchInvoiceDto, @CurrentUser() user: any) {
    const results = await this.billingService.searchInvoices(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiParam({ name: 'id', description: 'Invoice UUID' })
  @ApiResponse({ status: 200, description: 'Invoice found' })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async getInvoice(@Param('id') id: string, @CurrentUser() user: any) {
    const invoice = await this.billingService.getInvoice(id, user.organizationId);
    return {
      success: true,
      data: invoice,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('invoices/generate-premium')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate premium invoices for an employer group' })
  @ApiResponse({ status: 201, description: 'Premium invoices generated' })
  async generatePremiumInvoices(
    @Body() dto: GeneratePremiumInvoicesDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.billingService.generatePremiumInvoices(dto, user.organizationId);
    return {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Payments ────────────────────────────────────────

  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Process a payment' })
  @ApiResponse({ status: 201, description: 'Payment processed successfully' })
  async processPayment(@Body() dto: ProcessPaymentDto, @CurrentUser() user: any) {
    const payment = await this.billingService.processPayment(dto, user.organizationId);
    return {
      success: true,
      data: payment,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('payments')
  @ApiOperation({ summary: 'Search payments with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Payment search results' })
  async searchPayments(@Query() params: SearchPaymentDto, @CurrentUser() user: any) {
    const results = await this.billingService.searchPayments(params, user.organizationId);
    return {
      success: true,
      ...results,
      timestamp: new Date().toISOString(),
    };
  }

  // ─── Stats ───────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Get billing revenue statistics' })
  @ApiResponse({ status: 200, description: 'Revenue stats returned' })
  async getStats(@CurrentUser() user: any) {
    const stats = await this.billingService.getRevenueStats(user.organizationId);
    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }
}
