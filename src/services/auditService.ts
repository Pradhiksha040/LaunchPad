import { AuditLog } from '@/types';
import { ApiClient } from '@/lib/api/client';
import { MOCK_AUDIT_LOGS } from '@/mock/data';

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const logs = await ApiClient.get<any[]>('audit-logs');
      if (Array.isArray(logs)) {
        return logs.map((log: any) => ({
          id: log.id,
          timestamp: new Date(log.timestamp || log.createdAt).toLocaleString(),
          user: log.user?.name || log.user?.email || 'System / Service',
          action: log.action,
          module: log.resource,
          ip: log.ip || '127.0.0.1',
          status: log.status || 'success',
          details: log.details || `${log.action} on ${log.resource}`,
        }));
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API getAuditLogs failed, using fallback:', e.message);
    }
    return [...MOCK_AUDIT_LOGS];
  },
};

