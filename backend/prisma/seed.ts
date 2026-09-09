import { PrismaClient, SystemRole, AppMode, AppStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LaunchPad database seed...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'techsolutions-inc' },
    update: {},
    create: {
      name: 'TechSolutions Inc.',
      slug: 'techsolutions-inc',
      industry: 'Enterprise Software & Cloud Services',
      domain: 'techsolutions.io',
      plan: 'Enterprise',
      status: 'active',
    },
  });
  console.log(`✅ Organization seeded: ${org.name} (${org.id})`);

  // 2. Hash default password
  const defaultPassword = 'DemoPass123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 3. Seed Users
  const usersData = [
    {
      name: 'Alexander Vance',
      email: 'alexander@launchpad-os.com',
      role: SystemRole.SUPER_ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    },
    {
      name: 'Elena Rostova',
      email: 'elena.rostova@techsolutions.io',
      role: SystemRole.ORG_ADMIN,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    },
    {
      name: 'Marcus Chen',
      email: 'marcus.c@devhub.org',
      role: SystemRole.DEVELOPER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    },
    {
      name: 'Sarah Connor',
      email: 'viewer@launchpad-os.com',
      role: SystemRole.VIEWER,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
    },
    {
      name: 'John Doe',
      email: 'user@launchpad-os.com',
      role: SystemRole.USER,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    },
  ];

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        role: userData.role,
        passwordHash,
      },
      create: {
        name: userData.name,
        email: userData.email,
        passwordHash,
        organizationId: org.id,
        role: userData.role,
        avatar: userData.avatar,
        status: 'ACTIVE',
      },
    });
    console.log(`👤 Seeded User: ${user.name} (${user.email}) -> Role: ${user.role}`);
  }

  // 4. Seed Initial Templates
  const templates = [
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
        'Visitor Registration',
        'Appointment',
        'Check-in / Check-out',
        'Host Management',
        'QR Code',
        'Reports',
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
        'Editorial Calendar',
        'Asset Vault',
        'Multi-channel Publishing',
        'Content Analytics',
        'Approval Workflows',
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
        'Lead Pipeline',
        'Account Management',
        'Deal Stage Tracking',
        'Activity Logs',
        'Email Integration',
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
        'Employee Directory',
        'Attendance & Leave',
        'Onboarding Checklists',
        'Performance Reviews',
        'Document Hub',
      ],
    },
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { name: t.name },
      update: {
        description: t.description,
        modules: t.modules,
      },
      create: {
        id: t.id,
        name: t.name,
        industry: t.industry,
        category: t.category,
        description: t.description,
        popularity: t.popularity,
        iconName: t.iconName,
        featured: t.featured,
        modules: t.modules,
      },
    });
    console.log(`📋 Seeded Template: ${t.name}`);
  }

  // 5. Seed Initial Sample Application (Visitor Management Hub)
  const vmsApp = await prisma.application.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: 'visitor-access-hub' } },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Visitor Access Hub',
      slug: 'visitor-access-hub',
      description: 'Enterprise building visitor management & security kiosk system',
      mode: AppMode.STANDALONE,
      status: AppStatus.ACTIVE,
      templateId: 'template-vms-01',
      environment: 'production',
      usersCount: 24,
      branding: {
        appName: 'Visitor Access Hub',
        primaryColor: '#3F7659',
        secondaryColor: '#DDEEDF',
        font: 'Inter',
        buttonStyle: 'rounded',
        borderRadius: '8px',
      },
      modules: {
        create: [
          'Visitor Registration',
          'Appointment',
          'Check-in / Check-out',
          'Host Management',
          'QR Code',
          'Reports',
        ].map((m) => ({
          name: m,
          code: m.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          isEnabled: true,
        })),
      },
    },
  });
  console.log(`🚀 Seeded Application: ${vmsApp.name} (${vmsApp.id})`);

  // 6. Seed Audit Log
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      action: 'System Database Seed',
      resource: 'Platform',
      status: 'success',
      details: 'Initial system users, organization, templates, and applications seeded.',
    },
  });

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
