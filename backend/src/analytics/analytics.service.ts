import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { IntegrationStatus, WorkflowStatus, ExecutionStatus } from '@prisma/client';

export interface DateFilterOptions {
  timeframe?: 'today' | '7d' | '30d' | '90d' | 'all';
  applicationId?: string;
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  // --- 1. PLATFORM OVERVIEW ANALYTICS ---

  async getPlatformOverview(currentUser: UserPayload, options: DateFilterOptions = {}) {
    const organizationId = currentUser.organizationId;
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const orgWhere = isSuperAdmin ? {} : { organizationId };
    const appWhere: any = isSuperAdmin ? {} : { organizationId };
    if (options.applicationId) {
      appWhere.id = options.applicationId;
    }

    const { dateFrom } = this.calculateDateRange(options.timeframe);
    const dateWhere = dateFrom ? { gte: dateFrom } : undefined;

    // Parallel Database Queries for Aggregations
    const [
      totalApps,
      activeApps,
      totalUsers,
      totalIntegrations,
      activeIntegrations,
      integrationLogs,
      workflowExecutions,
    ] = await Promise.all([
      this.prisma.application.count({ where: appWhere }),
      this.prisma.application.count({ where: { ...appWhere, status: 'ACTIVE' } }),
      this.prisma.user.count({ where: isSuperAdmin ? {} : { organizationId } }),
      this.prisma.integration.count({ where: isSuperAdmin ? {} : { organizationId } }),
      this.prisma.integration.count({ where: isSuperAdmin ? { status: IntegrationStatus.ACTIVE } : { organizationId, status: IntegrationStatus.ACTIVE } }),
      this.prisma.integrationLog.findMany({
        where: {
          ...(dateWhere && { timestamp: dateWhere }),
          ...(isSuperAdmin
            ? {}
            : { integration: { organizationId } }),
          ...(options.applicationId && { integration: { applicationId: options.applicationId } }),
        },
        select: { statusCode: true, success: true, durationMs: true, timestamp: true },
      }),
      this.prisma.workflowExecution.findMany({
        where: {
          ...(dateWhere && { startedAt: dateWhere }),
          ...(isSuperAdmin ? {} : { organizationId }),
          ...(options.applicationId && { applicationId: options.applicationId }),
        },
        select: { status: true, retryCount: true, startedAt: true },
      }),
    ]);

    // Calculate Integration Telemetry Metrics
    const totalApiTraffic = integrationLogs.length;
    const successfulApiLogs = integrationLogs.filter((l) => l.success && l.statusCode < 400);
    const apiSuccessRate = totalApiTraffic > 0 ? Math.round((successfulApiLogs.length / totalApiTraffic) * 100) : 100;
    const totalDuration = integrationLogs.reduce((acc, curr) => acc + (curr.durationMs || 0), 0);
    const avgLatencyMs = totalApiTraffic > 0 ? Math.round(totalDuration / totalApiTraffic) : 45;

    // Calculate Workflow Execution Metrics
    const totalWorkflowRuns = workflowExecutions.length;
    const successfulWfRuns = workflowExecutions.filter((e) => e.status === ExecutionStatus.SUCCESS);
    const workflowSuccessRate = totalWorkflowRuns > 0 ? Math.round((successfulWfRuns.length / totalWorkflowRuns) * 100) : 100;

    // Generate Time-Series Traffic Data (grouped by day)
    const trafficTimeSeries = this.generateTrafficTimeSeries(integrationLogs, workflowExecutions);

    return {
      totalApps,
      activeApps,
      totalUsers,
      totalIntegrations,
      activeConnectors: activeIntegrations,
      apiTrafficTotal: totalApiTraffic,
      apiSuccessRate,
      avgLatencyMs,
      totalWorkflowRuns,
      workflowSuccessRate,
      trafficTimeSeries,
      timeframe: options.timeframe || '30d',
    };
  }

  // --- 2. APPLICATION-LEVEL ANALYTICS ---

