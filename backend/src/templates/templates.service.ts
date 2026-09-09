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
      { id: 'vms-visitor-registration', name: 'Visitor Registration', category: 'Visitor Management', required: true },
      { id: 'vms-visitor-profiles', name: 'Visitor Profiles', category: 'Visitor Management', recommended: true },
      { id: 'vms-appointments', name: 'Appointments', category: 'Appointments', dependencies: ['vms-visitor-registration'] },
      { id: 'vms-checkin', name: 'Check-in / Check-out', category: 'Check-in / Check-out', required: true },
      { id: 'vms-host-management', name: 'Host Management', category: 'Host Management', recommended: true },
      { id: 'vms-qr-badges', name: 'QR Badges', category: 'Badges & Access', recommended: true },
      { id: 'vms-security-alerts', name: 'Security Alerts', category: 'Security' },
      { id: 'vms-reports', name: 'Visitor Reports', category: 'Reports' },
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
      { id: 'cos-pages', name: 'Pages', category: 'Content', required: true },
      { id: 'cos-posts', name: 'Posts', category: 'Content', recommended: true },
      { id: 'cos-media', name: 'Media Library', category: 'Media', required: true },
      { id: 'cos-publishing', name: 'Publishing Workflow', category: 'Publishing' },
      { id: 'cos-seo', name: 'SEO Settings', category: 'SEO' },
      { id: 'cos-analytics', name: 'Content Analytics', category: 'Analytics' },
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
      { id: 'crm-contacts', name: 'Contacts', category: 'Customer Management', required: true },
      { id: 'crm-[#companies]', name: 'Companies', category: 'Customer Management', dependencies: ['crm-contacts'] },
      { id: 'crm-leads', name: 'Leads', category: 'Sales', required: true },
      { id: 'crm-deals', name: 'Deals & Pipeline', category: 'Sales', dependencies: ['crm-leads'] },
      { id: 'crm-tickets', name: 'Support Tickets', category: 'Support' },
      { id: 'crm-reports', name: 'Sales Reports', category: 'Reports' },
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
      { id: 'hrms-employees', name: 'Employees', category: 'Employee Management', required: true },
      { id: 'hrms-attendance', name: 'Attendance', category: 'Attendance', required: true },
      { id: 'hrms-leave', name: 'Leave Requests', category: 'Leave', dependencies: ['hrms-employees'] },
      { id: 'hrms-payroll', name: 'Payroll', category: 'Payroll', dependencies: ['hrms-employees', 'hrms-attendance'] },
      { id: 'hrms-documents', name: 'Document Hub', category: 'Employee Services' },
      { id: 'hrms-reports', name: 'Employee Reports', category: 'Reports' },
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
        return dbTemplates;
      }
    } catch (e) {
      console.warn('Fallback to memory templates:', e.message);
    }

    return INITIAL_TEMPLATES;
  }

  async findOne(id: string) {
    try {
      const dbTemplate = await this.prisma.template.findUnique({
        where: { id },
      });

      if (dbTemplate) {
        return dbTemplate;
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
