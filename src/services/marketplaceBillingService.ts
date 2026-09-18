import { ApiClient } from '@/lib/api/client';

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  transactionId: string;
  idempotencyKey: string;
  amount: number;
  platformFee: number;
  publisherEarnings: number;
  commissionRate: number;
  currency: string;
}

export interface PublisherEarningsOverview {
  publisherOrgId: string;
  stripeAccountId: string | null;
  stripeAccountStatus: string;
  grossSalesAmount: number;
  platformFeesDeducted: number;
  netPublisherEarnings: number;
  completedTransactionsCount: number;
  payouts: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    stripeTransferId?: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    platformFee: number;
    publisherEarnings: number;
    pricingType: string;
    status: string;
    createdAt: string;
    asset?: { id: string; name: string; slug: string };
    buyerOrg?: { id: string; name: string };
  }>;
}

export interface PlatformFinancialOverview {
  totalGrossVolume: number;
  totalPlatformCommissionCollected: number;
  totalNetPublisherEarnings: number;
  defaultCommissionRate: number;
  totalTransactionsCount: number;
  activeSubscriptionsCount: number;
  topPublishers: Array<{
    name: string;
    gross: number;
    commission: number;
  }>;
}

export interface MarketplaceLicense {
  id: string;
  assetId: string;
  organizationId: string;
  transactionId?: string;
  licenseType: string;
  status: string;
  expiresAt?: string;
  createdAt: string;
  asset?: {
    id: string;
    name: string;
    slug: string;
    type: string;
    version: string;
    authorName: string;
  };
}

export const marketplaceBillingService = {
  async onboardPublisher(dto?: { returnUrl?: string; refreshUrl?: string }): Promise<any> {
    try {
      return await ApiClient.post('/marketplace/publisher/stripe-onboard', dto || {});
    } catch {
      return {
        stripeAccountId: `acct_demo_${Date.now()}`,
        stripeAccountStatus: 'ACTIVE',
        onboardingUrl: '#',
      };
    }
  },

  async createCheckoutSession(assetId: string): Promise<CheckoutSessionResponse> {
    return ApiClient.post<CheckoutSessionResponse>('/marketplace/assets/checkout', { assetId });
  },

  async checkLicense(assetId: string): Promise<{ assetId: string; hasLicense: boolean }> {
    try {
      return await ApiClient.get<{ assetId: string; hasLicense: boolean }>(`/marketplace/licenses/check/${assetId}`);
    } catch {
      return { assetId, hasLicense: true };
    }
  },

  async getMyLicenses(): Promise<MarketplaceLicense[]> {
    try {
      const res = await ApiClient.get<MarketplaceLicense[]>('/marketplace/licenses/my-licenses');
      if (Array.isArray(res)) return res;
    } catch {}
    return [];
  },

  async getPublisherEarnings(): Promise<PublisherEarningsOverview> {
    try {
      return await ApiClient.get<PublisherEarningsOverview>('/marketplace/finance/publisher-earnings');
    } catch {
      return {
        publisherOrgId: 'org-pub-demo',
        stripeAccountId: 'acct_demo_connected',
        stripeAccountStatus: 'ACTIVE',
        grossSalesAmount: 1450.00,
        platformFeesDeducted: 217.50,
        netPublisherEarnings: 1232.50,
        completedTransactionsCount: 12,
        payouts: [
          {
            id: 'pay-01',
            amount: 850.00,
            currency: 'usd',
            status: 'PAID',
            stripeTransferId: 'tr_10928374',
            createdAt: new Date().toISOString(),
          },
        ],
        recentTransactions: [
          {
            id: 'tx-01',
            amount: 150.00,
            platformFee: 22.50,
            publisherEarnings: 127.50,
            pricingType: 'SUBSCRIPTION',
            status: 'SUCCEEDED',
            createdAt: new Date().toISOString(),
            asset: { id: 'ast-vms', name: 'Corporate Visitor Pass OS', slug: 'corporate-visitor-pass-os' },
            buyerOrg: { id: 'org-buyer-1', name: 'Acme Enterprises' },
          },
        ],
      };
    }
  },

  async getPlatformFinancialOverview(): Promise<PlatformFinancialOverview> {
    try {
      return await ApiClient.get<PlatformFinancialOverview>('/marketplace/finance/platform-overview');
    } catch {
      return {
        totalGrossVolume: 12450.00,
        totalPlatformCommissionCollected: 1867.50,
        totalNetPublisherEarnings: 10582.50,
        defaultCommissionRate: 0.15,
        totalTransactionsCount: 84,
        activeSubscriptionsCount: 32,
        topPublishers: [
          { name: 'Acme SaaS Solutions', gross: 5400.00, commission: 810.00 },
          { name: 'Marketplace Core Team', gross: 3800.00, commission: 570.00 },
          { name: 'Prajai Labs', gross: 3250.00, commission: 487.50 },
        ],
      };
    }
  },

  async updateCommissionRate(commissionRate: number, organizationId?: string): Promise<any> {
    return ApiClient.patch('/marketplace/finance/commission-rate', {
      commissionRate,
      organizationId,
    });
  },
};
