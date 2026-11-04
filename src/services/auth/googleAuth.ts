import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import type { GoogleUserProfile, AuthSession, AuthValidationResult } from '@/types/auth';
import { formatAuthError } from './authErrors';

export { formatAuthError };

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
const AUTH_TIMEOUT_MS = 35000; // 35s twardy limit czasu oczekiwania
const FOCUS_GRACE_PERIOD_MS = 3500; // 3.5s buforu po powrocie do okna aplikacji
export const AUTH_SESSION_STORAGE_KEY = 'kinetic_auth_session';

let currentSession: AuthSession = {};
let scriptLoadingPromise: Promise<void> | null = null;
let mockUser: GoogleUserProfile | null = null;
let mockValidationResult: AuthValidationResult | null = null;
let isNativeInitialized = false;

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
 * Set a mock validation result for testing session revalidation and revocation.
 */
export const setMockValidationResult = (result: AuthValidationResult | null): void => {
  mockValidationResult = result;
};

/**
 * Persists active AuthSession into localStorage.
 */
export const saveAuthSession = (session: AuthSession): void => {
  currentSession = { ...session };
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage write issues
    }
  }
};

/**
 * Loads stored AuthSession from localStorage if available.
 */
export const loadStoredAuthSession = (): AuthSession => {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          currentSession = parsed;
          return currentSession;
        }
      }
    } catch {
      // Ignore parse issues
    }
  }
  return currentSession;
};

/**
 * Clears stored AuthSession from memory and localStorage.
 */
export const clearStoredAuthSession = (): void => {
  currentSession = {};
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage remove issues
    }
  }
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
 * Web-based Google Identity Services OAuth flow with timeout and focus recovery.
 */
const signInWithGoogleWeb = async (clientId: string): Promise<GoogleUserProfile> => {
  await loadGoogleScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services nie jest dostępne.');
  }

  return new Promise((resolve, reject) => {
    let isSettled = false;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let focusGraceTimer: ReturnType<typeof setTimeout> | null = null;
    let hasLostFocus = false;

    const cleanup = () => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (focusGraceTimer) clearTimeout(focusGraceTimer);
      window.removeEventListener('focus', handleAppFocus);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };

    const settleResolve = (profile: GoogleUserProfile) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      resolve(profile);
    };

    const settleReject = (err: Error) => {
      if (isSettled) return;
      isSettled = true;
      cleanup();
      reject(err);
    };

    const onUserReturned = () => {
      if (isSettled) return;
      if (focusGraceTimer) clearTimeout(focusGraceTimer);
      focusGraceTimer = setTimeout(() => {
        if (!isSettled) {
          settleReject(new Error('Logowanie zostało przerwane lub okno autoryzacji zostało zamknięte.'));
        }
      }, FOCUS_GRACE_PERIOD_MS);
    };

    const handleWindowBlur = () => {
      hasLostFocus = true;
    };

    const handleAppFocus = () => {
      if (!hasLostFocus) return;
      onUserReturned();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        hasLostFocus = true;
      } else if (document.visibilityState === 'visible' && hasLostFocus) {
        onUserReturned();
      }
    };

    try {
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleAppFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      timeoutTimer = setTimeout(() => {
        settleReject(new Error('Przekroczono limit czasu oczekiwania na logowanie do Konta Google. Spróbuj ponownie.'));
      }, AUTH_TIMEOUT_MS);

      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: DEFAULT_SCOPES,
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            settleReject(new Error(`Błąd autoryzacji Google: ${tokenResponse.error}`));
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            settleReject(new Error('Nie otrzymano tokenu dostępowego od Google.'));
            return;
          }

          const session = {
            accessToken,
            expiresAt: Date.now() + 3500 * 1000,
          };
          saveAuthSession(session);

          try {
            const profile = await fetchGoogleUserProfile(accessToken);
            settleResolve(profile);
          } catch (profileError) {
            settleReject(profileError instanceof Error ? profileError : new Error(String(profileError)));
          }
        },
        error_callback: (error) => {
          settleReject(new Error(`Błąd okna logowania Google: ${String(error)}`));
        },
      });

      client.requestAccessToken();
    } catch (err) {
      settleReject(err instanceof Error ? err : new Error(String(err)));
    }
  });
};

