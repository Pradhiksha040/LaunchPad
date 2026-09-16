import { Module } from '@nestjs/common';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

import { MarketplaceSecurityService } from './marketplace-security.service';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService, MarketplaceSecurityService],
  exports: [MarketplaceService, MarketplaceSecurityService],
})
export class MarketplaceModule {}
