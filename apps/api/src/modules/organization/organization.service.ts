import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OperatingMode, ConnectorType, IndustryType } from '@launchpad/shared';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async getOrganization(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
      include: { tenantConfig: true },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async updateTenantConfig(
    orgId: string,
    dto: {
      mode?: OperatingMode;
      connectorType?: ConnectorType;
      connectorEndpoint?: string;
      connectorCredentials?: Record<string, string>;
      fieldMappings?: Record<string, Record<string, string>>;
    }
  ) {
    const config = await this.prisma.tenantConfig.upsert({
      where: { organizationId: orgId },
      update: {
        mode: dto.mode,
        connectorType: dto.connectorType,
        connectorEndpoint: dto.connectorEndpoint,
        connectorCredentials: dto.connectorCredentials,
        fieldMappings: dto.fieldMappings,
      },
      create: {
        organizationId: orgId,
        mode: dto.mode || OperatingMode.STANDALONE,
        connectorType: dto.connectorType || ConnectorType.GENERIC_REST,
        connectorEndpoint: dto.connectorEndpoint,
        connectorCredentials: dto.connectorCredentials,
        fieldMappings: dto.fieldMappings,
      },
    });
    return config;
  }
}
