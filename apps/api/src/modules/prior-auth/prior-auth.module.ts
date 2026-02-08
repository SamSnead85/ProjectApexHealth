import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PriorAuthEntity } from './entities/prior-auth.entity';
import { PriorAuthController } from './prior-auth.controller';
import { PriorAuthService } from './prior-auth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PriorAuthEntity]),
    BullModule.registerQueue({
      name: 'prior-auth-review',
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 100,
        attempts: 3,
        backoff: { type: 'exponential', delay: 3000 },
      },
    }),
  ],
  controllers: [PriorAuthController],
  providers: [PriorAuthService],
  exports: [PriorAuthService],
})
export class PriorAuthModule {}
