import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SystemRole } from '@prisma/client';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaService: any;
  let auditLogsService: any;

  const mockUserPayload: UserPayload = {
    userId: 'user-123',
    email: 'admin@techsolutions.io',
    name: 'Elena Rostova',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-456',
  };

  beforeEach(async () => {
    prismaService = {
      $transaction: jest.fn(async (cb) => cb(prismaService)),
      application: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      template: {
        findFirst: jest.fn(),
      },
      applicationModule: {
        deleteMany: jest.fn(),
        createMany: jest.fn(),
      },
    };

    auditLogsService = {
      logAction: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: prismaService },
        { provide: AuditLogsService, useValue: auditLogsService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('should create an application and trigger audit logging', async () => {
    const mockCreatedApp = {
      id: 'app-789',
      organizationId: 'org-456',
      name: 'Visitor Access Hub',
      slug: 'visitor-access-hub-123',
      description: 'Visitor management kiosk',
      mode: 'STANDALONE',
      status: 'ACTIVE',
      templateId: 'template-vms-01',
      environment: 'development',
      usersCount: 1,
      branding: { appName: 'Visitor Access Hub', primaryColor: '#3F7659' },
      modules: [{ name: 'Visitor Registration' }, { name: 'Check-in / Check-out' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaService.template.findFirst.mockResolvedValue({ id: 'template-vms-01', name: 'Visitor Management' });
    prismaService.application.create.mockResolvedValue(mockCreatedApp);

    const result = await service.create(
      {
        name: 'Visitor Access Hub',
        templateId: 'template-vms-01',
        modules: ['Visitor Registration', 'Check-in / Check-out'],
      },
      mockUserPayload,
    );

    expect(result.name).toBe('Visitor Access Hub');
    expect(result.mode).toBe('standalone');
    expect(auditLogsService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'Application Created', resourceId: 'app-789' }),
    );
  });

  it('should reject application creation when name is empty', async () => {
    await expect(
      service.create({ name: '   ', modules: ['Visitor Registration'] }, mockUserPayload),
    ).rejects.toThrow('Application name is required and cannot be empty.');
  });

  it('should reject application creation when organizationId is missing', async () => {
    const userWithoutOrg = { ...mockUserPayload, organizationId: '' as any };
    await expect(
      service.create({ name: 'Test App', modules: ['Visitor Registration'] }, userWithoutOrg),
    ).rejects.toThrow('Authenticated user must belong to an organization.');
  });

  it('should reject application creation when module dependency is missing', async () => {
    const modulesWithMissingDep = [
      {
        id: 'mod-reports',
        name: 'Analytics Reports',
        dependencies: ['Visitor Registration'],
      },
    ];
    await expect(
      service.create({ name: 'Test App', modules: modulesWithMissingDep }, mockUserPayload),
    ).rejects.toThrow(/requires dependency 'Visitor Registration'/);
  });

  it('should deduplicate modules with duplicate names or codes', async () => {
    const duplicateModules = [
      'Visitor Registration',
      'Visitor Registration',
      { id: 'mod-1', name: 'Visitor Registration' },
      'Check-in / Check-out',
    ];

    prismaService.application.create.mockImplementation(async ({ data }: any) => {
      expect(data.modules.create.length).toBe(2);
      return {
        id: 'app-dedup-1',
        organizationId: 'org-456',
        name: 'Dedup App',
        slug: 'dedup-app-123',
        description: 'Test',
        mode: 'STANDALONE',
        status: 'ACTIVE',
        modules: data.modules.create,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const res = await service.create({ name: 'Dedup App', modules: duplicateModules }, mockUserPayload);
    expect(res.modules.length).toBe(2);
  });

  it('should fetch application modules with getApplicationModules', async () => {
    const mockApp = { id: 'app-789', organizationId: 'org-456' };
    const mockModules = [
      { id: 'mod-1', name: 'Visitor Registration', isEnabled: true },
      { id: 'mod-2', name: 'Equipment Management', isEnabled: true, isCustom: true },
    ];

    prismaService.application.findUnique.mockResolvedValue(mockApp);
    prismaService.applicationModule = {
      ...prismaService.applicationModule,
      findMany: jest.fn().mockResolvedValue(mockModules),
    };

    const res = await service.getApplicationModules('app-789', mockUserPayload);
    expect(res.length).toBe(2);
    expect(res[1].name).toBe('Equipment Management');
  });

  it('should add a new custom module with addApplicationModule and log action', async () => {
    const mockApp = { id: 'app-789', organizationId: 'org-456', name: 'Visitor Access Hub' };
    const mockNewMod = {
      id: 'mod-new-1',
      applicationId: 'app-789',
      name: 'Custom Safety Quiz',
      isEnabled: true,
      isCustom: true,
    };

    prismaService.application.findUnique.mockResolvedValue(mockApp);
    prismaService.applicationModule = {
      ...prismaService.applicationModule,
      create: jest.fn().mockResolvedValue(mockNewMod),
    };

    const res = await service.addApplicationModule(
      'app-789',
      { name: 'Custom Safety Quiz', isCustom: true },
      mockUserPayload,
    );

    expect(res.id).toBe('mod-new-1');
    expect(auditLogsService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'Module Added' }),
    );
  });

  it('should update module with updateApplicationModule', async () => {
    const mockApp = { id: 'app-789', organizationId: 'org-456', name: 'Visitor Access Hub' };
    const mockMod = { id: 'mod-1', applicationId: 'app-789', name: 'Visitor Registration', isEnabled: true };

    prismaService.application.findUnique.mockResolvedValue(mockApp);
    prismaService.applicationModule = {
      ...prismaService.applicationModule,
      findFirst: jest.fn().mockResolvedValue(mockMod),
      update: jest.fn().mockResolvedValue({ ...mockMod, isEnabled: false }),
    };

    const res = await service.updateApplicationModule('app-789', 'mod-1', { isEnabled: false }, mockUserPayload);
    expect(res.isEnabled).toBe(false);
    expect(auditLogsService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'Module Updated' }),
    );
  });

  it('should delete module with deleteApplicationModule', async () => {
    const mockApp = { id: 'app-789', organizationId: 'org-456', name: 'Visitor Access Hub' };
    const mockMod = { id: 'mod-1', applicationId: 'app-789', name: 'Visitor Registration' };

    prismaService.application.findUnique.mockResolvedValue(mockApp);
    prismaService.applicationModule = {
      ...prismaService.applicationModule,
      findFirst: jest.fn().mockResolvedValue(mockMod),
      delete: jest.fn().mockResolvedValue(mockMod),
    };

    const res = await service.deleteApplicationModule('app-789', 'mod-1', mockUserPayload);
    expect(res.success).toBe(true);
    expect(auditLogsService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'Module Deleted' }),
    );
  });
});
