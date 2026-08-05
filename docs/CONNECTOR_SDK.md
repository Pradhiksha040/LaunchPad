# 🧰 Connector SDK & Developer Guide

The **Connector Framework** allows developers to add support for any legacy backend system by implementing the standard `BaseConnector` interface.

---

## 🛠️ Implementing a Custom Connector

Every connector must extend `BaseConnector` from `@launchpad/connectors`:

```typescript
import { BaseConnector } from '@launchpad/connectors';
import { ConnectorType, TenantConfig, Customer, Order, IntegrationResult } from '@launchpad/shared';

export class CustomERPConnector extends BaseConnector {
  readonly connectorType = ConnectorType.CUSTOM;

  async authenticate(config: TenantConfig): Promise<boolean> {
    // Custom OAuth2 or API Key validation
    return true;
  }

  async getCustomers(config: TenantConfig): Promise<Customer[]> {
    // 1. Fetch raw data from custom ERP endpoint
    const rawData = await fetch(`${config.connectorEndpoint}/customers`);
    
    // 2. Transform raw data into LaunchPad Canonical Customer model
    return rawData.map(item => this.transformToCanonicalSchema<Customer>('Customer', item, config));
  }

  async createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer> {
    // Transform canonical data to enterprise schema
    const payload = this.transformToEnterpriseSchema('Customer', data, config);
    // Post to custom ERP endpoint
    return response;
  }

  async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { actionName, payload },
      durationMs: 30,
      connectorUsed: this.connectorType,
      traceId: `trace_custom_${Date.now()}`
    };
  }
}
```

---

## 🔌 Registering the Custom Connector

Register your connector with `ConnectorRegistry`:

```typescript
import { ConnectorRegistry } from '@launchpad/connectors';

ConnectorRegistry.registerCustomConnector(ConnectorType.CUSTOM, new CustomERPConnector());
```
