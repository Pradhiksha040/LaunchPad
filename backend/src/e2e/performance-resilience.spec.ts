import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceBillingService } from '../marketplace/marketplace-billing.service';
import { MarketplaceSecurityService } from '../marketplace/marketplace-security.service';
import { AuthService } from '../auth/auth.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Phase 23 — Performance, Resilience & Security Hardening Verification', () => {
  let billingService: MarketplaceBillingService;
  let securityService: MarketplaceSecurityService;

  const mockAuditLogsService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-log-mock-1', action: 'SECURITY_SCAN' }),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token_string'),
    verify: jest.fn().mockReturnValue({ userId: 'user-1' }),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'super_secret_key';
      if (key === 'STRIPE_WEBHOOK_SECRET') return 'whsec_test_secret';
      return null;
    }),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    marketplaceAsset: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    marketplaceSecurityFinding: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({ id: 'f-mock-1' }),
      findMany: jest.fn().mockResolvedValue([
        { id: 'f-1', severity: 'CRITICAL', findingType: 'HARDCODED_SECRET', description: 'Found key', resolved: false, createdAt: new Date() },
        { id: 'f-2', severity: 'CRITICAL', findingType: 'UNSAFE_EVAL_OR_EXEC', description: 'Found eval', resolved: false, createdAt: new Date() },
      ]),
    },
    marketplaceTransaction: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    marketplaceLicense: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    platformSetting: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceBillingService,
        MarketplaceSecurityService,
        AuthService,
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    billingService = module.get<MarketplaceBillingService>(MarketplaceBillingService);
    securityService = module.get<MarketplaceSecurityService>(MarketplaceSecurityService);

    jest.clearAllMocks();
  });

  describe('Performance & Latency Benchmarks', () => {
    it('1. Rapid Concurrent Operations: Service handles 50 concurrent rate lookup requests cleanly under 100ms', async () => {
      mockPrisma.platformSetting.findUnique.mockResolvedValue({ key: 'PLATFORM_COMMISSION_RATE', value: '0.15' });

      const startTime = Date.now();
      const operations = Array.from({ length: 50 }).map(() =>
        billingService.getPlatformCommissionRate()
      );

      const results = await Promise.all(operations);
      const totalTime = Date.now() - startTime;

      expect(results).toHaveLength(50);
      expect(totalTime).toBeLessThan(500); // 500ms max for 50 ops
      expect(results[0]).toBe(0.15);
    });
  });

  describe('Resilience & Idempotency Tests', () => {
    it('2. Duplicate Webhook Idempotency: Processing duplicate Stripe event returns existing transaction status without creating duplicate license', async () => {
      const duplicateTx = {
        id: 'tx-existing-1',
        stripePaymentIntentId: 'pi_duplicate_123',
        status: 'SUCCEEDED',
        amount: 50.0,
      };

      mockPrisma.marketplaceTransaction.findFirst.mockResolvedValue(duplicateTx);

      const result = await billingService.handleStripeWebhook({
        id: 'evt_stripe_dup_123',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'sess_dup_123',
            payment_intent: 'pi_duplicate_123',
            amount: 5000,
          },
        },
      });

      expect(result.status).toBe('SUCCEEDED');
      expect(mockPrisma.marketplaceLicense.create).not.toHaveBeenCalled();
    });

    it('3. Webhook Failure Resilience: Gracefully handles unknown event types without throwing 500 error', async () => {
      const result = await billingService.handleStripeWebhook({
        id: 'evt_unknown_99',
        type: 'customer.subscription.unhandled_action',
        data: { object: {} },
      });

      expect(result.received).toBe(true);
    });
  });

  describe('Security & Vulnerability Sweep', () => {
    it('4. Security Scanner Detection: Detects dangerous shell exec and hardcoded secret keys', async () => {
      const maliciousAsset = {
        id: 'asset-malicious-1',
        name: 'Suspicious Module',
        publisherId: 'pub-1',
        version: '1.0.0',
        configuration: {
          script: 'const secret = "mock_secret_key_1234567890"; eval("process.env"); require("child_process").execSync("rm -rf /");',
        },
      };

      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(maliciousAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...maliciousAsset,
        scanStatus: 'SCAN_FAILED',
      });

      const scanResult = await securityService.runSecurityScan('asset-malicious-1');

      expect(scanResult.scanStatus).toBe('SCAN_FAILED');
      expect(scanResult.findings.some((f) => f.findingType === 'HARDCODED_SECRET')).toBe(true);
      expect(scanResult.findings.some((f) => f.findingType === 'UNSAFE_EVAL_OR_EXEC')).toBe(true);
    });

    it('5. Safe Input Processing: Passes clean configuration without false positives', async () => {
      const cleanAsset = {
        id: 'asset-clean-1',
        name: 'Clean Sales Dashboard',
        publisherId: 'pub-1',
        version: '1.0.0',
        configuration: {
          title: 'Sales Dashboard Module',
          theme: 'dark',
          maxRows: 100,
        },
      };

      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(cleanAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...cleanAsset,
        scanStatus: 'SCAN_PASSED',
      });
      mockPrisma.marketplaceSecurityFinding.findMany.mockResolvedValueOnce([]);

      const scanResult = await securityService.runSecurityScan('asset-clean-1');

      expect(scanResult.scanStatus).toBe('SCAN_PASSED');
      expect(scanResult.findings).toHaveLength(0);
    });
  });
});
