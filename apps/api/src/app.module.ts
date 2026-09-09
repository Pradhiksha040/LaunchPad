import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { IntegrationHubModule } from './modules/integration-hub/integration-hub.module';
import { CanonicalModule } from './modules/canonical/canonical.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';
import { IndustryTemplatesModule } from './modules/industry-templates/industry-templates.module';
import { AIWizardModule } from './modules/ai-wizard/ai-wizard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrganizationModule,
    IntegrationHubModule,
    CanonicalModule,
    WorkflowsModule,
    IndustryTemplatesModule,
    AIWizardModule,
  ],
})
export class AppModule {}
