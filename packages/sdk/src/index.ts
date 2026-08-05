/**
 * LaunchPad OS Client SDK
 */

import { Customer, Order, Appointment, Invoice, IntegrationResult, OperatingMode } from '@launchpad/shared';

export interface LaunchPadSDKOptions {
  baseUrl: string;
  tenantId: string;
  apiKey?: string;
  authToken?: string;
}

export class LaunchPadClient {
  private readonly baseUrl: string;
  private readonly tenantId: string;
  private readonly apiKey?: string;
  private authToken?: string;

  constructor(options: LaunchPadSDKOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.tenantId = options.tenantId;
    this.apiKey = options.apiKey;
    this.authToken = options.authToken;
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Tenant-ID': this.tenantId,
    };
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  // Auth Operations
  public async login(email: string, password: string): Promise<{ accessToken: string; mode: OperatingMode }> {
    const res = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, tenantId: this.tenantId }),
    });
    const data = await res.json();
    if (data.accessToken) {
      this.setAuthToken(data.accessToken);
    }
    return data;
  }

  // Canonical Resource APIs
  public async getCustomers(): Promise<Customer[]> {
    const res = await fetch(`${this.baseUrl}/canonical/customers`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  public async createCustomer(customer: Partial<Customer>): Promise<Customer> {
    const res = await fetch(`${this.baseUrl}/canonical/customers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(customer),
    });
    return res.json();
  }

  public async getOrders(): Promise<Order[]> {
    const res = await fetch(`${this.baseUrl}/canonical/orders`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  public async createOrder(order: Partial<Order>): Promise<Order> {
    const res = await fetch(`${this.baseUrl}/canonical/orders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(order),
    });
    return res.json();
  }

  public async getInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${this.baseUrl}/canonical/invoices`, {
      headers: this.getHeaders(),
    });
    return res.json();
  }

  public async createAppointment(appointment: Partial<Appointment>): Promise<Appointment> {
    const res = await fetch(`${this.baseUrl}/canonical/appointments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(appointment),
    });
    return res.json();
  }

  // Integration Hub Direct Execution
  public async executeIntegrationAction(actionName: string, payload: unknown): Promise<IntegrationResult> {
    const res = await fetch(`${this.baseUrl}/integration-hub/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ actionName, payload }),
    });
    return res.json();
  }
}
