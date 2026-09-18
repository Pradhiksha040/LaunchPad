import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from './ai-provider.interface';
import { OpenAIProvider } from './openai.provider';
import { MockFallbackLLMProvider } from './fallback.provider';

@Injectable()
export class AIProviderFactory {
  private readonly logger = new Logger(AIProviderFactory.name);

  constructor(
    private configService: ConfigService,
    private openAIProvider: OpenAIProvider,
    private fallbackProvider: MockFallbackLLMProvider,
  ) {}

  getProvider(): AIProvider {
    const providerName = (
      this.configService.get<string>('AI_PROVIDER') || 'fallback'
    ).toLowerCase();

    if (providerName === 'openai' || providerName === 'azure_openai') {
      return this.openAIProvider;
    }

    return this.fallbackProvider;
  }
}
