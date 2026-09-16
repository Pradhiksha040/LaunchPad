import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GovernanceService } from './governance.service';

@ApiTags('Platform Governance & System Health')
@Controller()
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  // ==================== PUBLIC HEALTH PROBES ====================

  @Get('health/liveness')
  @ApiOperation({ summary: 'Container Liveness Probe' })
  getLiveness() {
    return this.governanceService.getLivenessProbe();
  }

  @Get('health/readiness')
  @ApiOperation({ summary: 'Container Readiness Probe (Database Connectivity Check)' })
  async getReadiness() {
    return this.governanceService.getReadinessProbe();
  }

  // ==================== PROTECTED GOVERNANCE APIs ====================

  @Get('governance/overview')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Platform Governance Overview & Policies' })
  async getOverview(@Req() req: any) {
    const orgId = req.user.organizationId;
    return this.governanceService.getGovernanceOverview(orgId);
  }

  @Get('governance/health')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Live System Health & Observability Metrics' })
  async getHealth() {
    return this.governanceService.getSystemHealth();
  }

  @Get('governance/audit-security')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Security Audit Log Stream' })
  async getSecurityAuditLogs(@Req() req: any, @Query('limit') limit?: number) {
    const orgId = req.user.organizationId;
    return this.governanceService.getSecurityAuditLogs(orgId, limit ? Number(limit) : 20);
  }

  @Get('governance/readiness-matrix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Verified Production Readiness Checklist' })
  async getReadinessMatrix() {
    return this.governanceService.getProductionReadinessChecklist();
  }
}
