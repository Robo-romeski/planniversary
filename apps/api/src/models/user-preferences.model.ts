export type NotificationPreference = 'email' | 'sms' | 'both' | 'none';
export type BudgetRange = 'low' | 'medium' | 'high' | 'custom';

export interface UserPreferences {
  id: string;
  user_id: string;
  default_location?: string;
  default_location_lat?: number;
  default_location_lng?: number;
  budget_preference?: BudgetRange;
  custom_budget_min?: number;
  custom_budget_max?: number;
  theme_preference?: string;
  notification_preference: NotificationPreference;
  email_notifications: boolean;
  sms_notifications: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserPreferencesDTO {
  user_id: string;
  default_location?: string;
  default_location_lat?: number;
  default_location_lng?: number;
  budget_preference?: BudgetRange;
  custom_budget_min?: number;
  custom_budget_max?: number;
  theme_preference?: string;
  notification_preference?: NotificationPreference;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}

export interface UpdateUserPreferencesDTO {
  default_location?: string;
  default_location_lat?: number;
  default_location_lng?: number;
  budget_preference?: BudgetRange;
  custom_budget_min?: number;
  custom_budget_max?: number;
  theme_preference?: string;
  notification_preference?: NotificationPreference;
  email_notifications?: boolean;
  sms_notifications?: boolean;
} 