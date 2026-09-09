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
