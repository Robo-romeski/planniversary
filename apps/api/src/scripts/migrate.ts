import { MigrationHelper } from '../utils/migrationHelper';

async function migrate() {
  const migrationHelper = new MigrationHelper();
  
  try {
    await migrationHelper.migrate();
    console.log('✨ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 