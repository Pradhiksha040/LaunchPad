import { AppModuleItem } from '@/types';
import { VMS_MODULES } from './modules/vms';
import { CRM_MODULES } from './modules/crm';
import { HRMS_MODULES } from './modules/hrms';
import { CONTENT_OS_MODULES } from './modules/content-os';
import { SCHOOL_MODULES } from './modules/school';
import { EVENT_MODULES } from './modules/event';
import { FOOD_DELIVERY_MODULES } from './modules/food-delivery';
import { HEALTHCARE_MODULES } from './modules/healthcare';
import { ECOMMERCE_MODULES } from './modules/ecommerce';
import { BOOKING_MODULES } from './modules/booking';
import { MARKETPLACE_MODULES } from './modules/marketplace';
import { CUSTOM_APP_MODULES } from './modules/custom';

export const ALL_MODULE_CATALOGS: Record<string, AppModuleItem[]> = {
  vms: VMS_MODULES,
  'visitor-management': VMS_MODULES,
  'template-vms-01': VMS_MODULES,
  'tpl-vms': VMS_MODULES,

  crm: CRM_MODULES,
  'crm-portal': CRM_MODULES,
  'template-crm-03': CRM_MODULES,
  'tpl-crm': CRM_MODULES,

  hrms: HRMS_MODULES,
  'hrms-portal': HRMS_MODULES,
  'template-hrms-04': HRMS_MODULES,
  'tpl-hrms': HRMS_MODULES,

  'content-os': CONTENT_OS_MODULES,
  cms: CONTENT_OS_MODULES,
  'template-content-os-02': CONTENT_OS_MODULES,
  'tpl-content-os': CONTENT_OS_MODULES,

  school: SCHOOL_MODULES,
  'school-management': SCHOOL_MODULES,
  'tpl-school': SCHOOL_MODULES,

  event: EVENT_MODULES,
  'event-management': EVENT_MODULES,
  'tpl-event': EVENT_MODULES,

  'food-delivery': FOOD_DELIVERY_MODULES,
  food: FOOD_DELIVERY_MODULES,
  'tpl-food': FOOD_DELIVERY_MODULES,

  healthcare: HEALTHCARE_MODULES,
  hospital: HEALTHCARE_MODULES,
  'tpl-healthcare': HEALTHCARE_MODULES,

  ecommerce: ECOMMERCE_MODULES,
  ecom: ECOMMERCE_MODULES,
  'tpl-ecom': ECOMMERCE_MODULES,

  booking: BOOKING_MODULES,
  'booking-platform': BOOKING_MODULES,
  'tpl-booking': BOOKING_MODULES,

  marketplace: MARKETPLACE_MODULES,
  freelancer: MARKETPLACE_MODULES,
  'tpl-marketplace': MARKETPLACE_MODULES,

  custom: CUSTOM_APP_MODULES,
  'custom-app': CUSTOM_APP_MODULES,
  'tpl-custom': CUSTOM_APP_MODULES,
};

export function getModulesForTemplate(templateIdOrName: string): AppModuleItem[] {
  if (!templateIdOrName) return CUSTOM_APP_MODULES;

  const key = templateIdOrName.toLowerCase().trim();

  for (const [catalogKey, modules] of Object.entries(ALL_MODULE_CATALOGS)) {
    if (key === catalogKey || key.includes(catalogKey) || catalogKey.includes(key)) {
      return modules;
    }
  }

  // Fallback matching by keyword
  if (key.includes('vms') || key.includes('visitor')) return VMS_MODULES;
  if (key.includes('crm') || key.includes('customer') || key.includes('sales')) return CRM_MODULES;
  if (key.includes('hrms') || key.includes('hr') || key.includes('employee')) return HRMS_MODULES;
  if (key.includes('content') || key.includes('cms')) return CONTENT_OS_MODULES;
  if (key.includes('school') || key.includes('education') || key.includes('academic')) return SCHOOL_MODULES;
  if (key.includes('event') || key.includes('conference')) return EVENT_MODULES;
  if (key.includes('food') || key.includes('restaurant') || key.includes('delivery')) return FOOD_DELIVERY_MODULES;
  if (key.includes('health') || key.includes('hospital') || key.includes('patient')) return HEALTHCARE_MODULES;
  if (key.includes('ecom') || key.includes('commerce') || key.includes('shop')) return ECOMMERCE_MODULES;
  if (key.includes('book') || key.includes('appointment')) return BOOKING_MODULES;
  if (key.includes('market') || key.includes('freelance') || key.includes('gig')) return MARKETPLACE_MODULES;

  return CUSTOM_APP_MODULES;
}

export function getTemplateDisplayName(templateIdOrName: string): string {
  if (!templateIdOrName) return 'Custom Application';

  const key = templateIdOrName.toLowerCase();
  if (key.includes('vms') || key.includes('visitor')) return 'Visitor Management';
  if (key.includes('crm') || key.includes('sales')) return 'CRM';
  if (key.includes('hrms') || key.includes('hr')) return 'HRMS';
  if (key.includes('content') || key.includes('cms')) return 'Content OS';
  if (key.includes('school')) return 'School Management';
  if (key.includes('event')) return 'Event Management';
  if (key.includes('food')) return 'Food Delivery';
  if (key.includes('health')) return 'Healthcare Management';
  if (key.includes('ecom') || key.includes('commerce')) return 'E-commerce';
  if (key.includes('book')) return 'Booking Platform';
  if (key.includes('market')) return 'Marketplace Platform';

  return 'Custom Application';
}
