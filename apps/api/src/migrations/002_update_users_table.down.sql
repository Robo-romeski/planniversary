-- Drop indexes
DROP INDEX IF EXISTS users_username_idx;
DROP INDEX IF EXISTS users_account_status_idx;
DROP INDEX IF EXISTS users_oauth_lookup_idx;

-- Remove columns from users table
ALTER TABLE users
    DROP COLUMN IF EXISTS username,
    DROP COLUMN IF EXISTS email_verified,
    DROP COLUMN IF EXISTS verification_token,
    DROP COLUMN IF EXISTS verification_token_expires_at,
    DROP COLUMN IF EXISTS reset_token,
    DROP COLUMN IF EXISTS reset_token_expires_at,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS account_status,
    DROP COLUMN IF EXISTS profile_picture_url,
    DROP COLUMN IF EXISTS oauth_provider,
    DROP COLUMN IF EXISTS oauth_id; 