import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateApplicationDto, UpdateApplicationDto } from './dto/create-application.dto';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { AppMode, AppStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateApplicationDto, currentUser: UserPayload) {
    const slugBase = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const organizationId = currentUser.organizationId;

    let templateId: string | null = null;
    if (dto.templateId) {
      const template = await this.prisma.template.findFirst({
        where: {
          OR: [{ id: dto.templateId }, { name: { contains: dto.templateId, mode: 'insensitive' } }],
        },
      });
      if (template) {
        templateId = template.id;
      }
    }

    const branding = (dto.branding as any) || {
      appName: dto.name,
      primaryColor: '#3F7659',
      secondaryColor: '#DDEEDF',
      font: 'Inter',
      buttonStyle: 'rounded',
      borderRadius: '8px',
    };

    const mode = (dto.mode?.toUpperCase() as AppMode) || AppMode.STANDALONE;
    const status = (dto.status?.toUpperCase() as AppStatus) || AppStatus.ACTIVE;

    const rawModules = dto.modules || ['Visitor Registration', 'Appointments', 'Check-in / Check-out'];
    const moduleCreateInputs = rawModules.map((m: any, idx: number) => {
      if (typeof m === 'string') {
        return {
          name: m,
          code: m.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          isEnabled: true,
          category: 'Core',
          order: idx + 1,
        };
      }
      return {
        moduleId: m.id || `mod-${idx}`,
        name: m.name,
        code: (m.name || 'module').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        description: m.description || null,
        category: m.category || 'General',
        icon: m.icon || 'Boxes',
        isEnabled: m.isEnabled !== false,
        isRequired: !!(m.required || m.isRequired),
        isCustom: !!(m.custom || m.isCustom),
        order: m.order || idx + 1,
        dependencies: m.dependencies || null,
        visibility: m.visibility || null,
        permissions: m.permissions || null,
        configuration: m.configuration || null,
      };
    });

    const application = await this.prisma.application.create({
      data: {
        organizationId,
        name: dto.name,
        slug,
        description: dto.description || 'Enterprise platform application generated via LaunchPad wizard',
        mode,
        status,
        templateId,
        environment: 'development',
        usersCount: 1,
        branding,
        targetBackend: (dto.targetBackend as any) || null,
        modules: {
          create: moduleCreateInputs,
        },
      },
      include: {
        organization: true,
        template: true,
        modules: true,
        settings: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId,
      action: 'Application Created',
      resource: 'Application',
      resourceId: application.id,
      details: `Created application '${application.name}' with ${application.modules.length} modules (Mode: ${application.mode})`,
    });

    return this.formatApplicationResponse(application);
  }

  async findAll(currentUser: UserPayload) {
    const where = currentUser.role === 'SUPER_ADMIN' ? {} : { organizationId: currentUser.organizationId };

    const apps = await this.prisma.application.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        organization: true,
        template: true,
        modules: true,
      },
    });

    return apps.map((app) => this.formatApplicationResponse(app));
  }

  async findOne(id: string, currentUser: UserPayload) {
    const app = await this.prisma.application.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        organization: true,
        template: true,
        modules: {
          orderBy: [{ order: 'asc' }, { name: 'asc' }],
        },
        settings: true,
      },
    });

    if (!app) {
      throw new NotFoundException(`Application with ID or slug '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's application.");
    }

    return this.formatApplicationResponse(app);
  }

  async update(id: string, dto: UpdateApplicationDto, currentUser: UserPayload) {
    const app = await this.prisma.application.findUnique({ where: { id } });

    if (!app) {
      throw new NotFoundException(`Application with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to update another organization's application.");
    }

    const mode = dto.mode ? (dto.mode.toUpperCase() as AppMode) : undefined;
    const status = dto.status ? (dto.status.toUpperCase() as AppStatus) : undefined;

    const updatedApp = await this.prisma.application.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(mode && { mode }),
        ...(status && { status }),
        ...(dto.branding && { branding: dto.branding as any }),
        ...(dto.targetBackend && { targetBackend: dto.targetBackend as any }),
      },
      include: {
        organization: true,
        template: true,
        modules: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Application Updated',
      resource: 'Application',
      resourceId: id,
      details: `Updated application '${updatedApp.name}' settings`,
    });

    return this.findOne(id, currentUser);
  }

  async remove(id: string, currentUser: UserPayload) {
    const app = await this.prisma.application.findUnique({ where: { id } });

    if (!app) {
      throw new NotFoundException(`Application with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to delete another organization's application.");
    }

    await this.prisma.application.delete({ where: { id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Application Deleted',
      resource: 'Application',
      resourceId: id,
      details: `Deleted application '${app.name}'`,
    });

    return { success: true, message: `Application '${app.name}' deleted successfully.` };
  }

  // --- MODULE SPECIFIC API ENDPOINTS ---

  async getApplicationModules(appId: string, currentUser: UserPayload) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`Application with ID '${appId}' not found.`);
    }
    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's modules.");
    }

    return this.prisma.applicationModule.findMany({
      where: { applicationId: appId },
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
    });
  }

  async addApplicationModule(appId: string, dto: CreateModuleDto, currentUser: UserPayload) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`Application with ID '${appId}' not found.`);
    }
    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to add module to this application.");
    }

    const code = dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const createdModule = await this.prisma.applicationModule.create({
      data: {
        applicationId: appId,
        moduleId: dto.moduleId || `custom-${Date.now().toString(36)}`,
        name: dto.name,
        code,
        description: dto.description || null,
        category: dto.category || 'Custom',
        icon: dto.icon || 'Package',
        isEnabled: dto.isEnabled !== false,
        isRequired: !!dto.isRequired,
        isCustom: dto.isCustom !== false,
        order: dto.order || 99,
        dependencies: dto.dependencies || null,
        visibility: dto.visibility || null,
        permissions: dto.permissions || null,
        configuration: dto.configuration || null,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Module Added',
      resource: 'ApplicationModule',
      resourceId: createdModule.id,
      details: `Added module '${createdModule.name}' to application '${app.name}'`,
    });

    return createdModule;
  }

  async updateApplicationModule(
    appId: string,
    moduleId: string,
    dto: UpdateModuleDto,
    currentUser: UserPayload,
  ) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`Application with ID '${appId}' not found.`);
    }
    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Access denied to update this module.');
    }

    const moduleRecord = await this.prisma.applicationModule.findFirst({
      where: {
        applicationId: appId,
        OR: [{ id: moduleId }, { moduleId }],
      },
    });

    if (!moduleRecord) {
      throw new NotFoundException(`Module with ID '${moduleId}' not found in application '${appId}'.`);
    }

    if (moduleRecord.isRequired && dto.isEnabled === false) {
      throw new BadRequestException(`Required module '${moduleRecord.name}' cannot be disabled.`);
    }

    const updated = await this.prisma.applicationModule.update({
      where: { id: moduleRecord.id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category && { category: dto.category }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.isEnabled !== undefined && { isEnabled: dto.isEnabled }),
        ...(dto.isRequired !== undefined && { isRequired: dto.isRequired }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.permissions && { permissions: dto.permissions }),
        ...(dto.configuration && { configuration: dto.configuration }),
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Module Updated',
      resource: 'ApplicationModule',
      resourceId: updated.id,
      details: `Updated module '${updated.name}' (Enabled: ${updated.isEnabled}) in application '${app.name}'`,
    });

    return updated;
  }

  async deleteApplicationModule(appId: string, moduleId: string, currentUser: UserPayload) {
    const app = await this.prisma.application.findUnique({ where: { id: appId } });
    if (!app) {
      throw new NotFoundException(`Application with ID '${appId}' not found.`);
    }
    if (currentUser.role !== 'SUPER_ADMIN' && app.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Access denied to delete this module.');
    }

    const moduleRecord = await this.prisma.applicationModule.findFirst({
      where: {
        applicationId: appId,
        OR: [{ id: moduleId }, { moduleId }],
      },
    });

    if (!moduleRecord) {
      throw new NotFoundException(`Module with ID '${moduleId}' not found.`);
    }

    if (moduleRecord.isRequired) {
      throw new BadRequestException(`Required module '${moduleRecord.name}' cannot be deleted.`);
    }

    await this.prisma.applicationModule.delete({ where: { id: moduleRecord.id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Module Deleted',
      resource: 'ApplicationModule',
      resourceId: moduleId,
      details: `Deleted module '${moduleRecord.name}' from application '${app.name}'`,
    });

    return { success: true, message: `Module '${moduleRecord.name}' deleted successfully.` };
  }

  private formatApplicationResponse(app: any) {
    return {
      id: app.id,
      organizationId: app.organizationId,
      name: app.name,
      slug: app.slug,
      description: app.description,
      industry: app.template?.industry || 'Enterprise Services',
      type: app.mode === 'STANDALONE' ? 'Standalone Modular App' : 'Integration Hub Connector',
      mode: app.mode.toLowerCase(),
      status: app.status.toLowerCase(),
      templateId: app.templateId,
      templateName: app.template?.name || 'Custom Solution',
      modules: app.modules
        ? app.modules.map((m: any) => ({
            id: m.id,
            moduleId: m.moduleId || m.id,
            name: m.name,
            code: m.code,
            description: m.description,
            category: m.category,
            icon: m.icon,
            isEnabled: m.isEnabled,
            isRequired: m.isRequired,
            isCustom: m.isCustom,
            order: m.order,
            dependencies: m.dependencies,
            visibility: m.visibility,
            permissions: m.permissions,
            configuration: m.configuration,
          }))
        : [],
      usersCount: app.usersCount || 1,
      environment: app.environment || 'development',
      branding: app.branding || {
        appName: app.name,
        primaryColor: '#3F7659',
        secondaryColor: '#DDEEDF',
        font: 'Inter',
        buttonStyle: 'rounded',
        borderRadius: '8px',
      },
      targetBackend: app.targetBackend || undefined,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }
}
