import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from '../applications/applications.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AppMode } from '@prisma/client';

export interface ParseRequirementDto {
  prompt: string;
  mode?: 'standalone' | 'integration_hub';
  industry?: string;
}

export interface SuggestedWorkflowBlueprint {
  name: string;
  description: string;
  triggerType: 'EVENT' | 'SCHEDULE' | 'WEBHOOK' | 'MANUAL';
  eventName?: string;
  conditions?: { field: string; operator: any; value: string }[];
  actions: { type: any; configuration: any }[];
}

export interface AiAppGenerationPlan {
  appName: string;
  description: string;
  industry: string;
  type: string;
  mode: 'standalone' | 'integration_hub';
  templateId: string;
  templateName: string;
  moduleIds: string[];
  suggestedWorkflows: SuggestedWorkflowBlueprint[];
  targetBackend?: {
    systemName: string;
    techStack: string;
    connectorType: string;
    endpointUrl: string;
  };
  branding: {
    appName: string;
    primaryColor: string;
    secondaryColor: string;
    font: string;
    buttonStyle: 'rounded' | 'pill' | 'sharp';
    borderRadius: string;
  };
}

@Injectable()
export class AiGeneratorService {
  constructor(
    private prisma: PrismaService,
    private applicationsService: ApplicationsService,
    private workflowsService: WorkflowsService,
    private auditLogsService: AuditLogsService,
  ) {}

  /**
   * Parses natural language requirement prompt into a structured App Generation Plan
   */
  async parseRequirement(dto: ParseRequirementDto): Promise<AiAppGenerationPlan> {
    if (!dto.prompt || dto.prompt.trim().length < 5) {
      throw new BadRequestException('Prompt requirement text must be at least 5 characters');
    }

    const text = dto.prompt.toLowerCase();
    const mode = dto.mode || 'standalone';

    // 1. Visitor Management System Pattern
    if (
      text.includes('visitor') ||
      text.includes('check-in') ||
      text.includes('checkin') ||
      text.includes('qr') ||
      text.includes('badge') ||
      text.includes('gate') ||
      text.includes('host')
    ) {
      return {
        appName: 'Corporate Visitor Pass OS',
        description: 'Enterprise visitor check-in, QR badge printing, host notifications, and access logging.',
        industry: 'Real Estate & Facilities',
        type: 'Facilities & Security Management',
        mode,
        templateId: 'template-vms-01',
        templateName: 'Visitor Management',
        moduleIds: [
          'vms-visitor-registration',
          'vms-visitor-profiles',
          'vms-visitor-history',
          'vms-appointment-booking',
          'vms-visitor-checkin',
          'vms-visitor-checkout',
          'vms-qr-checkin',
          'vms-host-directory',
          'vms-host-notifications',
          'vms-qr-badges',
          'vms-badge-printing',
          'vms-security-alerts',
          'vms-visitor-reports',
        ],
        suggestedWorkflows: [
          {
            name: 'Instant Host Arrival Notification',
            description: 'Triggers instant email and SMS alert to employee host upon visitor reception check-in.',
            triggerType: 'EVENT',
            eventName: 'visitor.created',
            conditions: [],
            actions: [
              {
                type: 'SEND_NOTIFICATION',
                configuration: { message: 'Your visitor has checked in at reception.', channel: 'SMS' },
              },
            ],
          },
          {
            name: 'VIP Visitor Security Alert Dispatch',
            description: 'Alerts security desk immediately if visitor matches flagged watchlist.',
            triggerType: 'EVENT',
            eventName: 'visitor.created',
            conditions: [{ field: 'isVIP', operator: 'EQUALS', value: 'true' }],
            actions: [
              {
                type: 'CREATE_AUDIT_LOG',
                configuration: { details: 'VIP Visitor check-in detected.' },
              },
              {
                type: 'SEND_NOTIFICATION',
                configuration: { message: 'VIP Visitor arrived.', channel: 'SLACK' },
              },
            ],
          },
        ],
        targetBackend:
          mode === 'integration_hub'
            ? {
                systemName: 'Legacy Gate Access REST API',
                techStack: 'Java Spring Boot REST',
                connectorType: 'REST API',
                endpointUrl: 'https://gate-api.facilities.acme.com/v1',
              }
            : undefined,
        branding: {
          appName: 'Visitor Pass OS',
          primaryColor: '#3F7659',
          secondaryColor: '#173C2D',
          font: 'Inter',
          buttonStyle: 'rounded',
          borderRadius: '12px',
        },
      };
    }

    // 2. CRM & Sales Pattern
    if (text.includes('crm') || text.includes('lead') || text.includes('sales') || text.includes('deal') || text.includes('customer')) {
      return {
        appName: 'Enterprise Sales CRM Portal',
        description: 'Centralized lead scoring, customer contact management, Kanban deal pipelines, and revenue forecasting.',
        industry: 'Sales & Marketing',
        type: 'Customer Relationship Management',
        mode,
        templateId: 'template-crm-03',
        templateName: 'CRM Portal',
        moduleIds: ['crm-contacts', 'crm-companies', 'crm-leads', 'crm-deals', 'crm-tickets', 'crm-reports'],
        suggestedWorkflows: [
          {
            name: 'High-Value Deal Escalation Pipeline',
            description: 'Alerts sales manager when deal amount exceeds $50,000 threshold.',
            triggerType: 'EVENT',
            eventName: 'deal.updated',
            conditions: [{ field: 'amount', operator: 'GREATER_THAN', value: '50000' }],
            actions: [
              {
                type: 'SEND_NOTIFICATION',
                configuration: { message: 'High value deal updated!', channel: 'EMAIL' },
              },
            ],
          },
        ],
        targetBackend:
          mode === 'integration_hub'
            ? {
                systemName: 'External Salesforce REST Gateway',
                techStack: 'Salesforce REST',
                connectorType: 'REST API',
                endpointUrl: 'https://salesforce.api.acme.com/v2',
              }
            : undefined,
        branding: {
          appName: 'Sales CRM',
          primaryColor: '#3F7659',
          secondaryColor: '#173C2D',
          font: 'Inter',
          buttonStyle: 'pill',
          borderRadius: '9999px',
        },
      };
    }

    // 3. HRMS & Human Capital Pattern
    if (text.includes('hr') || text.includes('employee') || text.includes('leave') || text.includes('attendance') || text.includes('payroll')) {
      return {
        appName: 'Human Capital Management OS',
        description: 'Employee master file, timecard attendance tracking, leave requests, and payroll approvals.',
        industry: 'Human Capital',
        type: 'Human Resource Management',
        mode,
        templateId: 'template-hrms-04',
        templateName: 'HRMS Portal',
        moduleIds: ['hrms-employees', 'hrms-attendance', 'hrms-leave', 'hrms-payroll', 'hrms-documents', 'hrms-reports'],
        suggestedWorkflows: [
          {
            name: 'Leave Request Manager Approval Trigger',
            description: 'Dispatches approval request to reporting manager upon time-off submission.',
            triggerType: 'EVENT',
            eventName: 'leave.requested',
            conditions: [],
            actions: [
              {
                type: 'SEND_NOTIFICATION',
                configuration: { message: 'New leave request submitted for review.', channel: 'EMAIL' },
              },
            ],
          },
        ],
        targetBackend:
          mode === 'integration_hub'
            ? {
                systemName: 'Workday HRMS REST Connector',
                techStack: 'Node.js REST',
                connectorType: 'REST API',
                endpointUrl: 'https://hr.api.acme.com/v1',
              }
            : undefined,
        branding: {
          appName: 'Human Capital OS',
          primaryColor: '#3F7659',
          secondaryColor: '#173C2D',
          font: 'Inter',
          buttonStyle: 'rounded',
          borderRadius: '8px',
        },
      };
    }

    // 4. Default / Fallback Business Operations Platform
    return {
      appName: 'Digital Business Operations Hub',
      description: 'Customized business operations platform configured for team collaboration, publishing, and analytics.',
      industry: 'Business & Publishing',
      type: 'General Business Portal',
      mode,
      templateId: 'template-content-os-02',
      templateName: 'Content OS',
      moduleIds: ['cos-pages', 'cos-posts', 'cos-media', 'cos-publishing', 'cos-seo', 'cos-analytics'],
      suggestedWorkflows: [
        {
          name: 'Publishing Audit Logger',
          description: 'Logs all content publication actions to compliance audit trail.',
          triggerType: 'EVENT',
          eventName: 'post.published',
          conditions: [],
          actions: [
            {
              type: 'CREATE_AUDIT_LOG',
              configuration: { details: 'New post published.' },
            },
          ],
        },
      ],
      branding: {
        appName: 'Operations Hub',
        primaryColor: '#3F7659',
        secondaryColor: '#173C2D',
        font: 'Inter',
        buttonStyle: 'rounded',
        borderRadius: '12px',
      },
    };
  }

