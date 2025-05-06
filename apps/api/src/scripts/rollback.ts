import { MigrationHelper } from '../utils/migrationHelper';

async function rollback() {
  const migrationHelper = new MigrationHelper();
  
  try {
    await migrationHelper.rollback();
    console.log('✨ Rollback completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  }
}

rollback(); 