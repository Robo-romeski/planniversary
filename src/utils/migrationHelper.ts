import fs from 'fs';
import path from 'path';

interface Migration {
  id: number;
  name: string;
  up: string;
  down: string;
}

class MigrationHelper {
  private migrationsDir: string;

  constructor(migrationsDir: string) {
    this.migrationsDir = migrationsDir;
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
}

export default MigrationHelper; 