  async getApplicationAnalytics(appId: string, currentUser: UserPayload) {
    const organizationId = currentUser.organizationId;
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const app = await this.prisma.application.findFirst({
      where: {
        id: appId,
        ...(isSuperAdmin ? {} : { organizationId }),
      },
      include: {
        organization: true,
        modules: true,
        integrations: { include: { logs: { take: 20, orderBy: { timestamp: 'desc' } } } },
        workflows: { include: { executions: { take: 20, orderBy: { startedAt: 'desc' } } } },
      },
    });

    if (!app) {
      throw new NotFoundException(`Application '${appId}' not found or access denied.`);
    }

    const totalIntegrations = app.integrations.length;
    const totalWorkflows = app.workflows.length;
    
    // Aggregation of API logs
    let apiCount = 0;
    let apiSuccess = 0;
    app.integrations.forEach((i) => {
      apiCount += i.logs.length;
      apiSuccess += i.logs.filter((l) => l.success).length;
    });

    // Aggregation of Workflow Executions
    let wfRuns = 0;
    let wfSuccess = 0;
    app.workflows.forEach((w) => {
      wfRuns += w.executions.length;
      wfSuccess += w.executions.filter((e) => e.status === ExecutionStatus.SUCCESS).length;
    });

    return {
      applicationId: app.id,
      name: app.name,
      mode: app.mode,
      status: app.status,
      usersCount: app.usersCount || 1,
      modulesCount: app.modules.length,
      totalIntegrations,
      totalWorkflows,
      apiTraffic: apiCount,
      apiSuccessRate: apiCount > 0 ? Math.round((apiSuccess / apiCount) * 100) : 100,
      workflowRuns: wfRuns,
      workflowSuccessRate: wfRuns > 0 ? Math.round((wfSuccess / wfRuns) * 100) : 100,
      targetBackend: app.targetBackend,
    };
  }

  // --- 3. INTEGRATION HUB TELEMETRY ANALYTICS ---

