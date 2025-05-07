import { db } from '../config/database';
import { UserPreferences, CreateUserPreferencesDTO, UpdateUserPreferencesDTO } from '../models/user-preferences.model';

export class UserPreferencesRepository {
  private tableName = 'user_preferences';

  public async findByUserId(userId: string): Promise<UserPreferences | null> {
    try {
      console.log('[findByUserId] Querying user_preferences with userId:', userId);
      const result = await db.query(
        `SELECT * FROM ${this.tableName} WHERE user_id = $1`,
        [userId]
      );
      console.log('[findByUserId] Raw query result:', result);
      if (result && result.length > 0) {
        console.log('[findByUserId] Returning first row:', result[0]);
        return result[0];
      } else {
        console.log('[findByUserId] No rows found for userId:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error finding user preferences:', error);
      throw error;
    }
  }

  public async createPreferences(data: CreateUserPreferencesDTO): Promise<UserPreferences> {
    try {
      const result = await db.query(
        `INSERT INTO ${this.tableName} (
          user_id,
          default_location,
          default_location_lat,
          default_location_lng,
          budget_preference,
          custom_budget_min,
          custom_budget_max,
          theme_preference,
          notification_preference,
          email_notifications,
          sms_notifications,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [
          data.user_id,
          data.default_location || null,
          data.default_location_lat || null,
          data.default_location_lng || null,
          data.budget_preference || 'medium',
          data.custom_budget_min || null,
          data.custom_budget_max || null,
          data.theme_preference || null,
          data.notification_preference || 'email',
          data.email_notifications !== undefined ? data.email_notifications : true,
          data.sms_notifications !== undefined ? data.sms_notifications : false,
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user preferences:', error);
      throw error;
    }
  }

  public async updatePreferences(userId: string, data: UpdateUserPreferencesDTO): Promise<UserPreferences | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      // Build dynamic update query
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      });

      if (updates.length === 0) {
        return null;
      }

      values.push(userId);
      const query = `
        UPDATE ${this.tableName}
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE user_id = $${paramCount}
        RETURNING *
      `;

      const result = await db.query(query, values);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  public async deletePreferences(userId: string): Promise<boolean> {
    try {
      const result = await db.query(
        `DELETE FROM ${this.tableName} WHERE user_id = $1 RETURNING id`,
        [userId]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting user preferences:', error);
      throw error;
    }
  }
} 