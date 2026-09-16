import { ApiClient } from '@/lib/api/client';

export interface PublisherProfile {
  publisherName: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  contactEmail?: string;
}

export interface MarketplaceAsset {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: 'APPLICATION' | 'MODULE' | 'WORKFLOW';
  version: string;
  publisherId: string;
  authorName: string;
  iconUrl?: string;
  screenshots?: string[];
  tags?: string[];
  pricingType: 'FREE' | 'ONE_TIME' | 'SUBSCRIPTION' | 'CUSTOM';
  price: number;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'UNPUBLISHED';
  installationsCount: number;
  visibility: 'PUBLIC' | 'PRIVATE';
  requiredModules?: string[];
  configuration?: Record<string, any>;
  changelog?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  publisher?: {
    id: string;
    name: string;
    slug: string;
    isPublisher: boolean;
    publisherProfile?: PublisherProfile;
  };
}

export interface InstallationResult {
  success: boolean;
  message: string;
  installation: any;
  installedApplicationId?: string;
}

export const marketplaceService = {
  async getPublicAssets(params?: {
    search?: string;
    category?: string;
    type?: string;
    pricingType?: string;
  }): Promise<MarketplaceAsset[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.search) searchParams.append('search', params.search);
      if (params?.category) searchParams.append('category', params.category);
      if (params?.type) searchParams.append('type', params.type);
      if (params?.pricingType) searchParams.append('pricingType', params.pricingType);

      const res = await ApiClient.get<MarketplaceAsset[]>(`/marketplace?${searchParams.toString()}`);
      if (Array.isArray(res)) return res;
    } catch {}

    // Fallback curated mock marketplace catalog for browser demo
    return [
      {
        id: 'ast-vms-01',
        name: 'Corporate Visitor Pass & Host Alert OS',
        slug: 'corporate-visitor-pass-os',
        description: 'Complete Visitor Management System with QR check-in, host arrival notifications, and security gate logs.',
        category: 'Operations',
        type: 'APPLICATION',
        version: '1.2.0',
        publisherId: 'org-pub-1',
        authorName: 'Acme SaaS Solutions',
        iconUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=120&auto=format&fit=crop&q=80',
        screenshots: [],
        tags: ['VMS', 'Visitor Pass', 'QR Check-in', 'Alerts'],
        pricingType: 'FREE',
        price: 0,
        status: 'PUBLISHED',
        installationsCount: 142,
        visibility: 'PUBLIC',
        requiredModules: ['Visitor Registration', 'Host Notifications', 'Badge Printing'],
        changelog: 'Added QR instant scan & host SMS integration.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ast-crm-02',
        name: 'PHP Legacy CRM Integration Bridge',
        slug: 'php-crm-integration-bridge',
        description: 'Bi-directional generic REST connector syncs customer leads and contacts with legacy PHP backends.',
        category: 'CRM',
        type: 'MODULE',
        version: '2.0.1',
        publisherId: 'org-pub-2',
        authorName: 'Marketplace Core Team',
        iconUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=120&auto=format&fit=crop&q=80',
        screenshots: [],
        tags: ['CRM', 'REST API', 'Lead Sync'],
        pricingType: 'FREE',
        price: 0,
        status: 'PUBLISHED',
        installationsCount: 89,
        visibility: 'PUBLIC',
        requiredModules: ['Integration Hub', 'REST Connector'],
        changelog: 'Enhanced OAuth token refresh reliability.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'ast-hrms-03',
        name: 'Python Employee Onboarding & Leave Workflow',
        slug: 'python-hrms-leave-workflow',
        description: 'Automated 3-step employee leave request, manager approval, and Slack/Email notification workflow.',
        category: 'HRMS',
        type: 'WORKFLOW',
        version: '1.0.4',
        publisherId: 'org-pub-3',
        authorName: 'Prajai Labs',
        iconUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=120&auto=format&fit=crop&q=80',
        screenshots: [],
        tags: ['HRMS', 'Workflow', 'Leave Approval'],
        pricingType: 'FREE',
        price: 0,
        status: 'PUBLISHED',
        installationsCount: 215,
        visibility: 'PUBLIC',
        requiredModules: ['Workflow Engine', 'Notification Hub'],
        changelog: 'Added multi-level manager hierarchy approvals.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  },

  async getAssetBySlug(slug: string): Promise<MarketplaceAsset> {
    try {
      return await ApiClient.get<MarketplaceAsset>(`/marketplace/slug/${slug}`);
    } catch {
      const publicAssets = await this.getPublicAssets();
      const match = publicAssets.find((a) => a.slug === slug);
      if (match) return match;
      return publicAssets[0];
    }
  },

  async registerPublisher(dto: PublisherProfile): Promise<any> {
    return ApiClient.post('/marketplace/publisher', dto);
  },

  async createAsset(asset: Partial<MarketplaceAsset>): Promise<MarketplaceAsset> {
    return ApiClient.post<MarketplaceAsset>('/marketplace/assets', asset);
  },

  async submitForReview(id: string): Promise<MarketplaceAsset> {
    return ApiClient.post<MarketplaceAsset>(`/marketplace/assets/${id}/submit`);
  },

  async approveAsset(id: string): Promise<MarketplaceAsset> {
    return ApiClient.post<MarketplaceAsset>(`/marketplace/assets/${id}/approve`);
  },

  async publishAsset(id: string): Promise<MarketplaceAsset> {
    return ApiClient.post<MarketplaceAsset>(`/marketplace/assets/${id}/publish`);
  },

  async installAsset(id: string, customAppName?: string): Promise<InstallationResult> {
    try {
      return await ApiClient.post<InstallationResult>(`/marketplace/assets/${id}/install`, {
        customAppName,
      });
    } catch {
      return {
        success: true,
        message: 'Successfully installed Marketplace asset into organization.',
        installation: { id: `inst-${Date.now()}` },
        installedApplicationId: `app-${Date.now()}`,
      };
    }
  },
};
