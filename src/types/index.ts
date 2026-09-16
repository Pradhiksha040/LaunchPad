export type AppMode = 'standalone' | 'integration_hub';

export type AppEnvironment = 'development' | 'staging' | 'production';

export type AppStatus = 'active' | 'deploying' | 'warning' | 'archived';

export interface BrandingConfig {
  logoUrl?: string;
  appName: string;
  primaryColor: string;
  secondaryColor: string;
  font: string;
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  borderRadius: string;
}

export interface AppModuleItem {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  required?: boolean;
  isRequired?: boolean;
  recommended?: boolean;
  enabledByDefault?: boolean;
  isEnabled?: boolean;
  dependencies?: string[];
  availableFor?: string[];
  order?: number;
  configurable?: boolean;
  visibility?: {
    dashboard?: boolean;
    sidebar?: boolean;
    reports?: boolean;
  };
  permissions?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  custom?: boolean;
  isCustom?: boolean;
  configuration?: Record<string, any>;
}

export interface Application {
  id: string;
  slug?: string;
  name: string;
  description: string;
  industry: string;
  type: string;
  mode: AppMode;
  status: AppStatus;
  templateId?: string;
  templateName?: string;
  modules: (string | AppModuleItem)[];
  usersCount: number;
  environment: AppEnvironment;
  branding: BrandingConfig;
  updatedAt: string;
  createdAt: string;
  targetBackend?: {
    systemName: string;
    techStack: string;
    connectorType: string;
    endpointUrl: string;
  };
}

export interface Template {
  id: string;
  name: string;
  industry: string;
  description: string;
  modules: string[];
  popularity: number;
  iconName: string;
  category: 'Healthcare' | 'Education' | 'Business' | 'Commerce' | 'Events' | 'Services' | 'Marketplace';
  featured?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  organization: string;
  role: string;
  status: 'active' | 'disabled' | 'pending';
  lastLogin: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: Record<string, ('read' | 'write' | 'delete' | 'admin')[]>;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  applicationsCount: number;
  usersCount: number;
  plan: 'Starter' | 'Professional' | 'Business' | 'Enterprise';
  status: 'active' | 'suspended';
  domain: string;
  createdAt: string;
}

export interface Connector {
  id: string;
  name: string;
  type: 'crm' | 'hrms' | 'vms' | 'rest_api' | 'webhook' | 'custom';
  category: 'CRM' | 'HRMS' | 'ERP' | 'Healthcare' | 'Education' | 'Payments' | 'Communication' | 'Custom';
  status: 'connected' | 'disconnected' | 'warning' | 'error';
  targetSystem: string;
  targetTech: 'PHP' | 'Python' | 'Java' | 'Node' | 'C#' | 'Ruby' | 'Go';
  authType: 'API Key' | 'Bearer Token' | 'JWT' | 'OAuth 2.0';
  baseUrl: string;
  lastSync: string;
  latencyMs: number;
  successRate: number;
}

export interface IntegrationLog {
  id: string;
  connectorId: string;
  connectorName: string;
  timestamp: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'success' | 'error' | 'warning';
  statusCode: number;
  durationMs: number;
  requestPayload?: string;
  responsePayload?: string;
}

export interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyMasked: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
  rateLimit: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
  details: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  maxApplications: number;
  maxUsers: number;
  maxApiRequests: string;
  maxConnectors: number;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface AnalyticsMetric {
  totalApps: number;
  activeApps: number;
  totalUsers: number;
  totalIntegrations: number;
  activeConnectors: number;
  apiTraffic24h: number;
  apiSuccessRate: number;
  avgLatencyMs: number;
}

export interface WorkflowCondition {
  id?: string;
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'NOT_CONTAINS' | 'GREATER_THAN' | 'LESS_THAN' | 'GREATER_OR_EQUAL' | 'LESS_OR_EQUAL' | 'EXISTS' | 'NOT_EXISTS';
  value?: string;
  logicalOperator?: 'AND' | 'OR';
  order?: number;
}

export interface WorkflowAction {
  id?: string;
  type: 'SEND_NOTIFICATION' | 'CREATE_RECORD' | 'UPDATE_RECORD' | 'CALL_API' | 'WEBHOOK' | 'GENERATE_FILE' | 'CREATE_AUDIT_LOG';
  configuration?: Record<string, any>;
  order?: number;
  enabled?: boolean;
}

export interface Workflow {
  id: string;
  organizationId?: string;
  applicationId: string;
  applicationName?: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  triggerType: 'EVENT' | 'SCHEDULE' | 'WEBHOOK' | 'MANUAL';
  enabled: boolean;
  trigger?: {
    type: string;
    eventName?: string;
    configuration?: Record<string, any>;
  };
  conditions: WorkflowCondition[];
  actions: WorkflowAction[];
  lastExecutionStatus?: string;
  lastExecutionTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecutionStep {
  id: string;
  actionId?: string;
  actionType: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  input?: string;
  output?: string;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName?: string;
  applicationId: string;
  applicationName?: string;
  triggerData?: Record<string, any>;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  error?: string;
  retryCount: number;
  isTest?: boolean;
  steps?: WorkflowExecutionStep[];
}

