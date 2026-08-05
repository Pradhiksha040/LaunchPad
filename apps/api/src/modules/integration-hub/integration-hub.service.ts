import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectorRegistry } from '@launchpad/connectors';
import {
  TenantConfig,
  OperatingMode,
  ConnectorType,
  IndustryType,
  Customer,
  Order,
  Appointment,
  Invoice,
  IntegrationResult,
} from '@launchpad/shared';

@Injectable()
export class IntegrationHubService {
  constructor(private prisma: PrismaService) {}

  async resolveTenantConfig(tenantId: string): Promise<TenantConfig> {
    const org = await this.prisma.organization.findFirst({
      where: { OR: [{ id: tenantId }, { domain: tenantId }] },
      include: { tenantConfig: true },
    });

    if (!org) {
      // Fallback default config for standalone/demo execution
      return {
        tenantId: tenantId || 'demo_tenant',
        organizationName: 'Demo Organization',
        domain: 'demo.launchpad.io',
        mode: OperatingMode.STANDALONE,
        industry: 'CRM' as any,
        connectorType: ConnectorType.GENERIC_REST,
      };
    }

    const config = org.tenantConfig;
    return {
      tenantId: org.id,
      organizationName: org.name,
      domain: org.domain,
      mode: (config?.mode as unknown as OperatingMode) || OperatingMode.STANDALONE,
      industry: org.industry as unknown as IndustryType,
      connectorType: (config?.connectorType as unknown as ConnectorType) || ConnectorType.GENERIC_REST,
      connectorEndpoint: config?.connectorEndpoint || undefined,
      connectorCredentials: (config?.connectorCredentials as Record<string, string>) || undefined,
      fieldMappings: (config?.fieldMappings as Record<string, Record<string, string>>) || undefined,
    };
  }

  async getCustomers(tenantId: string): Promise<Customer[]> {
    const config = await this.resolveTenantConfig(tenantId);
    if (config.mode === OperatingMode.STANDALONE) {
      const records = await this.prisma.customer.findMany({ where: { organizationId: config.tenantId } });
      return records.map((r) => ({
        id: r.id,
        tenantId: r.organizationId,
        externalId: r.externalId || undefined,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone || undefined,
        companyName: r.companyName || undefined,
        taxId: r.taxId || undefined,
        status: r.status as any,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }

    const connector = ConnectorRegistry.getConnector(config.connectorType);
    return connector.getCustomers(config);
  }

  async createCustomer(tenantId: string, customerData: Partial<Customer>): Promise<Customer> {
    const config = await this.resolveTenantConfig(tenantId);
    if (config.mode === OperatingMode.STANDALONE) {
      const created = await this.prisma.customer.create({
        data: {
          organizationId: config.tenantId,
          firstName: customerData.firstName || 'First',
          lastName: customerData.lastName || 'Last',
          email: customerData.email || 'customer@launchpad.io',
          phone: customerData.phone,
          companyName: customerData.companyName,
          taxId: customerData.taxId,
          status: customerData.status || 'ACTIVE',
        },
      });
      return {
        id: created.id,
        tenantId: created.organizationId,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        status: created.status as any,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }

    const connector = ConnectorRegistry.getConnector(config.connectorType);
    return connector.createCustomer(config, customerData);
  }

  async getOrders(tenantId: string): Promise<Order[]> {
    const config = await this.resolveTenantConfig(tenantId);
    if (config.mode === OperatingMode.STANDALONE) {
      const orders = await this.prisma.order.findMany({ where: { organizationId: config.tenantId } });
      return orders.map((o) => ({
        id: o.id,
        tenantId: o.organizationId,
        externalId: o.externalId || undefined,
        orderNumber: o.orderNumber,
        customerId: o.customerId,
        customerName: o.customerName,
        status: o.status as any,
        totalAmount: o.totalAmount,
        currency: o.currency,
        items: [],
        paymentStatus: 'PAID',
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));
    }

    const connector = ConnectorRegistry.getConnector(config.connectorType);
    return connector.getOrders(config);
  }

  async createOrder(tenantId: string, orderData: Partial<Order>): Promise<Order> {
    const config = await this.resolveTenantConfig(tenantId);
    if (config.mode === OperatingMode.STANDALONE) {
      const created = await this.prisma.order.create({
        data: {
          organizationId: config.tenantId,
          orderNumber: orderData.orderNumber || `ORD-${Date.now()}`,
          customerId: orderData.customerId || 'c_1',
          customerName: orderData.customerName || 'Customer',
          status: orderData.status || 'PENDING',
          totalAmount: orderData.totalAmount || 0,
          currency: orderData.currency || 'USD',
        },
      });
      return {
        id: created.id,
        tenantId: created.organizationId,
        orderNumber: created.orderNumber,
        customerId: created.customerId,
        customerName: created.customerName,
        status: created.status as any,
        totalAmount: created.totalAmount,
        currency: created.currency,
        items: [],
        paymentStatus: 'PAID',
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      };
    }

    const connector = ConnectorRegistry.getConnector(config.connectorType);
    return connector.createOrder(config, orderData);
  }

  async executeCustomAction(tenantId: string, actionName: string, payload: unknown): Promise<IntegrationResult> {
    const config = await this.resolveTenantConfig(tenantId);
    const connector = ConnectorRegistry.getConnector(config.connectorType);
    return connector.executeCustomAction(config, actionName, payload);
  }
}
