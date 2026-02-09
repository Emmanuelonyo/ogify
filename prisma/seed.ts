import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create plans
  const plans = [
    {
      name: 'free',
      requestsPerMonth: 1000,
      ratePerMinute: 60,
      cacheTtlHours: 24,
      customTemplates: false,
      prioritySupport: false,
      webhooks: false,
      priceMonthly: 0,
      priceYearly: 0,
    },
    {
      name: 'starter',
      requestsPerMonth: 25000,
      ratePerMinute: 120,
      cacheTtlHours: 168, // 7 days
      customTemplates: true,
      prioritySupport: false,
      webhooks: false,
      priceMonthly: 1900, // $19
      priceYearly: 19000, // $190
    },
    {
      name: 'pro',
      requestsPerMonth: 100000,
      ratePerMinute: 300,
      cacheTtlHours: 720, // 30 days
      customTemplates: true,
      prioritySupport: true,
      webhooks: true,
      priceMonthly: 4900, // $49
      priceYearly: 49000, // $490
    },
    {
      name: 'enterprise',
      requestsPerMonth: -1, // unlimited
      ratePerMinute: 1000,
      cacheTtlHours: 8760, // 1 year
      customTemplates: true,
      prioritySupport: true,
      webhooks: true,
      priceMonthly: 0, // custom
      priceYearly: 0,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✓ Plan: ${plan.name}`);
  }

  console.log('✅ Seeding complete!');
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
