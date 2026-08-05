import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OperatingMode, ConnectorType } from '@launchpad/shared';

@ApiTags('Organization & Tenants')
@Controller('organizations')
export class OrganizationController {
  constructor(private orgService: OrganizationService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get Organization & Tenant Config by ID' })
  async getOrganization(@Param('id') id: string) {
    return this.orgService.getOrganization(id);
  }

  @Patch(':id/tenant-config')
  @ApiOperation({ summary: 'Update Tenant Operating Mode, Connector, and Field Mappings' })
  async updateTenantConfig(
    @Param('id') id: string,
    @Body()
    body: {
      mode?: OperatingMode;
      connectorType?: ConnectorType;
      connectorEndpoint?: string;
      connectorCredentials?: Record<string, string>;
      fieldMappings?: Record<string, Record<string, string>>;
    }
  ) {
    return this.orgService.updateTenantConfig(id, body);
  }
}
