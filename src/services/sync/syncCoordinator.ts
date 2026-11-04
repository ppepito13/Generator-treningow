import {
  findBackupFile,
  downloadBackupFile,
  uploadBackupFile,
  GoogleDriveError,
} from '@/services/cloud/googleDriveClient';
import { getValidAccessToken, getCurrentAuthSession } from '@/services/auth/googleAuth';
import { createSyncBackupPayload } from '@/domain/sync/mergeEngine';
import type {
  InitialSyncConflictAction,
  InitialSyncConflictDetails,
  SyncBackupPayload,
  SyncDataCollections,
} from '@/types/sync';
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
 * Formats a timestamp into a user-friendly Polish date/time label:
 * - null/undefined -> 'Nigdy'
 * - Today -> 'Dzisiaj, HH:mm'
 * - Yesterday -> 'Wczoraj, HH:mm'
 * - Other -> 'DD.MM.YYYY, HH:mm'
 */
export const formatLastSyncedAt = (timestamp: number | null | undefined): string => {
  if (!timestamp) {
    return 'Nigdy';
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return 'Nigdy';
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const timeStr = `${hours}:${minutes}`;

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Dzisiaj, ${timeStr}`;
  }

  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Wczoraj, ${timeStr}`;
  }

  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();

  return `${day}.${month}.${year}, ${timeStr}`;
};

/**
 * Checks whether an initial sync conflict condition is met:
 * 1. Device has never synced before (lastSyncedAt === null)
 * 2. Device has non-deleted custom items
 * 3. Remote Google Drive already contains a backup file
 */
export const checkInitialSyncConflict = async (): Promise<InitialSyncConflictDetails> => {
  const store = useAppStore.getState();

  const localExercises = (store.customExercises || []).filter(item => !item._sync?.isDeleted).length;
  const localRooms = (store.customRooms || []).filter(item => !item._sync?.isDeleted).length;
  const localEquipment = (store.customEquipment || []).filter(item => !item._sync?.isDeleted).length;
  const localPresets = (store.customIntervalPresets || []).filter(item => !item._sync?.isDeleted).length;
  const totalLocal = localExercises + localRooms + localEquipment + localPresets;

  const totalRawRecords =
    (store.customExercises?.length || 0) +
    (store.customRooms?.length || 0) +
    (store.customEquipment?.length || 0) +
    (store.customIntervalPresets?.length || 0);

  const localCount = {
    exercises: localExercises,
    rooms: localRooms,
    equipment: localEquipment,
    presets: localPresets,
    total: totalLocal,
  };

  if (store.lastSyncedAt !== null || !store.googleUser || store.googleUser.hasDriveScope === false) {
    return { hasConflict: false, localCount };
  }

  // If device is completely empty (no active items AND no tombstones), no conflict
  if (totalRawRecords === 0) {
    return { hasConflict: false, localCount };
  }

  const token = getValidAccessToken() || getCurrentAuthSession().accessToken;
  if (!token) {
    return { hasConflict: false, localCount };
  }

  try {
    const existingFile = await findBackupFile(token);
    if (!existingFile) {
      return { hasConflict: false, localCount };
    }

    const remotePayload = await downloadBackupFile<SyncBackupPayload>(token, existingFile.id);
    const remoteExercises = (remotePayload?.data?.customExercises || []).filter(item => !item._sync?.isDeleted).length;
    const remoteRooms = (remotePayload?.data?.customRooms || []).filter(item => !item._sync?.isDeleted).length;
    const remoteEquipment = (remotePayload?.data?.customEquipment || []).filter(item => !item._sync?.isDeleted).length;
    const remotePresets = (remotePayload?.data?.customIntervalPresets || []).filter(item => !item._sync?.isDeleted).length;
    const totalRemote = remoteExercises + remoteRooms + remoteEquipment + remotePresets;

    return {
      hasConflict: true,
      localCount,
      remoteCount: {
        exercises: remoteExercises,
        rooms: remoteRooms,
        equipment: remoteEquipment,
        presets: remotePresets,
        total: totalRemote,
      },
      remoteModifiedTime: existingFile.modifiedTime,
    };
  } catch (err) {
    console.error('Błąd podczas sprawdzania konfliktu początkowego:', err);
    return { hasConflict: false, localCount };
  }
};

/**
 * Resolves the initial synchronization conflict based on user's choice:
 * - 'merge': Last-Write-Wins merge between local device and Google Drive, then upload unified backup
 * - 'pull': Discards local custom data and replaces with Google Drive backup
 * - 'push': Overwrites Google Drive backup with current local device data
 */
export const resolveInitialSync = async (
  action: InitialSyncConflictAction
): Promise<{ success: boolean; error?: string }> => {
  const store = useAppStore.getState();

  if (!store.googleUser || store.googleUser.hasDriveScope === false) {
    return { success: false, error: 'Brak uprawnień do Dysku Google lub użytkownik niezalogowany.' };
  }

  if (action === 'merge') {
    return performSync({ force: true });
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

    const existingFile = await findBackupFile(token);

    if (action === 'pull') {
      if (!existingFile) {
        throw new Error('Nie znaleziono pliku kopii zapasowej na Dysku Google.');
      }
      const remotePayload = await downloadBackupFile<SyncBackupPayload>(token, existingFile.id);

      suppressAutoSync = true;
      try {
        useAppStore.setState({
          customExercises: remotePayload?.data?.customExercises || [],
          customRooms: remotePayload?.data?.customRooms || [],
          customEquipment: remotePayload?.data?.customEquipment || [],
          customIntervalPresets: remotePayload?.data?.customIntervalPresets || [],
        });
      } finally {
        suppressAutoSync = false;
      }
    } else if (action === 'push') {
      const currentStore = useAppStore.getState();
      const unifiedCollections: SyncDataCollections = {
        customExercises: currentStore.customExercises || [],
        customRooms: currentStore.customRooms || [],
        customEquipment: currentStore.customEquipment || [],
        customIntervalPresets: currentStore.customIntervalPresets || [],
      };
      const payload = createSyncBackupPayload(unifiedCollections);
      await uploadBackupFile(token, payload, existingFile?.id);
    }

    const now = Date.now();
    store.setLastSyncedAt?.(now);
    store.setSyncStatus?.('idle', null);

    return { success: true };
  } catch (err: unknown) {
    let errorMsg = 'Wystąpił błąd podczas rozstrzygania synchronizacji początkowej.';
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
 * Explicitly restores data from Google Drive backup, replacing all local custom
 * collections (exercises, rooms, equipment, interval presets) and discarding local tombstones.
 */
export const restoreFromCloudBackup = async (): Promise<{ success: boolean; error?: string }> => {
  return resolveInitialSync('pull');
};

/**
 * Reset internal coordinator state (primarily for isolated unit tests).
 */
export const resetSyncCoordinatorForTests = (): void => {
  cancelDebouncedSync();
  isSyncingInProgress = false;
  suppressAutoSync = false;
  networkListenerInitialized = false;
};
