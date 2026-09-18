import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { MarketplaceSecurityService } from './marketplace-security.service';
import { MarketplaceBillingService } from './marketplace-billing.service';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceSecurityService, MarketplaceBillingService],
  exports: [MarketplaceService, MarketplaceSecurityService, MarketplaceBillingService],
})
export class MarketplaceModule {}
