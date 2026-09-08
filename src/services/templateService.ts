import { Template } from '@/types';
import { MOCK_TEMPLATES } from '@/mock/data';

export const templateService = {
  async getTemplates(): Promise<Template[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...MOCK_TEMPLATES];
  },

  async getTemplateById(id: string): Promise<Template | undefined> {
    await new Promise((res) => setTimeout(res, 100));
    return MOCK_TEMPLATES.find((t) => t.id === id);
  },
};
