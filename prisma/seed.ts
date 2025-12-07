import 'dotenv/config'
import seedSlovakGeography from './seeds/slovak-geography';
import seedSampleEvents from './seeds/sample-events';
import seedCoreData from './seeds/core-data';

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Seed in order of dependencies:
  // 1. Core data (users, blogs, galleries, contact submissions)
  await seedCoreData();
  console.log('');

  // 2. Slovak geography (required by events)
  await seedSlovakGeography();
  console.log('');

  // 3. Sample events (depends on geography)
  await seedSampleEvents();

  console.log('\n✅ All seeds completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    const { default: prisma } = await import('../lib/prisma');
    await prisma.$disconnect();
  });
