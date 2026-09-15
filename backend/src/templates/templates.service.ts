import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const INITIAL_TEMPLATES = [
  {
    id: 'template-vms-01',
    name: 'Visitor Management',
    industry: 'Corporate & Facilities',
    category: 'Services',
    description: 'Complete visitor check-in, host notification, badge printing, and appointment scheduling system.',
    popularity: 98,
    iconName: 'UserCheck',
    featured: true,
    modules: [
      { id: 'vms-visitor-registration', name: 'Visitor Registration', description: 'Register and manage visitor information, personal details, and visit purposes.', category: 'Visitor Management', icon: 'UserPlus', required: true, recommended: true, enabledByDefault: true, order: 1 },
      { id: 'vms-visitor-profiles', name: 'Visitor Profiles', description: 'Centralized directory of visitor contact histories and photos.', category: 'Visitor Management', icon: 'UserCheck', recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-registration'], order: 2 },
      { id: 'vms-visitor-history', name: 'Visitor History', description: 'Complete audit log of past visits and timestamps.', category: 'Visitor Management', icon: 'History', recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-registration'], order: 3 },
      { id: 'vms-appointment-booking', name: 'Appointment Booking', description: 'Pre-schedule visits with automated calendar invites.', category: 'Appointments', icon: 'CalendarPlus', recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-registration'], order: 4 },
      { id: 'vms-visitor-checkin', name: 'Visitor Check-in', description: 'Self-service iPad kiosk check-in flow.', category: 'Check-in / Check-out', icon: 'LogIn', required: true, recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-registration'], order: 5 },
      { id: 'vms-visitor-checkout', name: 'Visitor Check-out', description: 'One-tap check-out kiosk to timestamp exit.', category: 'Check-in / Check-out', icon: 'LogOut', required: true, recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-checkin'], order: 6 },
      { id: 'vms-qr-checkin', name: 'QR Check-in', description: 'Touchless check-in by scanning pre-emailed QR pass.', category: 'Check-in / Check-out', icon: 'QrCode', recommended: true, enabledByDefault: true, dependencies: ['vms-visitor-checkin'], order: 7 },
      { id: 'vms-host-directory', name: 'Host Directory', description: 'Employee directory integration.', category: 'Host Management', icon: 'Users', recommended: true, enabledByDefault: true, order: 8 },
      { id: 'vms-host-notifications', name: 'Host Notifications', description: 'Instant SMS, WhatsApp, Email, Slack notifications.', category: 'Host Management', icon: 'BellRing', recommended: true, enabledByDefault: true, dependencies: ['vms-host-directory'], order: 9 },
      { id: 'vms-qr-badges', name: 'QR Badges', description: 'Dynamic digital QR badges sent to visitor phone wallet.', category: 'Badges & Access', icon: 'BadgeCheck', recommended: true, enabledByDefault: true, order: 10 },
      { id: 'vms-badge-printing', name: 'Visitor Badge Printing', description: 'Auto-print physical adhesive name badges.', category: 'Badges & Access', icon: 'Printer', recommended: true, enabledByDefault: true, dependencies: ['vms-qr-badges'], order: 11 },
      { id: 'vms-security-alerts', name: 'Security Alerts', description: 'Instant notification to security desk for VIP or flagged visitors.', category: 'Security', icon: 'AlertTriangle', recommended: true, enabledByDefault: true, order: 12 },
      { id: 'vms-visitor-reports', name: 'Visitor Reports', description: 'Analytics dashboards on peak visit hours and volume.', category: 'Reports', icon: 'BarChart3', recommended: true, enabledByDefault: true, order: 13 },
    ],
  },
  {
    id: 'template-content-os-02',
    name: 'Content OS',
    industry: 'Media & Publishing',
    category: 'Business',
    description: 'Digital asset management, editorial workflow, multi-channel content publishing, and analytics platform.',
    popularity: 92,
    iconName: 'FileText',
    featured: true,
    modules: [
      { id: 'cos-pages', name: 'Pages', description: 'Static pages and landing page builder.', category: 'Content', icon: 'FileText', required: true, recommended: true, order: 1 },
      { id: 'cos-posts', name: 'Posts', description: 'Blog and article publishing engine.', category: 'Content', icon: 'Edit3', recommended: true, order: 2 },
      { id: 'cos-media', name: 'Media Library', description: 'Digital asset management vault.', category: 'Media', icon: 'Image', required: true, recommended: true, order: 3 },
      { id: 'cos-publishing', name: 'Publishing Workflow', description: 'Multi-stage draft approval workflow.', category: 'Publishing', icon: 'Send', recommended: true, order: 4 },
      { id: 'cos-seo', name: 'SEO Settings', description: 'Automated meta tags and sitemap generation.', category: 'SEO', icon: 'Search', recommended: true, order: 5 },
      { id: 'cos-analytics', name: 'Content Analytics', description: 'Pageviews, read time, and reader engagement metrics.', category: 'Analytics', icon: 'BarChart2', recommended: true, order: 6 },
    ],
  },
  {
    id: 'template-crm-03',
    name: 'CRM Portal',
    industry: 'Sales & Marketing',
    category: 'Commerce',
    description: 'End-to-end customer relationship management, lead pipelines, deal tracking, and automated communication.',
    popularity: 95,
    iconName: 'Users',
    featured: true,
    modules: [
      { id: 'crm-contacts', name: 'Contacts', description: 'Centralized customer and prospect database.', category: 'Customer Management', icon: 'Users', required: true, recommended: true, order: 1 },
      { id: 'crm-companies', name: 'Companies', description: 'Organization accounts and corporate client profiles.', category: 'Customer Management', icon: 'Building', recommended: true, dependencies: ['crm-contacts'], order: 2 },
      { id: 'crm-leads', name: 'Leads', description: 'Lead capture, scoring, and distribution queue.', category: 'Sales', icon: 'Target', required: true, recommended: true, order: 3 },
      { id: 'crm-deals', name: 'Deals & Pipeline', description: 'Kanban deal board with stage probability tracking.', category: 'Sales', icon: 'Kanban', recommended: true, dependencies: ['crm-leads'], order: 4 },
      { id: 'crm-tickets', name: 'Support Tickets', description: 'Customer service inquiry and helpdesk ticket queue.', category: 'Support', icon: 'Ticket', recommended: true, order: 5 },
      { id: 'crm-reports', name: 'Sales Reports', description: 'Revenue forecasting and conversion metrics.', category: 'Reports', icon: 'TrendingUp', recommended: true, order: 6 },
    ],
  },
  {
    id: 'template-hrms-04',
    name: 'HRMS Portal',
    industry: 'Human Capital',
    category: 'Business',
    description: 'Employee onboarding, attendance tracking, leave requests, performance evaluations, and document vault.',
    popularity: 89,
    iconName: 'Briefcase',
    featured: false,
    modules: [
      { id: 'hrms-employees', name: 'Employees', description: 'Employee master file and organization chart.', category: 'Employee Management', icon: 'UserCheck', required: true, recommended: true, order: 1 },
      { id: 'hrms-attendance', name: 'Attendance', description: 'Daily clock-in/out tracking and timecard approvals.', category: 'Attendance', icon: 'Clock', required: true, recommended: true, order: 2 },
      { id: 'hrms-leave', name: 'Leave Requests', description: 'Time-off request submission and manager approval.', category: 'Leave', icon: 'Calendar', recommended: true, dependencies: ['hrms-employees'], order: 3 },
      { id: 'hrms-payroll', name: 'Payroll', description: 'Salary calculations, tax deductions, and payslip generation.', category: 'Payroll', icon: 'CreditCard', recommended: true, dependencies: ['hrms-employees', 'hrms-attendance'], order: 4 },
      { id: 'hrms-documents', name: 'Document Hub', description: 'Secure employee contracts and compliance document storage.', category: 'Employee Services', icon: 'FileCheck', recommended: true, order: 5 },
      { id: 'hrms-reports', name: 'Employee Reports', description: 'Headcount metrics, turnover rates, and attendance summary.', category: 'Reports', icon: 'BarChart3', recommended: true, order: 6 },
    ],
  },
];

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      const dbTemplates = await this.prisma.template.findMany({
        orderBy: { popularity: 'desc' },
      });

      if (dbTemplates.length > 0) {
        return dbTemplates.map((t) => {
          const initial = INITIAL_TEMPLATES.find((i) => i.id === t.id || i.name.toLowerCase() === t.name.toLowerCase());
          return {
            ...t,
            modules: initial ? initial.modules : t.modules,
          };
        });
      }
    } catch (e) {
      console.warn('Fallback to memory templates:', e.message);
    }

    return INITIAL_TEMPLATES;
  }

  async findOne(id: string) {
    try {
      const dbTemplate = await this.prisma.template.findFirst({
        where: { OR: [{ id }, { name: { contains: id, mode: 'insensitive' } }] },
      });

      if (dbTemplate) {
        const initial = INITIAL_TEMPLATES.find((i) => i.id === dbTemplate.id || i.name.toLowerCase() === dbTemplate.name.toLowerCase());
        return {
          ...dbTemplate,
          modules: initial ? initial.modules : dbTemplate.modules,
        };
      }
    } catch (e) {
      console.warn('Fallback to memory template findOne:', e.message);
    }

    const memoryTemplate = INITIAL_TEMPLATES.find(
      (t) => t.id === id || t.name.toLowerCase() === id.toLowerCase() || t.id.includes(id),
    );

    if (!memoryTemplate) {
      throw new NotFoundException(`Template with ID or name '${id}' not found.`);
    }

    return memoryTemplate;
  }

  async getTemplateModules(id: string) {
    const template = await this.findOne(id);
    return template.modules || [];
  }
}

