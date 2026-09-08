import { AnalyticsMetric, APIKey } from '@/types';
import { MOCK_METRICS, MOCK_API_KEYS } from '@/mock/data';

export const analyticsService = {
  async getMetrics(): Promise<AnalyticsMetric> {
    await new Promise((res) => setTimeout(res, 150));
    return { ...MOCK_METRICS };
  },

  async getAPIKeys(): Promise<APIKey[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...MOCK_API_KEYS];
  },
};
