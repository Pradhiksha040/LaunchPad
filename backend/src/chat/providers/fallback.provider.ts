import { Injectable, Logger } from '@nestjs/common';
import {
  AIProvider,
  AIProviderOptions,
  AIProviderResponse,
} from './ai-provider.interface';
import { LaunchPadKnowledgeService } from '../services/launchpad-knowledge.service';

@Injectable()
export class MockFallbackLLMProvider implements AIProvider {
  readonly name = 'FallbackKnowledgeEngine';
  private readonly logger = new Logger(MockFallbackLLMProvider.name);

  constructor(private knowledgeService: LaunchPadKnowledgeService) {}

  async generateResponse(
    options: AIProviderOptions,
  ): Promise<AIProviderResponse> {
    const userMessages = options.messages.filter((m) => m.role === 'user');
    const lastUserMessage =
      userMessages.length > 0
        ? userMessages[userMessages.length - 1].content
        : 'Help with LaunchPad';

    const snippets = this.knowledgeService.findRelevantKnowledge(lastUserMessage);

    const mainSnippet = snippets[0];
    let responseText = `### LaunchPad Assistant\n\n${mainSnippet.content}\n\n`;

    if (mainSnippet.suggestedSteps && mainSnippet.suggestedSteps.length > 0) {
      responseText += `**Recommended Steps:**\n`;
      mainSnippet.suggestedSteps.forEach((step, idx) => {
        responseText += `${idx + 1}. ${step}\n`;
      });
    }

    if (options.context && options.context.appName) {
      responseText += `\n*Note: Context active for current application **${options.context.appName}**.*`;
    }

    return {
      content: responseText,
      metadata: {
        provider: this.name,
        matchedSnippet: mainSnippet.topic,
        fallbackMode: true,
      },
      usage: {
        promptTokens: lastUserMessage.length,
        completionTokens: responseText.length,
        totalTokens: lastUserMessage.length + responseText.length,
      },
    };
  }

  async streamResponse(
    options: AIProviderOptions,
    onChunk: (chunk: string) => void,
  ): Promise<AIProviderResponse> {
    const response = await this.generateResponse(options);
    const chunks = response.content.split(' ');

    for (const chunk of chunks) {
      onChunk(chunk + ' ');
      // Simulate small delay for streaming feel
      await new Promise((resolve) => setTimeout(resolve, 15));
    }

    return response;
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }
}
