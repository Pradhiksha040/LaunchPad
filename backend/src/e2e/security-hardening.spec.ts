import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ForbiddenException, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { ApplicationsService } from '../applications/applications.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthRateLimitGuard } from '../common/guards/auth-rate-limit.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { SystemRole, IntegrationAuthType, IntegrationStatus, WorkflowStatus } from '@prisma/client';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { ConditionEvaluatorService } from '../workflows/services/condition-evaluator.service';
import { ActionExecutorService } from '../workflows/services/action-executor.service';
import { GenericRestConnectorService } from '../integrations/services/generic-rest-connector.service';
import { EncryptionService } from '../integrations/services/encryption.service';
import { ConnectorManagerService } from '../integrations/services/connector-manager.service';
import { TransformationService } from '../integrations/services/transformation.service';
import * as bcrypt from 'bcrypt';

describe('Phase 3 — Security Hardening, Multi-Tenancy & Reliability Suite', () => {
  let authService: AuthService;
  let appsService: ApplicationsService;
  let integrationsService: IntegrationsService;
  let workflowsService: WorkflowsService;
  let analyticsService: AnalyticsService;
  let jwtStrategy: JwtStrategy;
  let rolesGuard: RolesGuard;
  let prisma: PrismaService;
  let reflector: Reflector;

  const mockOrgAlpha = 'org-alpha-100';
  const mockOrgBeta = 'org-beta-200';

  const userAlphaAdmin: UserPayload = {
    userId: 'user-alpha-1',
    email: 'admin@alpha-corp.io',
    name: 'Alpha Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: mockOrgAlpha,
  };

  const userAlphaViewer: UserPayload = {
    userId: 'user-alpha-2',
    email: 'viewer@alpha-corp.io',
    name: 'Alpha Viewer',
    role: SystemRole.VIEWER,
    organizationId: mockOrgAlpha,
  };

  const userBetaAdmin: UserPayload = {
    userId: 'user-beta-1',
    email: 'admin@beta-corp.io',
    name: 'Beta Admin',
    role: SystemRole.ORG_ADMIN,
    organizationId: mockOrgBeta,
  };

  const userSuperAdmin: UserPayload = {
    userId: 'user-super-1',
    email: 'super@launchpad-os.com',
    name: 'Global SuperAdmin',
    role: SystemRole.SUPER_ADMIN,
    organizationId: mockOrgAlpha,
  };

  const mockAuditLogsService = {
    logAction: jest.fn().mockResolvedValue({ id: 'audit-mock-id' }),
    findAll: jest.fn().mockResolvedValue([]),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('valid_mock_jwt_access_token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-security-secret-key-32-chars';
      if (key === 'JWT_REFRESH_SECRET') return 'test-security-refresh-key-32-chars';
      if (key === 'ENCRYPTION_KEY') return '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      return null;
    }),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    application: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    integration: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    integrationLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflow: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workflowExecution: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    AuthRateLimitGuard.resetLimits();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        ApplicationsService,
        IntegrationsService,
        WorkflowsService,
        AnalyticsService,
        JwtStrategy,
        RolesGuard,
        Reflector,
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
    appsService = module.get<ApplicationsService>(ApplicationsService);
    integrationsService = module.get<IntegrationsService>(IntegrationsService);
    workflowsService = module.get<WorkflowsService>(WorkflowsService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    rolesGuard = module.get<RolesGuard>(RolesGuard);
    prisma = module.get<PrismaService>(PrismaService);
    reflector = module.get<Reflector>(Reflector);

    jest.clearAllMocks();
  });

  describe('1. Authentication & Token Security', () => {
    it('1.1 should authenticate with valid password and return sanitized user without passwordHash', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'admin@alpha-corp.io',
        name: 'Alpha Admin',
        passwordHash,
        role: SystemRole.ORG_ADMIN,
        organizationId: mockOrgAlpha,
        status: 'ACTIVE',
        organization: { id: mockOrgAlpha, name: 'Alpha Corp' },
      });
      mockPrisma.user.update.mockResolvedValue({});

      const res = await authService.login({
        email: 'admin@alpha-corp.io',
        password: 'CorrectPass123!',
      });

      expect(res.accessToken).toBe('valid_mock_jwt_access_token');
      expect(res.user.email).toBe('admin@alpha-corp.io');
      expect((res.user as any).passwordHash).toBeUndefined();
    });

    it('1.2 should reject invalid password with UnauthorizedException and log failure', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-1',
        email: 'admin@alpha-corp.io',
        passwordHash,
        status: 'ACTIVE',
        organizationId: mockOrgAlpha,
      });

      await expect(
        authService.login({ email: 'admin@alpha-corp.io', password: 'WrongPassword!' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockAuditLogsService.logAction).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'Login Failed', status: 'failed' }),
      );
    });

    it('1.3 should reject login for DISABLED account with UnauthorizedException', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-disabled',
        email: 'disabled@alpha-corp.io',
        passwordHash: 'hashed',
        status: 'DISABLED',
      });

      await expect(
        authService.login({ email: 'disabled@alpha-corp.io', password: 'AnyPassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('1.4 JwtStrategy should validate active token payload and reject DISABLED account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u-disabled',
        status: 'DISABLED',
      });

      await expect(
        jwtStrategy.validate({ sub: 'u-disabled', email: 'disabled@alpha.io' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('1.5 should refresh tokens with valid refresh token and reject invalid refresh token', async () => {
      mockJwtService.verify.mockReturnValueOnce({ sub: 'u-1' });
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'u-1',
        email: 'admin@alpha.io',
        name: 'Admin',
        role: SystemRole.ORG_ADMIN,
        organizationId: mockOrgAlpha,
        status: 'ACTIVE',
      });

      const refreshed = await authService.refreshToken('valid-refresh-token');
      expect(refreshed.accessToken).toBe('valid_mock_jwt_access_token');

      // Invalid refresh token
      mockJwtService.verify.mockImplementationOnce(() => {
        throw new Error('jwt expired');
      });
      await expect(authService.refreshToken('expired-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('2. Server-Side Role-Based Access Control (RBAC)', () => {
    function createMockExecutionContext(user: UserPayload | null, requiredRoles?: string[]) {
      return {
        getHandler: () => ({}),
        getClass: () => ({}),
        switchToHttp: () => ({
          getRequest: () => ({ user }),
          getResponse: () => ({ setHeader: jest.fn() }),
        }),
      } as any;
    }

    it('2.1 should deny access if user has no assigned role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ORG_ADMIN']);
      const context = createMockExecutionContext({ ...userAlphaViewer, role: undefined as any });
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('2.2 should deny VIEWER from accessing ORG_ADMIN/DEVELOPER endpoints', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN', 'ORG_ADMIN', 'DEVELOPER']);
      const context = createMockExecutionContext(userAlphaViewer);
      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('2.3 should permit ORG_ADMIN for endpoints requiring ORG_ADMIN', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SUPER_ADMIN', 'ORG_ADMIN']);
      const context = createMockExecutionContext(userAlphaAdmin);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });

    it('2.4 should always permit SUPER_ADMIN globally across all roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['SPECIAL_INTERNAL_ROLE']);
      const context = createMockExecutionContext(userSuperAdmin);
      expect(rolesGuard.canActivate(context)).toBe(true);
    });
  });

  describe('3. Multi-Tenant Boundary Isolation', () => {
    it('3.1 User from Org Alpha cannot access Org Beta application by ID', async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 'app-beta-secret',
        organizationId: mockOrgBeta,
        name: 'Beta Proprietary App',
        mode: 'STANDALONE',
        status: 'ACTIVE',
      });

      await expect(
        appsService.findOne('app-beta-secret', userAlphaAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3.2 User from Org Alpha cannot update Org Beta application', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        id: 'app-beta-secret',
        organizationId: mockOrgBeta,
      });

      await expect(
        appsService.update('app-beta-secret', { name: 'Hacked Name' }, userAlphaAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3.3 User from Org Alpha cannot delete Org Beta integration connector', async () => {
      mockPrisma.integration.findUnique.mockResolvedValue({
        id: 'conn-beta-stripe',
        organizationId: mockOrgBeta,
        name: 'Beta Stripe Payments',
      });

      await expect(
        integrationsService.remove('conn-beta-stripe', userAlphaAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3.4 User from Org Alpha cannot execute Org Beta workflow', async () => {
      mockPrisma.workflow.findUnique.mockResolvedValue({
        id: 'wf-beta-payroll',
        organizationId: mockOrgBeta,
        name: 'Beta Payroll Automation',
      });

      await expect(
        workflowsService.runWorkflow('wf-beta-payroll', {}, userAlphaAdmin),
      ).rejects.toThrow(ForbiddenException);
    });

    it('3.5 SUPER_ADMIN can manage applications across all tenants', async () => {
      mockPrisma.application.findFirst.mockResolvedValue({
        id: 'app-beta-secret',
        organizationId: mockOrgBeta,
        name: 'Beta Proprietary App',
        mode: 'STANDALONE',
        status: 'ACTIVE',
        modules: [],
      });

      const app = await appsService.findOne('app-beta-secret', userSuperAdmin);
      expect(app.id).toBe('app-beta-secret');
    });
  });

  describe('4. Input Validation & Error Handling', () => {
    it('4.1 should reject empty application name with BadRequestException', async () => {
      await expect(
        appsService.create({ name: '   ', description: 'Desc' } as any, userAlphaAdmin),
      ).rejects.toThrow(BadRequestException);
    });

    it('4.2 should sanitize credentials in integration response and logs', async () => {
      const integrationWithKey = {
        id: 'conn-test-1',
        organizationId: mockOrgAlpha,
        applicationId: 'app-1',
        name: 'Third-Party CRM API',
        type: 'REST_GENERIC',
        baseUrl: 'https://api.thirdparty.com',
        authType: IntegrationAuthType.API_KEY,
        status: IntegrationStatus.ACTIVE,
        credential: {
          encryptedData: JSON.stringify({ apiKey: 'lp_live_secret_key_123456789' }),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.integration.findUnique.mockResolvedValue(integrationWithKey);

      const result = await integrationsService.findOne('conn-test-1', userAlphaAdmin);
      expect(result.credentialMasked).toBeDefined();
      expect(result.credentialMasked).not.toContain('123456789');
    });
  });

  describe('5. Authentication Rate Limiting Guard', () => {
    it('5.1 should allow up to 10 requests from same IP and block 11th with 429 Too Many Requests', () => {
      const guard = new AuthRateLimitGuard();
      const mockReq = {
        ip: '198.51.100.42',
        headers: {},
        socket: {},
      };
      const mockRes = {
        setHeader: jest.fn(),
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => mockRes,
        }),
      } as any;

      // First 10 requests pass
      for (let i = 0; i < 10; i++) {
        expect(guard.canActivate(context)).toBe(true);
      }

      // 11th request triggers rate limit exception
      expect(() => guard.canActivate(context)).toThrow(HttpException);
      try {
        guard.canActivate(context);
      } catch (err: any) {
        expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(mockRes.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(String));
      }
    });
  });

  describe('6. Report Exports Data Scoping & Sanitization', () => {
    it('6.1 should export report data scoped strictly to current organization', async () => {
      mockPrisma.application.findMany.mockImplementation(({ where }) => {
        if (where.organizationId === mockOrgAlpha) {
          return Promise.resolve([
            {
              id: 'app-alpha-1',
              name: 'Alpha Internal System',
              mode: 'STANDALONE',
              status: 'ACTIVE',
              organization: { industry: 'FinTech' },
              modules: [1, 2],
              integrations: [],
              workflows: [],
              createdAt: new Date('2026-01-01'),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const reportCsv = await analyticsService.exportReportData(userAlphaAdmin, 'rep-apps', 'csv');
      expect(reportCsv.filename).toContain('applications_report_');
      expect(reportCsv.contentType).toBe('text/csv');
      expect(reportCsv.content).toContain('Alpha Internal System');
      expect(reportCsv.content).not.toContain('Beta');

      const reportJson = await analyticsService.exportReportData(userAlphaAdmin, 'rep-apps', 'json');
      expect(reportJson.contentType).toBe('application/json');
      const parsed = JSON.parse(reportJson.content);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].id).toBe('app-alpha-1');
    });
  });
});
