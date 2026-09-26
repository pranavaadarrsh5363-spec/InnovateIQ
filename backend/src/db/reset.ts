import { persistentStore } from './connection';
import { seedDatabase } from './seed';

export async function resetDatabase() {
  console.log('🧹 [Database Reset] Resetting InnovateIQ persistent storage...');
  persistentStore.reset();
  await seedDatabase();
  console.log('✨ [Database Reset] Database successfully reset and seeded.');
}

if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Reset failed:', err);
      process.exit(1);
    });
}
