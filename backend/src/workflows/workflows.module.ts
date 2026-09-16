import { Module } from '@nestjs/common';
import { WorkflowsController, WorkflowExecutionsController } from './workflows.controller';
import { WorkflowsService } from './workflows.service';
import { ConditionEvaluatorService } from './services/condition-evaluator.service';
import { ActionExecutorService } from './services/action-executor.service';
import { EventBusService } from './services/event-bus.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [PrismaModule, AuditLogsModule, IntegrationsModule],
  controllers: [WorkflowsController, WorkflowExecutionsController],
  providers: [
    WorkflowsService,
    ConditionEvaluatorService,
    ActionExecutorService,
    EventBusService,
  ],
  exports: [WorkflowsService, EventBusService],
})
export class WorkflowsModule {}
