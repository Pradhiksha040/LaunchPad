import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma database connection successfully established.');
    } catch (e: any) {
      this.logger.error(`Database connection failed on startup: ${e.message}`, e.stack);
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
        throw new Error(`CRITICAL STARTUP FAILURE: PostgreSQL is unreachable via DATABASE_URL (${e.message}). Service cannot start.`);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
