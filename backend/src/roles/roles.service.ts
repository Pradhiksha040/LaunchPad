import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: UserPayload) {
    const systemRoles = [
      {
        id: 'role-super-admin',
        name: 'SUPER_ADMIN',
        description: 'Full platform super administration across all organizations and system settings',
        userCount: 1,
        permissions: {
          applications: ['read', 'write', 'delete', 'admin'],
          users: ['read', 'write', 'delete', 'admin'],
          organizations: ['read', 'write', 'delete', 'admin'],
          auditLogs: ['read'],
        },
      },
      {
        id: 'role-org-admin',
        name: 'ORG_ADMIN',
        description: 'Full management within organization boundaries (applications, users, settings)',
        userCount: 2,
        permissions: {
          applications: ['read', 'write', 'delete'],
          users: ['read', 'write', 'delete'],
          organizations: ['read', 'write'],
          auditLogs: ['read'],
        },
      },
      {
        id: 'role-developer',
        name: 'DEVELOPER',
        description: 'Application creation, module configuration, integration hub connector access',
        userCount: 5,
        permissions: {
          applications: ['read', 'write'],
          users: ['read'],
          organizations: ['read'],
          auditLogs: ['read'],
        },
      },
      {
        id: 'role-user',
        name: 'USER',
        description: 'Standard end-user application access and operational interface',
        userCount: 12,
        permissions: {
          applications: ['read'],
          users: ['read'],
          organizations: ['read'],
        },
      },
      {
        id: 'role-viewer',
        name: 'VIEWER',
        description: 'Read-only audit and analytics reporting access across organization tools',
        userCount: 3,
        permissions: {
          applications: ['read'],
          users: ['read'],
          organizations: ['read'],
          auditLogs: ['read'],
        },
      },
    ];

    const dbRoles = await this.prisma.role.findMany({
      where: currentUser.role === 'SUPER_ADMIN' ? {} : { OR: [{ organizationId: currentUser.organizationId }, { organizationId: null }] },
    });

    if (dbRoles.length > 0) {
      return dbRoles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        userCount: 1,
        permissions: r.permissions,
      }));
    }

    return systemRoles;
  }
}
