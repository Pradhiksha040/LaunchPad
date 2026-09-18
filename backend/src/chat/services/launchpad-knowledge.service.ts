import { Injectable, Logger } from '@nestjs/common';

export interface KnowledgeSnippet {
  id: string;
  topic: string;
  category: 'architecture' | 'applications' | 'integrations' | 'marketplace' | 'roles' | 'billing' | 'troubleshooting' | 'general';
  keywords: string[];
  content: string;
  suggestedSteps?: string[];
}

@Injectable()
export class LaunchPadKnowledgeService {
  private readonly logger = new Logger(LaunchPadKnowledgeService.name);
  private readonly knowledgeBase: KnowledgeSnippet[] = [
    {
      id: 'kp-app-create',
      topic: 'Creating Applications & Modules',
      category: 'applications',
      keywords: ['create', 'app', 'application', 'module', 'wizard', 'builder', 'new app'],
      content:
        'To create an application in LaunchPad: 1. Go to the "Applications" tab in the left sidebar. 2. Click the "+ Create Application" button. 3. Enter your Application Name, description, and select the mode (Standalone App or Integration Hub). 4. Select from built-in templates (e.g., HRMS, CRM, Visitor Pass) or start from scratch. 5. Enable the required application modules (e.g., User Directory, Access Logs, Notifications). 6. Click "Generate Application" to save and initialize your workspace.',
      suggestedSteps: [
        'Navigate to Applications menu',
        'Click + Create Application',
        'Choose Standalone or Integration Hub mode',
        'Enable required modules and click Create',
      ],
    },
    {
      id: 'kp-integration-hub',
      topic: 'Integration Hub & Connectors',
      category: 'integrations',
      keywords: ['integration', 'hub', 'connector', 'backend', 'php', 'webhook', 'api', 'rest', 'connect'],
      content:
        'LaunchPad Integration Hub connects existing backend systems (PHP CRMs, legacy databases, SAP, custom REST APIs, or third-party webhooks) with LaunchPad frontend modules. You can configure: 1. Authentication (API Keys, Bearer Tokens, JWT). 2. Endpoints & Base URLs. 3. Data Transformations & Mappings. 4. Event Triggers & Webhook listeners. Navigate to "Integrations" from the dashboard sidebar to register and test new connectors.',
      suggestedSteps: [
        'Go to Integrations page',
        'Click + Register Integration Connector',
        'Configure Authentication & Base URL',
        'Map endpoints and test connection',
      ],
    },
    {
      id: 'kp-marketplace',
      topic: 'Marketplace & Asset Installation',
      category: 'marketplace',
      keywords: ['marketplace', 'asset', 'plugin', 'module', 'purchase', 'license', 'earnings', 'developer'],
      content:
        'The LaunchPad Marketplace allows developers to publish custom modules and applications, while organization admins can browse, license, and install verified assets. Assets undergo automated security & vulnerability scanning before admin review. Developers can track revenue and payouts under the "Earnings & Billing" menu.',
      suggestedSteps: [
        'Browse assets in Marketplace',
        'Select module/app and click Install or License',
        'Manage installed assets under Settings > Marketplace Installations',
      ],
    },
    {
      id: 'kp-roles-rbac',
      topic: 'Roles & RBAC Security',
      category: 'roles',
      keywords: ['role', 'permission', 'rbac', 'admin', 'developer', 'viewer', 'user', 'security', 'access'],
      content:
        'LaunchPad enforces strict Multi-Tenant Role-Based Access Control (RBAC). Built-in roles include: SUPER_ADMIN (Full system control), ORG_ADMIN (Organization management), DEVELOPER (App building & module configuration), USER (Standard app user), and VIEWER (Read-only access). Organization admins can manage user roles under "Organization > Team Members".',
      suggestedSteps: [
        'Navigate to Organization > Team Members',
        'Click Edit Role next to any team member',
        'Assign SUPER_ADMIN, ORG_ADMIN, DEVELOPER, USER, or VIEWER role',
      ],
    },
    {
      id: 'kp-billing',
      topic: 'Billing, Plans & Stripe Integration',
      category: 'billing',
      keywords: ['billing', 'stripe', 'plan', 'tier', 'subscription', 'commission', 'payment', 'payout'],
      content:
        'LaunchPad supports multi-tier organization plans (Starter, Professional, Enterprise) and Stripe payment processing. Platform commission rates are configurable for marketplace asset sales. Manage organization subscriptions under "Billing & Plans".',
      suggestedSteps: [
        'Go to Billing & Plans section',
        'Select desired plan tier (Starter, Pro, Enterprise)',
        'Click Upgrade Plan to manage Stripe checkout session',
      ],
    },
    {
      id: 'kp-troubleshooting',
      topic: 'Troubleshooting & Network Diagnostics',
      category: 'troubleshooting',
      keywords: ['error', 'fail', 'failing', 'status 0', 'network', 'cors', 'troubleshoot', 'diagnostic', 'bug'],
      content:
        'Common troubleshooting items: 1. If an integration returns error status 0, check CORS configuration (`CORS_ORIGIN`) and network access to backend target URL. 2. If API calls fail with 401 Unauthorized, verify JWT expiration or re-login. 3. If database operations fail, ensure PostgreSQL is running and Prisma migrations are applied (`npx prisma migrate deploy`).',
      suggestedSteps: [
        'Check backend API health status at /health/liveness',
        'Verify CORS settings and network connectivity',
        'Check browser devtools network tab for raw error codes',
      ],
    },
    {
      id: 'kp-architecture',
      topic: 'V1 Architecture & Security Model',
      category: 'architecture',
      keywords: ['architecture', 'security', 'v1', 'nestjs', 'nextjs', 'prisma', 'postgres', 'docker'],
      content:
        'LaunchPad V1 is built on Next.js 14 (Frontend UI), NestJS 10 API Gateway (Backend Services), and Prisma ORM 5 with PostgreSQL 16 (Multi-Tenant Persistence). All API requests pass through JWT security guards and tenant isolation checks ensuring multi-tenant data privacy.',
      suggestedSteps: [
        'Refer to V1 Architecture Overview in docs/V1_ARCHITECTURE_OVERVIEW.md',
        'Inspect API Gateway swagger docs at /api/docs',
      ],
    },
  ];

