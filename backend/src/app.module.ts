import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { RolesModule } from './roles/roles.module';
import { ApplicationsModule } from './applications/applications.module';
import { TemplatesModule } from './templates/templates.module';
import { SettingsModule } from './settings/settings.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DeveloperModule } from './developer/developer.module';
import { AiGeneratorModule } from './ai-generator/ai-generator.module';
import { GovernanceModule } from './governance/governance.module';
import { DomainsModule } from './domains/domains.module';
import { MarketplaceModule } from './marketplace/marketplace.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    RolesModule,
    ApplicationsModule,
    TemplatesModule,
    SettingsModule,
    AuditLogsModule,
    IntegrationsModule,
    WorkflowsModule,
    AnalyticsModule,
    DeveloperModule,
    AiGeneratorModule,
    GovernanceModule,
    DomainsModule,
    MarketplaceModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
