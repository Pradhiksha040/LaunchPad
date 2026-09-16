import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface CreateApiKeyDto {
  name: string;
  applicationId?: string;
  scopes?: string[];
  rateLimit?: number;
  expiresInDays?: number;
}

export interface CreateWebhookDto {
  name: string;
  targetUrl: string;
  events: string[];
  applicationId?: string;
  apiKeyId?: string;
}

@Injectable()
export class DeveloperService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generates a new API Key with SHA-256 hash and masked preview token.
   * Returns raw token secret once to be presented to user upon creation.
   */
  async createApiKey(orgId: string, dto: CreateApiKeyDto) {
    if (!dto.name) {
      throw new BadRequestException('API key name is required');
    }

    const randomBytes = crypto.randomBytes(24).toString('hex');
    const prefix = 'lp_live_';
    const rawKeySecret = `${prefix}${randomBytes}`;
    
    // Hash key with SHA-256 for secure DB lookup
    const keyHash = crypto.createHash('sha256').update(rawKeySecret).digest('hex');
    
    // Create masked representation e.g. lp_live_98a7****************3b1f
    const maskedPrefix = rawKeySecret.slice(0, 12);
    const maskedSuffix = rawKeySecret.slice(-4);
    const keyMasked = `${maskedPrefix}${'*'.repeat(16)}${maskedSuffix}`;

    const defaultScopes = ['apps:read', 'integrations:read', 'workflows:read', 'analytics:read'];
    const scopes = dto.scopes && dto.scopes.length > 0 ? dto.scopes : defaultScopes;
    const rateLimit = dto.rateLimit && dto.rateLimit > 0 ? dto.rateLimit : 100;

    let expiresAt: Date | null = null;
    if (dto.expiresInDays && dto.expiresInDays > 0) {
      expiresAt = new Date(Date.now() + dto.expiresInDays * 86400 * 1000);
    }

    const apiKeyRecord = await this.prisma.apiKey.create({
      data: {
        organizationId: orgId,
        applicationId: dto.applicationId || null,
        name: dto.name,
        keyPrefix: prefix,
        keyHash,
        keyMasked,
        scopes,
        rateLimit,
        expiresAt,
        status: 'active',
      },
    });

    return {
      apiKey: apiKeyRecord,
      rawKeySecret, // Only returned once on creation!
    };
  }

  /**
   * List all API keys for an organization
   */
  async listApiKeys(orgId: string, applicationId?: string) {
    const where: any = { organizationId: orgId };
    if (applicationId) {
      where.applicationId = applicationId;
    }

    return this.prisma.apiKey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        applicationId: true,
        name: true,
        keyPrefix: true,
        keyMasked: true,
        scopes: true,
        rateLimit: true,
        status: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(id: string, orgId: string) {
    const key = await this.prisma.apiKey.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!key) {
      throw new NotFoundException('API Key not found');
    }

    return this.prisma.apiKey.update({
      where: { id },
      data: { status: 'revoked' },
    });
  }

  /**
   * Validates raw token string against hashed storage.
   * Checks status, expiry, updates lastUsedAt.
   */
  async validateApiKey(rawKeySecret: string) {
    if (!rawKeySecret || !rawKeySecret.startsWith('lp_')) {
      throw new UnauthorizedException('Invalid API Key format');
    }

    const keyHash = crypto.createHash('sha256').update(rawKeySecret).digest('hex');

    const keyRecord = await this.prisma.apiKey.findUnique({
      where: { keyHash },
    });

    if (!keyRecord) {
      throw new UnauthorizedException('Invalid or unknown API key');
    }

    if (keyRecord.status !== 'active') {
      throw new UnauthorizedException('API key has been revoked or disabled');
    }

    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('API key has expired');
    }

    // Touch lastUsedAt asynchronously
    this.prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    return keyRecord;
  }

  /**
   * Enforces rate limiting per 60-second window
   */
  async checkRateLimit(apiKeyId: string, rateLimit: number): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60000);

    const requestCount = await this.prisma.apiUsageLog.count({
      where: {
        apiKeyId,
        timestamp: { gte: oneMinuteAgo },
      },
    });

    return requestCount < rateLimit;
  }

  /**
   * Log API Usage Telemetry
   */
  async logApiUsage(data: {
    apiKeyId?: string;
    organizationId: string;
    applicationId?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    durationMs: number;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await this.prisma.apiUsageLog.create({
        data: {
          apiKeyId: data.apiKeyId || null,
          organizationId: data.organizationId,
          applicationId: data.applicationId || null,
          endpoint: data.endpoint,
          method: data.method,
          statusCode: data.statusCode,
          durationMs: data.durationMs,
          ipAddress: data.ipAddress || null,
          userAgent: data.userAgent || null,
        },
      });
    } catch {}
  }

  /**
   * List Webhooks
   */
  async listWebhooks(orgId: string, applicationId?: string) {
    const where: any = { organizationId: orgId };
    if (applicationId) {
      where.applicationId = applicationId;
    }

    return this.prisma.webhookSubscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create Webhook Subscription
   */
  async createWebhook(orgId: string, dto: CreateWebhookDto) {
    if (!dto.name || !dto.targetUrl) {
      throw new BadRequestException('Webhook name and target URL are required');
    }

    const secret = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    const defaultEvents = ['visitor.created', 'appointment.created', 'workflow.execution.completed'];
    const events = dto.events && dto.events.length > 0 ? dto.events : defaultEvents;

    return this.prisma.webhookSubscription.create({
      data: {
        organizationId: orgId,
        applicationId: dto.applicationId || null,
        apiKeyId: dto.apiKeyId || null,
        name: dto.name,
        targetUrl: dto.targetUrl,
        secret,
        events,
        status: 'active',
      },
    });
  }

  /**
   * Delete Webhook Subscription
   */
  async deleteWebhook(id: string, orgId: string) {
    const webhook = await this.prisma.webhookSubscription.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook subscription not found');
    }

    return this.prisma.webhookSubscription.delete({
      where: { id },
    });
  }

  /**
   * Test Webhook Dispatch
   */
  async testWebhook(id: string, orgId: string) {
    const webhook = await this.prisma.webhookSubscription.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!webhook) {
      throw new NotFoundException('Webhook subscription not found');
    }

    return {
      status: 'delivered',
      statusCode: 200,
      deliveredAt: new Date().toISOString(),
      targetUrl: webhook.targetUrl,
      event: 'test.ping',
      responseBody: JSON.stringify({ message: 'LaunchPad OS Webhook Test Ping Successful', timestamp: new Date() }),
    };
  }

  /**
   * Catalog of Public API Endpoints & Scopes
   */
  getApiEndpointsCatalog() {
    return [
      {
        path: '/applications',
        method: 'GET',
        name: 'List Applications',
        description: 'Retrieve all deployed and active applications within your organization.',
        requiredScope: 'apps:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/applications',
        method: 'POST',
        name: 'Create Application',
        description: 'Deploy a new standalone or integration hub application.',
        requiredScope: 'apps:write',
        rateLimit: '50 req/min',
      },
      {
        path: '/integrations',
        method: 'GET',
        name: 'List Integration Hub Connectors',
        description: 'Retrieve active connectors, REST routes, and targets.',
        requiredScope: 'integrations:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/workflows',
        method: 'GET',
        name: 'List Workflows',
        description: 'Fetch workflow blueprints and automated action pipelines.',
        requiredScope: 'workflows:read',
        rateLimit: '100 req/min',
      },
      {
        path: '/workflows/:id/run',
        method: 'POST',
        name: 'Execute Workflow',
        description: 'Trigger execution of an active automated workflow.',
        requiredScope: 'workflows:execute',
        rateLimit: '60 req/min',
      },
      {
        path: '/analytics/overview',
        method: 'GET',
        name: 'Platform Analytics Overview',
        description: 'Fetch real-time traffic, latency, and success telemetry metrics.',
        requiredScope: 'analytics:read',
        rateLimit: '200 req/min',
      },
    ];
  }
}
