import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateAuditLogOptions {
  userId?: string;
  organizationId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  status?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async logAction(options: CreateAuditLogOptions) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          userId: options.userId || null,
          organizationId: options.organizationId || null,
          action: options.action,
          resource: options.resource,
          resourceId: options.resourceId || null,
          status: options.status || 'success',
          details: options.details || null,
          ip: options.ip || null,
          userAgent: options.userAgent || null,
        },
      });
    } catch (e) {
      console.error('Failed to write audit log:', e);
      return null;
    }
  }

  async findAll(organizationId?: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
