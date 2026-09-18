import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { SendChatMessageDto } from './dto/chat-request.dto';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { LaunchPadKnowledgeService } from './services/launchpad-knowledge.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AIProviderMessage } from './providers/ai-provider.interface';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private prisma: PrismaService,
    private providerFactory: AIProviderFactory,
    private knowledgeService: LaunchPadKnowledgeService,
    private auditLogsService: AuditLogsService,
  ) {}

  /**
   * Process a chat message and return assistant response
   */
  async sendMessage(dto: SendChatMessageDto, user: UserPayload) {
    if (!dto.message || dto.message.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    if (dto.message.length > 2000) {
      throw new BadRequestException('Message exceeds maximum limit of 2000 characters');
    }

    // 1. Resolve or create conversation
    let conversation = await this.getOrCreateConversation(dto, user);

    // 2. Persist user message
    const userMsg = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: dto.message,
        metadata: dto.context ? (dto.context as any) : undefined,
      },
    });

    // 3. Fetch previous message history (Limit to last 10 messages for token budget)
    const history = await this.prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    // 4. Construct AI prompt options & context
    const systemInstruction = `You are LaunchPad Assistant, an intelligent, helpful, and concise AI guide for the LaunchPad Enterprise SaaS Application Builder.
You help users understand features, build applications, configure modules, set up integrations, manage roles, and troubleshoot errors.
Never invent unsupported platform features. Strictly observe multi-tenant security boundaries. Never reveal internal API keys, database credentials, or secret configuration.

${this.knowledgeService.buildContextPrompt(dto.message, {
  organizationId: user.organizationId,
  role: user.role,
  userName: user.name,
  ...dto.context,
})}`;

    const formattedMessages: AIProviderMessage[] = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // 5. Generate AI response
    const provider = this.providerFactory.getProvider();
    const aiResponse = await provider.generateResponse({
      messages: formattedMessages,
      systemInstruction,
      context: dto.context,
      temperature: 0.7,
    });

    // 6. Persist assistant response
    const assistantMsg = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse.content,
        metadata: aiResponse.metadata ? (aiResponse.metadata as any) : undefined,
      },
    });

    // Update conversation title if first message
    if (history.length <= 2) {
      const generatedTitle =
        dto.message.length > 40
          ? `${dto.message.substring(0, 37)}...`
          : dto.message;
      await this.prisma.chatConversation.update({
        where: { id: conversation.id },
        data: { title: generatedTitle },
      });
      conversation.title = generatedTitle;
    }

    // Log audit event
    try {
      await this.auditLogsService.logAction({
        userId: user.userId,
        organizationId: user.organizationId,
        action: 'CHAT_ASSISTANT_INTERACTION',
        resource: 'LaunchPadAssistant',
        resourceId: conversation.id,
        details: JSON.stringify({ provider: provider.name }),
      });
    } catch {
      // Non-blocking log failure fallback
    }

    return {
      conversationId: conversation.id,
      title: conversation.title,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    };
  }

  /**
   * Stream response for SSE / realtime typing interfaces
   */
  async streamMessage(
    dto: SendChatMessageDto,
    user: UserPayload,
    onChunk: (chunk: string) => void,
  ) {
    if (!dto.message || dto.message.trim().length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    let conversation = await this.getOrCreateConversation(dto, user);

    await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: dto.message,
        metadata: dto.context ? (dto.context as any) : undefined,
      },
    });

    const history = await this.prisma.chatMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const systemInstruction = `You are LaunchPad Assistant. Help the user with LaunchPad features. Be concise.

${this.knowledgeService.buildContextPrompt(dto.message, {
  organizationId: user.organizationId,
  role: user.role,
  ...dto.context,
})}`;

    const formattedMessages: AIProviderMessage[] = history.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    const provider = this.providerFactory.getProvider();
    let fullResponse = '';

    if (provider.streamResponse) {
      const res = await provider.streamResponse(
        { messages: formattedMessages, systemInstruction, context: dto.context },
        (chunk) => {
          fullResponse += chunk;
          onChunk(chunk);
        },
      );
      fullResponse = res.content || fullResponse;
    } else {
      const res = await provider.generateResponse({
        messages: formattedMessages,
        systemInstruction,
        context: dto.context,
      });
      fullResponse = res.content;
      onChunk(fullResponse);
    }

    const assistantMsg = await this.prisma.chatMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: fullResponse,
      },
    });

    return {
      conversationId: conversation.id,
      assistantMessage: assistantMsg,
    };
  }

  /**
   * Get tenant conversations for authenticated user
   */
  async getConversations(user: UserPayload) {
    return this.prisma.chatConversation.findMany({
      where: {
        organizationId: user.organizationId,
        userId: user.userId,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });
  }

  /**
   * Get single conversation history with messages
   */
  async getConversationById(id: string, user: UserPayload) {
    const conversation = await this.prisma.chatConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation ${id} not found`);
    }

    if (conversation.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access to conversation from another tenant is forbidden');
    }

    if (conversation.userId !== user.userId && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access to private conversation is forbidden');
    }

    return conversation;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(id: string, user: UserPayload) {
    const conversation = await this.getConversationById(id, user);

    await this.prisma.chatConversation.delete({
      where: { id: conversation.id },
    });

    return { success: true, message: `Conversation ${id} deleted` };
  }

  /**
   * Internal helper to get or create conversation
   */
  private async getOrCreateConversation(
    dto: SendChatMessageDto,
    user: UserPayload,
  ) {
    if (dto.conversationId) {
      const existing = await this.prisma.chatConversation.findUnique({
        where: { id: dto.conversationId },
      });

      if (existing) {
        if (existing.organizationId !== user.organizationId) {
          throw new ForbiddenException('Cross-tenant conversation access forbidden');
        }
        return existing;
      }
    }

    const defaultTitle =
      dto.message.length > 30
        ? `${dto.message.substring(0, 27)}...`
        : dto.message;

    return this.prisma.chatConversation.create({
      data: {
        organizationId: user.organizationId,
        userId: user.userId,
        applicationId: dto.applicationId || null,
        title: defaultTitle,
      },
    });
  }
}
