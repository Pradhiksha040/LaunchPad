import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowsService } from './workflows.service';
import { ConditionEvaluatorService } from './services/condition-evaluator.service';
import { ActionExecutorService } from './services/action-executor.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { GenericRestConnectorService } from '../integrations/services/generic-rest-connector.service';
import { IntegrationsService } from '../integrations/integrations.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { SystemRole, WorkflowStatus, WorkflowTriggerType, WorkflowOperator, WorkflowActionType } from '@prisma/client';

describe('WorkflowsService Unit Tests', () => {
  let service: WorkflowsService;
  let conditionEvaluator: ConditionEvaluatorService;

  const mockUser = {
    userId: 'user-100',
    email: 'admin@company.com',
    role: SystemRole.ORG_ADMIN,
    organizationId: 'org-100',
    name: 'Admin User',
  };

  const mockPrismaService = {
    application: { findFirst: jest.fn() },
    workflow: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workflowExecution: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    workflowExecutionStep: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockAuditLogsService = { logAction: jest.fn() };
  const mockGenericConnector = { execute: jest.fn() };
  const mockIntegrationsService = { executeRequest: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowsService,
        ConditionEvaluatorService,
        ActionExecutorService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditLogsService, useValue: mockAuditLogsService },
        { provide: GenericRestConnectorService, useValue: mockGenericConnector },
        { provide: IntegrationsService, useValue: mockIntegrationsService },
      ],
    }).compile();

    service = module.get<WorkflowsService>(WorkflowsService);
    conditionEvaluator = module.get<ConditionEvaluatorService>(ConditionEvaluatorService);

    jest.clearAllMocks();
  });

  describe('Condition Evaluator', () => {
    it('should evaluate EQUALS operator correctly', () => {
      const cond: any = [{ field: 'type', operator: WorkflowOperator.EQUALS, value: 'VIP', logicalOperator: 'AND', order: 1 }];
      expect(conditionEvaluator.evaluateConditions(cond, { type: 'VIP' })).toBe(true);
      expect(conditionEvaluator.evaluateConditions(cond, { type: 'REGULAR' })).toBe(false);
    });

    it('should evaluate EXISTS operator correctly', () => {
      const cond: any = [{ field: 'name', operator: WorkflowOperator.EXISTS, logicalOperator: 'AND', order: 1 }];
      expect(conditionEvaluator.evaluateConditions(cond, { name: 'John' })).toBe(true);
      expect(conditionEvaluator.evaluateConditions(cond, { name: '' })).toBe(false);
    });
  });

  describe('Application & Tenant Isolation', () => {
    it('should throw ForbiddenException when accessing workflow belonging to another org', async () => {
      mockPrismaService.workflow.findUnique.mockResolvedValue({
        id: 'wf-other',
        organizationId: 'org-other-999',
        applicationId: 'app-other',
      });

      await expect(service.findOne('wf-other', mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should create workflow scoped to user organization', async () => {
      mockPrismaService.application.findFirst.mockResolvedValue({
        id: 'app-vms-1',
        name: 'Visitor Pass OS',
        organizationId: 'org-100',
      });

      mockPrismaService.workflow.create.mockResolvedValue({
        id: 'wf-vms-1',
        organizationId: 'org-100',
        applicationId: 'app-vms-1',
        name: 'Visitor Approval Workflow',
        status: WorkflowStatus.ACTIVE,
        triggerType: WorkflowTriggerType.EVENT,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        application: { name: 'Visitor Pass OS' },
        triggers: [{ type: 'EVENT', eventName: 'visitor.approved' }],
        conditions: [],
        actions: [],
      });

      const res = await service.create(
        {
          applicationId: 'app-vms-1',
          name: 'Visitor Approval Workflow',
          triggerType: WorkflowTriggerType.EVENT,
        },
        mockUser,
      );

      expect(res.organizationId).toBe('org-100');
      expect(res.name).toBe('Visitor Approval Workflow');
    });
  });

  describe('Workflow Execution Engine', () => {
    it('should execute active workflow pipeline successfully', async () => {
      mockPrismaService.workflow.findUnique.mockResolvedValue({
        id: 'wf-1',
        organizationId: 'org-100',
        applicationId: 'app-1',
        name: 'VMS Approval Workflow',
        status: WorkflowStatus.ACTIVE,
        enabled: true,
        conditions: [
          { field: 'type', operator: WorkflowOperator.EQUALS, value: 'VIP', logicalOperator: 'AND', order: 1 },
        ],
        actions: [
          { id: 'act-1', type: WorkflowActionType.SEND_NOTIFICATION, configuration: {}, order: 1, enabled: true },
        ],
      });

      mockPrismaService.workflowExecution.create.mockResolvedValue({ id: 'exec-1' });
      mockPrismaService.workflowExecutionStep.create.mockResolvedValue({ id: 'step-1' });
      mockPrismaService.workflowExecutionStep.update.mockResolvedValue({});
      mockPrismaService.workflowExecution.update.mockResolvedValue({
        id: 'exec-1',
        status: 'SUCCESS',
        steps: [{ id: 'step-1', status: 'SUCCESS' }],
      });

      const res = await service.runWorkflow(
        'wf-1',
        { payload: { type: 'VIP', hostEmail: 'host@co.com' } },
        mockUser,
      );

      expect(res.status).toBe('SUCCESS');
      expect(mockPrismaService.workflowExecutionStep.create).toHaveBeenCalled();
    });
  });
});
