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
  idToken?: string;
  serverAuthCode?: string;
  expiresAt?: number;
}

/**
 * Metadata for Google Drive files stored in appDataFolder.
 */
export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

/**
 * Result of Google Drive storage operations.
 */
export interface GoogleDriveOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Outcome of background silent session validation.
 */
export interface AuthValidationResult {
  status: 'valid' | 'revoked' | 'offline' | 'error';
  error?: string;
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
