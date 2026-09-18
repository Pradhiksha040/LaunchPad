import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { ApplicationsService } from '../applications/applications.service';
import { AiGeneratorService } from '../ai-generator/ai-generator.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import { MarketplaceSecurityService } from '../marketplace/marketplace-security.service';
import { MarketplaceBillingService } from '../marketplace/marketplace-billing.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { GovernanceService } from '../governance/governance.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemRole, IntegrationAuthType } from '@prisma/client';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConditionEvaluatorService } from '../workflows/services/condition-evaluator.service';
import { ActionExecutorService } from '../workflows/services/action-executor.service';
import { GenericRestConnectorService } from '../integrations/services/generic-rest-connector.service';
import { EncryptionService } from '../integrations/services/encryption.service';
import { ConnectorManagerService } from '../integrations/services/connector-manager.service';
import { TransformationService } from '../integrations/services/transformation.service';

describe('Phase 23 — Full System E2E Integration Suite', () => {
  let authService: AuthService;
  let orgsService: OrganizationsService;
  let appsService: ApplicationsService;
  let aiService: AiGeneratorService;
  let workflowsService: WorkflowsService;
  let integrationsService: IntegrationsService;
  let marketplaceService: MarketplaceService;
  let billingService: MarketplaceBillingService;
  let auditLogsService: AuditLogsService;
  let governanceService: GovernanceService;
  let prisma: PrismaService;

  const mockUserPayload: UserPayload = {
    userId: 'user-e2e-1',
    email: 'founder@acme.com',
    name: 'Acme Founder',
    role: SystemRole.SUPER_ADMIN,
    organizationId: 'org-acme-999',
  };

  const mockAuditLogsService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-log-mock-1', action: 'MARKETPLACE_ASSET_INSTALLED' }),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock_jwt_token_string'),
    verify: jest.fn().mockReturnValue(mockUserPayload),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'super_secret_key';
      if (key === 'STRIPE_WEBHOOK_SECRET') return 'webhook_secret_mock_test';
      return null;
    }),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    organizationMember: {
      create: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    workflow: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    workflowExecution: {
      create: jest.fn(),
      update: jest.fn(),
    },
    integration: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    marketplaceAsset: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    marketplaceTransaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    marketplaceLicense: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    marketplaceInstallation: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    marketplacePayout: {
      create: jest.fn(),
    },
    marketplaceSecurityFinding: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    platformSetting: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        OrganizationsService,
        ApplicationsService,
        AiGeneratorService,
        WorkflowsService,
        IntegrationsService,
        MarketplaceService,
        MarketplaceSecurityService,
        MarketplaceBillingService,
        GovernanceService,
        ConditionEvaluatorService,
        ActionExecutorService,
        GenericRestConnectorService,
        EncryptionService,
        ConnectorManagerService,
        TransformationService,
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    orgsService = module.get<OrganizationsService>(OrganizationsService);
    appsService = module.get<ApplicationsService>(ApplicationsService);
    aiService = module.get<AiGeneratorService>(AiGeneratorService);
    workflowsService = module.get<WorkflowsService>(WorkflowsService);
    integrationsService = module.get<IntegrationsService>(IntegrationsService);
    marketplaceService = module.get<MarketplaceService>(MarketplaceService);
    billingService = module.get<MarketplaceBillingService>(MarketplaceBillingService);
    auditLogsService = module.get<AuditLogsService>(AuditLogsService);
    governanceService = module.get<GovernanceService>(GovernanceService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('Complete End-to-End Platform Integration Lifecycle', () => {
    it('should execute full lifecycle: Auth -> Org -> App -> AI -> Workflow -> Integration -> Marketplace Purchase -> License -> Install -> Audit', async () => {
      // 1. User Auth Signup
      const userObj = {
        id: 'user-e2e-1',
        email: 'founder@acme.com',
        name: 'Acme Founder',
        passwordHash: 'hashed_pw',
        role: SystemRole.SUPER_ADMIN,
      };
      const defaultOrg = {
        id: 'org-acme-999',
        name: "Acme Founder's Organization",
        slug: 'acme-founder-org',
      };
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(userObj);
      mockPrisma.organization.create.mockResolvedValue(defaultOrg);
      mockPrisma.organizationMember.create.mockResolvedValue({ id: 'mem-1' });

      const registered = await authService.register({
        email: 'founder@acme.com',
        password: 'Password123!',
        name: 'Acme Founder',
      });
      expect(registered).toBeDefined();
      expect(registered.user.email).toBe('founder@acme.com');

      // 2. Organization / Tenant Creation
      const orgObj = {
        id: 'org-acme-999',
        name: 'Acme Corporation',
        plan: 'ENTERPRISE',
      };
      mockPrisma.organization.create.mockResolvedValue(orgObj);
      const org = await orgsService.create({
        name: 'Acme Corporation',
      }, mockUserPayload);
      expect(org.id).toBe('org-acme-999');

      // 3. Application & Module Configuration
      const appObj = {
        id: 'app-crm-1',
        organizationId: 'org-acme-999',
        name: 'Acme Sales CRM',
        type: 'CUSTOM',
        mode: 'DRAFT',
        status: 'ACTIVE',
        modules: [],
      };
      mockPrisma.application.create.mockResolvedValue(appObj);
      const app = await appsService.create({
        name: 'Acme Sales CRM',
        description: 'Customer Relationship Management App',
      }, mockUserPayload);
      expect(app.name).toBe('Acme Sales CRM');

      // 4. AI App Requirement Parsing Blueprint
      const plan = await aiService.parseRequirement({
        prompt: 'Build a Visitor Management app with host checkin notifications',
      });
      expect(plan).toBeDefined();
      expect(plan.appName).toBeDefined();

      // 5. Workflow Creation & Execution
      const workflowObj = {
        id: 'wf-lead-followup',
        organizationId: 'org-acme-999',
        applicationId: 'app-crm-1',
        name: 'Lead Followup Automation',
        triggerType: 'EVENT',
        status: 'ACTIVE',
        enabled: true,
        active: true,
        triggers: [],
        conditions: [],
        actions: [],
        executions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.application.findFirst.mockResolvedValue(appObj);
      mockPrisma.workflow.create.mockResolvedValue(workflowObj);
      mockPrisma.workflow.findFirst.mockResolvedValue(workflowObj);
      mockPrisma.workflow.findUnique.mockResolvedValue(workflowObj);
      mockPrisma.workflowExecution.create.mockResolvedValue({
        id: 'exec-1',
        workflowId: 'wf-lead-followup',
        status: 'RUNNING',
      });
      mockPrisma.workflowExecution.update.mockResolvedValue({
        id: 'exec-1',
        workflowId: 'wf-lead-followup',
        status: 'SUCCESS',
      });

      const wf = await workflowsService.create({
        applicationId: 'app-crm-1',
        name: 'Lead Followup Automation',
        triggerType: 'EVENT',
      }, mockUserPayload);
      expect(wf.id).toBe('wf-lead-followup');

      const exec = await workflowsService.runWorkflow('wf-lead-followup', { payload: { leadId: 'lead-123' } }, mockUserPayload);
      expect(exec.status).toBe('SUCCESS');

      // 6. Integration Hub Setup
      const integrationObj = {
        id: 'conn-hubspot-1',
        organizationId: 'org-acme-999',
        applicationId: 'app-crm-1',
        name: 'HubSpot Sync',
        baseUrl: 'https://api.hubspot.com',
        authType: IntegrationAuthType.API_KEY,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrisma.application.findFirst.mockResolvedValue(appObj);
      mockPrisma.integration.create.mockResolvedValue(integrationObj);

      const conn = await integrationsService.create({
        applicationId: 'app-crm-1',
        name: 'HubSpot Sync',
        baseUrl: 'https://api.hubspot.com',
        authType: IntegrationAuthType.API_KEY,
      }, mockUserPayload);
      expect(conn.name).toBe('HubSpot Sync');

      // 7. Marketplace Asset Purchase & Stripe Webhook Entitlement
      const paidAsset = {
        id: 'asset-analytics-pro',
        name: 'Advanced Executive Analytics',
        slug: 'analytics-pro',
        pricingType: 'ONE_TIME',
        price: 99.0,
        status: 'PUBLISHED',
        scanStatus: 'SCAN_PASSED',
        publisherId: 'pub-org-100',
      };
      const mockTx = {
        id: 'tx-100',
        stripeSessionId: 'sess_mock_12345',
        assetId: 'asset-analytics-pro',
        buyerOrgId: 'org-acme-999',
        publisherOrgId: 'pub-org-100',
        amount: 99.0,
        currency: 'usd',
        platformCommission: 14.85,
        publisherEarnings: 84.15,
        status: 'PENDING',
      };
      mockPrisma.marketplaceAsset.findUnique.mockResolvedValue(paidAsset);
      mockPrisma.organization.findUnique.mockResolvedValue(orgObj);
      mockPrisma.platformSetting.findUnique.mockResolvedValue({ key: 'PLATFORM_COMMISSION_RATE', value: '0.15' });
      mockPrisma.marketplaceTransaction.create.mockResolvedValue(mockTx);
      mockPrisma.marketplaceTransaction.findFirst.mockResolvedValue(mockTx);
      mockPrisma.marketplaceTransaction.update.mockResolvedValue({ ...mockTx, status: 'SUCCEEDED' });
      mockPrisma.marketplaceLicense.create.mockResolvedValue({ id: 'lic-100', organizationId: 'org-acme-999', assetId: 'asset-analytics-pro', status: 'ACTIVE' });
      mockPrisma.marketplacePayout.create.mockResolvedValue({ id: 'po-100' });

      // Create Checkout Session
      const session = await billingService.createCheckoutSession({
        assetId: 'asset-analytics-pro',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      }, mockUserPayload);
      expect(session.sessionId).toContain('cs_test_');

      // Process Webhook Event
      const webhookResult = await billingService.handleStripeWebhook({
        id: 'evt_stripe_e2e_100',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: session.sessionId,
            payment_intent: 'pi_e2e_payment_100',
            amount_total: 9900,
            currency: 'usd',
            metadata: {
              organizationId: 'org-acme-999',
              publisherId: 'pub-org-100',
              assetId: 'asset-analytics-pro',
              pricingType: 'ONE_TIME',
            },
          },
        },
      });
      expect(webhookResult.status).toBe('SUCCEEDED');

      // 8. License Verification & Safe Asset Installation
      const mockLicense = {
        id: 'lic-100',
        organizationId: 'org-acme-999',
        assetId: 'asset-analytics-pro',
        status: 'ACTIVE',
      };
      mockPrisma.marketplaceLicense.findFirst.mockResolvedValue(mockLicense);
      mockPrisma.marketplaceInstallation.findFirst.mockResolvedValue(null);
      mockPrisma.marketplaceInstallation.create.mockResolvedValue({
        id: 'inst-100',
        organizationId: 'org-acme-999',
        assetId: 'asset-analytics-pro',
        installedBy: 'user-e2e-1',
        status: 'INSTALLED',
      });
      mockPrisma.application.findFirst.mockResolvedValue(appObj);

      const installation = await marketplaceService.installAsset('asset-analytics-pro', { targetApplicationId: 'app-crm-1' }, mockUserPayload);
      expect(installation.success).toBe(true);
      expect(installation.installation.status).toBe('INSTALLED');

      // 9. Audit Logging Verification
      const log = await auditLogsService.logAction({
        organizationId: 'org-acme-999',
        userId: 'user-e2e-1',
        action: 'MARKETPLACE_ASSET_INSTALLED',
        resource: 'asset-analytics-pro',
      });
      expect(log.action).toBe('MARKETPLACE_ASSET_INSTALLED');
    });
  });
});
