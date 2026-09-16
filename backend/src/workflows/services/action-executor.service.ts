import { Injectable, Logger } from '@nestjs/common';
import { WorkflowAction, WorkflowActionType } from '@prisma/client';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { GenericRestConnectorService } from '../../integrations/services/generic-rest-connector.service';
import { IntegrationsService } from '../../integrations/integrations.service';

export interface ActionResult {
  success: boolean;
  output?: any;
  error?: string;
}

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);

  constructor(
    private auditLogsService: AuditLogsService,
    private genericRestConnector: GenericRestConnectorService,
    private integrationsService: IntegrationsService,
  ) {}

  async executeAction(
    action: WorkflowAction,
    context: {
      organizationId: string;
      applicationId: string;
      triggerData: Record<string, any>;
      userId?: string;
    },
  ): Promise<ActionResult> {
    const config = (action.configuration as Record<string, any>) || {};

    try {
      switch (action.type) {
        case WorkflowActionType.SEND_NOTIFICATION:
          return this.handleSendNotification(config, context);

        case WorkflowActionType.CREATE_RECORD:
          return this.handleCreateRecord(config, context);

        case WorkflowActionType.UPDATE_RECORD:
          return this.handleUpdateRecord(config, context);

        case WorkflowActionType.CALL_API:
          return this.handleCallApi(config, context);

        case WorkflowActionType.WEBHOOK:
          return this.handleWebhook(config, context);

        case WorkflowActionType.GENERATE_FILE:
          return this.handleGenerateFile(config, context);

        case WorkflowActionType.CREATE_AUDIT_LOG:
          return this.handleCreateAuditLog(config, context);

        default:
          return { success: true, output: { message: `Unhandled action type: ${action.type}` } };
      }
    } catch (err: any) {
      this.logger.error(`Action ${action.type} execution failed: ${err.message}`);
      return {
        success: false,
        error: err.message || `Failed to execute action ${action.type}`,
      };
    }
  }

  private async handleSendNotification(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    const recipient = config.recipient || context.triggerData?.hostEmail || 'host@company.com';
    const message = config.message || `Notification triggered for ${context.triggerData?.name || 'Visitor'}`;

    this.logger.log(`[Notification Dispatch] To: ${recipient} | Msg: ${message}`);
    return {
      success: true,
      output: {
        channel: config.channel || 'email',
        recipient,
        message,
        dispatchedAt: new Date().toISOString(),
      },
    };
  }

  private async handleCreateRecord(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    const entity = config.entity || 'VisitorRecord';
    return {
      success: true,
      output: {
        entity,
        recordId: `rec-${Date.now().toString(36)}`,
        data: { ...config.defaultFields, ...context.triggerData },
      },
    };
  }

  private async handleUpdateRecord(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    return {
      success: true,
      output: {
        entity: config.entity || 'VisitorRecord',
        updatedFields: config.fields || { status: 'APPROVED' },
      },
    };
  }

  private async handleCallApi(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    // If integrationId specified, call Integration Hub!
    if (config.integrationId) {
      const execRes = await this.integrationsService.executeRequest(
        config.integrationId,
        {
          endpoint: config.endpoint || '/api/v2/visitors',
          method: config.method || 'POST',
          body: config.body || context.triggerData,
        },
        {
          userId: context.userId || 'system-workflow',
          email: 'system@launchpad.internal',
          role: 'ORG_ADMIN' as any,
          organizationId: context.organizationId,
          name: 'Workflow Engine',
        },
      );
      return {
        success: execRes.success,
        output: execRes.data,
        error: execRes.success ? undefined : `Integration Hub request failed with code ${execRes.statusCode}`,
      };
    }

    // Direct generic connector call if raw URL passed
    const baseUrl = config.baseUrl || 'https://crm.customer-domain.com';
    const res = await this.genericRestConnector.execute({
      baseUrl,
      endpoint: config.endpoint || '/api/visitors',
      method: config.method || 'POST',
      body: config.body || context.triggerData,
    });

    return {
      success: res.success,
      output: res.data,
      error: res.errorMessage,
    };
  }

  private async handleWebhook(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    const targetUrl = config.url || 'https://webhook.site/demo';
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(context.triggerData),
    }).catch(() => null);

    return {
      success: !!res && res.ok,
      output: { url: targetUrl, status: res ? res.status : 0 },
    };
  }

  private async handleGenerateFile(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    const fileType = config.fileType || 'QR_CODE_PASS';
    const passId = `QR-${Date.now().toString(36).toUpperCase()}`;

    return {
      success: true,
      output: {
        fileType,
        passId,
        downloadUrl: `/api/v1/files/${passId}.png`,
        generatedAt: new Date().toISOString(),
      },
    };
  }

  private async handleCreateAuditLog(
    config: Record<string, any>,
    context: any,
  ): Promise<ActionResult> {
    await this.auditLogsService.logAction({
      userId: context.userId || null,
      organizationId: context.organizationId,
      action: config.action || 'Workflow Action Executed',
      resource: config.resource || 'WorkflowEngine',
      resourceId: config.resourceId || context.applicationId,
      details: config.details || `Workflow executed action for app '${context.applicationId}'`,
    });

    return {
      success: true,
      output: { auditLogged: true, timestamp: new Date().toISOString() },
    };
  }
}
