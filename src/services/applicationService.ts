import { Application, AppMode, BrandingConfig } from '@/types';
import { ApiClient } from '@/lib/api/client';
import { MOCK_APPLICATIONS } from '@/mock/data';

let localApplicationsStore: Application[] = [...MOCK_APPLICATIONS];

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    try {
      const apps = await ApiClient.get<Application[]>('applications');
      if (Array.isArray(apps)) {
        return apps;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API getApplications offline, fallback to local store:', e.message);
    }
    return [...localApplicationsStore];
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    try {
      const app = await ApiClient.get<Application>(`applications/${id}`);
      if (app && app.id) {
        return app;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn(`API getApplicationById(${id}) offline, fallback to local store:`, e.message);
    }
    return localApplicationsStore.find((app) => app.id === id || app.slug === id);
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
  }): Promise<Application> {
    try {
      const createdApp = await ApiClient.post<Application>('applications', payload);
      if (createdApp && createdApp.id) {
        localApplicationsStore.unshift(createdApp);
        return createdApp;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn('API createApplication failed offline, falling back to client-side store:', e.message);
    }

    const fallbackApp: Application = {
      id: `app-${Date.now().toString(36)}`,
      name: payload.name,
      description: payload.description,
      industry: payload.industry,
      type: payload.type,
      mode: payload.mode,
      status: 'active',
      templateId: payload.templateId,
      templateName: payload.templateName,
      modules: payload.modules,
      usersCount: 1,
      environment: 'development',
      branding: payload.branding,
      targetBackend: payload.targetBackend,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localApplicationsStore.unshift(fallbackApp);
    return fallbackApp;
  },

  async updateBranding(id: string, branding: BrandingConfig): Promise<Application | undefined> {
    try {
      const updated = await ApiClient.patch<Application>(`applications/${id}`, { branding });
      if (updated && updated.id) {
        return updated;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn(`API updateBranding(${id}) failed, updating local store:`, e.message);
    }

    const appIndex = localApplicationsStore.findIndex((a) => a.id === id);
    if (appIndex !== -1) {
      localApplicationsStore[appIndex].branding = branding;
      localApplicationsStore[appIndex].updatedAt = new Date().toISOString();
      return localApplicationsStore[appIndex];
    }
    return undefined;
  },

  async deleteApplication(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`applications/${id}`);
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn(`API deleteApplication(${id}) failed, updating local store:`, e.message);
    }
    localApplicationsStore = localApplicationsStore.filter((a) => a.id !== id);
    return true;
  },

  async deployApplication(
    id: string,
    environment: 'development' | 'staging' | 'production',
  ): Promise<Application | undefined> {
    try {
      const updated = await ApiClient.patch<Application>(`applications/${id}`, {
        environment,
        status: 'active',
      });
      if (updated && updated.id) {
        return updated;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn(`API deployApplication(${id}) failed, updating local store:`, e.message);
    }

    const appIndex = localApplicationsStore.findIndex((a) => a.id === id);
    if (appIndex !== -1) {
      localApplicationsStore[appIndex].environment = environment;
      localApplicationsStore[appIndex].status = 'active';
      localApplicationsStore[appIndex].updatedAt = new Date().toISOString();
      return localApplicationsStore[appIndex];
    }
    return undefined;
  },

  async getApplicationModules(id: string): Promise<any[]> {
    try {
      const res = await ApiClient.get<any>(`applications/${id}/modules`);
      if (Array.isArray(res)) {
        return res;
      } else if (res && Array.isArray(res.modules)) {
        return res.modules;
      }
    } catch (e: any) {
      if (e.statusCode !== undefined) throw e;
      console.warn(`API getApplicationModules(${id}) failed:`, e.message);
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