  /**
   * Search knowledge base for snippets relevant to user message
   */
  findRelevantKnowledge(query: string): KnowledgeSnippet[] {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase();
    const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 2);

    const scoredSnippets = this.knowledgeBase.map((snippet) => {
      let score = 0;

      for (const keyword of snippet.keywords) {
        if (normalizedQuery.includes(keyword)) {
          score += 5;
        }
      }

      for (const word of queryWords) {
        if (snippet.topic.toLowerCase().includes(word)) {
          score += 3;
        }
        if (snippet.content.toLowerCase().includes(word)) {
          score += 1;
        }
      }

      return { snippet, score };
    });

    const relevant = scoredSnippets
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.snippet);

    return relevant.length > 0 ? relevant.slice(0, 3) : [this.knowledgeBase[0]];
  }

  /**
   * Format context payload for AI prompt
   */
  buildContextPrompt(query: string, userContext?: Record<string, any>): string {
    const snippets = this.findRelevantKnowledge(query);

    let docContext = snippets
      .map(
        (s) =>
          `[Topic: ${s.topic}]\n${s.content}\nSuggested Action Steps:\n${s.suggestedSteps?.map((st) => ` - ${st}`).join('\n')}`,
      )
      .join('\n\n');

    let envContext = '';
    if (userContext) {
      // Strip sensitive parameters
      const sanitizedContext = { ...userContext };
      delete sanitizedContext.password;
      delete sanitizedContext.jwtSecret;
      delete sanitizedContext.apiKey;
      delete sanitizedContext.stripeKey;

      envContext = `User Current Context: ${JSON.stringify(sanitizedContext)}`;
    }

    return `LAUNCHPAD KNOWLEDGE RETRIEVAL:\n${docContext}\n\n${envContext}`;
  }
}
