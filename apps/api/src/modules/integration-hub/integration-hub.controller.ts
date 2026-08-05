import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntegrationHubService } from './integration-hub.service';

@ApiTags('Integration Hub & Connectors')
@Controller('integration-hub')
export class IntegrationHubController {
  constructor(private integrationHubService: IntegrationHubService) {}

  @Get('tenant-config')
  @ApiOperation({ summary: 'Resolve active connector & tenant operating mode configuration' })
  async getTenantConfig(@Headers('x-tenant-id') tenantHeader?: string, @Query('tenantId') queryTenant?: string) {
    const tenantId = tenantHeader || queryTenant || 'demo_tenant';
    return this.integrationHubService.resolveTenantConfig(tenantId);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute custom action via active Enterprise Connector (SAP, Oracle, Salesforce, REST, etc.)' })
  async executeCustomAction(
    @Headers('x-tenant-id') tenantHeader: string,
    @Body() body: { tenantId?: string; actionName: string; payload: unknown }
  ) {
    const tenantId = tenantHeader || body.tenantId || 'demo_tenant';
    return this.integrationHubService.executeCustomAction(tenantId, body.actionName, body.payload);
  }
}
