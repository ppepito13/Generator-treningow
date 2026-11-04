import {
  findBackupFile,
  downloadBackupFile,
  uploadBackupFile,
  GoogleDriveError,
} from '@/services/cloud/googleDriveClient';
import { getValidAccessToken, getCurrentAuthSession } from '@/services/auth/googleAuth';
import { createSyncBackupPayload } from '@/domain/sync/mergeEngine';
import type { SyncBackupPayload, SyncDataCollections } from '@/types/sync';
import { useAppStore } from '@/app/lib/store';

export const DEFAULT_DEBOUNCE_DELAY_MS = 2500;

let isSyncingInProgress = false;
let suppressAutoSync = false;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let networkListenerInitialized = false;

/**
 * Returns whether auto-sync triggering is currently suppressed.
 */
export const isAutoSyncSuppressed = (): boolean => suppressAutoSync;

/**
 * Returns whether a synchronization cycle is currently in progress.
 */
export const isSyncInProgress = (): boolean => isSyncingInProgress;

/**
 * Cancels any pending debounced sync cycle.
 */
export const cancelDebouncedSync = (): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};

/**
 * Performs a complete synchronization run:
 * 1. Validates preconditions (user logged in, drive scope, online, not already syncing)
 * 2. Fetches remote backup from Google Drive (if exists)
 * 3. Merges remote data with local store (LWW)
 * 4. Uploads unified payload back to Google Drive
 * 5. Updates store status and lastSyncedAt timestamp
 */
export const performSync = async (options?: { force?: boolean }): Promise<{ success: boolean; error?: string }> => {
  const store = useAppStore.getState();

  // 1. Precondition checks
  if (!store.googleUser) {
    return { success: false, error: 'Użytkownik nie jest zalogowany.' };
  }

  if (store.googleUser.hasDriveScope === false) {
    return { success: false, error: 'Brak uprawnień do Dysku Google.' };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine && !options?.force) {
    store.setSyncStatus?.('offline', 'Brak połączenia z siecią. Synchronizacja wstrzymana.');
    return { success: false, error: 'Brak połączenia z siecią.' };
  }

  if (isSyncingInProgress) {
    return { success: false, error: 'Synchronizacja jest już w toku.' };
  }

  isSyncingInProgress = true;
  cancelDebouncedSync();
  store.setSyncStatus?.('syncing');

  try {
    const token = getValidAccessToken() || getCurrentAuthSession().accessToken;

    if (!token) {
      throw new GoogleDriveError('AUTH_EXPIRED', 'Brak aktywnego tokenu dostępowego sesji Google.', 401);
    }

    // 2. Fetch existing backup from appDataFolder
    const existingFile = await findBackupFile(token);
    let remotePayload: SyncBackupPayload | null = null;

    if (existingFile) {
      remotePayload = await downloadBackupFile<SyncBackupPayload>(token, existingFile.id);
    }

    // 3. Merge remote backup into local state (with auto-sync suppressed to prevent loop)
    suppressAutoSync = true;
    try {
      if (remotePayload?.data) {
        store.mergeRemoteBackup(remotePayload);
      }

      // 4. Construct unified payload from freshly merged state
      const updatedStore = useAppStore.getState();
      const unifiedCollections: SyncDataCollections = {
        customExercises: updatedStore.customExercises || [],
        customRooms: updatedStore.customRooms || [],
        customEquipment: updatedStore.customEquipment || [],
        customIntervalPresets: updatedStore.customIntervalPresets || [],
      };

      const payload = createSyncBackupPayload(unifiedCollections);

      // 5. Upload back to Google Drive
      await uploadBackupFile(token, payload, existingFile?.id);
    } finally {
      suppressAutoSync = false;
    }

    const now = Date.now();
    store.setLastSyncedAt?.(now);
    store.setSyncStatus?.('idle', null);

    return { success: true };
  } catch (err: unknown) {
    let errorMsg = 'Wystąpił błąd podczas synchronizacji danych.';
    if (err instanceof GoogleDriveError) {
      errorMsg = err.message;
    } else if (err instanceof Error) {
      errorMsg = err.message;
    }

    store.setSyncStatus?.('error', errorMsg);
    return { success: false, error: errorMsg };
  } finally {
    isSyncingInProgress = false;
    suppressAutoSync = false;
  }
};

/**
 * Schedules an auto-sync run after a specified debounce period.
 * Does nothing if user is not logged in, lacks drive scope, or sync is suppressed/in progress.
 */
export const scheduleDebouncedSync = (delayMs = DEFAULT_DEBOUNCE_DELAY_MS): void => {
  if (suppressAutoSync || isSyncingInProgress) {
    return;
  }

  const store = useAppStore.getState();
  if (!store.googleUser || store.googleUser.hasDriveScope === false) {
    return;
  }

  cancelDebouncedSync();

  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void performSync();
  }, delayMs);
};

/**
 * Attaches network connectivity listeners (online/offline) to trigger sync when returning online.
 */
export const initSyncNetworkListeners = (): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleOnline = () => {
    const store = useAppStore.getState();
    if (store.googleUser && store.googleUser.hasDriveScope !== false) {
      scheduleDebouncedSync(600);
    }
  };

  const handleOffline = () => {
    cancelDebouncedSync();
    const store = useAppStore.getState();
    if (store.googleUser && store.syncStatus === 'syncing') {
      store.setSyncStatus?.('offline', 'Utracono połączenie z Internetem.');
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  networkListenerInitialized = true;

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    networkListenerInitialized = false;
  };
};

export const isNetworkListenerInitialized = (): boolean => networkListenerInitialized;

/**
 * Reset internal coordinator state (primarily for isolated unit tests).
 */
export const resetSyncCoordinatorForTests = (): void => {
  cancelDebouncedSync();
  isSyncingInProgress = false;
  suppressAutoSync = false;
  networkListenerInitialized = false;
};
