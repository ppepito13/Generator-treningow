import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAppStore, partializeStoreState } from '@/app/lib/store';
import { setMockGoogleUser, signInWithGoogle, signOutFromGoogle } from '@/services/auth/googleAuth';
import type { GoogleUserProfile } from '@/types/auth';

const mockUser: GoogleUserProfile = {
  id: 'google-user-123',
  email: 'test@sportsway.eu',
  name: 'Test Trener',
  picture: 'https://lh3.googleusercontent.com/test-avatar.jpg',
  verifiedEmail: true,
};

describe('Zustand Store - Google Auth State (#39, #47)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setMockGoogleUser(null);
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
});
