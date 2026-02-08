import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { WorkflowService } from './workflow.service';
import { WorkflowController } from './workflow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowEntity, WorkflowExecutionEntity])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
