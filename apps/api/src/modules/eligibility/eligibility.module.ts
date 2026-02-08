import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberEligibilityEntity } from './entities/member-eligibility.entity';
import { BenefitPlanEntity } from './entities/benefit-plan.entity';
import { EnrollmentEventEntity } from './entities/enrollment-event.entity';
import { EligibilityController } from './eligibility.controller';
import { EligibilityService } from './eligibility.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemberEligibilityEntity,
      BenefitPlanEntity,
      EnrollmentEventEntity,
    ]),
  ],
  controllers: [EligibilityController],
  providers: [EligibilityService],
  exports: [EligibilityService],
})
export class EligibilityModule {}
