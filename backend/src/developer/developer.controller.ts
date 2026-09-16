import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { DeveloperService, CreateApiKeyDto, CreateWebhookDto } from './developer.service';

@ApiTags('Developer Portal & API Management')
@Controller()
export class DeveloperController {
  constructor(private readonly developerService: DeveloperService) {}

  // ==================== API KEYS ====================

  @Get('api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List API Keys for Organization' })
  async listApiKeys(@Req() req: any, @Query('applicationId') applicationId?: string) {
    const orgId = req.user.organizationId;
    return this.developerService.listApiKeys(orgId, applicationId);
  }

  @Post('api-keys')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new API Key with Scopes & Rate Limit' })
  async createApiKey(@Req() req: any, @Body() dto: CreateApiKeyDto) {
    const orgId = req.user.organizationId;
    return this.developerService.createApiKey(orgId, dto);
  }

  @Delete('api-keys/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke an API Key' })
  async revokeApiKey(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user.organizationId;
    return this.developerService.revokeApiKey(id, orgId);
  }

  // ==================== WEBHOOKS ====================

  @Get('webhooks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List Webhook Subscriptions' })
  async listWebhooks(@Req() req: any, @Query('applicationId') applicationId?: string) {
    const orgId = req.user.organizationId;
    return this.developerService.listWebhooks(orgId, applicationId);
  }

  @Post('webhooks')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Webhook Subscription' })
  async createWebhook(@Req() req: any, @Body() dto: CreateWebhookDto) {
    const orgId = req.user.organizationId;
    return this.developerService.createWebhook(orgId, dto);
  }

  @Delete('webhooks/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete Webhook Subscription' })
  async deleteWebhook(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user.organizationId;
    return this.developerService.deleteWebhook(id, orgId);
  }

  @Post('webhooks/:id/test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test Webhook Dispatch' })
  async testWebhook(@Req() req: any, @Param('id') id: string) {
    const orgId = req.user.organizationId;
    return this.developerService.testWebhook(id, orgId);
  }

  // ==================== DEVELOPER SPECS & CATALOG ====================

  @Get('developer/endpoints')
  @ApiOperation({ summary: 'Get Catalog of Public Endpoints & Scopes' })
  async getApiEndpoints() {
    return this.developerService.getApiEndpointsCatalog();
  }

  @Get('developer/docs')
  @ApiOperation({ summary: 'Get OpenAPI Spec JSON' })
  async getOpenApiDocs() {
    return {
      openapi: '3.0.0',
      info: {
        title: 'LaunchPad OS Public Developer API',
        version: '1.0.0',
        description: 'Complete OpenAPI specification for LaunchPad OS endpoints, Integration Hub, and Workflows.',
      },
      servers: [
        { url: 'http://localhost:4000', description: 'Local Development Server' },
      ],
      paths: {
        '/applications': {
          get: {
            summary: 'List Applications',
            description: 'Retrieve all deployed and active applications.',
            security: [{ ApiKeyAuth: [] }],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/integrations': {
          get: {
            summary: 'List Integrations',
            description: 'Retrieve connectors and external backend targets.',
            security: [{ ApiKeyAuth: [] }],
            responses: { '200': { description: 'Success' } },
          },
        },
        '/workflows': {
          get: {
            summary: 'List Workflows',
            description: 'Fetch workflow blueprints and automated action pipelines.',
            security: [{ ApiKeyAuth: [] }],
            responses: { '200': { description: 'Success' } },
          },
        },
      },
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
          },
        },
      },
    };
  }
}
