import fs from 'fs';
import path from 'path';
import { db } from '../config/db';

interface Migration {
  id: number;
  name: string;
  up: string;
  down: string;
}

export class MigrationHelper {
  private migrationsDir: string;

  constructor() {
    this.migrationsDir = path.join(__dirname, '../migrations');
  }

  private async ensureMigrationsTable(): Promise<void> {
    await db.none(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async getExecutedMigrations(): Promise<string[]> {
    return await db.map('SELECT name FROM migrations ORDER BY id', [], (row: any) => row.name);
  }

  private async loadMigrationFiles(): Promise<Migration[]> {
    const files = fs.readdirSync(this.migrationsDir);
    console.log('DEBUG: Files in migrationsDir:', files);
    const migrations: Migration[] = [];

    for (const file of files) {
      if (file.endsWith('.up.sql')) {
        const id = parseInt(file.split('_')[0]);
        const name = file.replace('.up.sql', '');
        const upPath = path.join(this.migrationsDir, file);
        const downPath = path.join(this.migrationsDir, file.replace('.up.sql', '.down.sql'));
        console.log(`DEBUG: Checking upPath: ${upPath}, downPath: ${downPath}, exists: ${fs.existsSync(downPath)}`);

        if (fs.existsSync(downPath)) {
          migrations.push({
            id,
            name,
            up: fs.readFileSync(upPath, 'utf8'),
            down: fs.readFileSync(downPath, 'utf8')
          });
        } else {
          console.warn(`Warning: No down migration found for ${file}`);
        }
      }
    }

    return migrations.sort((a, b) => a.id - b.id);
  }

  public async migrate(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      const migrations = await this.loadMigrationFiles();

      for (const migration of migrations) {
        if (!executedMigrations.includes(migration.name)) {
          console.log(`Executing migration: ${migration.name}`);
          
          await db.tx(async t => {
            await t.none(migration.up);
            await t.none('INSERT INTO migrations(name) VALUES($1)', [migration.name]);
          });

          console.log(`Successfully executed migration: ${migration.name}`);
        }
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  public async rollback(steps: number = 1): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      const migrations = await this.loadMigrationFiles();

      // Filter to only include executed migrations and sort in reverse order
      const migrationsToRollback = migrations
        .filter(m => executedMigrations.includes(m.name))
        .sort((a, b) => b.id - a.id)
        .slice(0, steps);

      for (const migration of migrationsToRollback) {
        console.log(`Rolling back migration: ${migration.name}`);
        
        await db.tx(async t => {
          await t.none(migration.down);
          await t.none('DELETE FROM migrations WHERE name = $1', [migration.name]);
        });

        console.log(`Successfully rolled back migration: ${migration.name}`);
      }
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  }

  public async reset(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      
      if (executedMigrations.length > 0) {
        await this.rollback(executedMigrations.length);
      }
      
      await this.migrate();
      console.log('Database reset completed successfully');
    } catch (error) {
      console.error('Database reset failed:', error);
      throw error;
    }
  }

  public async status(): Promise<void> {
    try {
      await this.ensureMigrationsTable();
      const executedMigrations = await this.getExecutedMigrations();
      const migrations = await this.loadMigrationFiles();

      console.log('\nMigration Status:');
      console.log('================');

      for (const migration of migrations) {
        const status = executedMigrations.includes(migration.name) ? 'Executed' : 'Pending';
        console.log(`${migration.name}: ${status}`);
      }
    } catch (error) {
      console.error('Failed to get migration status:', error);
      throw error;
    }
  }
} 