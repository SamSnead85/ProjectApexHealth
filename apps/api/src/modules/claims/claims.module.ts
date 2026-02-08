import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ClaimEntity } from './entities/claim.entity';
import { ClaimServiceLineEntity } from './entities/claim-service-line.entity';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { ClaimsProcessor } from './claims.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClaimEntity, ClaimServiceLineEntity]),
    BullModule.registerQueue({
      name: 'claims-processing',
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    }),
  ],
  controllers: [ClaimsController],
  providers: [ClaimsService, ClaimsProcessor],
  exports: [ClaimsService],
})
export class ClaimsModule {}
