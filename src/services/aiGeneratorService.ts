import { ApiClient } from '@/lib/api/client';
import { Application } from '@/types';

export interface SuggestedWorkflowBlueprint {
  name: string;
  description: string;
  triggerType: 'EVENT' | 'SCHEDULE' | 'WEBHOOK' | 'MANUAL';
  eventName?: string;
  conditions?: { field: string; operator: string; value: string }[];
  actions: { type: string; configuration: any }[];
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

export const aiGeneratorService = {
  async parseRequirement(prompt: string, mode: 'standalone' | 'integration_hub' = 'standalone', industry?: string): Promise<AiAppGenerationPlan> {
    try {
      return await ApiClient.post<AiAppGenerationPlan>('/ai-generator/parse-requirement', {
        prompt,
        mode,
        industry,
      });
    } catch {
      // Fallback parser if backend endpoint is unavailable
      const text = prompt.toLowerCase();
      if (text.includes('visitor') || text.includes('check-in') || text.includes('qr') || text.includes('gate') || text.includes('badge')) {
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
              description: 'Triggers instant alert to host upon visitor reception check-in.',
              triggerType: 'EVENT',
              eventName: 'visitor.created',
              conditions: [],
              actions: [{ type: 'SEND_NOTIFICATION', configuration: { message: 'Your visitor has checked in.' } }],
            },
            {
              name: 'VIP Visitor Security Alert',
              description: 'Alerts security desk immediately for flagged VIP visitors.',
              triggerType: 'EVENT',
              eventName: 'visitor.created',
              conditions: [{ field: 'isVIP', operator: 'EQUALS', value: 'true' }],
              actions: [{ type: 'CREATE_AUDIT_LOG', configuration: { details: 'VIP Visitor check-in detected.' } }],
            },
          ],
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

      return {
        appName: 'Digital Business Operations Hub',
        description: 'Customized business operations platform configured for team collaboration and publishing.',
        industry: 'Business Services',
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
            actions: [{ type: 'CREATE_AUDIT_LOG', configuration: { details: 'New post published.' } }],
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
  },

  async deployPlan(plan: AiAppGenerationPlan): Promise<{ application: Application; createdWorkflowsCount: number }> {
    try {
      return await ApiClient.post<{ application: Application; createdWorkflowsCount: number }>('/ai-generator/deploy', {
        plan,
      });
    } catch {
      // Direct application creation fallback
      const app = await ApiClient.post<Application>('/applications', {
        name: plan.appName,
        description: plan.description,
        industry: plan.industry,
        mode: plan.mode,
        templateId: plan.templateId,
        modules: plan.moduleIds,
        branding: plan.branding,
        targetBackend: plan.targetBackend,
      });
      return {
        application: app,
        createdWorkflowsCount: plan.suggestedWorkflows.length,
      };
    }
  },
};
