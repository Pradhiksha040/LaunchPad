export interface AIProviderResponse {
  content: string;
  metadata?: Record<string, any>;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AIProviderMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIProviderOptions {
  messages: AIProviderMessage[];
  systemInstruction?: string;
  context?: Record<string, any>;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  name: string;
  generateResponse(options: AIProviderOptions): Promise<AIProviderResponse>;
  streamResponse?(
    options: AIProviderOptions,
    onChunk: (chunk: string) => void,
  ): Promise<AIProviderResponse>;
  healthCheck(): Promise<boolean>;
}
