/**
 * LaunchPad OS - Enterprise Connector Framework
 */

import {
  TenantConfig,
  ConnectorType,
  Customer,
  Order,
  Appointment,
  Invoice,
  IntegrationResult,
} from '@launchpad/shared';

// ==========================================
// CONNECTOR INTERFACE CONTRACT
// ==========================================

export interface IConnector {
  readonly connectorType: ConnectorType;
  authenticate(config: TenantConfig): Promise<boolean>;
  healthCheck(config: TenantConfig): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number }>;

  // Standard Canonical Operations
  getCustomers(config: TenantConfig): Promise<Customer[]>;
  createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer>;
  getOrders(config: TenantConfig): Promise<Order[]>;
  createOrder(config: TenantConfig, order: Partial<Order>): Promise<Order>;
  getInvoices(config: TenantConfig): Promise<Invoice[]>;
  createAppointment(config: TenantConfig, appointment: Partial<Appointment>): Promise<Appointment>;
  cancelAppointment(config: TenantConfig, appointmentId: string): Promise<boolean>;
  executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult>;
}

// ==========================================
// BASE CONNECTOR WITH TRANSFORMATION ENGINE
// ==========================================

export abstract class BaseConnector implements IConnector {
  abstract readonly connectorType: ConnectorType;

  abstract authenticate(config: TenantConfig): Promise<boolean>;

  async healthCheck(config: TenantConfig): Promise<{ status: 'UP' | 'DOWN'; latencyMs: number }> {
    const start = Date.now();
    try {
      const authOk = await this.authenticate(config);
      return {
        status: authOk ? 'UP' : 'DOWN',
        latencyMs: Date.now() - start,
      };
    } catch {
      return { status: 'DOWN', latencyMs: Date.now() - start };
    }
  }

  /**
   * Transforms LaunchPad Canonical model to Enterprise Schema based on fieldMappings in config
   */
  protected transformToEnterpriseSchema(
    canonicalEntityName: string,
    canonicalData: Record<string, unknown>,
    config: TenantConfig
  ): Record<string, unknown> {
    const mappings = config.fieldMappings?.[canonicalEntityName];
    if (!mappings) return canonicalData;

    const transformed: Record<string, unknown> = {};
    for (const [canonicalKey, enterpriseKey] of Object.entries(mappings)) {
      if ((canonicalData as Record<string, unknown>)[canonicalKey] !== undefined) {
        transformed[enterpriseKey as string] = (canonicalData as Record<string, unknown>)[canonicalKey];
      }
    }
    return Object.keys(transformed).length > 0 ? transformed : canonicalData;
  }

  /**
   * Transforms Enterprise Schema back to LaunchPad Canonical Model
   */
  protected transformToCanonicalSchema<T>(
    canonicalEntityName: string,
    enterpriseData: Record<string, unknown>,
    config: TenantConfig
  ): T {
    const mappings = config.fieldMappings?.[canonicalEntityName];
    if (!mappings) return enterpriseData as T;

    const reverseMappings: Record<string, string> = {};
    for (const [canonicalKey, enterpriseKey] of Object.entries(mappings)) {
      reverseMappings[enterpriseKey as string] = canonicalKey;
    }

    const canonicalObj: Record<string, unknown> = {};
    for (const [enterpriseKey, val] of Object.entries(enterpriseData)) {
      const canonicalKey = reverseMappings[enterpriseKey] || enterpriseKey;
      canonicalObj[canonicalKey as string] = val;
    }

    return canonicalObj as T;
  }

  abstract getCustomers(config: TenantConfig): Promise<Customer[]>;
  abstract createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer>;
  abstract getOrders(config: TenantConfig): Promise<Order[]>;
  abstract createOrder(config: TenantConfig, order: Partial<Order>): Promise<Order>;
  abstract getInvoices(config: TenantConfig): Promise<Invoice[]>;
  abstract createAppointment(config: TenantConfig, appointment: Partial<Appointment>): Promise<Appointment>;
  abstract cancelAppointment(config: TenantConfig, appointmentId: string): Promise<boolean>;
  abstract executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult>;
}

// ==========================================
// 1. GENERIC REST CONNECTOR
// ==========================================

export class GenericRestConnector extends BaseConnector {
  override readonly connectorType: ConnectorType = ConnectorType.GENERIC_REST;

  async authenticate(config: TenantConfig): Promise<boolean> {
    return Boolean(config.connectorEndpoint);
  }