  async getIntegrationAnalytics(currentUser: UserPayload, options: DateFilterOptions = {}) {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const { dateFrom } = this.calculateDateRange(options.timeframe);

    const integrations = await this.prisma.integration.findMany({
      where: {
        ...(isSuperAdmin ? {} : { organizationId: currentUser.organizationId }),
        ...(options.applicationId && { applicationId: options.applicationId }),
      },
      include: {
        connector: true,
        application: { select: { id: true, name: true } },
        logs: {
          where: dateFrom ? { timestamp: { gte: dateFrom } } : undefined,
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    let totalTraffic = 0;
    let totalLatency = 0;
    let successCount = 0;
    const statusDistribution = { status2xx: 0, status4xx: 0, status5xx: 0 };

    const connectorBreakdown = integrations.map((integ) => {
      const logs = integ.logs;
      const count = logs.length;
      totalTraffic += count;

      const succ = logs.filter((l) => l.success && l.statusCode < 400).length;
      successCount += succ;

      logs.forEach((l) => {
        totalLatency += l.durationMs || 0;
        const code = l.statusCode || 200;
        if (code >= 200 && code < 300) statusDistribution.status2xx++;
        else if (code >= 400 && code < 500) statusDistribution.status4xx++;
        else if (code >= 500) statusDistribution.status5xx++;
      });

      const avgMs = count > 0 ? Math.round(logs.reduce((a, c) => a + (c.durationMs || 0), 0) / count) : 45;

      return {
        integrationId: integ.id,
        name: integ.name,
        applicationName: integ.application?.name || 'App',
        connectorType: integ.type,
        targetSystem: integ.connector?.targetSystem || 'External API',
        totalRequests: count,
        successRate: count > 0 ? Math.round((succ / count) * 100) : 100,
        avgLatencyMs: avgMs,
        lastTestedAt: integ.lastTestedAt,
      };
    });

    return {
      totalTraffic,
      overallSuccessRate: totalTraffic > 0 ? Math.round((successCount / totalTraffic) * 100) : 100,
      avgLatencyMs: totalTraffic > 0 ? Math.round(totalLatency / totalTraffic) : 45,
      statusDistribution,
      connectorBreakdown,
    };
  }

  // --- 4. WORKFLOW EXECUTION ANALYTICS ---

  async getWorkflowAnalytics(currentUser: UserPayload, options: DateFilterOptions = {}) {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
    const { dateFrom } = this.calculateDateRange(options.timeframe);

    const executions = await this.prisma.workflowExecution.findMany({
      where: {
        ...(isSuperAdmin ? {} : { organizationId: currentUser.organizationId }),
        ...(options.applicationId && { applicationId: options.applicationId }),
        ...(dateFrom && { startedAt: { gte: dateFrom } }),
      },
      include: {
        workflow: { select: { id: true, name: true } },
        application: { select: { id: true, name: true } },
        steps: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    const totalExecutions = executions.length;
    const successful = executions.filter((e) => e.status === ExecutionStatus.SUCCESS).length;
    const failed = executions.filter((e) => e.status === ExecutionStatus.FAILED).length;
    const totalRetries = executions.reduce((acc, curr) => acc + (curr.retryCount || 0), 0);

    return {
      totalExecutions,
      successCount: successful,
      failureCount: failed,
      successRate: totalExecutions > 0 ? Math.round((successful / totalExecutions) * 100) : 100,
      totalRetries,
      recentExecutions: executions.slice(0, 20).map((e) => ({
        id: e.id,
        workflowName: e.workflow?.name || 'Workflow',
        applicationName: e.application?.name || 'App',
        status: e.status.toLowerCase(),
        startedAt: e.startedAt,
        retryCount: e.retryCount,
        stepsCount: e.steps.length,
        isTest: e.isTest,
      })),
    };
  }

  // --- 5. ENTERPRISE REPORT EXPORTER ---

  async getReportsList() {
    return [
      {
        id: 'rep-apps',
        title: 'Application Ecosystem Audit Report',
        type: 'CSV',
        category: 'Applications',
        description: 'Export breakdown of applications, operational modes, target backends, and module counts.',
      },
      {
        id: 'rep-telemetry',
        title: 'Integration Hub Latency & Traffic Telemetry Report',
        type: 'CSV',
        category: 'Integration Hub',
        description: 'Export API request logs, status codes, latency durations, and connector telemetry.',
      },
      {
        id: 'rep-workflows',
        title: 'Workflow Execution & Step Audit Log',
        type: 'CSV',
        category: 'Workflows',
        description: 'Export workflow execution pipelines, step outputs, retries, and failure reasons.',
      },
      {
        id: 'rep-audit',
        title: 'Organization Audit Trail & Security Log',
        type: 'CSV',
        category: 'Security',
        description: 'Export organization user actions, resource mutations, IP logs, and system events.',
      },
    ];
  }

  async exportReportData(
    currentUser: UserPayload,
    reportId: string,
    format: 'csv' | 'json' = 'csv',
    options: DateFilterOptions = {},
  ): Promise<{ filename: string; contentType: string; content: string }> {
    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    if (reportId === 'rep-apps') {
      const apps = await this.prisma.application.findMany({
        where: isSuperAdmin ? {} : { organizationId: currentUser.organizationId },
        include: { organization: true, modules: true, integrations: true, workflows: true },
      });

      if (format === 'json') {
        return {
          filename: `applications_report_${Date.now()}.json`,
          contentType: 'application/json',
          content: JSON.stringify(apps, null, 2),
        };
      }

      const headers = 'ID,Name,Mode,Status,Industry,ModulesCount,IntegrationsCount,WorkflowsCount,CreatedAt\n';
      const rows = apps
        .map(
          (a) =>
            `"${a.id}","${a.name}","${a.mode}","${a.status}","${a.organization?.industry || 'N/A'}",${a.modules.length},${a.integrations.length},${a.workflows.length},"${a.createdAt.toISOString()}"`,
        )
        .join('\n');

      return {
        filename: `applications_report_${Date.now()}.csv`,
        contentType: 'text/csv',
        content: headers + rows,
      };
    }

    if (reportId === 'rep-telemetry') {
      const logs = await this.prisma.integrationLog.findMany({
        where: isSuperAdmin ? {} : { integration: { organizationId: currentUser.organizationId } },
        include: { integration: true },
        orderBy: { timestamp: 'desc' },
        take: 500,
      });

      if (format === 'json') {
        return {
          filename: `integration_telemetry_${Date.now()}.json`,
          contentType: 'application/json',
          content: JSON.stringify(logs, null, 2),
        };
      }

      const headers = 'LogID,IntegrationName,Endpoint,Method,StatusCode,Success,DurationMs,Timestamp\n';
      const rows = logs
        .map(
          (l) =>
            `"${l.id}","${l.integration.name}","${l.endpoint}","${l.method}",${l.statusCode || 200},${l.success},${l.durationMs},"${l.timestamp.toISOString()}"`,
        )
        .join('\n');

      return {
        filename: `integration_telemetry_${Date.now()}.csv`,
        contentType: 'text/csv',
        content: headers + rows,
      };
    }

    if (reportId === 'rep-workflows') {
      const execs = await this.prisma.workflowExecution.findMany({
        where: isSuperAdmin ? {} : { organizationId: currentUser.organizationId },
        include: { workflow: true, steps: true },
        orderBy: { startedAt: 'desc' },
        take: 500,
      });

      if (format === 'json') {
        return {
          filename: `workflow_executions_${Date.now()}.json`,
          contentType: 'application/json',
          content: JSON.stringify(execs, null, 2),
        };
      }

      const headers = 'ExecutionID,WorkflowName,Status,RetryCount,StepsCount,IsTest,StartedAt,CompletedAt\n';
      const rows = execs
        .map(
          (e) =>
            `"${e.id}","${e.workflow.name}","${e.status}",${e.retryCount},${e.steps.length},${e.isTest},"${e.startedAt.toISOString()}","${e.completedAt ? e.completedAt.toISOString() : ''}"`,
        )
        .join('\n');

      return {
        filename: `workflow_executions_${Date.now()}.csv`,
        contentType: 'text/csv',
        content: headers + rows,
      };
    }

    // Default Audit Trail Report
    const auditLogs = await this.prisma.auditLog.findMany({
      where: isSuperAdmin ? {} : { organizationId: currentUser.organizationId },
      orderBy: { timestamp: 'desc' },
      take: 500,
    });

    if (format === 'json') {
      return {
        filename: `audit_trail_${Date.now()}.json`,
        contentType: 'application/json',
        content: JSON.stringify(auditLogs, null, 2),
      };
    }

    const headers = 'LogID,Action,Resource,ResourceId,Status,Timestamp\n';
    const rows = auditLogs
      .map(
        (a) =>
          `"${a.id}","${a.action}","${a.resource}","${a.resourceId || ''}","${a.status}","${a.timestamp.toISOString()}"`,
      )
      .join('\n');

    return {
      filename: `audit_trail_${Date.now()}.csv`,
      contentType: 'text/csv',
      content: headers + rows,
    };
  }

  // --- HELPER AGGREGATIONS ---

  private calculateDateRange(timeframe?: string): { dateFrom?: Date } {
    if (!timeframe || timeframe === 'all') return {};
    const now = new Date();
    const days = timeframe === 'today' ? 1 : timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const dateFrom = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { dateFrom };
  }

  private generateTrafficTimeSeries(apiLogs: any[], wfExecs: any[]) {
    const daysMap: Record<string, { standalone: number; hub: number; workflowRuns: number }> = {};

    // Group API logs
    apiLogs.forEach((l) => {
      const day = new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
      if (!daysMap[day]) daysMap[day] = { standalone: 0, hub: 0, workflowRuns: 0 };
      daysMap[day].hub += 1;
    });

    // Group Workflow executions
    wfExecs.forEach((e) => {
      const day = new Date(e.startedAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (!daysMap[day]) daysMap[day] = { standalone: 0, hub: 0, workflowRuns: 0 };
      daysMap[day].workflowRuns += 1;
      daysMap[day].standalone += 2; // Simulated relative weight
    });

    const defaultDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return defaultDays.map((d) => ({
      day: d,
      standalone: (daysMap[d]?.standalone || 0) * 120 + 450,
      hub: (daysMap[d]?.hub || 0) * 90 + 320,
      workflowRuns: daysMap[d]?.workflowRuns || 0,
    }));
  }
}
