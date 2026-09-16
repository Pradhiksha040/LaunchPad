import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceSecurityService } from './marketplace-security.service';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

describe('Marketplace Security, Trust & Production Hardening', () => {
  let securityService: MarketplaceSecurityService;
  let marketplaceService: MarketplaceService;
  let prisma: PrismaService;

  const mockUser = {
    userId: 'user-1',
    email: 'admin@acme.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-1',
  };

  const mockSuperAdmin = {
    userId: 'admin-0',
    email: 'super@launchpad.com',
    role: 'SUPER_ADMIN',
    organizationId: 'org-system',
  };

  const mockCleanAsset = {
    id: 'asset-clean-1',
    name: 'Clean Certified HRMS Module',
    slug: 'clean-hrms-module',
    description: 'Standard HRMS leave management module with no external secrets.',
    category: 'HRMS',
    type: 'MODULE',
    version: '1.0.0',
    publisherId: 'org-1',
    status: 'SUBMITTED',
    scanStatus: 'SCAN_PENDING',
    requiredModules: ['Workflow Engine'],
    configuration: { timeoutMs: 5000 },
    changelog: 'Initial release',
  };

  const mockMaliciousSecretAsset = {
    id: 'asset-secret-1',
    name: 'Suspicious Integration App',
    slug: 'suspicious-integration-app',
    description: 'Leaked credentials payload test asset.',
    category: 'Integrations',
    type: 'APPLICATION',
    version: '1.0.0',
    publisherId: 'org-1',
    status: 'SUBMITTED',
    scanStatus: 'SCAN_PENDING',
    requiredModules: [],
    configuration: {
      awsSecret: 'AKIA1234567890ABCDEF',
      jwtToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    },
    changelog: 'Initial release',
  };

  const mockMaliciousEvalAsset = {
    id: 'asset-eval-1',
    name: 'Malware Handler App',
    slug: 'malware-handler-app',
    description: 'Asset using dangerous eval() dynamic execution.',
    category: 'Utilities',
    type: 'WORKFLOW',
    version: '1.0.0',
    publisherId: 'org-1',
    status: 'SUBMITTED',
    scanStatus: 'SCAN_PENDING',
    requiredModules: [],
    configuration: {
      customHandler: 'eval("console.log(process.env)")',
    },
    changelog: 'Initial release',
  };

  const mockHttpWebhookAsset = {
    id: 'asset-http-1',
    name: 'Unencrypted Webhook Asset',
    slug: 'unencrypted-webhook-asset',
    description: 'Asset pointing to plaintext HTTP webhook target.',
    category: 'Integrations',
    type: 'MODULE',
    version: '1.0.0',
    publisherId: 'org-1',
    status: 'SUBMITTED',
    scanStatus: 'SCAN_PENDING',
    requiredModules: [],
    configuration: {
      webhookUrl: 'http://api.external-unsecure-target.com/webhooks',
    },
    changelog: 'Initial release',
  };

  const mockFindingsStore: any[] = [];

  const mockPrisma = {
    marketplaceAsset: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    marketplaceSecurityFinding: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockImplementation((args) => {
        const item = { id: `finding-${Date.now()}-${Math.random()}`, ...args.data };
        mockFindingsStore.push(item);
        return item;
      }),
      findMany: jest.fn().mockImplementation(() => Promise.resolve(mockFindingsStore)),
    },
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditLogs = {
    logAction: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockFindingsStore.length = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceSecurityService,
        MarketplaceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    securityService = module.get<MarketplaceSecurityService>(MarketplaceSecurityService);
    marketplaceService = module.get<MarketplaceService>(MarketplaceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(securityService).toBeDefined();
    expect(marketplaceService).toBeDefined();
  });

  describe('Automated Security Scanner (Positive & Negative Tests)', () => {
    it('POSITIVE TEST: should pass clean asset with SCAN_PASSED status', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockCleanAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockCleanAsset,
        scanStatus: 'SCAN_PASSED',
      });

      const res = await securityService.runSecurityScan('asset-clean-1');

      expect(res.scanStatus).toEqual('SCAN_PASSED');
      expect(res.criticalCount).toEqual(0);
      expect(res.highCount).toEqual(0);
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_SECURITY_SCAN_COMPLETED' }),
      );
    });

    it('NEGATIVE TEST 1: should detect hardcoded AWS key and JWT token, setting SCAN_FAILED', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockMaliciousSecretAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockMaliciousSecretAsset,
        scanStatus: 'SCAN_FAILED',
      });

      const res = await securityService.runSecurityScan('asset-secret-1');

      expect(res.scanStatus).toEqual('SCAN_FAILED');
      expect(res.criticalCount).toBeGreaterThanOrEqual(1);
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_SECURITY_FAILURE' }),
      );
    });

    it('NEGATIVE TEST 2: should detect dangerous eval() execution code, setting SCAN_FAILED', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockMaliciousEvalAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockMaliciousEvalAsset,
        scanStatus: 'SCAN_FAILED',
      });

      const res = await securityService.runSecurityScan('asset-eval-1');

      expect(res.scanStatus).toEqual('SCAN_FAILED');
      expect(res.criticalCount).toBeGreaterThanOrEqual(1);
    });

    it('NEGATIVE TEST 3: should flag unencrypted plaintext HTTP webhook as WARNINGS_FOUND', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockHttpWebhookAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockHttpWebhookAsset,
        scanStatus: 'WARNINGS_FOUND',
      });

      const res = await securityService.runSecurityScan('asset-http-1');

      expect(res.scanStatus).toEqual('WARNINGS_FOUND');
      expect(res.mediumCount).toBeGreaterThanOrEqual(1);
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_SECURITY_WARNING' }),
      );
    });
  });

  describe('Publishing Gate & Review Security', () => {
    it('should block publishing asset with SCAN_FAILED status', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({
        ...mockCleanAsset,
        status: 'APPROVED',
        scanStatus: 'SCAN_FAILED',
      });

      await expect(marketplaceService.publishAsset('asset-clean-1', mockUser as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should block approval for asset with SCAN_FAILED status', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({
        ...mockCleanAsset,
        status: 'SUBMITTED',
        scanStatus: 'SCAN_FAILED',
      });

      await expect(marketplaceService.approveAsset('asset-clean-1', mockSuperAdmin as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reset scanStatus to SCAN_PENDING and status to DRAFT upon version upgrade', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({
        ...mockCleanAsset,
        status: 'APPROVED',
        scanStatus: 'SCAN_PASSED',
      });
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockCleanAsset,
        version: '1.1.0',
        status: 'DRAFT',
        scanStatus: 'SCAN_PENDING',
      });

      const res = await marketplaceService.updateAsset(
        'asset-clean-1',
        { version: '1.1.0' },
        mockUser as any,
      );

      expect(res.status).toEqual('DRAFT');
      expect(res.scanStatus).toEqual('SCAN_PENDING');
      expect(mockPrisma.marketplaceAsset.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            version: '1.1.0',
            scanStatus: 'SCAN_PENDING',
            status: 'DRAFT',
          }),
        }),
      );
    });
  });
});
