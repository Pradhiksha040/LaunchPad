import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { DeveloperService } from './developer.service';
import { DeveloperController } from './developer.controller';
import { ApiKeyAuthGuard } from './guards/api-key-auth.guard';

@Module({
  imports: [PrismaModule],
  controllers: [DeveloperController],
  providers: [DeveloperService, ApiKeyAuthGuard],
  exports: [DeveloperService, ApiKeyAuthGuard],
})
export class DeveloperModule {}
