import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdiTransactionEntity } from './entities/edi-transaction.entity';
import { EdiService } from './edi.service';
import { EdiController } from './edi.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EdiTransactionEntity])],
  controllers: [EdiController],
  providers: [EdiService],
  exports: [EdiService],
})
export class EDIModule {}
