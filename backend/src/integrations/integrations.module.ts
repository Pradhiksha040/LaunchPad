import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { EncryptionService } from './services/encryption.service';
import { GenericRestConnectorService } from './services/generic-rest-connector.service';
import { TransformationService } from './services/transformation.service';
import { ConnectorManagerService } from './services/connector-manager.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    EncryptionService,
    GenericRestConnectorService,
    TransformationService,
    ConnectorManagerService,
  ],
  exports: [IntegrationsService, ConnectorManagerService, GenericRestConnectorService],
})
export class IntegrationsModule {}
