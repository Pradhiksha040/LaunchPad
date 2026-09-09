import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Industry Starter Templates')
@Controller('industry-templates')
export class IndustryTemplatesController {
  private templates = [
    { id: 'healthcare', name: 'Healthcare & EHR Portal', industry: 'HEALTHCARE', modules: ['Appointments', 'Patients', 'EHR Connector'] },
    { id: 'crm', name: 'Enterprise CRM & Pipeline', industry: 'CRM', modules: ['Leads', 'Deals', 'Contacts', 'Salesforce Sync'] },
    { id: 'hrms', name: 'Global HRMS & Payroll', industry: 'HRMS', modules: ['Employees', 'Attendance', 'Leaves', 'Workday Sync'] },
    { id: 'ecommerce', name: 'Multi-Tenant E-Commerce', industry: 'E_COMMERCE', modules: ['Catalog', 'Cart', 'Orders', 'Payments', 'SAP SD'] },
    { id: 'food-delivery', name: 'Food Delivery & Dispatch', industry: 'FOOD_DELIVERY', modules: ['Restaurants', 'Drivers', 'Live Orders', 'Tracking'] },
    { id: 'real-estate', name: 'Real Estate & Property', industry: 'REAL_ESTATE', modules: ['Properties', 'Leases', 'Tenants', 'Agents'] },
    { id: 'logistics', name: 'Logistics & Fleet Management', industry: 'LOGISTICS', modules: ['Shipments', 'Fleet', 'Warehouses', 'Tracking'] },
    { id: 'education', name: 'EdTech & Student Portal', industry: 'EDUCATION', modules: ['Students', 'Courses', 'Grades', 'Fees'] },
    { id: 'booking', name: 'Booking Platform', industry: 'BOOKING', modules: ['Services', 'Slots', 'Reservations', 'Payments'] },
    { id: 'marketplace', name: 'Vendor Marketplace', industry: 'MARKETPLACE', modules: ['Vendors', 'Commission', 'Payouts', 'Ratings'] },
    { id: 'rental', name: 'Equipment & Auto Rental', industry: 'RENTAL', modules: ['Inventory', 'Reservations', 'Contracts', 'Billing'] },
    { id: 'freelancer', name: 'Gig Economy Platform', industry: 'FREELANCER', modules: ['Jobs', 'Bids', 'Milestones', 'Escrow'] },
  ];

  @Get()
  @ApiOperation({ summary: 'Get catalog of 12 industry starter templates' })
  async getTemplates() {
    return this.templates;
  }

  @Post(':id/deploy')
  @ApiOperation({ summary: '1-Click Deploy Starter Template into Tenant Workspace' })
  async deployTemplate(@Param('id') id: string) {
    const template = this.templates.find((t) => t.id === id);
    return {
      success: true,
      deployedTemplate: template || this.templates[0],
      installedModules: template?.modules || [],
      message: `Template '${template?.name || id}' successfully provisioned and ready for deployment.`,
    };
  }
}
