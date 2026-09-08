import { Connector, IntegrationLog } from '@/types';
import { MOCK_CONNECTORS, MOCK_INTEGRATION_LOGS } from '@/mock/data';

let connectorsStore: Connector[] = [...MOCK_CONNECTORS];
let logsStore: IntegrationLog[] = [...MOCK_INTEGRATION_LOGS];

export const integrationService = {
  async getConnectors(): Promise<Connector[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...connectorsStore];
  },

  async getConnectorById(id: string): Promise<Connector | undefined> {
    await new Promise((res) => setTimeout(res, 150));
    return connectorsStore.find((c) => c.id === id);
  },

  async testConnection(connectorIdOrPayload: {
    name: string;
    baseUrl: string;
    authType: string;
    apiKey?: string;
  }): Promise<{ success: boolean; latencyMs: number; message: string; details: string }> {
    // Simulate real ping latency
    const latencyMs = Math.floor(Math.random() * 80) + 40;
    await new Promise((res) => setTimeout(res, 800));

    return {
      success: true,
      latencyMs,
      message: 'Connection Successful',
      details: `Endpoint ${connectorIdOrPayload.baseUrl} is reachable. Authentication verified. Response code 200 OK.`,
    };
  },

  async createConnector(payload: Partial<Connector>): Promise<Connector> {
    await new Promise((res) => setTimeout(res, 350));
    const newConnector: Connector = {
      id: `conn-${Date.now().toString(36)}`,
      name: payload.name || 'New Custom Connector',
      type: payload.type || 'rest_api',
      category: payload.category || 'Custom',
      status: 'connected',
      targetSystem: payload.targetSystem || 'External System API',
      targetTech: payload.targetTech || 'PHP',
      authType: payload.authType || 'API Key',
      baseUrl: payload.baseUrl || 'https://api.external.com/v1',
      lastSync: 'Just now',
      latencyMs: Math.floor(Math.random() * 90) + 40,
      successRate: 100,
    };
    connectorsStore.unshift(newConnector);

    // Add log
    logsStore.unshift({
      id: `log-${Date.now()}`,
      connectorId: newConnector.id,
      connectorName: newConnector.name,
      timestamp: new Date().toISOString(),
      endpoint: '/healthcheck',
      method: 'GET',
      status: 'success',
      statusCode: 200,
      durationMs: newConnector.latencyMs,
      requestPayload: '{"ping": true}',
      responsePayload: '{"status": "ok"}',
    });

    return newConnector;
  },

  async getLogs(): Promise<IntegrationLog[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...logsStore];
  },
};
