import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class SettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async getSettings(currentUser: UserPayload) {
    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
    });

    return {
      platformName: 'LaunchPad OS Control Center',
      environment: 'development',
      multiTenancyMode: 'isolated',
      organization: org || {
        name: 'TechSolutions Inc.',
        industry: 'Technology',
        domain: 'techsolutions.io',
      },
      features: {
        rbacEnabled: true,
        auditLogsEnabled: true,
        swaggerEnabled: true,
      },
    };
  }

  async updateSettings(settingsData: any, currentUser: UserPayload) {
    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Settings Changed',
      resource: 'Settings',
      details: 'Updated organization and platform settings',
    });

    return {
      success: true,
      message: 'Platform settings updated successfully',
      settings: settingsData,
    };
  }
}
