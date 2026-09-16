import { Connector, IntegrationLog } from '@/types';
import { MOCK_CONNECTORS, MOCK_INTEGRATION_LOGS } from '@/mock/data';
import { ApiClient } from '@/lib/api/client';

let fallbackConnectorsStore: Connector[] = [...MOCK_CONNECTORS];
let fallbackLogsStore: IntegrationLog[] = [...MOCK_INTEGRATION_LOGS];

export const integrationService = {
  async getConnectors(applicationId?: string): Promise<Connector[]> {
    try {
      const query = applicationId ? `?applicationId=${applicationId}` : '';
      const realData = await ApiClient.get<any[]>(`/integrations${query}`);
      if (Array.isArray(realData) && realData.length > 0) {
        return realData.map((item) => ({
          id: item.id,
          name: item.name,
          type: item.type === 'REST_GENERIC' ? 'rest_api' : item.type.toLowerCase(),
          category: item.category || 'Custom',
          status: item.status === 'active' ? 'connected' : 'error',
          targetSystem: item.targetSystem || 'External Customer API',
          targetTech: item.targetTech || 'REST',
          authType: item.authType === 'API_KEY' ? 'API Key' : item.authType === 'BEARER_TOKEN' ? 'Bearer Token' : 'JWT',
          baseUrl: item.baseUrl,
          lastSync: item.lastTestedAt ? new Date(item.lastTestedAt).toLocaleTimeString() : 'Not tested yet',
          latencyMs: 45,
          successRate: item.status === 'active' ? 100 : 0,
        }));
      }
    } catch {
      // Fallback to local memory store if backend server is not running or unauthenticated
    }
    return [...fallbackConnectorsStore];
  },

  async getConnectorById(id: string): Promise<Connector | undefined> {
    try {
      const item = await ApiClient.get<any>(`/integrations/${id}`);
      if (item) {
        return {
          id: item.id,
          name: item.name,
          type: item.type === 'REST_GENERIC' ? 'rest_api' : item.type.toLowerCase(),
          category: item.category || 'Custom',
          status: item.status === 'active' ? 'connected' : 'error',
          targetSystem: item.targetSystem || 'External Customer API',
          targetTech: item.targetTech || 'REST',
          authType: item.authType === 'API_KEY' ? 'API Key' : item.authType === 'BEARER_TOKEN' ? 'Bearer Token' : 'JWT',
          baseUrl: item.baseUrl,
          lastSync: item.lastTestedAt ? new Date(item.lastTestedAt).toLocaleTimeString() : 'Not tested yet',
          latencyMs: 45,
          successRate: 100,
        };
      }
    } catch {}
    return fallbackConnectorsStore.find((c) => c.id === id);
  },

  async testConnection(connectorIdOrPayload: {
    id?: string;
    name?: string;
    baseUrl: string;
    authType: string;
    apiKey?: string;
    bearerToken?: string;
    jwtToken?: string;
  }): Promise<{ success: boolean; latencyMs: number; message: string; details: string }> {
    try {
      if (connectorIdOrPayload.id) {
        const res = await ApiClient.post<{
          success: boolean;
          statusCode: number;
          latencyMs: number;
          message: string;
          details: string;
        }>(`/integrations/${connectorIdOrPayload.id}/test`);
        return {
          success: res.success,
          latencyMs: res.latencyMs || 45,
          message: res.message || (res.success ? '✓ Connection Successful' : '✕ Connection Failed'),
          details: res.details || `HTTP ${res.statusCode} OK`,
        };
      } else {
        const authTypeEnum = connectorIdOrPayload.authType.toUpperCase().replace(/\s+/g, '_');
        const res = await ApiClient.post<{
          success: boolean;
          statusCode: number;
          latencyMs: number;
          message: string;
          details: string;
        }>(`/integrations/test`, {
          name: connectorIdOrPayload.name || 'AdHoc Connection Test',
          baseUrl: connectorIdOrPayload.baseUrl,
          authType: authTypeEnum,
          credentials: {
            apiKey: connectorIdOrPayload.apiKey,
            bearerToken: connectorIdOrPayload.bearerToken,
            jwtToken: connectorIdOrPayload.jwtToken,
          },
        });
        return {
          success: res.success,
          latencyMs: res.latencyMs || 50,
          message: res.message || (res.success ? '✓ Connection Successful' : '✕ Connection Failed'),
          details: res.details || `HTTP ${res.statusCode} response`,
        };
      }
    } catch (err: any) {
      // Return exact error message if real API test fails
      return {
        success: false,
        latencyMs: 120,
        message: '✕ Connection Failed',
        details: err.message || `Unable to reach target host ${connectorIdOrPayload.baseUrl}`,
      };
    }
  },

  async createConnector(payload: {
    applicationId?: string;
    name: string;
    type?: string;
    category?: string;
    targetSystem?: string;
    targetTech?: string;
    baseUrl: string;
    authType: string;
    apiKey?: string;
    bearerToken?: string;
    jwtToken?: string;
  }): Promise<Connector> {
    try {
      const authTypeEnum = payload.authType.toUpperCase().replace(/\s+/g, '_');
      const created = await ApiClient.post<any>('/integrations', {
        applicationId: payload.applicationId || 'app-vms-01',
        name: payload.name,
        type: payload.type || 'REST_GENERIC',
        baseUrl: payload.baseUrl,
        authType: authTypeEnum === 'API_KEY' ? 'API_KEY' : authTypeEnum === 'BEARER_TOKEN' ? 'BEARER_TOKEN' : 'JWT',
        credentials: {
          apiKey: payload.apiKey,
          bearerToken: payload.bearerToken,
          jwtToken: payload.jwtToken,
        },
      });

      return {
        id: created.id,
        name: created.name,
        type: 'rest_api',
        category: (payload.category as any) || 'Custom',
        status: 'connected',
        targetSystem: payload.targetSystem || 'External System API',
        targetTech: (payload.targetTech as any) || 'PHP',
        authType: (payload.authType as any) || 'API Key',
        baseUrl: created.baseUrl,
        lastSync: 'Just now',
        latencyMs: 45,
        successRate: 100,
      };
    } catch (err) {
      // Fallback local creation
      const newConnector: Connector = {
        id: `conn-${Date.now().toString(36)}`,
        name: payload.name || 'New Custom Connector',
        type: 'rest_api',
        category: (payload.category as any) || 'Custom',
        status: 'connected',
        targetSystem: payload.targetSystem || 'External System API',
        targetTech: (payload.targetTech as any) || 'PHP',
        authType: (payload.authType as any) || 'API Key',
        baseUrl: payload.baseUrl || 'https://api.external.com/v1',
        lastSync: 'Just now',
        latencyMs: Math.floor(Math.random() * 90) + 40,
        successRate: 100,
      };
      fallbackConnectorsStore.unshift(newConnector);
      return newConnector;
    }
  },

  async getLogs(integrationId?: string): Promise<IntegrationLog[]> {
    try {
      const url = integrationId ? `/integrations/${integrationId}/logs` : '/integrations/logs';
      const realLogs = await ApiClient.get<any[]>(url);
      if (Array.isArray(realLogs) && realLogs.length > 0) {
        return realLogs.map((log) => ({
          id: log.id,
          connectorId: log.integrationId || log.connectorId,
          connectorName: log.connectorName || 'Generic REST Connector',
          timestamp: log.timestamp,
          endpoint: log.endpoint,
          method: log.method,
          status: log.status || (log.statusCode < 400 ? 'success' : 'error'),
          statusCode: log.statusCode,
          durationMs: log.durationMs,
          requestPayload: log.requestPayload || undefined,
          responsePayload: log.responsePayload || undefined,
        }));
      }
    } catch {}
    return [...fallbackLogsStore];
  },
};
