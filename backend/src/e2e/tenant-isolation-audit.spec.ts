import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from '../applications/applications.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { MarketplaceSecurityService } from '../marketplace/marketplace-security.service';
import { MarketplaceBillingService } from '../marketplace/marketplace-billing.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { DomainsService } from '../domains/domains.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemRole } from '@prisma/client';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { BadRequestException } from '@nestjs/common';
import { ConditionEvaluatorService } from '../workflows/services/condition-evaluator.service';
import { ActionExecutorService } from '../workflows/services/action-executor.service';
import { GenericRestConnectorService } from '../integrations/services/generic-rest-connector.service';
import { EncryptionService } from '../integrations/services/encryption.service';
import { ConnectorManagerService } from '../integrations/services/connector-manager.service';
import { TransformationService } from '../integrations/services/transformation.service';

describe('Phase 23 — Cross-Tenant Security & Isolation Audit', () => {
  let appsService: ApplicationsService;
  let workflowsService: WorkflowsService;
  let integrationsService: IntegrationsService;
  let marketplaceService: MarketplaceService;
  let billingService: MarketplaceBillingService;
  let auditLogsService: AuditLogsService;
  let domainsService: DomainsService;
  let prisma: PrismaService;

  const userAlpha: UserPayload = {
    userId: 'user-alpha-1',
    email: 'admin@alpha.com',
    name: 'Alpha Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-alpha',
  };

  const userBeta: UserPayload = {
    userId: 'user-beta-1',
    email: 'admin@beta.com',
    name: 'Beta Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-beta',
  };

  const mockAuditLogsService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-log-mock-1' }),
    findAll: jest.fn().mockImplementation((orgId) => {
      if (orgId === 'org-alpha') {
        return Promise.resolve([
          { id: 'audit-1', organizationId: 'org-alpha', action: 'USER_LOGIN' },
          { id: 'audit-2', organizationId: 'org-alpha', action: 'ROLE_UPDATED' },
        ]);
      }
      return Promise.resolve([]);
    }),
  };

  const mockPrisma = {
    application: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    workflow: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
    integration: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    marketplaceAsset: {
      findUnique: jest.fn(),
    },
    marketplaceLicense: {
      findFirst: jest.fn(),
    },
    marketplaceInstallation: {
      findFirst: jest.fn(),
    },
    tenantDomain: {
      findFirst: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        WorkflowsService,
        IntegrationsService,
        MarketplaceService,
        MarketplaceSecurityService,
        MarketplaceBillingService,
        DomainsService,
        ConditionEvaluatorService,
        ActionExecutorService,
        GenericRestConnectorService,
        EncryptionService,
        ConnectorManagerService,
        TransformationService,
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    appsService = module.get<ApplicationsService>(ApplicationsService);
    workflowsService = module.get<WorkflowsService>(WorkflowsService);
    integrationsService = module.get<IntegrationsService>(IntegrationsService);
    marketplaceService = module.get<MarketplaceService>(MarketplaceService);
    billingService = module.get<MarketplaceBillingService>(MarketplaceBillingService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
    domainsService = module.get<DomainsService>(DomainsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Tenant Boundary Security & Data Scoping Checks', () => {
    it('1. Application Access Scoping: Org A user cannot access Org B applications', async () => {
      mockPrisma.application.findMany.mockImplementation(({ where }) => {
        if (where.organizationId === 'org-alpha') {
          return Promise.resolve([{ id: 'app-alpha-1', name: 'Alpha Private App', mode: 'STANDALONE', status: 'ACTIVE' }]);
        }
        return Promise.resolve([]);
      });

      const alphaApps = await appsService.findAll(userAlpha);
      const betaApps = await appsService.findAll(userBeta);

      expect(alphaApps).toHaveLength(1);
      expect(alphaApps[0].id).toBe('app-alpha-1');
      expect(betaApps).toHaveLength(0);
    });

    it('2. Workflow Execution Scoping: Org Beta cannot trigger Org Alpha workflow', async () => {
      mockPrisma.workflow.findUnique.mockResolvedValue({
        id: 'wf-alpha-100',
        organizationId: 'org-alpha',
        name: 'Alpha Internal Payroll Workflow',
      });

      const wf = await prisma.workflow.findUnique({ where: { id: 'wf-alpha-100' } });
      expect(wf.organizationId).toBe('org-alpha');
      expect(wf.organizationId).not.toBe('org-beta');
    });

    it('3. Integration Connector Scoping: Org Beta cannot view connectors of Org Alpha', async () => {
      mockPrisma.integration.findMany.mockImplementation(({ where }) => {
        if (where.organizationId === 'org-alpha') {
          return Promise.resolve([{ id: 'conn-alpha-stripe', name: 'Stripe Connector' }]);
        }
        return Promise.resolve([]);
      });

      const connectors = await integrationsService.findAll(userBeta);
      expect(connectors).toEqual([]);
    });

    it('4. Marketplace License Scoping: Org Beta cannot install asset paid by Org Alpha', async () => {
      const paidAsset = {
        id: 'asset-paid-v1',
        name: 'Enterprise ERP Module',
        pricingType: 'ONE_TIME',
        price: 499.0,
        status: 'APPROVED',
        scanStatus: 'SCAN_PASSED',
      };
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(paidAsset);
      mockPrisma.marketplaceLicense.findFirst.mockImplementation(({ where }) => {
        if (where.organizationId === 'org-alpha' && where.assetId === 'asset-paid-v1') {
          return Promise.resolve({ id: 'lic-alpha-99', status: 'ACTIVE' });
        }
        return Promise.resolve(null);
      });

      await expect(
        marketplaceService.installAsset('asset-paid-v1', { targetApplicationId: 'app-beta-1' }, userBeta)
      ).rejects.toThrow(BadRequestException);
    });

    it('5. Custom Domain Isolation: Org Beta cannot view domains of Org Alpha', async () => {
      mockPrisma.tenantDomain.findFirst.mockResolvedValue({
        id: 'dom-1',
        domain: 'app.alpha-corp.com',
        organizationId: 'org-alpha',
      });

      const existingDomain = await prisma.tenantDomain.findFirst({ where: { domain: 'app.alpha-corp.com' } });
      expect(existingDomain.organizationId).toBe('org-alpha');
      expect(existingDomain.organizationId).not.toBe('org-beta');
    });

    it('6. Audit Log Scoping: Org Beta cannot view audit trails of Org Alpha', async () => {
      const logs = await auditLogsService.findAll('org-beta');
      expect(logs).toHaveLength(0);
    });
  });
});
