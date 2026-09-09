import { Injectable } from '@nestjs/common';
import {
  AISetupWizardRequest,
  AISetupWizardResponse,
  ConnectorType,
  OperatingMode,
  IndustryType,
} from '@launchpad/shared';

@Injectable()
export class AIWizardService {
  async processSetupWizard(request: AISetupWizardRequest): Promise<AISetupWizardResponse> {
    let recommendedConnector = ConnectorType.GENERIC_REST;

    if (request.operatingMode === OperatingMode.STANDALONE) {
      recommendedConnector = ConnectorType.GENERIC_REST;
    } else {
      switch (request.existingSystem) {
        case 'SAP':
          recommendedConnector = ConnectorType.SAP;
          break;
        case 'Oracle':
          recommendedConnector = ConnectorType.ORACLE;
          break;
        case 'Salesforce':
          recommendedConnector = ConnectorType.SALESFORCE;
          break;
        case 'Dynamics':
          recommendedConnector = ConnectorType.MICROSOFT_DYNAMICS;
          break;
        case 'GraphQL':
          recommendedConnector = ConnectorType.GRAPHQL;
          break;
        default:
          recommendedConnector = ConnectorType.GENERIC_REST;
      }
    }

    // Generate smart field mappings based on industry & system
    const fieldMappings: Record<string, Record<string, string>> = {
      Customer:
        request.existingSystem === 'SAP'
          ? { firstName: 'NAME_FIRST', lastName: 'NAME_LAST', email: 'SMTP_ADDR', taxId: 'STCD1' }
          : request.existingSystem === 'Salesforce'
          ? { firstName: 'FirstName', lastName: 'LastName', email: 'PersonEmail', companyName: 'Company' }
          : { firstName: 'first_name', lastName: 'last_name', email: 'email_address' },
      Order:
        request.existingSystem === 'SAP'
          ? { orderNumber: 'VBELN', customerId: 'KUNNR', totalAmount: 'NETWR', currency: 'WAERK' }
          : { orderNumber: 'order_no', customerId: 'customer_id', totalAmount: 'amount' },
    };

    const suggestedModules = [
      'Authentication & RBAC',
      'Organization & Team Hierarchy',
      'Integration Hub Engine',
      'Secrets Management',
    ];

    if (request.industry === IndustryType.HEALTHCARE) {
      suggestedModules.push('Patient Appointment Scheduler', 'Electronic Health Records (EHR) Sync');
    } else if (request.industry === IndustryType.E_COMMERCE || request.industry === IndustryType.FOOD_DELIVERY) {
      suggestedModules.push('Product Catalog Manager', 'Order & Inventory Manager', 'Payment Gateway Integration');
    } else if (request.industry === IndustryType.HRMS) {
      suggestedModules.push('Employee Portal', 'Leave & Payroll Sync');
    }

    return {
      recommendedConnector,
      generatedFieldMappings: fieldMappings,
      suggestedModules,
      readyConfig: {
        tenantId: `tenant_${request.organizationName.toLowerCase().replace(/\s+/g, '_')}`,
        organizationName: request.organizationName,
        domain: `${request.organizationName.toLowerCase().replace(/\s+/g, '')}.launchpad.io`,
        mode: request.operatingMode,
        industry: request.industry,
        connectorType: recommendedConnector,
        connectorEndpoint: request.apiEndpoint || 'https://api.enterprise.com/v1',
        fieldMappings,
      },
      explanation: `LaunchPad AI Assistant configured ${request.organizationName} in ${request.operatingMode} using ${recommendedConnector}. Field mappings and 4 domain modules auto-installed.`,
    };
  }
}
