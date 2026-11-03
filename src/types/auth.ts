/**
 * Google user profile information retrieved after authentication.
 */
export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verifiedEmail?: boolean;
}

/**
 * Status of the authentication lifecycle.
 */
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

/**
 * Session tokens or credentials held in memory.
 */
export interface AuthSession {
  accessToken?: string;
  expiresAt?: number;
}

/**
 * Contract for Google Auth Client operations.
 */
export interface GoogleAuthClient {
  init: () => Promise<void>;
  signIn: () => Promise<GoogleUserProfile>;
  signOut: () => Promise<void>;
  getUserProfile: () => GoogleUserProfile | null;
  isConfigured: () => boolean;
}

