import { Test, TestingModule } from '@nestjs/testing';
import { AiGeneratorService } from './ai-generator.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from '../applications/applications.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { BadRequestException } from '@nestjs/common';

describe('AiGeneratorService', () => {
  let service: AiGeneratorService;
  let appsServiceMock: any;
  let workflowsServiceMock: any;
  let auditLogsServiceMock: any;

  beforeEach(async () => {
    appsServiceMock = {
      create: jest.fn().mockResolvedValue({ id: 'app_vms_100', name: 'Corporate Visitor Pass OS' }),
    };

    workflowsServiceMock = {
      create: jest.fn().mockResolvedValue({ id: 'wf_101', name: 'Instant Host Arrival Notification' }),
    };

    auditLogsServiceMock = {
      logAction: jest.fn().mockResolvedValue({ id: 'audit_102' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiGeneratorService,
        { provide: PrismaService, useValue: {} },
        { provide: ApplicationsService, useValue: appsServiceMock },
        { provide: WorkflowsService, useValue: workflowsServiceMock },
        { provide: AuditLogsService, useValue: auditLogsServiceMock },
      ],
    }).compile();

    service = module.get<AiGeneratorService>(AiGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseRequirement', () => {
    it('should parse VMS natural language requirement correctly', async () => {
      const plan = await service.parseRequirement({
        prompt: 'Create a Visitor Management System for a corporate office with QR check-in and host notifications.',
      });

      expect(plan.templateId).toBe('template-vms-01');
      expect(plan.templateName).toBe('Visitor Management');
      expect(plan.moduleIds).toContain('vms-visitor-registration');
      expect(plan.moduleIds).toContain('vms-qr-checkin');
      expect(plan.suggestedWorkflows.length).toBeGreaterThan(0);
      expect(plan.branding.primaryColor).toBe('#3F7659');
    });

    it('should parse CRM requirement correctly', async () => {
      const plan = await service.parseRequirement({
        prompt: 'Build a Sales CRM with lead scoring, deals pipeline, and revenue reports.',
      });

      expect(plan.templateId).toBe('template-crm-03');
      expect(plan.templateName).toBe('CRM Portal');
      expect(plan.moduleIds).toContain('crm-leads');
      expect(plan.moduleIds).toContain('crm-deals');
    });

    it('should throw BadRequestException if prompt is too short', async () => {
      await expect(service.parseRequirement({ prompt: 'hi' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('deployPlan', () => {
    it('should deploy application and create suggested workflows', async () => {
      const plan = await service.parseRequirement({
        prompt: 'Visitor management app',
      });

      const result = await service.deployPlan('org_1', 'user_1', plan);

      expect(appsServiceMock.create).toHaveBeenCalled();
      expect(workflowsServiceMock.create).toHaveBeenCalled();
      expect(auditLogsServiceMock.logAction).toHaveBeenCalled();
      expect(result.application.id).toBe('app_vms_100');
    });
  });
});
