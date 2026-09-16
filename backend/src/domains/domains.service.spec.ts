import { Test, TestingModule } from '@nestjs/testing';
import { DomainsService } from './domains.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DomainsService', () => {
  let service: DomainsService;
  let prisma: PrismaService;
  let auditLogsService: AuditLogsService;

  const mockUser = {
    userId: 'user-1',
    email: 'admin@acme.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-1',
  };

  const mockOtherUser = {
    userId: 'user-2',
    email: 'admin@other.com',
    role: 'ORG_ADMIN',
    organizationId: 'org-2',
  };

  const mockDomainRecord = {
    id: 'domain-1',
    organizationId: 'org-1',
    applicationId: null,
    domain: 'portal.acme.com',
    type: 'CUSTOM',
    status: 'PENDING',
    verificationToken: 'lp_verify_1234567890abcdef',
    verificationTxtRecord: '_launchpad-challenge.portal.acme.com',
    isPrimary: false,
    verifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    tenantDomain: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditLogs = {
    logAction: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DomainsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLogsService, useValue: mockAuditLogs },
      ],
    }).compile();

    service = module.get<DomainsService>(DomainsService);
    prisma = module.get<PrismaService>(PrismaService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDomain', () => {
    it('should create a custom domain with verification token and txt record', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(null);
      mockPrisma.tenantDomain.create.mockResolvedValue(mockDomainRecord);

      const res = await service.createDomain({ domain: 'portal.acme.com' }, mockUser as any);

      expect(res.domain).toEqual('portal.acme.com');
      expect(res.status).toEqual('PENDING');
      expect(mockPrisma.tenantDomain.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            domain: 'portal.acme.com',
            organizationId: 'org-1',
            type: 'CUSTOM',
            status: 'PENDING',
          }),
        }),
      );
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DOMAIN_ADDED' }),
      );
    });

    it('should reject invalid domain formats', async () => {
      await expect(service.createDomain({ domain: 'invalid' }, mockUser as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject duplicate domain registration', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      await expect(
        service.createDomain({ domain: 'portal.acme.com' }, mockUser as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('verifyDomain', () => {
    it('should successfully verify test custom domain in staging/test mode', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      mockPrisma.tenantDomain.update.mockResolvedValue({
        ...mockDomainRecord,
        status: 'ACTIVE',
        verifiedAt: new Date(),
      });

      const res = await service.verifyDomain('domain-1', mockUser as any);
      expect(res.success).toBe(true);
      expect(mockPrisma.tenantDomain.update).toHaveBeenCalledWith({
        where: { id: 'domain-1' },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      });
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DOMAIN_VERIFIED' }),
      );
    });

    it('should reject cross-tenant domain verification', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      await expect(service.verifyDomain('domain-1', mockOtherUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('setPrimaryDomain', () => {
    it('should switch primary domain for organization', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      mockPrisma.tenantDomain.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.tenantDomain.update.mockResolvedValue({ ...mockDomainRecord, isPrimary: true });

      const res = await service.setPrimaryDomain('domain-1', mockUser as any);

      expect(res.isPrimary).toBe(true);
      expect(mockPrisma.tenantDomain.updateMany).toHaveBeenCalledWith({
        where: { organizationId: 'org-1' },
        data: { isPrimary: false },
      });
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PRIMARY_DOMAIN_CHANGED' }),
      );
    });
  });

  describe('removeDomain', () => {
    it('should remove custom domain record', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      mockPrisma.tenantDomain.delete.mockResolvedValue(mockDomainRecord);

      const res = await service.removeDomain('domain-1', mockUser as any);

      expect(res.success).toBe(true);
      expect(mockPrisma.tenantDomain.delete).toHaveBeenCalledWith({ where: { id: 'domain-1' } });
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DOMAIN_REMOVED' }),
      );
    });

    it('should prevent cross-tenant domain deletion', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue(mockDomainRecord);
      await expect(service.removeDomain('domain-1', mockOtherUser as any)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('resolveTenant', () => {
    it('should resolve tenant context and branding by registered domain', async () => {
      mockPrisma.tenantDomain.findUnique.mockResolvedValue({
        ...mockDomainRecord,
        organization: {
          id: 'org-1',
          name: 'Acme Corp',
          slug: 'acme-corp',
          branding: { primaryColor: '#2D5B46', appName: 'Acme Portal' },
        },
        application: null,
      });

      const res = await service.resolveTenant('portal.acme.com');

      expect(res.organizationId).toEqual('org-1');
      expect(res.organizationName).toEqual('Acme Corp');
      expect(res.branding.primaryColor).toEqual('#2D5B46');
      expect(res.branding.appName).toEqual('Acme Portal');
    });
  });

  describe('updateOrgBranding', () => {
    it('should update organization white-label branding', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({
        id: 'org-1',
        name: 'Acme Corp',
        branding: {},
      });
      mockPrisma.organization.update.mockResolvedValue({
        id: 'org-1',
        name: 'Acme Corp',
        branding: { primaryColor: '#173C2D', appName: 'Custom App' },
      });

      const res = await service.updateOrgBranding(
        'org-1',
        { primaryColor: '#173C2D', appName: 'Custom App' },
        mockUser as any,
      );

      expect(res.branding).toEqual({ primaryColor: '#173C2D', appName: 'Custom App' });
      expect(mockAuditLogs.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'BRANDING_UPDATED' }),
      );
    });
  });
});
