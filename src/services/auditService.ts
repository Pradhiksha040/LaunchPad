import { AuditLog } from '@/types';
import { MOCK_AUDIT_LOGS } from '@/mock/data';

export const auditService = {
  async getAuditLogs(): Promise<AuditLog[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...MOCK_AUDIT_LOGS];
  },
};
