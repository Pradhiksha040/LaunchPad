import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConditionEvaluatorService } from './services/condition-evaluator.service';
import { ActionExecutorService } from './services/action-executor.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { RunWorkflowDto } from './dto/run-workflow.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import {
  WorkflowStatus,
  WorkflowTriggerType,
  ExecutionStatus,
  WorkflowOperator,
  WorkflowActionType,
} from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ApplicationEventPayload } from './services/event-bus.service';

@Injectable()
export class WorkflowsService {
  private readonly logger = new Logger(WorkflowsService.name);

  constructor(
    private prisma: PrismaService,
    private conditionEvaluator: ConditionEvaluatorService,
    private actionExecutor: ActionExecutorService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateWorkflowDto, currentUser: UserPayload) {
    const organizationId = currentUser.organizationId;

    const app = await this.prisma.application.findFirst({
      where: {
        id: dto.applicationId,
        ...(currentUser.role !== 'SUPER_ADMIN' && { organizationId }),
      },
    });

    if (!app) {
      throw new NotFoundException(`Application with ID '${dto.applicationId}' not found or access denied.`);
    }

    const workflow = await this.prisma.workflow.create({
      data: {
        organizationId,
        applicationId: app.id,
        name: dto.name,
        description: dto.description || null,
        status: dto.status || WorkflowStatus.DRAFT,
        triggerType: dto.triggerType || WorkflowTriggerType.EVENT,
        enabled: dto.enabled !== false,
        triggers: dto.trigger
          ? {
              create: [
                {
                  type: dto.trigger.type || WorkflowTriggerType.EVENT,
                  eventName: dto.trigger.eventName || 'visitor.created',
                  configuration: (dto.trigger.configuration as any) || {},
                },
              ],
            }
          : {
              create: [
                {
                  type: dto.triggerType || WorkflowTriggerType.EVENT,
                  eventName: 'visitor.created',
                },
              ],
            },
        conditions: dto.conditions
          ? {
              create: dto.conditions.map((c, idx) => ({
                field: c.field,
                operator: c.operator || WorkflowOperator.EQUALS,
                value: c.value || null,
                logicalOperator: c.logicalOperator || 'AND',
                order: c.order || idx + 1,
              })),
            }
          : undefined,
        actions: dto.actions
          ? {
              create: dto.actions.map((a, idx) => ({
                type: a.type || WorkflowActionType.SEND_NOTIFICATION,
                configuration: (a.configuration as any) || {},
                order: a.order || idx + 1,
                enabled: a.enabled !== false,
              })),
            }
          : undefined,
      },
      include: {
        triggers: true,
        conditions: true,
        actions: true,
        application: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId,
      action: 'Workflow Created',
      resource: 'Workflow',
      resourceId: workflow.id,
      details: `Created workflow '${workflow.name}' for app '${app.name}'`,
    });

    return this.formatWorkflowResponse(workflow);
  }

  async findAll(currentUser: UserPayload, applicationId?: string) {
    const where: any = currentUser.role === 'SUPER_ADMIN' ? {} : { organizationId: currentUser.organizationId };
    if (applicationId) {
      where.applicationId = applicationId;
    }

    let workflows = await this.prisma.workflow.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        triggers: true,
        conditions: true,
        actions: { orderBy: { order: 'asc' } },
        application: true,
        executions: { orderBy: { startedAt: 'desc' }, take: 1 },
      },
    });

    if (workflows.length === 0) {
      // Seed default VMS Demo Workflow if empty
      await this.seedVmsDemoWorkflow(currentUser);
      workflows = await this.prisma.workflow.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          triggers: true,
          conditions: true,
          actions: { orderBy: { order: 'asc' } },
          application: true,
          executions: { orderBy: { startedAt: 'desc' }, take: 1 },
        },
      });
    }

    return workflows.map((w) => this.formatWorkflowResponse(w));
  }

  async findOne(id: string, currentUser: UserPayload) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        triggers: true,
        conditions: { orderBy: { order: 'asc' } },
        actions: { orderBy: { order: 'asc' } },
        application: true,
        executions: { orderBy: { startedAt: 'desc' }, take: 10, include: { steps: true } },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && workflow.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's workflow.");
    }

    return this.formatWorkflowResponse(workflow);
  }

  async update(id: string, dto: UpdateWorkflowDto, currentUser: UserPayload) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && workflow.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to update another organization's workflow.");
    }

    const updated = await this.prisma.workflow.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status && { status: dto.status }),
        ...(dto.triggerType && { triggerType: dto.triggerType }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
      },
      include: {
        triggers: true,
        conditions: true,
        actions: true,
        application: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Workflow Updated',
      resource: 'Workflow',
      resourceId: id,
      details: `Updated workflow '${updated.name}'`,
    });

    return this.formatWorkflowResponse(updated);
  }

  async remove(id: string, currentUser: UserPayload) {
    const workflow = await this.prisma.workflow.findUnique({ where: { id } });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && workflow.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to delete another organization's workflow.");
    }

    await this.prisma.workflow.delete({ where: { id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Workflow Deleted',
      resource: 'Workflow',
      resourceId: id,
      details: `Deleted workflow '${workflow.name}'`,
    });

    return { success: true, message: `Workflow '${workflow.name}' deleted successfully.` };
  }

  async activate(id: string, currentUser: UserPayload) {
    const workflow = await this.findOne(id, currentUser);
    const updated = await this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.ACTIVE, enabled: true },
      include: { triggers: true, conditions: true, actions: true, application: true },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Workflow Activated',
      resource: 'Workflow',
      resourceId: id,
      details: `Activated workflow '${updated.name}'`,
    });

    return this.formatWorkflowResponse(updated);
  }

  async pause(id: string, currentUser: UserPayload) {
    const workflow = await this.findOne(id, currentUser);
    const updated = await this.prisma.workflow.update({
      where: { id },
      data: { status: WorkflowStatus.PAUSED, enabled: false },
      include: { triggers: true, conditions: true, actions: true, application: true },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Workflow Paused',
      resource: 'Workflow',
      resourceId: id,
      details: `Paused workflow '${updated.name}'`,
    });

    return this.formatWorkflowResponse(updated);
  }

  // --- WORKFLOW EXECUTION ENGINE & RETRIES ---

  async runWorkflow(id: string, dto: RunWorkflowDto, currentUser: UserPayload) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        triggers: true,
        conditions: { orderBy: { order: 'asc' } },
        actions: { where: { enabled: true }, orderBy: { order: 'asc' } },
      },
    });

    if (!workflow) {
      throw new NotFoundException(`Workflow with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && workflow.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to execute this workflow.");
    }

    const triggerData = dto.payload || {
      eventName: 'visitor.approved',
      name: 'John Doe',
      type: 'VIP',
      email: 'john@example.com',
      hostEmail: 'admin@company.com',
      status: 'APPROVED',
      hasQrCode: false,
    };

    return this.executePipeline(workflow, triggerData, {
      userId: currentUser.userId,
      isTest: dto.isTest || false,
    });
  }

  async processEvent(event: ApplicationEventPayload) {
    // Find active workflows matching organizationId, applicationId, and eventName
    const matchingWorkflows = await this.prisma.workflow.findMany({
      where: {
        organizationId: event.organizationId,
        applicationId: event.applicationId,
        status: WorkflowStatus.ACTIVE,
        enabled: true,
        triggers: {
          some: {
            eventName: event.eventName,
          },
        },
      },
      include: {
        triggers: true,
        conditions: { orderBy: { order: 'asc' } },
        actions: { where: { enabled: true }, orderBy: { order: 'asc' } },
      },
    });

    this.logger.log(`Processing event '${event.eventName}': Found ${matchingWorkflows.length} active workflows`);

    for (const workflow of matchingWorkflows) {
      await this.executePipeline(workflow, event.data, {
        userId: event.userId,
        isTest: false,
      });
    }
  }

  private async executePipeline(
    workflow: any,
    triggerData: Record<string, any>,
    options: { userId?: string; isTest?: boolean },
  ) {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        organizationId: workflow.organizationId,
        applicationId: workflow.applicationId,
        triggerData: triggerData as any,
        status: ExecutionStatus.RUNNING,
        startedAt: new Date(),
        isTest: options.isTest || false,
      },
    });

    // Step 1: Condition Evaluation
    const conditionsPassed = this.conditionEvaluator.evaluateConditions(
      workflow.conditions || [],
      triggerData,
    );

    if (!conditionsPassed) {
      const completed = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: ExecutionStatus.SUCCESS,
          completedAt: new Date(),
          error: 'Conditions evaluated to false. Actions skipped.',
        },
        include: { steps: true },
      });

      await this.auditLogsService.logAction({
        userId: options.userId || null,
        organizationId: workflow.organizationId,
        action: 'Workflow Executed',
        resource: 'WorkflowExecution',
        resourceId: execution.id,
        details: `Workflow '${workflow.name}' completed (Conditions: False)`,
      });

      return completed;
    }

    // Step 2: Actions Execution Loop with Retries
    let hasFailed = false;
    let executionError: string | null = null;
    let totalRetries = 0;

    for (const action of workflow.actions) {
      const step = await this.prisma.workflowExecutionStep.create({
        data: {
          executionId: execution.id,
          actionId: action.id,
          actionType: action.type,
          status: ExecutionStatus.RUNNING,
          input: JSON.stringify(triggerData),
          startedAt: new Date(),
        },
      });

      let retries = 0;
      const maxRetries = 3;
      let actionRes = await this.actionExecutor.executeAction(action, {
        organizationId: workflow.organizationId,
        applicationId: workflow.applicationId,
        triggerData,
        userId: options.userId,
      });

      while (!actionRes.success && retries < maxRetries) {
        retries++;
        totalRetries++;
        this.logger.warn(`Action ${action.type} failed. Retry attempt ${retries}/${maxRetries}...`);
        await new Promise((r) => setTimeout(r, 200 * retries)); // Exponential backoff simulation
        actionRes = await this.actionExecutor.executeAction(action, {
          organizationId: workflow.organizationId,
          applicationId: workflow.applicationId,
          triggerData,
          userId: options.userId,
        });
      }

      if (actionRes.success) {
        await this.prisma.workflowExecutionStep.update({
          where: { id: step.id },
          data: {
            status: ExecutionStatus.SUCCESS,
            output: JSON.stringify(actionRes.output || {}),
            completedAt: new Date(),
          },
        });
      } else {
        hasFailed = true;
        executionError = actionRes.error || `Action ${action.type} failed after ${maxRetries} retries`;
        await this.prisma.workflowExecutionStep.update({
          where: { id: step.id },
          data: {
            status: ExecutionStatus.FAILED,
            error: executionError,
            completedAt: new Date(),
          },
        });
        break; // Stop pipeline execution on failure
      }
    }

    const finalStatus = hasFailed ? ExecutionStatus.FAILED : ExecutionStatus.SUCCESS;
    const completedExecution = await this.prisma.workflowExecution.update({
      where: { id: execution.id },
      data: {
        status: finalStatus,
        completedAt: new Date(),
        error: executionError,
        retryCount: totalRetries,
      },
      include: { steps: true },
    });

    await this.auditLogsService.logAction({
      userId: options.userId || null,
      organizationId: workflow.organizationId,
      action: hasFailed ? 'Workflow Failed' : 'Workflow Executed',
      resource: 'WorkflowExecution',
      resourceId: execution.id,
      details: `Workflow '${workflow.name}' finished with status ${finalStatus} (${totalRetries} retries)`,
    });

    return completedExecution;
  }

  // --- EXECUTIONS HISTORY LOGS ---

  async getExecutions(currentUser: UserPayload, workflowId?: string) {
    const where: any = {};
    if (workflowId) {
      const workflow = await this.prisma.workflow.findUnique({ where: { id: workflowId } });
      if (!workflow) throw new NotFoundException(`Workflow '${workflowId}' not found.`);
      if (currentUser.role !== 'SUPER_ADMIN' && workflow.organizationId !== currentUser.organizationId) {
        throw new ForbiddenException('Access denied to workflow executions.');
      }
      where.workflowId = workflowId;
    } else if (currentUser.role !== 'SUPER_ADMIN') {
      where.organizationId = currentUser.organizationId;
    }

    return this.prisma.workflowExecution.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        workflow: { select: { id: true, name: true, triggerType: true } },
        application: { select: { id: true, name: true } },
        steps: { orderBy: { startedAt: 'asc' } },
      },
    });
  }

  async getExecutionById(id: string, currentUser: UserPayload) {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id },
      include: {
        workflow: { select: { id: true, name: true, triggerType: true } },
        application: { select: { id: true, name: true } },
        steps: { orderBy: { startedAt: 'asc' } },
      },
    });

    if (!execution) {
      throw new NotFoundException(`Workflow execution '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && execution.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException('Access denied to this execution log.');
    }

    return execution;
  }

  // --- SEED DEMO WORKFLOW ---

  private async seedVmsDemoWorkflow(currentUser: UserPayload) {
    const app = await this.prisma.application.findFirst({
      where: {
        organizationId: currentUser.organizationId,
      },
    });

    if (!app) return;

    await this.prisma.workflow.create({
      data: {
        organizationId: currentUser.organizationId,
        applicationId: app.id,
        name: 'Visitor Approval Workflow',
        description: 'Automated visitor approval notification, QR generation, and CRM sync pipeline.',
        status: WorkflowStatus.ACTIVE,
        triggerType: WorkflowTriggerType.EVENT,
        enabled: true,
        triggers: {
          create: [
            {
              type: WorkflowTriggerType.EVENT,
              eventName: 'visitor.approved',
            },
          ],
        },
        conditions: {
          create: [
            {
              field: 'type',
              operator: WorkflowOperator.EXISTS,
              logicalOperator: 'AND',
              order: 1,
            },
          ],
        },
        actions: {
          create: [
            {
              type: WorkflowActionType.SEND_NOTIFICATION,
              configuration: { recipient: 'host@company.com', message: 'Visitor check-in approved' },
              order: 1,
              enabled: true,
            },
            {
              type: WorkflowActionType.GENERATE_FILE,
              configuration: { fileType: 'QR_CODE_PASS' },
              order: 2,
              enabled: true,
            },
            {
              type: WorkflowActionType.CREATE_AUDIT_LOG,
              configuration: { action: 'Visitor Pass Approved', resource: 'VMS' },
              order: 3,
              enabled: true,
            },
          ],
        },
      },
    });
  }

  private formatWorkflowResponse(w: any) {
    const lastExec = w.executions && w.executions.length > 0 ? w.executions[0] : null;
    return {
      id: w.id,
      organizationId: w.organizationId,
      applicationId: w.applicationId,
      applicationName: w.application?.name || 'Application',
      name: w.name,
      description: w.description,
      status: w.status.toLowerCase(),
      triggerType: w.triggerType,
      enabled: w.enabled,
      trigger: w.triggers && w.triggers.length > 0 ? w.triggers[0] : null,
      conditions: w.conditions || [],
      actions: w.actions || [],
      lastExecutionStatus: lastExec ? lastExec.status.toLowerCase() : 'none',
      lastExecutionTime: lastExec ? lastExec.startedAt.toISOString() : null,
      createdAt: w.createdAt.toISOString(),
      updatedAt: w.updatedAt.toISOString(),
    };
  }
}
