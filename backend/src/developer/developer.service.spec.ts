import { Test, TestingModule } from '@nestjs/testing';
import { DeveloperService } from './developer.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('DeveloperService', () => {
  let service: DeveloperService;
  let prismaMock: any;

  const mockApiKeyRecord = {
    id: 'key_123',
    organizationId: 'org_1',
    name: 'Test Key',
    keyPrefix: 'lp_live_',
    keyHash: 'dummyhash',
    keyMasked: 'lp_live_98a7****************3b1f',
    scopes: ['apps:read'],
    rateLimit: 100,
    status: 'active',
    expiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaMock = {
      apiKey: {
        create: jest.fn().mockResolvedValue(mockApiKeyRecord),
        findMany: jest.fn().mockResolvedValue([mockApiKeyRecord]),
        findUnique: jest.fn().mockResolvedValue(mockApiKeyRecord),
        findFirst: jest.fn().mockResolvedValue(mockApiKeyRecord),
        update: jest.fn().mockResolvedValue({ ...mockApiKeyRecord, status: 'revoked' }),
      },
      apiUsageLog: {
        count: jest.fn().mockResolvedValue(5),
        create: jest.fn().mockResolvedValue({ id: 'log_1' }),
      },
      webhookSubscription: {
        create: jest.fn().mockResolvedValue({ id: 'wh_1', name: 'Test Webhook', targetUrl: 'https://example.com/wh' }),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue({ id: 'wh_1', name: 'Test Webhook', targetUrl: 'https://example.com/wh' }),
        delete: jest.fn().mockResolvedValue({ id: 'wh_1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeveloperService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<DeveloperService>(DeveloperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApiKey', () => {
    it('should generate random key secret and store SHA-256 hash', async () => {
      const result = await service.createApiKey('org_1', { name: 'New Key' });

      expect(result.rawKeySecret).toContain('lp_live_');
      expect(prismaMock.apiKey.create).toHaveBeenCalled();
      expect(result.apiKey.id).toBe('key_123');
    });

    it('should throw BadRequestException if name is missing', async () => {
      await expect(service.createApiKey('org_1', { name: '' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateApiKey', () => {
    it('should validate valid raw key secret', async () => {
      const rawSecret = 'lp_live_abc123';
      const expectedHash = crypto.createHash('sha256').update(rawSecret).digest('hex');

      prismaMock.apiKey.findUnique.mockResolvedValueOnce({
        ...mockApiKeyRecord,
        keyHash: expectedHash,
      });

      const key = await service.validateApiKey(rawSecret);
      expect(key.id).toBe('key_123');
    });

    it('should throw UnauthorizedException if key format is invalid', async () => {
      await expect(service.validateApiKey('invalid_key')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('checkRateLimit', () => {
    it('should return true if request count is below rate limit', async () => {
      prismaMock.apiUsageLog.count.mockResolvedValueOnce(50);
      const allowed = await service.checkRateLimit('key_123', 100);
      expect(allowed).toBe(true);
    });

    it('should return false if request count exceeds rate limit', async () => {
      prismaMock.apiUsageLog.count.mockResolvedValueOnce(150);
      const allowed = await service.checkRateLimit('key_123', 100);
      expect(allowed).toBe(false);
    });
  });

  describe('webhooks', () => {
    it('should create webhook subscription', async () => {
      const wh = await service.createWebhook('org_1', {
        name: 'Order Webhook',
        targetUrl: 'https://example.com/hooks',
        events: ['order.created'],
      });
      expect(wh.id).toBe('wh_1');
    });
  });
});
