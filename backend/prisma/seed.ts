import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create plans
  const starterPlan = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter',
      slug: 'starter',
      description: 'Free plan for getting started',
      priceUsd: 0,
      priceInr: 0,
      billingCycle: 'MONTHLY',
      features: [
        'surveys_basic',
        'max_surveys_5',
        'max_responses_100',
        'basic_analytics',
        'email_support',
      ],
      maxSurveys: 5,
      maxResponses: 100,
      maxQuestions: 10,
      maxTeamMembers: 1,
      isActive: true,
      sortOrder: 1,
      supportLevel: 'community',
    },
  });
  console.log(`  Plan: ${starterPlan.name} (${starterPlan.id})`);

  const professionalPlan = await prisma.plan.upsert({
    where: { slug: 'professional' },
    update: {},
    create: {
      name: 'Professional',
      slug: 'professional',
      description: 'For growing teams and advanced surveys',
      priceUsd: 49,
      priceInr: 3999,
      billingCycle: 'MONTHLY',
      features: [
        'surveys_basic',
        'surveys_advanced',
        'max_surveys_50',
        'max_responses_5000',
        'basic_analytics',
        'advanced_analytics',
        'ai_analysis',
        'export_csv',
        'export_pdf',
        'custom_branding',
        'priority_support',
        'api_access',
      ],
      maxSurveys: 50,
      maxResponses: 5000,
      maxQuestions: 50,
      maxTeamMembers: 5,
      isActive: true,
      sortOrder: 2,
      supportLevel: 'priority',
    },
  });
  console.log(`  Plan: ${professionalPlan.name} (${professionalPlan.id})`);

  const enterprisePlan = await prisma.plan.upsert({
    where: { slug: 'enterprise' },
    update: {},
    create: {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Unlimited access for large organizations',
      priceUsd: 199,
      priceInr: 14999,
      billingCycle: 'MONTHLY',
      features: [
        'surveys_basic',
        'surveys_advanced',
        'unlimited_surveys',
        'unlimited_responses',
        'basic_analytics',
        'advanced_analytics',
        'ai_analysis',
        'predictive_analytics',
        'export_csv',
        'export_pdf',
        'export_spss',
        'custom_branding',
        'white_label',
        'priority_support',
        'dedicated_support',
        'api_access',
        'webhooks',
        'sso',
        'respondent_panel',
        'multi_language',
        'public_datasets',
      ],
      maxSurveys: -1,
      maxResponses: -1,
      maxQuestions: -1,
      maxTeamMembers: -1,
      isActive: true,
      sortOrder: 3,
      supportLevel: 'dedicated',
    },
  });
  console.log(`  Plan: ${enterprisePlan.name} (${enterprisePlan.id})`);

  // 2. Create superadmin user
  const adminPasswordHash = await bcrypt.hash('Admin@2024!Primo', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@primodata.io' },
    update: {},
    create: {
      email: 'admin@primodata.io',
      name: 'PrimoData Admin',
      passwordHash: adminPasswordHash,
      role: 'SUPERADMIN',
      status: 'ACTIVE',
      emailVerified: new Date(),
      organization: 'PrimoData',
    },
  });
  console.log(`  Admin: ${admin.email} (${admin.id})`);

  // 3. Create subscription for admin (Enterprise)
  await prisma.subscription.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      planId: enterprisePlan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('  Admin subscription: Enterprise (active)');

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
