import { Template } from '@/types';
import { ApiClient } from '@/lib/api/client';
import { MOCK_TEMPLATES } from '@/mock/data';

export const templateService = {
  async getTemplates(): Promise<Template[]> {
    try {
      const templates = await ApiClient.get<Template[]>('templates');
      if (Array.isArray(templates) && templates.length > 0) {
        return templates;
      }
    } catch (e: any) {
      console.warn('API getTemplates failed, using fallback:', e.message);
    }
    return [...MOCK_TEMPLATES];
  },

  async getTemplateById(id: string): Promise<Template | undefined> {
    try {
      const template = await ApiClient.get<Template>(`templates/${id}`);
      if (template && template.id) {
        return template;
      }
    } catch (e: any) {
      console.warn(`API getTemplateById(${id}) failed, using fallback:`, e.message);
    }
    return MOCK_TEMPLATES.find((t) => t.id === id);
  },

  async getTemplateModules(id: string): Promise<any[]> {
    try {
      const res = await ApiClient.get<{ modules: any[] }>(`templates/${id}/modules`);
      if (res && Array.isArray(res.modules)) {
        return res.modules;
      }
    } catch (e: any) {
      console.warn(`API getTemplateModules(${id}) failed, using fallback:`, e.message);
    }
    return [];
  },
};
