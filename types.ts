
export type Page = 'Dashboard' | 'Tenants' | 'AddTenant' | 'Subscriptions' | 'Reports' | 'Communication' | 'Settings' | 'PaymentGateways';

export enum TenantStatus {
  Active = 'Active',
  Trial = 'Trial',
  Expired = 'Expired',
  Deactivated = 'Deactivated'
}

export interface Tenant {
  id: number;
  companyName: string;
  subdomain: string;
  currentPlan: string;
  status: TenantStatus;
  startDate: string;
  endDate: string;
  users: string;
}

export interface Plan {
    id: number;
    name: string;
    type: 'Trial' | 'Paid' | 'Free';
    priceMonthly: number;
    priceYearly: number;
    trialDays: number;
    users: number | 'unlimited';
    clients: number | 'unlimited';
    storage: number; // In GB
    features: string; // Use a single string for textarea, lines separated by newline
    visible: boolean;
}

export enum PaymentStatus {
    Successful = 'Successful',
    Failed = 'Failed'
}

export interface Payment {
    id: string;
    companyName: string;
    amount: number;
    plan: string;
    status: PaymentStatus;
    date: string;
}

export enum InvoiceStatus {
    Paid = 'Paid',
    Due = 'Due',
    Overdue = 'Overdue'
}

export interface Invoice {
    id: string;
    companyName: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
}

export interface Broadcast {
    id: number;
    subject: string;
    target: string;
    date: string;
    status: 'Sent' | 'Scheduled';
    content: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
}

export interface AuditLog {
    id: number;
    user: string;
    action: { key: string; params: Record<string, string | number> };
    timestamp: string;
}

export interface BackupLog {
    id: string;
    date: Date;
    status: 'Completed' | 'Failed';
    initiator: 'Manual' | 'Scheduled';
}

export enum PaymentGatewayStatus {
  Active = 'Active',
  Disabled = 'Disabled',
  SetupRequired = 'SetupRequired'
}

export interface PaymentGateway {
  id: string;
  name: string;
  description: string;
  status: PaymentGatewayStatus;
  enabled: boolean;
  config: {
    publishableKey?: string;
    secretKey?: string;
    environment?: 'test' | 'live';
  };
}