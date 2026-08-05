import { Module } from '@nestjs/common';
import { CanonicalController } from './canonical.controller';
import { IntegrationHubModule } from '../integration-hub/integration-hub.module';

@Module({
  imports: [IntegrationHubModule],
  controllers: [CanonicalController],
})
export class CanonicalModule {}
