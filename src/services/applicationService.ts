import { Application, AppMode, BrandingConfig } from '@/types';
import { ApiClient } from '@/lib/api/client';

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    const apps = await ApiClient.get<Application[]>('applications');
    if (Array.isArray(apps)) {
      return apps;
    }
    return [];
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    try {
      const app = await ApiClient.get<Application>(`applications/${id}`);
      if (app && app.id) {
        return app;
      }
      return undefined;
    } catch (e: any) {
      if (e.statusCode === 404) {
        return undefined;
      }
      throw e;
    }
  },

  async createApplication(payload: {
    name: string;
    description: string;
    industry: string;
    type: string;
    mode: AppMode;
    templateId?: string;
    templateName?: string;
    modules: any[];
    branding: BrandingConfig;
    targetBackend?: {
      systemName: string;
      techStack: string;
      connectorType: string;
      endpointUrl: string;
    };
    configuration?: any;
  }): Promise<Application> {
    const formattedPayload = {
      ...payload,
      mode: payload.mode === 'integration_hub' ? 'INTEGRATION_HUB' : 'STANDALONE',
    };

    // Real persistence: Call the NestJS backend to persist into PostgreSQL
    // Throws real error if backend is unavailable or unauthenticated
    const createdApp = await ApiClient.post<Application>('applications', formattedPayload);
    if (!createdApp || !createdApp.id) {
      throw new Error('Backend failed to return persisted application record.');
    }
    return createdApp;
  },

  async updateBranding(id: string, branding: BrandingConfig): Promise<Application | undefined> {
    const updated = await ApiClient.patch<Application>(`applications/${id}`, { branding });
    return updated;
  },

  async deleteApplication(id: string): Promise<boolean> {
    await ApiClient.delete(`applications/${id}`);
    return true;
  },

  async deployApplication(
    id: string,
    environment: 'development' | 'staging' | 'production',
  ): Promise<Application | undefined> {
    const updated = await ApiClient.patch<Application>(`applications/${id}`, {
      environment,
      status: 'active',
    });
    return updated;
  },

  async getApplicationModules(id: string): Promise<any[]> {
    const res = await ApiClient.get<any>(`applications/${id}/modules`);
    if (Array.isArray(res)) {
      return res;
    } else if (res && Array.isArray(res.modules)) {
      return res.modules;
    }
    return [];
  },

  async addApplicationModule(id: string, moduleData: any): Promise<any> {
    return ApiClient.post(`applications/${id}/modules`, moduleData);
  },

  async updateApplicationModule(id: string, moduleId: string, moduleData: any): Promise<any> {
    return ApiClient.patch(`applications/${id}/modules/${moduleId}`, moduleData);
  },

  async deleteApplicationModule(id: string, moduleId: string): Promise<any> {
    return ApiClient.delete(`applications/${id}/modules/${moduleId}`);
  },
};

