import { Application, AppMode, BrandingConfig } from '@/types';
import { MOCK_APPLICATIONS } from '@/mock/data';

let applicationsStore: Application[] = [...MOCK_APPLICATIONS];

export const applicationService = {
  async getApplications(): Promise<Application[]> {
    await new Promise((res) => setTimeout(res, 200));
    return [...applicationsStore];
  },

  async getApplicationById(id: string): Promise<Application | undefined> {
    await new Promise((res) => setTimeout(res, 150));
    return applicationsStore.find((app) => app.id === id);
  },

  async createApplication(payload: {
    name: string;
    description: string;
    industry: string;
    type: string;
    mode: AppMode;
    templateId?: string;
    templateName?: string;
    modules: string[];
    branding: BrandingConfig;
    targetBackend?: {
      systemName: string;
      techStack: string;
      connectorType: string;
      endpointUrl: string;
    };
  }): Promise<Application> {
    await new Promise((res) => setTimeout(res, 400));
    const newApp: Application = {
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

    applicationsStore.unshift(newApp);
    return newApp;
  },

  async updateBranding(id: string, branding: BrandingConfig): Promise<Application | undefined> {
    await new Promise((res) => setTimeout(res, 200));
    const appIndex = applicationsStore.findIndex((a) => a.id === id);
    if (appIndex !== -1) {
      applicationsStore[appIndex].branding = branding;
      applicationsStore[appIndex].updatedAt = new Date().toISOString();
      return applicationsStore[appIndex];
    }
    return undefined;
  },

  async deployApplication(id: string, environment: 'development' | 'staging' | 'production'): Promise<Application | undefined> {
    await new Promise((res) => setTimeout(res, 600));
    const appIndex = applicationsStore.findIndex((a) => a.id === id);
    if (appIndex !== -1) {
      applicationsStore[appIndex].environment = environment;
      applicationsStore[appIndex].status = 'active';
      applicationsStore[appIndex].updatedAt = new Date().toISOString();
      return applicationsStore[appIndex];
    }
    return undefined;
  },
};
