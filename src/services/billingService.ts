import { BillingPlan } from '@/types';
import { MOCK_BILLING_PLANS } from '@/mock/data';

export const billingService = {
  async getPlans(): Promise<BillingPlan[]> {
    await new Promise((res) => setTimeout(res, 150));
    return [...MOCK_BILLING_PLANS];
  },
};
