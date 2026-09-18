import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AIProviderFactory } from './providers/ai-provider.factory';
import { OpenAIProvider } from './providers/openai.provider';
import { MockFallbackLLMProvider } from './providers/fallback.provider';
import { LaunchPadKnowledgeService } from './services/launchpad-knowledge.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { SystemRole } from '@prisma/client';

describe('ChatService — LaunchPad Assistant Unit & Tenant Isolation Tests', () => {
  let chatService: ChatService;
  let prismaService: PrismaService;

  const mockUserPayloadTenant1: UserPayload = {
    userId: 'user-tenant-1',
    email: 'tenant1@acme.com',
    name: 'Tenant One Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-tenant-1',
  };

  const mockUserPayloadTenant2: UserPayload = {
    userId: 'user-tenant-2',
    email: 'tenant2@beta.com',
    name: 'Tenant Two Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-tenant-2',
  };

  const mockPrismaService = {
    chatConversation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    chatMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockAuditLogsService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-log-1' }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'AI_PROVIDER') return 'fallback';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        AIProviderFactory,
        OpenAIProvider,
        MockFallbackLLMProvider,
        LaunchPadKnowledgeService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    chatService = module.get<ChatService>(ChatService);
    prismaService = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('sendMessage', () => {
    it('should create a new conversation and return user & assistant messages', async () => {
      const mockConv = {
        id: 'conv-101',
        organizationId: 'org-tenant-1',
        userId: 'user-tenant-1',
        title: 'How do I create an app...',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.chatConversation.create.mockResolvedValue(mockConv);
      mockPrismaService.chatMessage.create
        .mockResolvedValueOnce({
          id: 'msg-user-1',
          conversationId: 'conv-101',
          role: 'user',
          content: 'How do I create an application?',
        })
        .mockResolvedValueOnce({
          id: 'msg-assistant-1',
          conversationId: 'conv-101',
          role: 'assistant',
          content: '### LaunchPad Assistant\n\nTo create an application...',
        });

      mockPrismaService.chatMessage.findMany.mockResolvedValue([]);
      mockPrismaService.chatConversation.update.mockResolvedValue(mockConv);

      const result = await chatService.sendMessage(
        { message: 'How do I create an application?' },
        mockUserPayloadTenant1,
      );

      expect(result).toBeDefined();
      expect(result.conversationId).toBe('conv-101');
      expect(result.assistantMessage.content).toContain('LaunchPad Assistant');
    });

    it('should enforce cross-tenant conversation isolation on existing conversation', async () => {
      mockPrismaService.chatConversation.findUnique.mockResolvedValue({
        id: 'conv-tenant-2',
        organizationId: 'org-tenant-2', // Belonging to Tenant 2
        userId: 'user-tenant-2',
        title: 'Tenant 2 Private Query',
      });

      // Tenant 1 attempts to send message to Tenant 2's conversation
      await expect(
        chatService.sendMessage(
          { conversationId: 'conv-tenant-2', message: 'Malicious Cross-Tenant Attempt' },
          mockUserPayloadTenant1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getConversationById', () => {
    it('should throw ForbiddenException if user tries to access conversation from another organization', async () => {
      mockPrismaService.chatConversation.findUnique.mockResolvedValue({
        id: 'conv-secret-2',
        organizationId: 'org-tenant-2',
        userId: 'user-tenant-2',
        messages: [],
      });

      await expect(
        chatService.getConversationById('conv-secret-2', mockUserPayloadTenant1),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return conversation if tenant matches', async () => {
      const mockConv = {
        id: 'conv-valid-1',
        organizationId: 'org-tenant-1',
        userId: 'user-tenant-1',
        messages: [{ id: 'm1', role: 'user', content: 'Hello' }],
      };

      mockPrismaService.chatConversation.findUnique.mockResolvedValue(mockConv);

      const result = await chatService.getConversationById(
        'conv-valid-1',
        mockUserPayloadTenant1,
      );

      expect(result).toEqual(mockConv);
    });
  });
});
