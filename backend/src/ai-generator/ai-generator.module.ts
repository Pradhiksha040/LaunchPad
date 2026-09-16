import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ApplicationsModule } from '../applications/applications.module';
import { WorkflowsModule } from '../workflows/workflows.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { AiGeneratorService } from './ai-generator.service';
import { AiGeneratorController } from './ai-generator.controller';

@Module({
  imports: [PrismaModule, ApplicationsModule, WorkflowsModule, AuditLogsModule],
  controllers: [AiGeneratorController],
  providers: [AiGeneratorService],
  exports: [AiGeneratorService],
})
export class AiGeneratorModule {}
