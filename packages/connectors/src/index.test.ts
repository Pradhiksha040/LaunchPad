import { ConnectorRegistry } from './index';
import { ConnectorType, OperatingMode, IndustryType, TenantConfig } from '@launchpad/shared';

describe('Connector Framework Tests', () => {
  const mockTenantConfig: TenantConfig = {
    tenantId: 'tenant_apollo_hospital',
    organizationName: 'Apollo Hospital Enterprise',
    domain: 'apollo.launchpad.io',
    mode: OperatingMode.INTEGRATION_HUB,
    industry: IndustryType.HEALTHCARE,
    connectorType: ConnectorType.SAP,
    connectorEndpoint: 'https://sap.apollohospital.org/sap/bc/odata/sap/ZLAUNCHPAD_SRV',
    connectorCredentials: { client: '100', user: 'LAUNCHPAD_SERVICE' },
    fieldMappings: {
      Customer: {
        firstName: 'NAME_FIRST',
        lastName: 'NAME_LAST',
        email: 'SMTP_ADDR',
      },
    },
  };

  it('should resolve SAPConnector dynamically from ConnectorRegistry based on TenantConfig', () => {
    const connector = ConnectorRegistry.getConnector(mockTenantConfig.connectorType);
    expect(connector).toBeDefined();
    expect(connector.connectorType).toBe(ConnectorType.SAP);
  });

  it('should authenticate SAP connector successfully', async () => {
    const connector = ConnectorRegistry.getConnector(mockTenantConfig.connectorType);
    const isAuthenticated = await connector.authenticate(mockTenantConfig);
    expect(isAuthenticated).toBe(true);
  });

  it('should retrieve SAP customers and apply canonical transformation', async () => {
    const connector = ConnectorRegistry.getConnector(mockTenantConfig.connectorType);
    const customers = await connector.getCustomers(mockTenantConfig);
    expect(customers).toHaveLength(1);
    expect(customers[0].companyName).toContain('Apollo Hospitals');
  });

  it('should execute custom BAPI integration action', async () => {
    const connector = ConnectorRegistry.getConnector(mockTenantConfig.connectorType);
    const result = await connector.executeCustomAction(mockTenantConfig, 'BAPI_PATIENT_CREATE', { patientId: 'P1002' });
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(result.connectorUsed).toBe(ConnectorType.SAP);
  });
});
