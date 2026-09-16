import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './services/encryption.service';
import { ConnectorManagerService } from './services/connector-manager.service';
import { TransformationService } from './services/transformation.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { TestIntegrationDto } from './dto/test-integration.dto';
import { ExecuteRequestDto } from './dto/execute-request.dto';
import { UserPayload } from '../common/interfaces/authenticated-request.interface';
import { IntegrationAuthType, IntegrationStatus } from '@prisma/client';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
    private connectorManager: ConnectorManagerService,
    private transformationService: TransformationService,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(dto: CreateIntegrationDto, currentUser: UserPayload) {
    const organizationId = currentUser.organizationId;

    // Verify application exists and belongs to current organization
    const app = await this.prisma.application.findFirst({
      where: {
        id: dto.applicationId,
        ...(currentUser.role !== 'SUPER_ADMIN' && { organizationId }),
      },
    });

    if (!app) {
      throw new NotFoundException(`Application with ID '${dto.applicationId}' not found or access denied.`);
    }

    // Encrypt credentials if provided
    let encryptedData = '';
    if (dto.credentials && Object.keys(dto.credentials).length > 0) {
      encryptedData = this.encryptionService.encrypt(JSON.stringify(dto.credentials));
    }

    const integration = await this.prisma.integration.create({
      data: {
        organizationId,
        applicationId: app.id,
        connectorId: dto.connectorId || null,
        name: dto.name,
        type: dto.type || 'REST_GENERIC',
        baseUrl: dto.baseUrl,
        authType: dto.authType || IntegrationAuthType.API_KEY,
        status: IntegrationStatus.ACTIVE,
        configuration: (dto.configuration as any) || {},
        ...(encryptedData && {
          credential: {
            create: {
              authType: dto.authType || IntegrationAuthType.API_KEY,
              encryptedData,
            },
          },
        }),
      },
      include: {
        application: true,
        connector: true,
        credential: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId,
      action: 'Integration Created',
      resource: 'Integration',
      resourceId: integration.id,
      details: `Created integration '${integration.name}' for app '${app.name}'`,
    });

    return this.sanitizeIntegration(integration);
  }

  async findAll(currentUser: UserPayload, applicationId?: string) {
    const where: any = currentUser.role === 'SUPER_ADMIN' ? {} : { organizationId: currentUser.organizationId };
    if (applicationId) {
      where.applicationId = applicationId;
    }

    const integrations = await this.prisma.integration.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        application: true,
        connector: true,
        credential: true,
      },
    });

    return integrations.map((item) => this.sanitizeIntegration(item));
  }

  async findOne(id: string, currentUser: UserPayload) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      include: {
        application: true,
        connector: true,
        credential: true,
      },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to another organization's integration.");
    }

    return this.sanitizeIntegration(integration);
  }

  async update(id: string, dto: UpdateIntegrationDto, currentUser: UserPayload) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      include: { credential: true },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to update another organization's integration.");
    }

    // Update credential if passed
    if (dto.credentials && Object.keys(dto.credentials).length > 0) {
      const encryptedData = this.encryptionService.encrypt(JSON.stringify(dto.credentials));
      if (integration.credential) {
        await this.prisma.integrationCredential.update({
          where: { id: integration.credential.id },
          data: {
            authType: dto.authType || integration.authType,
            encryptedData,
          },
        });
      } else {
        await this.prisma.integrationCredential.create({
          data: {
            integrationId: id,
            authType: dto.authType || integration.authType,
            encryptedData,
          },
        });
      }
    }

    const updated = await this.prisma.integration.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.baseUrl && { baseUrl: dto.baseUrl }),
        ...(dto.authType && { authType: dto.authType }),
        ...(dto.status && { status: dto.status }),
        ...(dto.configuration && { configuration: dto.configuration as any }),
      },
      include: {
        application: true,
        connector: true,
        credential: true,
      },
    });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Integration Updated',
      resource: 'Integration',
      resourceId: id,
      details: `Updated integration '${updated.name}' configuration`,
    });

    return this.sanitizeIntegration(updated);
  }

  async remove(id: string, currentUser: UserPayload) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to delete another organization's integration.");
    }

    await this.prisma.integration.delete({ where: { id } });

    await this.auditLogsService.logAction({
      userId: currentUser.userId,
      organizationId: currentUser.organizationId,
      action: 'Integration Deleted',
      resource: 'Integration',
      resourceId: id,
      details: `Deleted integration '${integration.name}'`,
    });

    return { success: true, message: `Integration '${integration.name}' deleted successfully.` };
  }

  // --- TEST CONNECTION ---

  async testIntegrationById(id: string, currentUser: UserPayload) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      include: { credential: true },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to test this integration.");
    }

    let credentials: any = {};
    if (integration.credential?.encryptedData) {
      const decrypted = this.encryptionService.decrypt(integration.credential.encryptedData);
      try {
        credentials = decrypted ? JSON.parse(decrypted) : {};
      } catch {}
    }

    const testEndpoint = (integration.configuration as any)?.testEndpoint || '/';
    const result = await this.connectorManager.executeRequest({
      baseUrl: integration.baseUrl,
      endpoint: testEndpoint,
      method: 'GET',
      authType: integration.authType,
      credentials,
      timeoutMs: 5000,
    });

    // Update lastTestedAt and status
    const newStatus = result.success ? IntegrationStatus.ACTIVE : IntegrationStatus.ERROR;
    await this.prisma.integration.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: newStatus,
      },
    });

    // Create Log
    await this.prisma.integrationLog.create({
      data: {
        integrationId: id,
        method: 'GET',
        endpoint: testEndpoint,
        statusCode: result.statusCode,
        success: result.success,
        durationMs: result.durationMs,
        requestPayload: JSON.stringify({ action: 'test_connection', authType: integration.authType }),
        responsePayload: this.sanitizePayload(result.data),
        errorMessage: result.errorMessage || null,
      },
    });

    return {
      success: result.success,
      statusCode: result.statusCode,
      latencyMs: result.durationMs,
      message: result.success ? '✓ Connection Successful' : '✕ Connection Failed',
      details: result.details || (result.success ? `HTTP ${result.statusCode} OK` : result.errorMessage),
    };
  }

  async testAdHocConnection(dto: TestIntegrationDto) {
    const baseUrl = dto.baseUrl || 'https://crm.customer-domain.com/api/v2';
    const endpoint = dto.endpoint || '/';
    const authType = dto.authType || IntegrationAuthType.API_KEY;

    const result = await this.connectorManager.executeRequest({
      baseUrl,
      endpoint,
      method: 'GET',
      authType,
      credentials: dto.credentials,
      timeoutMs: 5000,
    });

    return {
      success: result.success,
      statusCode: result.statusCode,
      latencyMs: result.durationMs,
      message: result.success ? '✓ Connection Successful' : '✕ Connection Failed',
      details: result.details || (result.success ? `HTTP ${result.statusCode} OK` : result.errorMessage),
    };
  }

  // --- REQUEST EXECUTION & LOGGING ---

  async executeRequest(id: string, dto: ExecuteRequestDto, currentUser: UserPayload) {
    const integration = await this.prisma.integration.findUnique({
      where: { id },
      include: { credential: true },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID '${id}' not found.`);
    }

    if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
      throw new ForbiddenException("Access denied to execute request on this integration.");
    }

    let credentials: any = {};
    if (integration.credential?.encryptedData) {
      const decrypted = this.encryptionService.decrypt(integration.credential.encryptedData);
      try {
        credentials = decrypted ? JSON.parse(decrypted) : {};
      } catch {}
    }

    // Apply Transformation if body and mapping present
    let body = dto.body;
    const configMapping = (integration.configuration as any)?.mapping;
    const mapping = dto.mapping || configMapping;

    if (body && mapping) {
      body = this.transformationService.transformPayload(body, mapping);
    }

    const method = dto.method || 'GET';
    const result = await this.connectorManager.executeRequest({
      baseUrl: integration.baseUrl,
      endpoint: dto.endpoint,
      method,
      authType: integration.authType,
      credentials,
      headers: dto.headers,
      queryParams: dto.queryParams,
      body,
      timeoutMs: 10000,
    });

    // Create Integration Log (strictly no sensitive credentials logged)
    const log = await this.prisma.integrationLog.create({
      data: {
        integrationId: id,
        method,
        endpoint: dto.endpoint,
        statusCode: result.statusCode,
        success: result.success,
        durationMs: result.durationMs,
        requestPayload: this.sanitizePayload(body),
        responsePayload: this.sanitizePayload(result.data),
        errorMessage: result.errorMessage || null,
      },
    });

    return {
      success: result.success,
      statusCode: result.statusCode,
      durationMs: result.durationMs,
      data: result.data,
      logId: log.id,
    };
  }

  // --- LOGS ---

  async getLogs(currentUser: UserPayload, integrationId?: string) {
    const where: any = {};
    if (integrationId) {
      const integration = await this.prisma.integration.findUnique({ where: { id: integrationId } });
      if (!integration) throw new NotFoundException(`Integration '${integrationId}' not found.`);
      if (currentUser.role !== 'SUPER_ADMIN' && integration.organizationId !== currentUser.organizationId) {
        throw new ForbiddenException('Access denied to integration logs.');
      }
      where.integrationId = integrationId;
    } else if (currentUser.role !== 'SUPER_ADMIN') {
      where.integration = { organizationId: currentUser.organizationId };
    }

    const logs = await this.prisma.integrationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 100,
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            type: true,
            baseUrl: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      integrationId: log.integrationId,
      connectorId: log.integrationId,
      connectorName: log.integration.name,
      endpoint: log.endpoint,
      method: log.method,
      status: log.success ? 'success' : 'error',
      statusCode: log.statusCode || (log.success ? 200 : 500),
      durationMs: log.durationMs,
      requestPayload: log.requestPayload,
      responsePayload: log.responsePayload,
      errorMessage: log.errorMessage,
      timestamp: log.timestamp.toISOString(),
    }));
  }

  // --- SANITIZATION HELPERS ---

  private sanitizeIntegration(integration: any) {
    let credentialMasked = null;
    if (integration.credential?.encryptedData) {
      const decrypted = this.encryptionService.decrypt(integration.credential.encryptedData);
      try {
        const credObj = JSON.parse(decrypted);
        const key = credObj.apiKey || credObj.bearerToken || credObj.jwtToken || '';
        credentialMasked = this.encryptionService.maskCredential(key);
      } catch {
        credentialMasked = '***';
      }
    }

    return {
      id: integration.id,
      organizationId: integration.organizationId,
      applicationId: integration.applicationId,
      applicationName: integration.application?.name || 'Application',
      connectorId: integration.connectorId,
      name: integration.name,
      type: integration.type,
      category: integration.connector?.category || 'Custom',
      targetSystem: integration.connector?.targetSystem || 'External System',
      targetTech: integration.connector?.targetTech || 'REST',
      baseUrl: integration.baseUrl,
      authType: integration.authType,
      status: integration.status.toLowerCase(),
      credentialMasked,
      hasCredentials: !!integration.credential,
      configuration: integration.configuration || {},
      lastTestedAt: integration.lastTestedAt ? integration.lastTestedAt.toISOString() : null,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString(),
    };
  }

  private sanitizePayload(data: any): string {
    if (!data) return '';
    let str = typeof data === 'string' ? data : JSON.stringify(data);
    // Sanitize any sensitive key matches in string
    str = str.replace(/"(apiKey|password|secret|token|bearerToken)":\s*"[^"]+"/gi, '"$1": "***MASKED***"');
    if (str.length > 1000) {
      str = str.substring(0, 1000) + '...[truncated]';
    }
    return str;
  }
}
