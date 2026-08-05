import { Controller, Get, Post, Body, Headers, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntegrationHubService } from '../integration-hub/integration-hub.service';
import { Customer, Order } from '@launchpad/shared';

@ApiTags('Canonical Data Models (Dual Mode Router)')
@Controller('canonical')
export class CanonicalController {
  constructor(private integrationHubService: IntegrationHubService) {}

  @Get('customers')
  @ApiOperation({ summary: 'Get Customers (Auto-routed: Standalone DB or Enterprise Connector)' })
  async getCustomers(@Headers('x-tenant-id') tenantHeader?: string, @Query('tenantId') queryTenant?: string) {
    const tenantId = tenantHeader || queryTenant || 'demo_tenant';
    return this.integrationHubService.getCustomers(tenantId);
  }

  @Post('customers')
  @ApiOperation({ summary: 'Create Customer (Auto-routed & Payload Transformed)' })
  async createCustomer(
    @Headers('x-tenant-id') tenantHeader: string,
    @Body() body: { tenantId?: string; customer: Partial<Customer> }
  ) {
    const tenantId = tenantHeader || body.tenantId || 'demo_tenant';
    return this.integrationHubService.createCustomer(tenantId, body.customer || body);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get Orders (Auto-routed: Standalone DB or Enterprise Connector)' })
  async getOrders(@Headers('x-tenant-id') tenantHeader?: string, @Query('tenantId') queryTenant?: string) {
    const tenantId = tenantHeader || queryTenant || 'demo_tenant';
    return this.integrationHubService.getOrders(tenantId);
  }

  @Post('orders')
  @ApiOperation({ summary: 'Create Order (Auto-routed & Payload Transformed)' })
  async createOrder(
    @Headers('x-tenant-id') tenantHeader: string,
    @Body() body: { tenantId?: string; order: Partial<Order> }
  ) {
    const tenantId = tenantHeader || body.tenantId || 'demo_tenant';
    return this.integrationHubService.createOrder(tenantId, body.order || body);
  }
}
