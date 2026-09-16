import { Workflow, WorkflowExecution } from '@/types';
import { ApiClient } from '@/lib/api/client';

export const workflowService = {
  async getWorkflows(applicationId?: string): Promise<Workflow[]> {
    try {
      const query = applicationId ? `?applicationId=${applicationId}` : '';
      const data = await ApiClient.get<Workflow[]>(`/workflows${query}`);
      if (Array.isArray(data)) {
        return data;
      }
    } catch {}
    return [];
  },

  async getWorkflowById(id: string): Promise<Workflow | null> {
    try {
      return await ApiClient.get<Workflow>(`/workflows/${id}`);
    } catch {
      return null;
    }
  },

  async createWorkflow(payload: {
    applicationId: string;
    name: string;
    description?: string;
    status?: 'draft' | 'active' | 'paused';
    triggerType?: 'EVENT' | 'SCHEDULE' | 'WEBHOOK' | 'MANUAL';
    trigger?: {
      type: string;
      eventName?: string;
      configuration?: Record<string, any>;
    };
    conditions?: any[];
    actions?: any[];
  }): Promise<Workflow> {
    return ApiClient.post<Workflow>('/workflows', payload);
  },

  async updateWorkflow(id: string, payload: Partial<Workflow>): Promise<Workflow> {
    return ApiClient.patch<Workflow>(`/workflows/${id}`, payload);
  },

  async deleteWorkflow(id: string): Promise<{ success: boolean; message: string }> {
    return ApiClient.delete<{ success: boolean; message: string }>(`/workflows/${id}`);
  },

  async activateWorkflow(id: string): Promise<Workflow> {
    return ApiClient.post<Workflow>(`/workflows/${id}/activate`);
  },

  async pauseWorkflow(id: string): Promise<Workflow> {
    return ApiClient.post<Workflow>(`/workflows/${id}/pause`);
  },

  async runWorkflow(id: string, payload?: Record<string, any>): Promise<WorkflowExecution> {
    return ApiClient.post<WorkflowExecution>(`/workflows/${id}/run`, { payload });
  },

  async testWorkflow(id: string, payload?: Record<string, any>): Promise<WorkflowExecution> {
    return ApiClient.post<WorkflowExecution>(`/workflows/${id}/test`, { payload });
  },

  async getExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    try {
      const url = workflowId ? `/workflows/${workflowId}/executions` : '/workflows/executions';
      const data = await ApiClient.get<WorkflowExecution[]>(url);
      if (Array.isArray(data)) return data;
    } catch {}
    return [];
  },

  async getExecutionById(id: string): Promise<WorkflowExecution | null> {
    try {
      return await ApiClient.get<WorkflowExecution>(`/workflow-executions/${id}`);
    } catch {
      return null;
    }
  },
};
