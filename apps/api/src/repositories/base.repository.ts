import { db } from '../config/database';

export class BaseRepository<T, IdType = number> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> {
    return db.any(`SELECT * FROM ${this.tableName}`);
  }

  async findById(id: IdType): Promise<T | null> {
    return db.oneOrNone(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id]);
  }

  async create(data: Partial<T>): Promise<T> {
    const keys = Object.keys(data);
    const columns = keys.join(', ');
    const values = keys.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO ${this.tableName} (${columns})
      VALUES (${values})
      RETURNING *
    `;
    return db.one(query, Object.values(data));
  }

  async update(id: IdType, data: Partial<T>): Promise<T | null> {
    const keys = Object.keys(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    return db.oneOrNone(query, [id, ...Object.values(data)]);
  }

  async delete(id: IdType): Promise<boolean> {
    const result = await db.result(`DELETE FROM ${this.tableName} WHERE id = $1`, [id]);
    return result.rowCount > 0;
  }
} 