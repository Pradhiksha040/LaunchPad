import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GenericRestConnectorService, ConnectorResponse, ExecuteOptions } from './generic-rest-connector.service';

@Injectable()
export class ConnectorManagerService {
  constructor(
    private prisma: PrismaService,
    private genericRestConnector: GenericRestConnectorService,
  ) {}

  async getConnectors() {
    let connectors = await this.prisma.connector.findMany({
      orderBy: { name: 'asc' },
    });

    if (connectors.length === 0) {
      // Seed initial reusable connectors if empty
      await this.prisma.connector.createMany({
        data: [
          {
            name: 'Generic REST API Connector',
            type: 'REST_GENERIC',
            category: 'Custom',
            description: 'Universal HTTP/REST connector supporting GET, POST, PUT, PATCH, DELETE and API Key/Bearer/JWT auth.',
            targetSystem: 'External Customer API',
            targetTech: 'REST / JSON',
            supportedAuthTypes: ['API_KEY', 'BEARER_TOKEN', 'JWT'],
          },
          {
            name: 'Prajai PHP CRM Connector',
            type: 'CRM_PHP',
            category: 'CRM',
            description: 'Connector for existing PHP/Laravel Customer Relationship Management system.',
            targetSystem: 'Existing PHP CRM',
            targetTech: 'PHP 8.2 / Laravel',
            supportedAuthTypes: ['API_KEY', 'BEARER_TOKEN'],
          },
          {
            name: 'Prajai Python HRMS Connector',
            type: 'HRMS_PYTHON',
            category: 'HRMS',
            description: 'Connector for existing Python/Django Human Resource Management System.',
            targetSystem: 'Existing Python HRMS',
            targetTech: 'Python 3.11 / Django',
            supportedAuthTypes: ['BEARER_TOKEN', 'JWT'],
          },
        ],
      });
      connectors = await this.prisma.connector.findMany({ orderBy: { name: 'asc' } });
    }

    return connectors;
  }

  async executeRequest(options: ExecuteOptions): Promise<ConnectorResponse> {
    return this.genericRestConnector.execute(options);
  }
}
