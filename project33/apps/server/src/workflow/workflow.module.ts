import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { ProcessEngineService } from './process-engine.service';

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, ProcessEngineService],
  exports: [WorkflowService, ProcessEngineService],
})
export class WorkflowModule {}