  /**
   * Deploys an approved AI App Generation Plan into PostgreSQL database
   */
  async deployPlan(orgId: string, userId: string, plan: AiAppGenerationPlan) {
    const userPayload: any = {
      userId,
      organizationId: orgId,
      role: 'ORG_ADMIN',
    };

    // 1. Create Application
    const app = await this.applicationsService.create(
      {
        name: plan.appName,
        description: plan.description,
        industry: plan.industry,
        mode: plan.mode === 'integration_hub' ? AppMode.INTEGRATION_HUB : AppMode.STANDALONE,
        templateId: plan.templateId,
        modules: plan.moduleIds,
        branding: plan.branding,
        targetBackend: plan.targetBackend,
      },
      userPayload,
    );

    // 2. Create Approved Suggested Workflows
    let createdWorkflowsCount = 0;
    if (plan.suggestedWorkflows && plan.suggestedWorkflows.length > 0) {
      for (const wf of plan.suggestedWorkflows) {
        try {
          await this.workflowsService.create(
            {
              applicationId: app.id,
              name: wf.name,
              description: wf.description,
              triggerType: wf.triggerType as any,
              trigger: {
                type: wf.triggerType,
                eventName: wf.eventName || 'custom.event',
              },
              conditions: wf.conditions || [],
              actions: wf.actions || [],
              enabled: true,
            },
            userPayload,
          );
          createdWorkflowsCount++;
        } catch (e) {
          console.warn(`Failed to create suggested workflow '${wf.name}':`, e.message);
        }
      }
    }

    // 3. Log Audit Trail
    await this.auditLogsService.logAction({
      userId,
      organizationId: orgId,
      action: 'AI_APP_DEPLOYED',
      resource: 'Application',
      resourceId: app.id,
      status: 'success',
      details: `AI Generator deployed '${app.name}' with ${createdWorkflowsCount} automated workflows.`,
    });

    return {
      application: app,
      createdWorkflowsCount,
    };
  }
}
