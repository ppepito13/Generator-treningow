import type { GoogleUserProfile, AuthSession } from '@/types/auth';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: unknown) => void;
          }) => {
            requestAccessToken: () => void;
          };
          revoke?: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

const DEFAULT_SCOPES = 'openid email profile';
const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let currentSession: AuthSession = {};
let scriptLoadingPromise: Promise<void> | null = null;
let mockUser: GoogleUserProfile | null = null;

export const getGoogleClientId = (): string => {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
};

export const isGoogleAuthConfigured = (): boolean => {
  return Boolean(getGoogleClientId());
};

/**
 * Set a mock user for testing or demo purposes without real network OAuth.
 */
export const setMockGoogleUser = (user: GoogleUserProfile | null): void => {
  mockUser = user;
};

/**
 * Ensures Google Identity Services script is loaded.
 */
export const loadGoogleScript = (): Promise<void> => {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.src = SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      scriptLoadingPromise = null;
      reject(new Error(`Nie udało się załadować biblioteki Google Auth: ${String(err)}`));
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

/**
 * Fetches user profile from Google userinfo API using the access token.
 */
export const fetchGoogleUserProfile = async (accessToken: string): Promise<GoogleUserProfile> => {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Błąd pobierania profilu Google: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    id: data.sub,
    email: data.email,
    name: data.name || data.email,
    picture: data.picture,
    verifiedEmail: data.email_verified,
  };
};

/**
 * Initiates Google OAuth popup and retrieves user profile.
 */
export const signInWithGoogle = async (): Promise<GoogleUserProfile> => {
  // Return mock user if configured (for unit/e2e tests)
  if (mockUser) {
    currentSession = { accessToken: 'mock-access-token' };
    return mockUser;
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Brak skonfigurowanego identyfikatora Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID).');
  }

  if (typeof window === 'undefined') {
    throw new Error('Logowanie Google jest dostępne wyłącznie w środowisku przeglądarki.');
  }

  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services nie jest dostępne.');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DEFAULT_SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(`Błąd autoryzacji Google: ${tokenResponse.error}`));
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('Nie otrzymano tokenu dostępowego od Google.'));
            return;
          }

          currentSession = {
            accessToken,
            expiresAt: Date.now() + 3500 * 1000,
          };

          try {
            const profile = await fetchGoogleUserProfile(accessToken);
            resolve(profile);
          } catch (profileError) {
            reject(profileError);
          }
        },
        error_callback: (error) => {
          reject(new Error(`Błąd okna logowania Google: ${String(error)}`));
        },
      });

      client.requestAccessToken();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Revokes access token and clears session from memory.
 */
export const signOutFromGoogle = async (): Promise<void> => {
  mockUser = null;
  const token = currentSession.accessToken;
  if (token && typeof window !== 'undefined' && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(token);
    } catch {
      // Ignore revocation error if network was offline
    }
  }
  currentSession = {};
};

/**
 * Returns current access token if present in memory.
 */
export const getCurrentAccessToken = (): string | undefined => {
  if (currentSession.expiresAt && Date.now() > currentSession.expiresAt) {
    currentSession = {};
    return undefined;
  }
  return currentSession.accessToken;
};

