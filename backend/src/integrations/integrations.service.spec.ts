import { Test, TestingModule } from '@nestjs/testing';
import { IntegrationsService } from './integrations.service';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './services/encryption.service';
import { ConnectorManagerService } from './services/connector-manager.service';
import { TransformationService } from './services/transformation.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { IntegrationAuthType, IntegrationStatus, SystemRole } from '@prisma/client';

describe('IntegrationsService Unit Tests', () => {
  let service: IntegrationsService;
  let encryptionService: EncryptionService;
  let transformationService: TransformationService;

  const mockUser = {
    userId: 'user-123',
    email: 'dev@company.com',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-111',
    name: 'Test Dev',
  };

  const mockOtherOrgUser = {
    userId: 'user-999',
    email: 'other@company.com',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-999',
    name: 'Other User',
  };

  const mockPrismaService = {
    application: {
      findFirst: jest.fn(),
    },
    integration: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    integrationCredential: {
      update: jest.fn(),
      create: jest.fn(),
    },
    integrationLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const mockConnectorManager = {
    executeRequest: jest.fn(),
  };

  const mockAuditLogsService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntegrationsService,
        EncryptionService,
        TransformationService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConnectorManagerService, useValue: mockConnectorManager },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
      ],
    }).compile();

    service = module.get<IntegrationsService>(IntegrationsService);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    transformationService = module.get<TransformationService>(TransformationService);

    jest.clearAllMocks();
  });

  describe('Encryption & Credential Masking', () => {
    it('should encrypt sensitive string and decrypt back correctly', () => {
      const secret = 'sk_live_super_secret_api_key_9988';
      const encrypted = encryptionService.encrypt(secret);
      expect(encrypted).not.toEqual(secret);
      expect(encrypted).toContain(':');

      const decrypted = encryptionService.decrypt(encrypted);
      expect(decrypted).toEqual(secret);
    });

    it('should mask sensitive credential strings', () => {
      const masked = encryptionService.maskCredential('sk_live_super_secret_api_key_9988');
      expect(masked).toEqual('sk_l...9988');
      expect(masked).not.toContain('super_secret');
    });
  });

  describe('Field Transformation Layer', () => {
    it('should transform canonical input payload according to mapping configuration', () => {
      const canonicalInput = {
        name: 'John Doe',
        phone: '9876543210',
        email: 'john@example.com',
      };

      const mapping = {
        name: 'customer_name',
        phone: 'mobile',
      };

      const transformed = transformationService.transformPayload(canonicalInput, mapping);
      expect(transformed).toEqual({
        customer_name: 'John Doe',
        mobile: '9876543210',
        email: 'john@example.com',
      });
    });
  });

  describe('Multi-Tenant & Application Isolation', () => {
    it('should create integration scoped to current organization and application', async () => {
      mockPrismaService.application.findFirst.mockResolvedValue({
        id: 'app-vms-1',
        name: 'Visitor Pass OS',
        organizationId: 'org-111',
      });

      mockPrismaService.integration.create.mockResolvedValue({
        id: 'integ-1',
        organizationId: 'org-111',
        applicationId: 'app-vms-1',
        name: 'PHP CRM Integration',
        type: 'REST_GENERIC',
        baseUrl: 'https://crm.company.com/api',
        authType: IntegrationAuthType.API_KEY,
        status: IntegrationStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        application: { name: 'Visitor Pass OS' },
        connector: { category: 'CRM', targetSystem: 'Existing PHP CRM', targetTech: 'PHP' },
        credential: { encryptedData: encryptionService.encrypt(JSON.stringify({ apiKey: 'sk_test_12345678' })) },
      });

      const res = await service.create(
        {
          applicationId: 'app-vms-1',
          name: 'PHP CRM Integration',
          baseUrl: 'https://crm.company.com/api',
          authType: IntegrationAuthType.API_KEY,
          credentials: { apiKey: 'sk_test_12345678' },
        },
        mockUser,
      );

      expect(res.organizationId).toBe('org-111');
      expect(res.credentialMasked).toBe('sk_t...5678');
      expect((res as any).credentials).toBeUndefined(); // Secrets never exposed
    });

    it('should throw ForbiddenException when accessing another organization integration', async () => {
      mockPrismaService.integration.findUnique.mockResolvedValue({
        id: 'integ-other',
        organizationId: 'org-other-999',
        applicationId: 'app-other',
      });

      await expect(service.findOne('integ-other', mockUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Test Connection & Telemetry Logs', () => {
    it('should execute test connection and produce telemetry log', async () => {
      mockPrismaService.integration.findUnique.mockResolvedValue({
        id: 'integ-1',
        organizationId: 'org-111',
        applicationId: 'app-1',
        baseUrl: 'https://crm.customer.com/api',
        authType: IntegrationAuthType.BEARER_TOKEN,
        configuration: { testEndpoint: '/ping' },
        credential: { encryptedData: encryptionService.encrypt(JSON.stringify({ bearerToken: 'my_bearer_token' })) },
      });

      mockConnectorManager.executeRequest.mockResolvedValue({
        success: true,
        statusCode: 200,
        durationMs: 45,
        data: { status: 'ok' },
        details: 'Endpoint reachable',
      });

      mockPrismaService.integration.update.mockResolvedValue({});
      mockPrismaService.integrationLog.create.mockResolvedValue({ id: 'log-1' });

      const res = await service.testIntegrationById('integ-1', mockUser);

      expect(res.success).toBe(true);
      expect(res.latencyMs).toBe(45);
      expect(res.message).toContain('Successful');
      expect(mockPrismaService.integrationLog.create).toHaveBeenCalled();
    });
  });
});
