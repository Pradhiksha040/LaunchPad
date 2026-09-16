import { Test, TestingModule } from '@nestjs/testing';
import { MarketplaceService } from './marketplace.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { MarketplaceSecurityService } from './marketplace-security.service';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('MarketplaceService', () => {
  let service: MarketplaceService;
  let prisma: PrismaService;
  let auditLogsService: AuditLogsService;

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

  const mockOtherUser = {
    userId: 'user-2',
    email: 'admin@other.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-2',
  };

  const mockAsset = {
    id: 'asset-1',
    name: 'Corporate Visitor Pass OS',
    slug: 'corporate-visitor-pass-os-12345',
    description: 'Complete Visitor Management System with QR Pass & Host Alerts',
    category: 'Operations',
    type: 'APPLICATION',
    version: '1.0.0',
    publisherId: 'org-1',
    authorName: 'Acme Corp',
    iconUrl: '',
    screenshots: [],
    tags: ['VMS', 'Operations'],
    pricingType: 'FREE',
    price: 0,
    status: 'DRAFT',
    scanStatus: 'SCAN_PASSED',
    installationsCount: 12,
    visibility: 'PUBLIC',
    requiredModules: ['Visitor Registration', 'Check-in'],
    configuration: {},
    changelog: 'Initial release',
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    marketplaceAsset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    application: {
      create: jest.fn(),
    },
    applicationModule: {
      create: jest.fn(),
    },
    marketplaceInstallation: {
      create: jest.fn(),
    },
  };

  const mockAuditLogs = {
    logAction: jest.fn().mockResolvedValue(true),
  };

  const mockSecurityService = {
    runSecurityScan: jest.fn().mockResolvedValue({
      scanStatus: 'SCAN_PASSED',
      findingsCount: 0,
      findings: [],
    }),
    getFindingsForAsset: jest.fn().mockResolvedValue([]),
    verifyPublisher: jest.fn().mockResolvedValue({ isPublisher: true, publisherStatus: 'VERIFIED' }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketplaceService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
        { provide: MarketplaceSecurityService, useValue: mockSecurityService },
      ],
    }).compile();

    service = module.get<MarketplaceService>(MarketplaceService);
    prisma = module.get<PrismaService>(PrismaService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerPublisher', () => {
    it('should register organization as a publisher', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1', name: 'Acme Corp' });
      mockPrisma.organization.update.mockResolvedValue({ id: 'org-1', isPublisher: true });

      const res = await service.registerPublisher({ publisherName: 'Acme Software' }, mockUser as any);
      expect(res.isPublisher).toBe(true);
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_PUBLISHER_REGISTERED' }),
      );
    });
  });

  describe('createAsset', () => {
    it('should create draft marketplace asset', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 'org-1', name: 'Acme Corp' });
      mockPrisma.marketplaceAsset.create.mockResolvedValue(mockAsset);

      const res = await service.createAsset(
        { name: 'Corporate Visitor Pass OS', description: 'VMS system' },
        mockUser as any,
      );

      expect(res.name).toEqual('Corporate Visitor Pass OS');
      expect(res.status).toEqual('DRAFT');
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_ASSET_CREATED' }),
      );
    });
  });

  describe('publishing lifecycle (submit, approve, reject, publish)', () => {
    it('should submit draft asset for review', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockAsset);
      mockPrisma.marketplaceAsset.update.mockResolvedValue({ ...mockAsset, status: 'SUBMITTED' });

      const res = await service.submitForReview('asset-1', mockUser as any);
      expect(res.asset.status).toBe('SUBMITTED');
    });

    it('should allow SuperAdmin to approve submitted asset', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({ ...mockAsset, status: 'SUBMITTED' });
      mockPrisma.marketplaceAsset.update.mockResolvedValue({ ...mockAsset, status: 'APPROVED' });

      const res = await service.approveAsset('asset-1', mockSuperAdmin as any);
      expect(res.status).toBe('APPROVED');
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_REVIEW_APPROVED' }),
      );
    });

    it('should reject non-SuperAdmin approval attempt', async () => {
      await expect(service.approveAsset('asset-1', mockUser as any)).rejects.toThrow(ForbiddenException);
    });

    it('should allow SuperAdmin to reject asset with reason', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({ ...mockAsset, status: 'SUBMITTED' });
      mockPrisma.marketplaceAsset.update.mockResolvedValue({
        ...mockAsset,
        status: 'REJECTED',
        rejectionReason: 'Missing icons',
      });

      const res = await service.rejectAsset('asset-1', { reason: 'Missing icons' }, mockSuperAdmin as any);
      expect(res.status).toBe('REJECTED');
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_REVIEW_REJECTED' }),
      );
    });

    it('should publish approved asset', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({ ...mockAsset, status: 'APPROVED' });
      mockPrisma.marketplaceAsset.update.mockResolvedValue({ ...mockAsset, status: 'PUBLISHED' });

      const res = await service.publishAsset('asset-1', mockUser as any);
      expect(res.status).toBe('PUBLISHED');
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_ASSET_PUBLISHED' }),
      );
    });

    it('should reject cross-tenant asset modifications', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(mockAsset);
      await expect(service.updateAsset('asset-1', { name: 'Hacked' }, mockOtherUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('installAsset', () => {
    it('should safely install marketplace asset into organization', async () => {
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue({ ...mockAsset, status: 'PUBLISHED' });
      mockPrisma.application.create.mockResolvedValue({ id: 'app-installed-1', name: 'Corporate Visitor Pass OS' });
      mockPrisma.applicationModule.create.mockResolvedValue({ id: 'mod-1' });
      mockPrisma.marketplaceInstallation.create.mockResolvedValue({ id: 'inst-1', status: 'ACTIVE' });
      mockPrisma.marketplaceAsset.update.mockResolvedValue({ ...mockAsset, installationsCount: 13 });

      const res = await service.installAsset('asset-1', {}, mockOtherUser as any);

      expect(res.success).toBe(true);
      expect(res.installedApplicationId).toEqual('app-installed-1');
      expect(mockPrisma.application.create).toHaveBeenCalled();
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'MARKETPLACE_ASSET_INSTALLED' }),
      );
    });
  });
});
