import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';
import { SystemRole, IntegrationStatus, ExecutionStatus } from '@prisma/client';

describe('AnalyticsService Unit Tests', () => {
  let service: AnalyticsService;

  const mockUser = {
    userId: 'user-1',
    email: 'admin@company.com',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-1',
    name: 'Admin',
  };

  const mockPrismaService = {
    application: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    user: { count: jest.fn() },
    integration: { count: jest.fn(), findMany: jest.fn() },
    integrationLog: { findMany: jest.fn() },
    workflowExecution: { findMany: jest.fn() },
    auditLog: { findMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    jest.clearAllMocks();
  });

  describe('Platform Overview Aggregation', () => {
    it('should aggregate counts, success rates, and average latency', async () => {
      mockPrismaService.application.count
        .mockResolvedValueOnce(12) // total apps
        .mockResolvedValueOnce(10); // active apps
      mockPrismaService.user.count.mockResolvedValue(45);
      mockPrismaService.integration.count
        .mockResolvedValueOnce(5) // total integrations
        .mockResolvedValueOnce(4); // active integrations

      mockPrismaService.integrationLog.findMany.mockResolvedValue([
        { statusCode: 200, success: true, durationMs: 40, timestamp: new Date() },
        { statusCode: 200, success: true, durationMs: 60, timestamp: new Date() },
        { statusCode: 500, success: false, durationMs: 100, timestamp: new Date() },
      ]);

      mockPrismaService.workflowExecution.findMany.mockResolvedValue([
        { status: ExecutionStatus.SUCCESS, retryCount: 0, startedAt: new Date() },
        { status: ExecutionStatus.FAILED, retryCount: 2, startedAt: new Date() },
      ]);

      const overview = await service.getPlatformOverview(mockUser, { timeframe: '30d' });

      expect(overview.totalApps).toBe(12);
      expect(overview.activeApps).toBe(10);
      expect(overview.totalUsers).toBe(45);
      expect(overview.apiTrafficTotal).toBe(3);
      expect(overview.apiSuccessRate).toBe(67); // 2 out of 3 = 67%
      expect(overview.avgLatencyMs).toBe(67); // (40+60+100)/3 = 67ms
      expect(overview.totalWorkflowRuns).toBe(2);
      expect(overview.workflowSuccessRate).toBe(50); // 1 out of 2 = 50%
    });
  });

  describe('Enterprise Reports Exporter', () => {
    it('should generate CSV applications report export', async () => {
      mockPrismaService.application.findMany.mockResolvedValue([
        {
          id: 'app-1',
          name: 'VMS OS',
          mode: 'STANDALONE',
          status: 'ACTIVE',
          createdAt: new Date(),
          organization: { industry: 'Real Estate' },
          modules: [1, 2],
          integrations: [1],
          workflows: [1],
        },
      ]);

      const report = await service.exportReportData(mockUser, 'rep-apps', 'csv');
      expect(report.contentType).toBe('text/csv');
      expect(report.filename).toContain('applications_report');
      expect(report.content).toContain('VMS OS');
      expect(report.content).toContain('STANDALONE');
    });

    it('should generate JSON telemetry report export', async () => {
      mockPrismaService.integrationLog.findMany.mockResolvedValue([
        {
          id: 'log-1',
          endpoint: '/api/v2/visitors',
          method: 'POST',
          statusCode: 200,
          success: true,
          durationMs: 42,
          timestamp: new Date(),
          integration: { name: 'PHP CRM' },
        },
      ]);

      const report = await service.exportReportData(mockUser, 'rep-telemetry', 'json');
      expect(report.contentType).toBe('application/json');
      expect(report.content).toContain('PHP CRM');
      expect(report.content).toContain('/api/v2/visitors');
    });
  });
});
