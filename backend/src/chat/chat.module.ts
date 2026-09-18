import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { OpenAIProvider } from './providers/openai.provider';
import { MockFallbackLLMProvider } from './providers/fallback.provider';
import { LaunchPadKnowledgeService } from './services/launchpad-knowledge.service';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [ChatController],
  providers: [
    ChatService,
    AIProviderFactory,
    OpenAIProvider,
    MockFallbackLLMProvider,
    LaunchPadKnowledgeService,
  ],
  exports: [ChatService, AIProviderFactory],
})
export class ChatModule {}
