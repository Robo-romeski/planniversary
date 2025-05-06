import fs from 'fs';
import path from 'path';
import { db, pgp } from '../config/database';

interface MigrationRecord {
  id: number;
  name: string;
  executed_at: Date;
}

export class MigrationRunner {
  private readonly migrationsDir: string;
  private readonly migrationTableName = 'migrations';

  constructor() {
    this.migrationsDir = path.join(__dirname, '..', 'migrations');
  }

  private async ensureMigrationTable(): Promise<void> {
    await db.none(`
      CREATE TABLE IF NOT EXISTS ${this.migrationTableName} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private async getExecutedMigrations(): Promise<MigrationRecord[]> {
    return await db.any<MigrationRecord>(`
      SELECT * FROM ${this.migrationTableName} ORDER BY id ASC
    `);
  }

  private async recordMigration(migrationName: string): Promise<void> {
    await db.none(`
      INSERT INTO ${this.migrationTableName} (name)
      VALUES ($1)
    `, [migrationName]);
  }

  private async executeMigration(migrationPath: string, migrationName: string): Promise<void> {
    try {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      await db.tx(async t => {
        await t.none(sql);
        await t.none(`
          INSERT INTO ${this.migrationTableName} (name)
          VALUES ($1)
        `, [migrationName]);
      });
      console.log(`✅ Successfully executed migration: ${migrationName}`);
    } catch (error) {
      console.error(`❌ Error executing migration ${migrationName}:`, error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    try {
      await this.ensureMigrationTable();
      const executedMigrations = await this.getExecutedMigrations();
      const executedMigrationNames = new Set(executedMigrations.map(m => m.name));

      const migrationFiles = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const migrationFile of migrationFiles) {
        if (!executedMigrationNames.has(migrationFile)) {
          const migrationPath = path.join(this.migrationsDir, migrationFile);
          await this.executeMigration(migrationPath, migrationFile);
        }
      }

      console.log('✨ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    }
  }

  public async rollbackLastMigration(): Promise<void> {
    try {
      const lastMigration = await db.oneOrNone<MigrationRecord>(`
        SELECT * FROM ${this.migrationTableName}
        ORDER BY id DESC
        LIMIT 1
      `);

      if (!lastMigration) {
        console.log('No migrations to rollback');
        return;
      }

      const rollbackFile = lastMigration.name.replace('.sql', '.down.sql');
      const rollbackPath = path.join(this.migrationsDir, rollbackFile);

      if (!fs.existsSync(rollbackPath)) {
        throw new Error(`Rollback file not found: ${rollbackFile}`);
      }

      await db.tx(async t => {
        const sql = fs.readFileSync(rollbackPath, 'utf8');
        await t.none(sql);
        await t.none(`
          DELETE FROM ${this.migrationTableName}
          WHERE id = $1
        `, [lastMigration.id]);
      });

      console.log(`✅ Successfully rolled back migration: ${lastMigration.name}`);
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  const migrationRunner = new MigrationRunner();
  migrationRunner.runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
} 