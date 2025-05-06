-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_location VARCHAR(255),
  default_location_lat DECIMAL(10, 8),
  default_location_lng DECIMAL(11, 8),
  budget_preference VARCHAR(50) DEFAULT 'medium',
  custom_budget_min INTEGER,
  custom_budget_max INTEGER,
  theme_preference VARCHAR(50),
  notification_preference VARCHAR(50) NOT NULL DEFAULT 'email',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_budget_range CHECK (
    (budget_preference != 'custom') OR 
    (budget_preference = 'custom' AND custom_budget_min IS NOT NULL AND custom_budget_max IS NOT NULL AND custom_budget_min <= custom_budget_max)
  ),
  CONSTRAINT valid_notification_preference CHECK (notification_preference IN ('email', 'sms', 'both', 'none')),
  CONSTRAINT valid_budget_preference CHECK (budget_preference IN ('low', 'medium', 'high', 'custom')),
  CONSTRAINT valid_location_coordinates CHECK (
    (default_location_lat IS NULL AND default_location_lng IS NULL) OR
    (default_location_lat IS NOT NULL AND default_location_lng IS NOT NULL AND
     default_location_lat BETWEEN -90 AND 90 AND
     default_location_lng BETWEEN -180 AND 180)
  )
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 