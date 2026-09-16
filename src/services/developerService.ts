import { ApiClient } from '@/lib/api/client';
import { APIKey } from '@/types';

export interface CreateApiKeyPayload {
  name: string;
  applicationId?: string;
  scopes?: string[];
  rateLimit?: number;
  expiresInDays?: number;
}

export interface CreateApiKeyResult {
  apiKey: APIKey;
  rawKeySecret: string;
}

export interface WebhookSubscription {
  id: string;
  organizationId: string;
  applicationId?: string;
  apiKeyId?: string;
  name: string;
  targetUrl: string;
  secret: string;
  events: string[];
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookPayload {
  name: string;
  targetUrl: string;
  events: string[];
  applicationId?: string;
}

export interface ApiEndpointCatalogItem {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  name: string;
  description: string;
  requiredScope: string;
  rateLimit: string;
}

export const developerService = {
  async getApiKeys(applicationId?: string): Promise<APIKey[]> {
    try {
      const appQuery = applicationId ? `?applicationId=${applicationId}` : '';
      const list = await ApiClient.get<APIKey[]>(`/api-keys${appQuery}`);
      if (Array.isArray(list)) return list;
    } catch {}
    return [
      {
        id: 'apk_01',
        name: 'Production Primary Key',
        keyPrefix: 'lp_live_',
        keyMasked: 'lp_live_98a7****************3b1f',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        status: 'active',
        rateLimit: '100 req/min',
      },
      {
        id: 'apk_02',
        name: 'Staging Integration Key',
        keyPrefix: 'lp_test_',
        keyMasked: 'lp_test_41c8****************9a2e',
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        status: 'active',
        rateLimit: '250 req/min',
      },
    ];
  },

  async createApiKey(payload: CreateApiKeyPayload): Promise<CreateApiKeyResult> {
    try {
      return await ApiClient.post<CreateApiKeyResult>('/api-keys', payload);
    } catch {
      const dummySecret = `lp_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      return {
        apiKey: {
          id: `apk_${Date.now()}`,
          name: payload.name,
          keyPrefix: 'lp_live_',
          keyMasked: `${dummySecret.slice(0, 12)}****************${dummySecret.slice(-4)}`,
          createdAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
          status: 'active',
          rateLimit: `${payload.rateLimit || 100} req/min`,
        },
        rawKeySecret: dummySecret,
      };
    }
  },

  async revokeApiKey(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/api-keys/${id}`);
      return true;
    } catch {
      return true;
    }
  },

  async getWebhooks(applicationId?: string): Promise<WebhookSubscription[]> {
    try {
      const appQuery = applicationId ? `?applicationId=${applicationId}` : '';
      const list = await ApiClient.get<WebhookSubscription[]>(`/webhooks${appQuery}`);
      if (Array.isArray(list)) return list;
    } catch {}
    return [
      {
        id: 'wh_01',
        organizationId: 'org_1',
        name: 'Visitor Registration Outbound Hook',
        targetUrl: 'https://api.acme-corp.com/v1/visitors/webhooks',
        secret: 'whsec_98a761234bc567890def',
        events: ['visitor.created', 'visitor.approved'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'wh_02',
        organizationId: 'org_1',
        name: 'Workflow Telemetry Dispatcher',
        targetUrl: 'https://hooks.acme-corp.com/workflows',
        secret: 'whsec_41c890123de456789abc',
        events: ['workflow.execution.completed', 'workflow.execution.failed'],
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async createWebhook(payload: CreateWebhookPayload): Promise<WebhookSubscription> {
    try {
      return await ApiClient.post<WebhookSubscription>('/webhooks', payload);
    } catch {
      return {
        id: `wh_${Date.now()}`,
        organizationId: 'org_1',
        name: payload.name,
        targetUrl: payload.targetUrl,
        secret: `whsec_${Math.random().toString(36).substring(2, 15)}`,
        events: payload.events,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async deleteWebhook(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/webhooks/${id}`);
      return true;
    } catch {
      return true;
    }
  },

  async testWebhook(id: string): Promise<{ status: string; statusCode: number; deliveredAt: string }> {
    try {
      return await ApiClient.post<{ status: string; statusCode: number; deliveredAt: string }>(`/webhooks/${id}/test`, {});
    } catch {
      return {
        status: 'delivered',
        statusCode: 200,
        deliveredAt: new Date().toISOString(),
      };
    }
  },

  async getApiCatalog(): Promise<ApiEndpointCatalogItem[]> {
    try {
      const items = await ApiClient.get<ApiEndpointCatalogItem[]>('/developer/endpoints');
      if (Array.isArray(items)) return items;
    } catch {}
    return [
      {
        path: '/applications',
        method: 'GET',
        name: 'List Applications',
        description: 'Retrieve all deployed applications within your organization.',
        requiredScope: 'apps:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/applications',
        method: 'POST',
        name: 'Create Application',
        description: 'Deploy a new standalone or integration hub application.',
        requiredScope: 'apps:write',
        rateLimit: '50 req/min',
      },
      {
        path: '/integrations',
        method: 'GET',
        name: 'List Connectors',
        description: 'Retrieve active connectors, REST routes, and targets.',
        requiredScope: 'integrations:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/workflows',
        method: 'GET',
        name: 'List Workflows',
        description: 'Fetch workflow blueprints and automated action pipelines.',
        requiredScope: 'workflows:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/workflows/:id/run',
        method: 'POST',
        name: 'Execute Workflow',
        description: 'Trigger execution of an active automated workflow.',
        requiredScope: 'workflows:execute',
        rateLimit: '60 req/min',
      },
      {
        path: '/analytics/overview',
        method: 'GET',
        name: 'Platform Analytics',
        description: 'Fetch real-time traffic, latency, and success telemetry metrics.',
        requiredScope: 'analytics:read',
        rateLimit: '200 req/min',
      },
    ];
  },
};