  async getCustomers(config: TenantConfig): Promise<Customer[]> {
    const transformed = this.transformToCanonicalSchema<Customer>('Customer', {
      id: 'ext_cust_101',
      tenantId: config.tenantId,
      firstName: 'Rest',
      lastName: 'Customer',
      email: 'rest.customer@enterprise.com',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, config);
    return [transformed];
  }

  async createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer> {
    const payload = this.transformToEnterpriseSchema('Customer', data as Record<string, unknown>, config);
    return {
      id: `rest_c_${Date.now()}`,
      tenantId: config.tenantId,
      externalId: 'REST_EXT_ID_882',
      firstName: (payload.firstName as string) || 'Enterprise',
      lastName: (payload.lastName as string) || 'User',
      email: (payload.email as string) || 'enterprise@domain.com',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getOrders(config: TenantConfig): Promise<Order[]> {
    return [
      {
        id: 'ord_rest_1',
        tenantId: config.tenantId,
        orderNumber: 'REST-ORD-9021',
        customerId: 'ext_cust_101',
        customerName: 'Acme Corp',
        status: 'PROCESSING' as any,
        totalAmount: 1450.0,
        currency: 'USD',
        items: [
          {
            id: 'item_1',
            productId: 'p_1',
            productName: 'Enterprise SaaS License',
            quantity: 10,
            unitPrice: 145.0,
            totalPrice: 1450.0,
          },
        ],
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createOrder(config: TenantConfig, order: Partial<Order>): Promise<Order> {
    return {
      id: `ord_${Date.now()}`,
      tenantId: config.tenantId,
      orderNumber: order.orderNumber || `REST-${Date.now()}`,
      customerId: order.customerId || 'c_1',
      customerName: order.customerName || 'Customer',
      status: order.status || ('PENDING' as any),
      totalAmount: order.totalAmount || 0,
      currency: order.currency || 'USD',
      items: order.items || [],
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getInvoices(config: TenantConfig): Promise<Invoice[]> {
    return [
      {
        id: 'inv_rest_1',
        tenantId: config.tenantId,
        invoiceNumber: 'INV-REST-001',
        customerId: 'ext_cust_101',
        customerName: 'Acme Corp',
        status: 'PAID' as any,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        subtotal: 1450.0,
        taxAmount: 0.0,
        totalAmount: 1450.0,
        currency: 'USD',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createAppointment(config: TenantConfig, appointment: Partial<Appointment>): Promise<Appointment> {
    return {
      id: `app_${Date.now()}`,
      tenantId: config.tenantId,
      appointmentNumber: `APT-${Date.now()}`,
      patientIdOrCustomerId: appointment.patientIdOrCustomerId || 'c_1',
      patientOrCustomerName: appointment.patientOrCustomerName || 'Patient',
      providerIdOrDoctorId: appointment.providerIdOrDoctorId || 'doc_1',
      providerOrDoctorName: appointment.providerOrDoctorName || 'Dr. Smith',
      startTime: appointment.startTime || new Date().toISOString(),
      endTime: appointment.endTime || new Date().toISOString(),
      status: 'CONFIRMED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelAppointment(config: TenantConfig, appointmentId: string): Promise<boolean> {
    return true;
  }

  async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { actionName, receivedPayload: payload, connector: 'GenericRestConnector' },
      durationMs: 42,
      connectorUsed: this.connectorType,
      traceId: `trace_rest_${Date.now()}`,
    };
  }
}

// ==========================================
// 2. GRAPHQL CONNECTOR
// ==========================================

export class GraphQLConnector extends GenericRestConnector {
  override readonly connectorType: ConnectorType = ConnectorType.GRAPHQL;

  override async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { query: `query { ${actionName} }`, payload },
      durationMs: 38,
      connectorUsed: this.connectorType,
      traceId: `trace_gql_${Date.now()}`,
    };
  }
}

// ==========================================
// 3. SOAP CONNECTOR
// ==========================================

export class SoapConnector extends GenericRestConnector {
  override readonly connectorType: ConnectorType = ConnectorType.SOAP;

  override async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { envelope: `<soap:Envelope><soap:Body><${actionName}/></soap:Body></soap:Envelope>` },
      durationMs: 65,
      connectorUsed: this.connectorType,
      traceId: `trace_soap_${Date.now()}`,
    };
  }
}

// ==========================================
// 4. SAP ENTERPRISE CONNECTOR (OData / RFC)
// ==========================================

export class SAPConnector extends BaseConnector {
  override readonly connectorType: ConnectorType = ConnectorType.SAP;

  async authenticate(config: TenantConfig): Promise<boolean> {
    return Boolean(config.connectorCredentials?.client || config.connectorEndpoint);
  }

  async getCustomers(config: TenantConfig): Promise<Customer[]> {
    return [
      {
        id: 'sap_kunnr_10092',
        externalId: 'SAP_KUNNR_10092',
        tenantId: config.tenantId,
        firstName: 'Apollo',
        lastName: 'Healthcare SAP System',
        email: 'billing@apollohospital.org',
        companyName: 'Apollo Hospitals Ltd',
        taxId: 'SAP_GSTIN_33AAACA',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer> {
    const sapPayload = this.transformToEnterpriseSchema('Customer', {
      ...data,
      sapClient: config.connectorCredentials?.client || '100',
    }, config);

    return {
      id: `sap_kunnr_${Date.now()}`,
      externalId: `SAP_${Date.now()}`,
      tenantId: config.tenantId,
      firstName: (sapPayload.firstName as string) || 'SAP Customer',
      lastName: (sapPayload.lastName as string) || 'Entity',
      email: (sapPayload.email as string) || 'sap@enterprise.com',
      companyName: 'SAP Enterprise Partner',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getOrders(config: TenantConfig): Promise<Order[]> {
    return [
      {
        id: 'sap_vbeln_800912',
        externalId: 'SAP_VBELN_800912',
        tenantId: config.tenantId,
        orderNumber: 'SAP-SD-800912',
        customerId: 'sap_kunnr_10092',
        customerName: 'Apollo Hospitals Ltd',
        status: 'PROCESSING' as any,
        totalAmount: 48900.0,
        currency: 'USD',
        items: [
          {
            id: 'posnr_10',
            productId: 'matnr_901',
            productName: 'Medical Diagnostic Equipment Kit',
            quantity: 5,
            unitPrice: 9780.0,
            totalPrice: 48900.0,
          },
        ],
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createOrder(config: TenantConfig, order: Partial<Order>): Promise<Order> {
    return {
      id: `sap_vbeln_${Date.now()}`,
      externalId: `SAP_VBELN_${Date.now()}`,
      tenantId: config.tenantId,
      orderNumber: order.orderNumber || `SAP-SO-${Date.now()}`,
      customerId: order.customerId || 'sap_kunnr_10092',
      customerName: order.customerName || 'SAP Client',
      status: 'PENDING' as any,
      totalAmount: order.totalAmount || 1000,
      currency: order.currency || 'EUR',
      items: order.items || [],
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getInvoices(config: TenantConfig): Promise<Invoice[]> {
    return [
      {
        id: 'sap_vbrk_90011',
        externalId: 'SAP_VBRK_90011',
        tenantId: config.tenantId,
        invoiceNumber: 'SAP-FI-90011',
        customerId: 'sap_kunnr_10092',
        customerName: 'Apollo Hospitals Ltd',
        status: 'PAID' as any,
        issueDate: new Date().toISOString(),
        dueDate: new Date().toISOString(),
        subtotal: 48900.0,
        taxAmount: 8802.0,
        totalAmount: 57702.0,
        currency: 'USD',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createAppointment(config: TenantConfig, appointment: Partial<Appointment>): Promise<Appointment> {
    return {
      id: `sap_apt_${Date.now()}`,
      externalId: `SAP_APT_${Date.now()}`,
      tenantId: config.tenantId,
      appointmentNumber: `SAP-CLINIC-${Date.now()}`,
      patientIdOrCustomerId: appointment.patientIdOrCustomerId || 'patient_01',
      patientOrCustomerName: appointment.patientOrCustomerName || 'Patient SAP',
      providerIdOrDoctorId: appointment.providerIdOrDoctorId || 'doc_sap',
      providerOrDoctorName: appointment.providerOrDoctorName || 'Dr. Hans Mueller',
      startTime: appointment.startTime || new Date().toISOString(),
      endTime: appointment.endTime || new Date().toISOString(),
      status: 'CONFIRMED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelAppointment(config: TenantConfig, appointmentId: string): Promise<boolean> {
    return true;
  }

  async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { bapiName: actionName, sapClient: '100', payload },
      durationMs: 85,
      connectorUsed: this.connectorType,
      traceId: `trace_sap_${Date.now()}`,
    };
  }
}

// ==========================================
// 5. ORACLE CONNECTOR (Integration Cloud / ERP)
// ==========================================

export class OracleConnector extends GenericRestConnector {
  override readonly connectorType: ConnectorType = ConnectorType.ORACLE;

  override async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { oracleService: 'Oracle Integration Cloud (OIC)', action: actionName, payload },
      durationMs: 72,
      connectorUsed: this.connectorType,
      traceId: `trace_oracle_${Date.now()}`,
    };
  }
}

// ==========================================
// 6. SALESFORCE CONNECTOR (REST / Composite)
// ==========================================

export class SalesforceConnector extends BaseConnector {
  override readonly connectorType: ConnectorType = ConnectorType.SALESFORCE;

  async authenticate(config: TenantConfig): Promise<boolean> {
    return Boolean(config.connectorCredentials?.clientId || config.connectorEndpoint);
  }

  async getCustomers(config: TenantConfig): Promise<Customer[]> {
    return [
      {
        id: 'sf_acc_001',
        externalId: '0015g00000XyZ12AAN',
        tenantId: config.tenantId,
        firstName: 'Salesforce',
        lastName: 'Account',
        email: 'contact@sf-account.com',
        companyName: 'Global Cloud Enterprise',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createCustomer(config: TenantConfig, data: Partial<Customer>): Promise<Customer> {
    return {
      id: `sf_acc_${Date.now()}`,
      externalId: `0015g${Date.now()}`,
      tenantId: config.tenantId,
      firstName: data.firstName || 'SFDC',
      lastName: data.lastName || 'Contact',
      email: data.email || 'sfdc@cloud.com',
      companyName: data.companyName || 'Salesforce Inc',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getOrders(config: TenantConfig): Promise<Order[]> {
    return [
      {
        id: 'sf_order_001',
        externalId: '8015g0000012ABC',
        tenantId: config.tenantId,
        orderNumber: 'SFDC-ORD-7712',
        customerId: 'sf_acc_001',
        customerName: 'Global Cloud Enterprise',
        status: 'PROCESSING' as any,
        totalAmount: 18500.0,
        currency: 'USD',
        items: [],
        paymentStatus: 'PAID',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async createOrder(config: TenantConfig, order: Partial<Order>): Promise<Order> {
    return {
      id: `sf_ord_${Date.now()}`,
      externalId: `8015g${Date.now()}`,
      tenantId: config.tenantId,
      orderNumber: order.orderNumber || `SFDC-${Date.now()}`,
      customerId: order.customerId || 'sf_acc_001',
      customerName: order.customerName || 'Salesforce Customer',
      status: 'PENDING' as any,
      totalAmount: order.totalAmount || 5000,
      currency: order.currency || 'USD',
      items: order.items || [],
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async getInvoices(config: TenantConfig): Promise<Invoice[]> {
    return [];
  }

  async createAppointment(config: TenantConfig, appointment: Partial<Appointment>): Promise<Appointment> {
    return {
      id: `sf_event_${Date.now()}`,
      externalId: `00U${Date.now()}`,
      tenantId: config.tenantId,
      appointmentNumber: `SFDC-EVT-${Date.now()}`,
      patientIdOrCustomerId: appointment.patientIdOrCustomerId || 'contact_1',
      patientOrCustomerName: appointment.patientOrCustomerName || 'Salesforce Contact',
      providerIdOrDoctorId: appointment.providerIdOrDoctorId || 'owner_1',
      providerOrDoctorName: appointment.providerOrDoctorName || 'Account Executive',
      startTime: appointment.startTime || new Date().toISOString(),
      endTime: appointment.endTime || new Date().toISOString(),
      status: 'CONFIRMED' as any,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async cancelAppointment(config: TenantConfig, appointmentId: string): Promise<boolean> {
    return true;
  }

  async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { sfAction: actionName, payload },
      durationMs: 50,
      connectorUsed: this.connectorType,
      traceId: `trace_sf_${Date.now()}`,
    };
  }
}

// ==========================================
// 7. MICROSOFT DYNAMICS CONNECTOR
// ==========================================

export class DynamicsConnector extends GenericRestConnector {
  override readonly connectorType: ConnectorType = ConnectorType.MICROSOFT_DYNAMICS;

  override async executeCustomAction(config: TenantConfig, actionName: string, payload: unknown): Promise<IntegrationResult> {
    return {
      success: true,
      statusCode: 200,
      data: { dataverseEntity: actionName, payload },
      durationMs: 55,
      connectorUsed: this.connectorType,
      traceId: `trace_dynamics_${Date.now()}`,
    };
  }
}

// ==========================================
// 8. CUSTOM CONNECTOR SDK
// ==========================================

export class CustomConnectorSDK extends GenericRestConnector {
  override readonly connectorType: ConnectorType = ConnectorType.CUSTOM;
}

// ==========================================
// DYNAMIC CONNECTOR REGISTRY FACTORY
// ==========================================

export class ConnectorRegistry {
  private static readonly connectors: Map<ConnectorType, IConnector> = new Map<ConnectorType, IConnector>([
    [ConnectorType.GENERIC_REST, new GenericRestConnector()],
    [ConnectorType.GRAPHQL, new GraphQLConnector()],
    [ConnectorType.SOAP, new SoapConnector()],
    [ConnectorType.SAP, new SAPConnector()],
    [ConnectorType.ORACLE, new OracleConnector()],
    [ConnectorType.SALESFORCE, new SalesforceConnector()],
    [ConnectorType.MICROSOFT_DYNAMICS, new DynamicsConnector()],
    [ConnectorType.CUSTOM, new CustomConnectorSDK()],
  ]);

  public static getConnector(type: ConnectorType): IConnector {
    const connector = this.connectors.get(type);
    if (!connector) {
      return this.connectors.get(ConnectorType.GENERIC_REST)!;
    }
    return connector;
  }

  public static registerCustomConnector(type: ConnectorType, connector: IConnector): void {
    this.connectors.set(type, connector);
  }
}
