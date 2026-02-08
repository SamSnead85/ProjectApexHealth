import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './entities/invoice.entity';
import { PaymentEntity } from './entities/payment.entity';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity, PaymentEntity])],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
