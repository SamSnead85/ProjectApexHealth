import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceEntity } from './entities/invoice.entity';
import { PaymentEntity } from './entities/payment.entity';
import {
  CreateInvoiceDto, SearchInvoiceDto, ProcessPaymentDto,
  SearchPaymentDto, GeneratePremiumInvoicesDto,
} from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(InvoiceEntity)
    private readonly invoiceRepository: Repository<InvoiceEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  // ─── Invoice Operations ──────────────────────────────

  async createInvoice(dto: CreateInvoiceDto, organizationId: string): Promise<InvoiceEntity> {
    // Calculate totals from line items
    const subtotal = dto.lineItems.reduce((sum, item) => sum + Number(item.totalPrice), 0);
    const tax = dto.taxAmount ?? 0;
    const adjustment = dto.adjustmentAmount ?? 0;
    const total = subtotal + tax - adjustment;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const invoice = this.invoiceRepository.create({
      ...dto,
      organizationId,
      invoiceNumber,
      status: 'draft',
      subtotalAmount: subtotal,
      taxAmount: tax,
      adjustmentAmount: adjustment,
      totalAmount: total,
      paidAmount: 0,
      balanceDue: total,
      lineItems: dto.lineItems.map((item, idx) => ({
        ...item,
        id: `LI-${idx + 1}`,
      })),
    });

    const saved = await this.invoiceRepository.save(invoice);
    this.logger.log(`Invoice created: ${saved.invoiceNumber} for ${dto.entityName} ($${total})`);
    return saved;
  }

  async getInvoice(id: string, organizationId: string): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, organizationId },
      relations: ['payments'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${id} not found`);
    }

    return invoice;
  }

  async searchInvoices(params: SearchInvoiceDto, organizationId: string): Promise<{
    data: InvoiceEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.invoiceRepository.createQueryBuilder('inv');
    qb.where('inv.organization_id = :organizationId', { organizationId });

    if (params.query) {
      qb.andWhere(
        '(inv.invoice_number ILIKE :query OR inv.entity_name ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.status) {
      qb.andWhere('inv.status = :status', { status: params.status });
    }

    if (params.entityType) {
      qb.andWhere('inv.entity_type = :entityType', { entityType: params.entityType });
    }

    if (params.entityId) {
      qb.andWhere('inv.entity_id = :entityId', { entityId: params.entityId });
    }

    if (params.dateFrom) {
      qb.andWhere('inv.invoice_date >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo) {
      qb.andWhere('inv.invoice_date <= :dateTo', { dateTo: params.dateTo });
    }

    qb.orderBy('inv.invoice_date', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Payment Operations ──────────────────────────────

  async processPayment(dto: ProcessPaymentDto, organizationId: string): Promise<PaymentEntity> {
    const referenceNumber = `PAY-${new Date().getFullYear()}-${uuidv4().slice(0, 8).toUpperCase()}`;

    const payment = this.paymentRepository.create({
      ...dto,
      organizationId,
      referenceNumber,
      currency: dto.currency ?? 'USD',
      status: 'processing',
    });

    const saved = await this.paymentRepository.save(payment);

    // If linked to an invoice, update invoice balances
    if (dto.invoiceId) {
      const invoice = await this.invoiceRepository.findOne({
        where: { id: dto.invoiceId, organizationId },
      });

      if (invoice) {
        invoice.paidAmount = Number(invoice.paidAmount) + Number(dto.amount);
        invoice.balanceDue = Number(invoice.totalAmount) - Number(invoice.paidAmount);

        if (invoice.balanceDue <= 0) {
          invoice.status = 'paid';
          invoice.paidDate = dto.paymentDate;
          invoice.balanceDue = 0;
        } else {
          invoice.status = 'partial';
        }

        await this.invoiceRepository.save(invoice);
        this.logger.log(`Invoice ${invoice.invoiceNumber} updated: paid=$${invoice.paidAmount}, balance=$${invoice.balanceDue}`);
      }
    }

    // Mark as completed (in production, this would be async after bank confirmation)
    saved.status = 'completed';
    saved.processedDate = new Date().toISOString().split('T')[0];
    await this.paymentRepository.save(saved);

    this.logger.log(`Payment processed: ${referenceNumber} ($${dto.amount}) via ${dto.paymentMethod}`);
    return saved;
  }

  async searchPayments(params: SearchPaymentDto, organizationId: string): Promise<{
    data: PaymentEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;

    const qb = this.paymentRepository.createQueryBuilder('pay');
    qb.where('pay.organization_id = :organizationId', { organizationId });

    if (params.query) {
      qb.andWhere(
        '(pay.reference_number ILIKE :query OR pay.payer_entity_name ILIKE :query OR pay.payee_entity_name ILIKE :query)',
        { query: `%${params.query}%` },
      );
    }

    if (params.invoiceId) {
      qb.andWhere('pay.invoice_id = :invoiceId', { invoiceId: params.invoiceId });
    }

    if (params.status) {
      qb.andWhere('pay.status = :status', { status: params.status });
    }

    if (params.transactionType) {
      qb.andWhere('pay.transaction_type = :transactionType', { transactionType: params.transactionType });
    }

    if (params.dateFrom) {
      qb.andWhere('pay.payment_date >= :dateFrom', { dateFrom: params.dateFrom });
    }

    if (params.dateTo) {
      qb.andWhere('pay.payment_date <= :dateTo', { dateTo: params.dateTo });
    }

    if (params.amountMin !== undefined) {
      qb.andWhere('pay.amount >= :amountMin', { amountMin: params.amountMin });
    }

    if (params.amountMax !== undefined) {
      qb.andWhere('pay.amount <= :amountMax', { amountMax: params.amountMax });
    }

    qb.orderBy('pay.payment_date', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Revenue Stats ───────────────────────────────────

  async getRevenueStats(organizationId: string): Promise<{
    totalRevenue: number;
    totalOutstanding: number;
    totalOverdue: number;
    invoicesByStatus: Record<string, number>;
    paymentsByMethod: Record<string, number>;
    monthlyRevenue: { month: string; amount: number }[];
  }> {
    // Total revenue (completed payments)
    const revenueResult = await this.paymentRepository
      .createQueryBuilder('pay')
      .select('COALESCE(SUM(pay.amount), 0)', 'total')
      .where('pay.organization_id = :organizationId', { organizationId })
      .andWhere('pay.status = :status', { status: 'completed' })
      .getRawOne();

    // Total outstanding (unpaid invoices)
    const outstandingResult = await this.invoiceRepository
      .createQueryBuilder('inv')
      .select('COALESCE(SUM(inv.balance_due), 0)', 'total')
      .where('inv.organization_id = :organizationId', { organizationId })
      .andWhere('inv.status IN (:...statuses)', { statuses: ['sent', 'partial'] })
      .getRawOne();

    // Total overdue
    const overdueResult = await this.invoiceRepository
      .createQueryBuilder('inv')
      .select('COALESCE(SUM(inv.balance_due), 0)', 'total')
      .where('inv.organization_id = :organizationId', { organizationId })
      .andWhere('inv.status = :status', { status: 'overdue' })
      .getRawOne();

    // Invoices by status
    const invoiceStatusCounts = await this.invoiceRepository
      .createQueryBuilder('inv')
      .select('inv.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('inv.organization_id = :organizationId', { organizationId })
      .groupBy('inv.status')
      .getRawMany();

    const invoicesByStatus: Record<string, number> = {};
    for (const row of invoiceStatusCounts) {
      invoicesByStatus[row.status] = parseInt(row.count, 10);
    }

    // Payments by method
    const paymentMethodCounts = await this.paymentRepository
      .createQueryBuilder('pay')
      .select('pay.payment_method', 'method')
      .addSelect('COUNT(*)', 'count')
      .where('pay.organization_id = :organizationId', { organizationId })
      .andWhere('pay.status = :status', { status: 'completed' })
      .groupBy('pay.payment_method')
      .getRawMany();

    const paymentsByMethod: Record<string, number> = {};
    for (const row of paymentMethodCounts) {
      paymentsByMethod[row.method] = parseInt(row.count, 10);
    }

    // Monthly revenue (last 12 months)
    const monthlyRevenue = await this.paymentRepository
      .createQueryBuilder('pay')
      .select("TO_CHAR(pay.payment_date::date, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(pay.amount), 0)', 'amount')
      .where('pay.organization_id = :organizationId', { organizationId })
      .andWhere('pay.status = :status', { status: 'completed' })
      .andWhere("pay.payment_date >= (CURRENT_DATE - INTERVAL '12 months')")
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();

    return {
      totalRevenue: parseFloat(revenueResult.total),
      totalOutstanding: parseFloat(outstandingResult.total),
      totalOverdue: parseFloat(overdueResult.total),
      invoicesByStatus,
      paymentsByMethod,
      monthlyRevenue: monthlyRevenue.map((r) => ({
        month: r.month,
        amount: parseFloat(r.amount),
      })),
    };
  }

  // ─── Batch Invoice Generation ────────────────────────

  async generatePremiumInvoices(
    dto: GeneratePremiumInvoicesDto,
    organizationId: string,
  ): Promise<{ generated: number; invoiceIds: string[] }> {
    this.logger.log(`Generating premium invoices for group ${dto.groupId}, period ${dto.period}`);

    // In production, this would:
    // 1. Query all active members in the group
    // 2. Look up their plan rates
    // 3. Create one invoice per employer group with member-level line items
    // For now, create a placeholder invoice

    const [year, month] = dto.period.split('-').map(Number);
    const periodStart = `${dto.period}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const periodEnd = `${dto.period}-${lastDay}`;

    const dueDate = new Date(year, month - 1, 1);
    dueDate.setDate(dueDate.getDate() - 15); // Due 15 days before period start

    const invoiceNumber = `INV-PREM-${dto.period}-${dto.groupId.slice(0, 8).toUpperCase()}`;

    const invoice = this.invoiceRepository.create({
      organizationId,
      invoiceNumber,
      status: 'draft',
      entityType: 'employer_group',
      entityId: dto.groupId,
      entityName: `Group ${dto.groupId}`, // In production, look up group name
      subtotalAmount: 0,
      taxAmount: 0,
      adjustmentAmount: 0,
      totalAmount: 0,
      paidAmount: 0,
      balanceDue: 0,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      periodStartDate: periodStart,
      periodEndDate: periodEnd,
      lineItems: [],
      notes: `Premium invoice for period ${dto.period}`,
    });

    const saved = await this.invoiceRepository.save(invoice);

    this.logger.log(`Generated premium invoice ${invoiceNumber} for group ${dto.groupId}`);

    return {
      generated: 1,
      invoiceIds: [saved.id],
    };
  }
}
