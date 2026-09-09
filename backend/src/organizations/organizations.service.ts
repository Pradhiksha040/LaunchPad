import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto/create-organization.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

@Injectable()
export class OrganizationsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateOrganizationDto, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can explicitly create new organizations.');
    }

    const slug = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`An organization with name '${dto.name}' already exists.`);
    }

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        industry: dto.industry || 'Technology',
        domain: dto.domain || 'example.com',
        plan: dto.plan || 'Starter',
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: org.id,
      action: 'Organization Created',
      resource: 'Organization',
      resourceId: org.id,
      details: `Super Admin created organization ${org.name}`,
    });

    return org;
  }

  async findAll(currentUser: UserPayload) {
    if (currentUser.role === 'SUPER_ADMIN') {
      return this.prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { users: true, applications: true },
          },
        },
      });
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: currentUser.organizationId },
      include: {
        _count: {
          select: { users: true, applications: true },
        },
      },
    });

    return org ? [org] : [];
  }

  async findOne(id: string, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw new ForbiddenException('Access denied to another organization details.');
    }

    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            lastLogin: true,
          },
        },
        applications: true,
        _count: {
          select: { users: true, applications: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    return org;
  }

  async update(id: string, dto: UpdateOrganizationDto, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.organizationId !== id) {
      throw new ForbiddenException('Access denied to update another organization.');
    }

    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.industry && { industry: dto.industry }),
        ...(dto.domain && { domain: dto.domain }),
        ...(dto.plan && { plan: dto.plan }),
        ...(dto.status && { status: dto.status }),
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: id,
      action: 'Organization Updated',
      resource: 'Organization',
      resourceId: id,
      details: `Updated organization settings`,
    });

    return updated;
  }

  async remove(id: string, currentUser: UserPayload) {
    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admins can delete organizations.');
    }

    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID '${id}' not found.`);
    }

    await this.prisma.organization.delete({ where: { id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: id,
      action: 'Organization Deleted',
      resource: 'Organization',
      resourceId: id,
      details: `Deleted organization ${org.name}`,
    });

    return { success: true, message: `Organization '${org.name}' deleted.` };
  }
}
