import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceBillingService } from './marketplace-billing.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

describe('Marketplace Billing, Monetization & Settlement Engine (Phase 22)', () => {
  let service: MarketplaceBillingService;
  let prisma: PrismaService;

  const mockUser = {
    userId: 'user-buyer-1',
    email: 'buyer@acme.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-buyer-1',
  };

  const mockPublisherUser = {
    userId: 'user-pub-1',
    email: 'pub@partner.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-pub-1',
  };

  const mockSuperAdmin = {
    userId: 'admin-super',
    email: 'super@launchpad.com',
    role: 'SUPER_ADMIN',
    organizationId: 'org-system',
  };

  const mockPaidAsset = {
    id: 'asset-paid-1',
    name: 'Enterprise VMS Pro OS',
    slug: 'enterprise-vms-pro-os',
    description: 'Premium visitor management app with custom branding.',
    price: 100,
    pricingType: 'ONE_TIME',
    status: 'PUBLISHED',
    publisherId: 'org-pub-1',
    publisher: { id: 'org-pub-1', name: 'Partner Vendor Inc' },
  };

  const mockFreeAsset = {
    id: 'asset-free-1',
    name: 'Free Starter Connector',
    slug: 'free-starter-connector',
    price: 0,
    pricingType: 'FREE',
    status: 'PUBLISHED',
    publisherId: 'org-pub-1',
  };

  const mockTransactionsStore: any[] = [];
  const mockLicensesStore: any[] = [];
  const mockPayoutsStore: any[] = [];
  const mockSettingsStore: any[] = [];

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    marketplaceAsset: {
      findUnique: jest.fn(),
    },
    platformSetting: {
      findUnique: jest.fn().mockImplementation((args) => {
        const item = mockSettingsStore.find((s) => s.key === args.where.key);
        return Promise.resolve(item || null);
      }),
      upsert: jest.fn().mockImplementation((args) => {
        const existing = mockSettingsStore.find((s) => s.key === args.where.key);
        if (existing) {
          existing.value = args.update.value;
          return existing;
        }
        const item = { id: `sett-${Date.now()}`, key: args.create.key, value: args.create.value };
        mockSettingsStore.push(item);
        return item;
      }),
    },
    marketplaceTransaction: {
      create: jest.fn().mockImplementation((args) => {
        const item = { id: `tx-${Date.now()}-${Math.random()}`, ...args.data };
        mockTransactionsStore.push(item);
        return item;
      }),
      findFirst: jest.fn().mockImplementation((args) => {
        const sessionId = args.where?.OR?.[0]?.stripeCheckoutSessionId || args.where?.OR?.[1]?.id;
        const found = mockTransactionsStore.find((t) => t.stripeCheckoutSessionId === sessionId || t.id === sessionId);
        return Promise.resolve(found || null);
      }),
      update: jest.fn().mockImplementation((args) => {
        const tx = mockTransactionsStore.find((t) => t.id === args.where.id);
        if (tx) {
          Object.assign(tx, args.data);
        }
        return tx;
      }),
      findMany: jest.fn().mockImplementation((args) => {
        let list = [...mockTransactionsStore];
        if (args?.where?.publisherOrgId) {
          list = list.filter((t) => t.publisherOrgId === args.where.publisherOrgId);
        }
        if (args?.where?.status) {
          list = list.filter((t) => t.status === args.where.status);
        }
        return Promise.resolve(list);
      }),
    },
    marketplaceLicense: {
      findFirst: jest.fn().mockImplementation((args) => {
        const match = mockLicensesStore.find(
          (l) => l.assetId === args.where.assetId && l.organizationId === args.where.organizationId && l.status === (args.where.status || 'ACTIVE'),
        );
        return Promise.resolve(match || null);
      }),
      create: jest.fn().mockImplementation((args) => {
        const item = { id: `lic-${Date.now()}`, ...args.data };
        mockLicensesStore.push(item);
        return item;
      }),
      update: jest.fn().mockImplementation((args) => {
        const lic = mockLicensesStore.find((l) => l.id === args.where.id);
        if (lic) Object.assign(lic, args.data);
        return lic;
      }),
      findMany: jest.fn().mockImplementation((args) => {
        const list = mockLicensesStore.filter((l) => l.organizationId === args.where.organizationId);
        return Promise.resolve(list);
      }),
    },
    marketplacePayout: {
      create: jest.fn().mockImplementation((args) => {
        const item = { id: `pay-${Date.now()}`, ...args.data };
        mockPayoutsStore.push(item);
        return item;
      }),
      findMany: jest.fn().mockImplementation((args) => {
        const list = mockPayoutsStore.filter((p) => p.publisherOrgId === args.where.publisherOrgId);
        return Promise.resolve(list);
      }),
    },
  };

  const mockAuditLogs = {
    logAction: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTransactionsStore.length = 0;
    mockLicensesStore.length = 0;
    mockPayoutsStore.length = 0;
    mockSettingsStore.length = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceBillingService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    service = module.get<MarketplaceBillingService>(MarketplaceBillingService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Configurable Platform Commission Rate', () => {
    it('should return default 15% (0.15) commission rate when no custom setting exists', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-pub-1', customCommissionRate: null });
      const rate = await service.getPlatformCommissionRate('org-pub-1');
      expect(rate).toEqual(0.15);
    });

    it('should allow SuperAdmin to update global commission rate', async () => {
      const res = await service.updatePlatformCommissionRate({ commissionRate: 0.20 }, mockSuperAdmin as any);
      expect(res.commissionRate).toEqual(0.20);
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_COMMISSION_RATE_UPDATED' }),
      );
    });

    it('should block non-SuperAdmin from updating commission rate', async () => {
      await expect(
        service.updatePlatformCommissionRate({ commissionRate: 0.10 }, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Marketplace Checkout & Revenue Share Calculation', () => {
    it('should create checkout session with dynamic 15% commission fee ($15 on $100 asset)', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockPaidAsset);
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-pub-1', customCommissionRate: null });

      const res = await service.createCheckoutSession({ assetId: 'asset-paid-1' }, mockUser as any);

      expect(res.amount).toEqual(100);
      expect(res.platformFee).toEqual(15);
      expect(res.publisherEarnings).toEqual(85);
      expect(res.idempotencyKey).toContain('chk_asset-paid-1_org-buyer-1');
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_PURCHASE_STARTED' }),
      );
    });

    it('should block publishers from buying their own assets', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockPaidAsset);

      await expect(
        service.createCheckoutSession({ assetId: 'asset-paid-1' }, mockPublisherUser as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Stripe Webhook Signature & Idempotent Entitlement Processing', () => {
    it('should process webhook idempotently, grant license, create payout, and prevent double processing', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockPaidAsset);
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-pub-1', customCommissionRate: null });

      // 1. Create Checkout Session
      const checkoutRes = await service.createCheckoutSession({ assetId: 'asset-paid-1' }, mockUser as any);

      // 2. First Webhook Trigger: checkout.session.completed
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            stripeCheckoutSessionId: checkoutRes.sessionId,
            payment_intent: 'pi_test_123456',
          },
        },
      };

      const webhookRes1 = await service.handleStripeWebhook(webhookPayload);
      expect(webhookRes1.status).toEqual('SUCCEEDED');
      expect(mockLicensesStore.length).toEqual(1);
      expect(mockPayoutsStore.length).toEqual(1);
      expect(mockPayoutsStore[0].amount).toEqual(85);

      // 3. Second Webhook Trigger (Duplicate): Idempotency prevents re-processing
      const webhookRes2 = await service.handleStripeWebhook(webhookPayload);
      expect(webhookRes2.alreadyProcessed).toEqual(true);
      expect(mockLicensesStore.length).toEqual(1); // Still 1 license
    });
  });

  describe('License Entitlement Gates', () => {
    it('should return true for free assets without requiring purchase license', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockFreeAsset);
      const hasLic = await service.hasActiveLicense('asset-free-1', 'org-buyer-1');
      expect(hasLic).toEqual(true);
    });

    it('should return false for paid asset if tenant organization has no active license', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockPaidAsset);
      const hasLic = await service.hasActiveLicense('asset-paid-1', 'org-buyer-1');
      expect(hasLic).toEqual(false);
    });
  });
});
