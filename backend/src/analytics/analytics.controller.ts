import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { Response } from 'express';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  getPlatformOverview(
    @CurrentUser() currentUser: UserPayload,
    @Query('timeframe') timeframe?: 'today' | '7d' | '30d' | '90d' | 'all',
    @Query('applicationId') applicationId?: string,
  ) {
    return this.analyticsService.getPlatformOverview(currentUser, { timeframe, applicationId });
  }

  @Get('applications/:id')
  getApplicationAnalytics(
    @Param('id') id: string,
    @CurrentUser() currentUser: UserPayload,
  ) {
    return this.analyticsService.getApplicationAnalytics(id, currentUser);
  }

  @Get('integrations')
  getIntegrationAnalytics(
    @CurrentUser() currentUser: UserPayload,
    @Query('timeframe') timeframe?: 'today' | '7d' | '30d' | '90d' | 'all',
    @Query('applicationId') applicationId?: string,
  ) {
    return this.analyticsService.getIntegrationAnalytics(currentUser, { timeframe, applicationId });
  }

  @Get('workflows')
  getWorkflowAnalytics(
    @CurrentUser() currentUser: UserPayload,
    @Query('timeframe') timeframe?: 'today' | '7d' | '30d' | '90d' | 'all',
    @Query('applicationId') applicationId?: string,
  ) {
    return this.analyticsService.getWorkflowAnalytics(currentUser, { timeframe, applicationId });
  }

  @Get('reports')
  getReportsList() {
    return this.analyticsService.getReportsList();
  }

  @Get('reports/export')
  async exportReportData(
    @CurrentUser() currentUser: UserPayload,
    @Query('reportId') reportId: string,
    @Query('format') format: 'csv' | 'json',
    @Query('timeframe') timeframe: any,
    @Res() res: Response,
  ) {
    const fileData = await this.analyticsService.exportReportData(
      currentUser,
      reportId || 'rep-apps',
      format || 'csv',
      { timeframe },
    );

    res.setHeader('Content-Type', fileData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    return res.send(fileData.content);
  }
}
