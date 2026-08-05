import { Module } from '@nestjs/common';
import { IntegrationHubService } from './integration-hub.service';
import { IntegrationHubController } from './integration-hub.controller';

@Module({
  providers: [IntegrationHubService],
  controllers: [IntegrationHubController],
  exports: [IntegrationHubService],
})
export class IntegrationHubModule {}