/**
 * Native Android/iOS Google Sign-In flow using Capacitor Credential Manager.
 */
const signInWithGoogleNative = async (clientId: string): Promise<GoogleUserProfile> => {
  if (!isNativeInitialized) {
    await GoogleSignIn.initialize({
      clientId,
      scopes: ['openid', 'email', 'profile'],
    });
    isNativeInitialized = true;
  }

  const result = await GoogleSignIn.signIn();

  if (!result || !result.userId) {
    throw new Error('Nie udało się uzyskać danych konta z natywnego menedżera logowania.');
  }

  const email = result.email || '';
  const name = result.displayName || [result.givenName, result.familyName].filter(Boolean).join(' ') || email || 'Użytkownik';
  const picture = result.imageUrl || undefined;

  if (result.accessToken) {
    saveAuthSession({
      accessToken: result.accessToken,
      expiresAt: Date.now() + 3500 * 1000,
    });
  }

  return {
    id: result.userId,
    email,
    name,
    picture,
    verifiedEmail: Boolean(email),
  };
};

/**
 * Initiates Google OAuth popup or native dialog and retrieves user profile.
 */
export const signInWithGoogle = async (): Promise<GoogleUserProfile> => {
  // Return mock user if configured (for unit/e2e tests)
  if (mockUser) {
    saveAuthSession({ accessToken: 'mock-access-token' });
    return mockUser;
  }

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error('Brak skonfigurowanego identyfikatora Google Client ID (NEXT_PUBLIC_GOOGLE_CLIENT_ID).');
  }

  if (typeof window === 'undefined') {
    throw new Error('Logowanie Google jest dostępne wyłącznie w środowisku przeglądarki.');
  }

  try {
    if (Capacitor.isNativePlatform()) {
      return await signInWithGoogleNative(clientId);
    }

    return await signInWithGoogleWeb(clientId);
  } catch (err) {
    throw new Error(formatAuthError(err));
  }
};

/**
 * Performs silent background validation of the active Google session.
 */
export const validateGoogleSession = async (): Promise<AuthValidationResult> => {
  if (mockValidationResult) {
    return mockValidationResult;
  }

  // 1. Check network connectivity (Offline-First preservation)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return { status: 'offline' };
  }

  // 2. Ensure current session is present
  const session = currentSession.accessToken ? currentSession : loadStoredAuthSession();
  const token = session.accessToken;

  if (!token) {
    // If running in test environment with mockUser, treat as valid
    if (mockUser) {
      return { status: 'valid' };
    }
    return { status: 'revoked', error: 'Brak aktywnego tokenu autoryzacji sesji.' };
  }

  // 3. Query Google tokeninfo endpoint
  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(token)}`);

    if (response.ok) {
      return { status: 'valid' };
    }

    if (response.status === 400 || response.status === 401) {
      let errorDesc = '';
      try {
        const errData = await response.json();
        errorDesc = errData.error_description || errData.error || '';
      } catch {
        // ignore parse error
      }
      return {
        status: 'revoked',
        error: errorDesc || 'Dostęp do Konta Google wygasł lub został cofnięty.',
      };
    }

    return {
      status: 'error',
      error: `Google API zwróciło status ${response.status}`,
    };
  } catch (err) {
    // Network failure (DNS error, offline, fetch abort) -> NEVER revoke on network failures
    return {
      status: 'offline',
      error: err instanceof Error ? err.message : String(err),
    };
  }
};

/**
 * Revokes access token and clears session from memory and storage.
 */
export const signOutFromGoogle = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleSignIn.signOut();
    } catch {
      // Ignorujemy błędy przy wylogowaniu natywnym
    }
  } else if (typeof window !== 'undefined' && currentSession.accessToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(currentSession.accessToken);
    } catch {
      // Ignorujemy błędy przy cofaniu tokena webowego
    }
  }
  clearStoredAuthSession();
};

/**
 * Returns currently stored auth session (loads from storage if not initialized in memory).
 */
export const getCurrentAuthSession = (): AuthSession => {
  if (!currentSession.accessToken) {
    loadStoredAuthSession();
  }
  return { ...currentSession };
};
