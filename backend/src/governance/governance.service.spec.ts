import { Test, TestingModule } from '@nestjs/testing';
import { GovernanceService } from './governance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GovernanceService', () => {
  let service: GovernanceService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      application: { count: jest.fn().mockResolvedValue(12) },
      user: { count: jest.fn().mockResolvedValue(45) },
      apiKey: { count: jest.fn().mockResolvedValue(3) },
      auditLog: {
        count: jest.fn().mockResolvedValue(150),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'log_01',
            organizationId: 'org_01',
            action: 'API_KEY_REVOKED',
            resource: 'ApiKey',
            status: 'success',
            timestamp: new Date(),
          },
        ]),
      },
      tenantDomain: {
        count: jest.fn().mockResolvedValue(2),
      },
      marketplaceAsset: {
        count: jest.fn().mockResolvedValue(5),
      },
      marketplaceInstallation: {
        count: jest.fn().mockResolvedValue(3),
      },
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GovernanceService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<GovernanceService>(GovernanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGovernanceOverview', () => {
    it('should return enforced tenant isolation and policy overview', async () => {
      const res = await service.getGovernanceOverview('org_01');

      expect(res.tenantIsolationStatus).toBe('VERIFIED_ENFORCED');
      expect(res.securityPosture).toBe('HARDENED_ENTERPRISE');
      expect(res.activePolicies.organizationIsolation).toBe(true);
      expect(res.stats.applicationsCount).toBe(12);
    });
  });

  describe('getSystemHealth & Probes', () => {
    it('should return operational system health', async () => {
      const health = await service.getSystemHealth();

      expect(health.status).toBe('OPERATIONAL');
      expect(health.database.status).toBe('HEALTHY');
      expect(health.services.apiGateway).toBe('UP');
    });

    it('should return liveness probe ok', () => {
      const live = service.getLivenessProbe();
      expect(live.status).toBe('ok');
    });

    it('should return readiness probe ready', async () => {
      const ready = await service.getReadinessProbe();
      expect(ready.status).toBe('ready');
      expect(ready.database).toBe('connected');
    });
  });

  describe('getProductionReadinessChecklist', () => {
    it('should return complete verified checklist items', () => {
      const matrix = service.getProductionReadinessChecklist();
      expect(matrix.length).toBeGreaterThan(5);

      const tenantIsoItem = matrix.find((i) => i.id === 'chk-tenant-iso');
      expect(tenantIsoItem?.status).toBe('VERIFIED');
    });
  });

  describe('Tenant & Security Controls', () => {
    it('should fetch audit security logs scoped to organization', async () => {
      const logs = await service.getSecurityAuditLogs('org_01', 10);

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org_01' },
        }),
      );
      expect(logs.length).toBe(1);
    });
  });
});
