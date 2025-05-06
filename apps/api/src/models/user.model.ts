export type AccountStatus = 'pending' | 'active' | 'suspended' | 'deleted';
export type OAuthProvider = 'google' | 'github' | null;

export interface User {
  id: string;
  email: string;
  password_hash: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires_at: Date | null;
  reset_token: string | null;
  reset_token_expires_at: Date | null;
  last_login: Date | null;
  account_status: AccountStatus;
  profile_picture_url: string | null;
  oauth_provider: OAuthProvider;
  oauth_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  account_status?: AccountStatus;
  verification_token?: string;
  verification_token_expires_at?: Date;
  email_verified?: boolean;
}

export interface UpdateUserDTO {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  profile_picture_url?: string | null;
}

// Omit sensitive fields when returning user data to the client
export type SafeUser = Omit<User, 
  'password_hash' | 
  'verification_token' | 
  'verification_token_expires_at' | 
  'reset_token' | 
  'reset_token_expires_at'
>; 