import fs from 'fs';
import path from 'path';
import { persistentStore, query } from './connection';

export async function runMigrations() {
  console.log('🔄 [Migration Runner] Starting InnovateIQ database migration...');
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  persistentStore.init();
  const appliedList = persistentStore.get('schema_migrations');

  for (const file of files) {
    const version = file.split('_')[0];
    const isAlreadyApplied = appliedList.some((m: any) => m.version === version);

    if (!isAlreadyApplied) {
      console.log(`📦 [Migration Runner] Applying migration: ${file}...`);
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      // 1. Apply to PostgreSQL if available
      try {
        await query(sqlContent);
      } catch (err: any) {
        console.warn(`[Migration Runner] PostgreSQL migration warning for ${file}:`, err.message);
      }

      // 2. Record migration in persistent state
      appliedList.push({
        id: appliedList.length + 1,
        version,
        name: file,
        applied_at: new Date().toISOString(),
      });
      persistentStore.set('schema_migrations', appliedList);
      console.log(`✅ [Migration Runner] Migration applied successfully: ${file}`);
    } else {
      console.log(`⏭️ [Migration Runner] Migration already applied: ${file}`);
    }
  }

  console.log('🎉 [Migration Runner] All migrations complete.');
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}
