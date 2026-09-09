/**
 * LaunchPad OS - Shared Canonical Data Models & Core Interfaces
 */

// ==========================================
// OPERATING MODES & SYSTEM ENUMS
// ==========================================

export enum OperatingMode {
  STANDALONE = 'STANDALONE',
  INTEGRATION_HUB = 'INTEGRATION_HUB',
}

export enum ConnectorType {
  GENERIC_REST = 'GENERIC_REST',
  GRAPHQL = 'GRAPHQL',
  SOAP = 'SOAP',
  SAP = 'SAP',
  ORACLE = 'ORACLE',
  SALESFORCE = 'SALESFORCE',
  MICROSOFT_DYNAMICS = 'MICROSOFT_DYNAMICS',
  CUSTOM = 'CUSTOM',
}

export enum IndustryType {
  HEALTHCARE = 'HEALTHCARE',
  EDUCATION = 'EDUCATION',
  FOOD_DELIVERY = 'FOOD_DELIVERY',
  CRM = 'CRM',
  HRMS = 'HRMS',
  E_COMMERCE = 'E_COMMERCE',
  RENTAL = 'RENTAL',
  MARKETPLACE = 'MARKETPLACE',
  REAL_ESTATE = 'REAL_ESTATE',
  FREELANCER = 'FREELANCER',
  LOGISTICS = 'LOGISTICS',
  BOOKING = 'BOOKING',
}

export enum UserRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  GUEST = 'GUEST',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

// ==========================================
// CANONICAL DATA MODELS
// ==========================================

export interface CanonicalBaseEntity {
  id: string;
  tenantId: string;
  externalId?: string; // Mapped ID in SAP / Salesforce / Legacy system
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface Customer extends CanonicalBaseEntity {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  taxId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface Product extends CanonicalBaseEntity {
  sku: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  category?: string;
  stockQuantity: number;
  isAvailable: boolean;
  attributes?: Record<string, string | number | boolean>;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order extends CanonicalBaseEntity {
  orderNumber: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  paymentStatus: 'UNPAID' | 'PAID' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
  shippingAddress?: string;
}

export interface Appointment extends CanonicalBaseEntity {
  appointmentNumber: string;
  patientIdOrCustomerId: string;
  patientOrCustomerName: string;
  providerIdOrDoctorId: string;
  providerOrDoctorName: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  locationOrUrl?: string;
  department?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Invoice extends CanonicalBaseEntity {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  items: InvoiceItem[];
}

export interface Employee extends CanonicalBaseEntity {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  joiningDate: string;
  salary?: number;
  currency?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
}

export interface Student extends CanonicalBaseEntity {
  rollNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  gradeOrClass: string;
  section?: string;
  guardianName?: string;
  guardianPhone?: string;
  enrollmentDate: string;
  status: 'ENROLLED' | 'GRADUATED' | 'SUSPENDED';
}

export interface Vendor extends CanonicalBaseEntity {
  vendorCode: string;
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  category: string;
  rating?: number;
  paymentTerms?: string;
}

export interface Supplier extends CanonicalBaseEntity {
  supplierCode: string;
  name: string;
  email: string;
  phone?: string;
  suppliedCategories: string[];
  contractStartDate?: string;
  contractEndDate?: string;
}

// ==========================================
// TENANT CONFIG & INTEGRATION HUB SPEC
// ==========================================

export interface TenantConfig {
  tenantId: string;
  organizationName: string;
  domain: string;
  mode: OperatingMode;
  industry: IndustryType;
  connectorType: ConnectorType;
  connectorEndpoint?: string;
  connectorCredentials?: Record<string, string>;
  headerTransformations?: Record<string, string>;
  fieldMappings?: Record<string, Record<string, string>>; // Canonical Field -> Enterprise Field
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  customHeaders?: Record<string, string>;
}

export interface TransformationRule {
  sourceField: string;
  targetField: string;
  transformer?: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'UPPERCASE' | 'LOWERCASE' | 'CUSTOM';
}

export interface IntegrationPayload<T = unknown> {
  tenantId: string;
  action: string;
  canonicalEntity: string;
  payload: T;
  traceId: string;
}

export interface IntegrationResult<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  durationMs: number;
  connectorUsed: ConnectorType;
  traceId: string;
}

// ==========================================
// AI SETUP WIZARD PAYLOAD
// ==========================================

export interface AISetupWizardRequest {
  organizationName: string;
  industry: IndustryType;
  operatingMode: OperatingMode;
  existingSystem?: 'SAP' | 'Oracle' | 'Salesforce' | 'Dynamics' | 'REST' | 'GraphQL' | 'None';
  apiEndpoint?: string;
  samplePayload?: Record<string, unknown>;
}

export interface AISetupWizardResponse {
  recommendedConnector: ConnectorType;
  generatedFieldMappings: Record<string, Record<string, string>>;
  suggestedModules: string[];
  readyConfig: TenantConfig;
  explanation: string;
}
