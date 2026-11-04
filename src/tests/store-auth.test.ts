import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore, partializeStoreState } from '@/app/lib/store';
import {
  setMockGoogleUser,
  setMockValidationResult,
  signInWithGoogle,
  signOutFromGoogle,
  formatAuthError,
} from '@/services/auth/googleAuth';
import type { GoogleUserProfile } from '@/types/auth';

const mockUser: GoogleUserProfile = {
  id: 'google-user-123',
  email: 'test@sportsway.eu',
  name: 'Test Trener',
  picture: 'https://lh3.googleusercontent.com/test-avatar.jpg',
  verifiedEmail: true,
};

describe('Zustand Store - Google Auth State (#39, #47, #50)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockGoogleUser(null);
    setMockValidationResult(null);
    useAppStore.setState({
      googleUser: null,
      authStatus: 'idle',
      authError: null,
      customExercises: [],
      customRooms: [],
      customEquipment: [],
    });
  });

  it('initializes with unauthenticated idle state', () => {
    const state = useAppStore.getState();
    expect(state.googleUser).toBeNull();
    expect(state.authStatus).toBe('idle');
    expect(state.authError).toBeNull();
  });

  it('updates googleUser and sets authStatus to authenticated', () => {
    useAppStore.getState().setGoogleUser(mockUser);

    const state = useAppStore.getState();
    expect(state.googleUser).toEqual(mockUser);
    expect(state.authStatus).toBe('authenticated');
    expect(state.authError).toBeNull();
  });

  it('handles authStatus transitions and error reporting', () => {
    useAppStore.getState().setAuthStatus('loading');
    expect(useAppStore.getState().authStatus).toBe('loading');

    useAppStore.getState().setAuthStatus('error', 'Network failure');
    const state = useAppStore.getState();
    expect(state.authStatus).toBe('error');
    expect(state.authError).toBe('Network failure');
  });

  it('correctly handles authentication timeout and resets to error state without corrupting session', () => {
    useAppStore.getState().setAuthStatus('loading');
    expect(useAppStore.getState().authStatus).toBe('loading');

    const timeoutError = 'Przekroczono limit czasu oczekiwania na logowanie do Konta Google. Spróbuj ponownie.';
    useAppStore.getState().setAuthStatus('error', timeoutError);

    const state = useAppStore.getState();
    expect(state.authStatus).toBe('error');
    expect(state.authError).toBe(timeoutError);
    expect(state.googleUser).toBeNull();
  });

  it('allows recovery from an interrupted or timed-out session back to idle or authenticated', () => {
    useAppStore.getState().setAuthStatus('error', 'Logowanie zostało przerwane');
    expect(useAppStore.getState().authStatus).toBe('error');

    useAppStore.getState().setGoogleUser(mockUser);
    const state = useAppStore.getState();
    expect(state.authStatus).toBe('authenticated');
    expect(state.authError).toBeNull();
    expect(state.googleUser).toEqual(mockUser);
  });

  it('authenticates through signInWithGoogle with mock provider and clears on signOutFromGoogle', async () => {
    setMockGoogleUser(mockUser);

    const profile = await signInWithGoogle();
    expect(profile).toEqual(mockUser);

    useAppStore.getState().setGoogleUser(profile);
    expect(useAppStore.getState().googleUser).toEqual(mockUser);

    await signOutFromGoogle();
    useAppStore.getState().setGoogleUser(null);
    expect(useAppStore.getState().googleUser).toBeNull();
  });

  it('disconnects google account, clearing user session while strictly preserving local custom data', async () => {
    const customEx = useAppStore.getState().addCustomExercise({ nazwa: 'Moje Ćwiczenie Testowe' });
    useAppStore.getState().setGoogleUser(mockUser);

    expect(useAppStore.getState().googleUser).not.toBeNull();
    expect(useAppStore.getState().customExercises.length).toBeGreaterThan(0);

    await useAppStore.getState().disconnectGoogleAccount();

    const stateAfter = useAppStore.getState();
    expect(stateAfter.googleUser).toBeNull();
    expect(stateAfter.authStatus).toBe('idle');
    expect(stateAfter.authError).toBeNull();

    expect(stateAfter.customExercises.some(e => e.id_cwiczenia === customEx.id_cwiczenia)).toBe(true);
  });

  it('includes googleUser in partializeStoreState for persistent identity caching', () => {
    useAppStore.getState().setGoogleUser(mockUser);
    const partialized = partializeStoreState(useAppStore.getState());

    expect(partialized.googleUser).toEqual(mockUser);
  });

  describe('Background Session Validation and Revocation Handling (#50)', () => {
    it('returns false immediately when no user is logged in', async () => {
      const isValid = await useAppStore.getState().validateGoogleSessionState();
      expect(isValid).toBe(false);
      expect(useAppStore.getState().googleUser).toBeNull();
      expect(useAppStore.getState().authStatus).toBe('idle');
    });

    it('preserves user profile and returns true when session is valid', async () => {
      useAppStore.getState().setGoogleUser(mockUser);
      setMockValidationResult({ status: 'valid' });

      const isValid = await useAppStore.getState().validateGoogleSessionState();
      expect(isValid).toBe(true);

      const state = useAppStore.getState();
      expect(state.googleUser).toEqual(mockUser);
      expect(state.authStatus).toBe('authenticated');
      expect(state.authError).toBeNull();
    });

    it('clears user profile, sets status to idle, and displays warning when session is revoked externally', async () => {
      const customEx = useAppStore.getState().addCustomExercise({ nazwa: 'Autorskie Ćwiczenie Nienaruszone' });
      useAppStore.getState().setGoogleUser(mockUser);
      setMockValidationResult({
        status: 'revoked',
        error: 'The token provided in the request is already expired or has already been revoked.',
      });

      const isValid = await useAppStore.getState().validateGoogleSessionState();
      expect(isValid).toBe(false);

      const state = useAppStore.getState();
      expect(state.googleUser).toBeNull();
      expect(state.authStatus).toBe('idle');
      expect(state.authError).toBe(
        'Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.'
      );
      // Offline-first local data remains strictly intact
      expect(state.customExercises.some(e => e.id_cwiczenia === customEx.id_cwiczenia)).toBe(true);
    });

    it('preserves session and returns true when validation reports offline', async () => {
      useAppStore.getState().setGoogleUser(mockUser);
      setMockValidationResult({ status: 'offline' });

      const isValid = await useAppStore.getState().validateGoogleSessionState();
      expect(isValid).toBe(true);

      const state = useAppStore.getState();
      expect(state.googleUser).toEqual(mockUser);
      expect(state.authError).toBeNull();
    });

    it('formatAuthError correctly identifies revoked tokens and avoids duplicate prefixing', () => {
      const revokedMsg = formatAuthError('invalid_token: Token has been expired or revoked');
      expect(revokedMsg).toBe(
        'Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.'
      );

      const alreadyPrefixed = formatAuthError('Błąd logowania Google: Coś poszło nie tak');
      expect(alreadyPrefixed).toBe('Błąd logowania Google: Coś poszło nie tak');

      const fullLocalized = formatAuthError(
        'Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.'
      );
      expect(fullLocalized).toBe(
        'Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.'
      );
    });
  });
});
