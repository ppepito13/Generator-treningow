// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  performSync,
  scheduleDebouncedSync,
  cancelDebouncedSync,
  initSyncNetworkListeners,
  resetSyncCoordinatorForTests,
} from '@/services/sync/syncCoordinator';
import { useAppStore } from '@/app/lib/store';
import * as googleDriveClient from '@/services/cloud/googleDriveClient';
import * as googleAuth from '@/services/auth/googleAuth';
import type { SyncBackupPayload } from '@/types/sync';
import { createDefaultExercise } from '@/app/lib/data';

vi.mock('@/services/cloud/googleDriveClient', () => ({
  findBackupFile: vi.fn(),
  downloadBackupFile: vi.fn(),
  uploadBackupFile: vi.fn(),
  GoogleDriveError: class extends Error {
    constructor(public code: string, message: string, public statusCode?: number) {
      super(message);
      this.name = 'GoogleDriveError';
    }
  },
}));

describe('SyncCoordinator Lifecycle (#40.3)', () => {
  const mockUser = {
    id: 'user_123',
    email: 'trener@sportsway.eu',
    name: 'Trener Testowy',
    hasDriveScope: true,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    resetSyncCoordinatorForTests();

    // Reset store state
    useAppStore.setState({
      googleUser: null,
      syncStatus: 'idle',
      lastSyncedAt: null,
      syncError: null,
      customExercises: [],
      customRooms: [],
      customEquipment: [],
      customIntervalPresets: [],
    });

    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });

    vi.spyOn(googleAuth, 'getValidAccessToken').mockReturnValue('test-access-token-123');
    vi.spyOn(googleAuth, 'getCurrentAuthSession').mockReturnValue({
      accessToken: 'test-access-token-123',
      expiresAt: Date.now() + 3600000,
    });
  });

  afterEach(() => {
    resetSyncCoordinatorForTests();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('rejects sync when user is not logged in', async () => {
    const result = await performSync();
    expect(result.success).toBe(false);
    expect(result.error).toContain('nie jest zalogowany');
    expect(useAppStore.getState().syncStatus).toBe('idle');
  });

  it('rejects sync when user lacks Drive scope', async () => {
    useAppStore.setState({
      googleUser: { ...mockUser, hasDriveScope: false },
    });

    const result = await performSync();
    expect(result.success).toBe(false);
    expect(result.error).toContain('Brak uprawnień');
    expect(useAppStore.getState().syncStatus).toBe('idle');
  });

  it('handles offline state by setting syncStatus to offline', async () => {
    useAppStore.setState({ googleUser: mockUser });

    // Mock navigator.onLine = false
    const originalOnLine = navigator.onLine;
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    try {
      const result = await performSync();
      expect(result.success).toBe(false);
      expect(result.error).toContain('połączenia');
      expect(useAppStore.getState().syncStatus).toBe('offline');
    } finally {
      Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true });
    }
  });

  it('performs full initial sync when no remote backup exists', async () => {
    useAppStore.setState({ googleUser: mockUser });

    vi.mocked(googleDriveClient.findBackupFile).mockResolvedValue(null);
    vi.mocked(googleDriveClient.uploadBackupFile).mockResolvedValue({
      id: 'new-drive-file-id',
      name: 'sportsway_sync_backup.json',
    });

    const result = await performSync();

    expect(result.success).toBe(true);
    expect(googleDriveClient.findBackupFile).toHaveBeenCalledWith('test-access-token-123');
    expect(googleDriveClient.downloadBackupFile).not.toHaveBeenCalled();
    expect(googleDriveClient.uploadBackupFile).toHaveBeenCalledTimes(1);

    const state = useAppStore.getState();
    expect(state.syncStatus).toBe('idle');
    expect(state.lastSyncedAt).toBeTypeOf('number');
    expect(state.syncError).toBeNull();
  });

  it('merges remote backup into store and uploads combined state when remote file exists', async () => {
    useAppStore.setState({
      googleUser: mockUser,
      customExercises: [
        createDefaultExercise({
          id_cwiczenia: 'cust_local_1',
          nazwa: 'Lokalne Pompki',
          _sync: { updatedAt: 1000, version: 1 },
        }),
      ],
    });

    const remotePayload: SyncBackupPayload = {
      schemaVersion: 1,
      clientVersion: '1.3.0',
      lastModified: 2000,
      data: {
        customExercises: [
          createDefaultExercise({
            id_cwiczenia: 'cust_remote_2',
            nazwa: 'Zdalne Podciąganie',
            _sync: { updatedAt: 2000, version: 1 },
          }),
        ],
        customRooms: [],
        customEquipment: [],
        customIntervalPresets: [],
      },
    };

    vi.mocked(googleDriveClient.findBackupFile).mockResolvedValue({
      id: 'existing-file-id',
      name: 'sportsway_sync_backup.json',
    });
    vi.mocked(googleDriveClient.downloadBackupFile).mockResolvedValue(remotePayload);
    vi.mocked(googleDriveClient.uploadBackupFile).mockResolvedValue({
      id: 'existing-file-id',
      name: 'sportsway_sync_backup.json',
    });

    const result = await performSync();

    expect(result.success).toBe(true);
    expect(googleDriveClient.downloadBackupFile).toHaveBeenCalledWith('test-access-token-123', 'existing-file-id');
    expect(googleDriveClient.uploadBackupFile).toHaveBeenCalledWith(
      'test-access-token-123',
      expect.objectContaining({
        data: expect.objectContaining({
          customExercises: expect.arrayContaining([
            expect.objectContaining({ id_cwiczenia: 'cust_local_1' }),
            expect.objectContaining({ id_cwiczenia: 'cust_remote_2' }),
          ]),
        }),
      }),
      'existing-file-id'
    );

    const state = useAppStore.getState();
    expect(state.customExercises).toHaveLength(2);
    expect(state.syncStatus).toBe('idle');
  });

  it('handles API errors gracefully without wiping local data', async () => {
    useAppStore.setState({
      googleUser: mockUser,
      customExercises: [
        createDefaultExercise({
          id_cwiczenia: 'preserved_ex',
          nazwa: 'Nienaruszone ćwiczenie',
        }),
      ],
    });

    vi.mocked(googleDriveClient.findBackupFile).mockRejectedValue(
      new googleDriveClient.GoogleDriveError('AUTH_EXPIRED', 'Sesja wygasła.', 401)
    );

    const result = await performSync();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Sesja wygasła.');

    const state = useAppStore.getState();
    expect(state.syncStatus).toBe('error');
    expect(state.syncError).toBe('Sesja wygasła.');
    expect(state.customExercises).toHaveLength(1);
    expect(state.customExercises[0].id_cwiczenia).toBe('preserved_ex');
  });

  it('debounces rapid sequential changes into a single sync run', async () => {
    vi.useFakeTimers();
    useAppStore.setState({ googleUser: mockUser });

    vi.mocked(googleDriveClient.findBackupFile).mockResolvedValue(null);
    vi.mocked(googleDriveClient.uploadBackupFile).mockResolvedValue({
      id: 'file-id',
      name: 'sportsway_sync_backup.json',
    });

    // Rapid edits
    scheduleDebouncedSync(2500);
    scheduleDebouncedSync(2500);
    scheduleDebouncedSync(2500);

    // No calls immediately
    expect(googleDriveClient.findBackupFile).not.toHaveBeenCalled();

    // Advance halfway
    await vi.advanceTimersByTimeAsync(1500);
    expect(googleDriveClient.findBackupFile).not.toHaveBeenCalled();

    // Another edit resets timer
    scheduleDebouncedSync(2500);

    await vi.advanceTimersByTimeAsync(2000);
    expect(googleDriveClient.findBackupFile).not.toHaveBeenCalled();

    // Advance remaining time
    await vi.advanceTimersByTimeAsync(600);

    expect(googleDriveClient.findBackupFile).toHaveBeenCalledTimes(1);
  });

  it('cancels pending debounced sync', async () => {
    vi.useFakeTimers();
    useAppStore.setState({ googleUser: mockUser });

    scheduleDebouncedSync(2500);
    cancelDebouncedSync();

    await vi.advanceTimersByTimeAsync(3000);
    expect(googleDriveClient.findBackupFile).not.toHaveBeenCalled();
  });

  it('initializes network event listeners and handles online event', async () => {
    vi.useFakeTimers();
    useAppStore.setState({ googleUser: mockUser });

    vi.mocked(googleDriveClient.findBackupFile).mockResolvedValue(null);
    vi.mocked(googleDriveClient.uploadBackupFile).mockResolvedValue({
      id: 'file-id',
      name: 'sportsway_sync_backup.json',
    });

    const cleanup = initSyncNetworkListeners();

    // Trigger online event
    window.dispatchEvent(new Event('online'));

    // Debounced sync should trigger
    await vi.advanceTimersByTimeAsync(1000);

    expect(googleDriveClient.findBackupFile).toHaveBeenCalledTimes(1);

    cleanup();
  });
});
