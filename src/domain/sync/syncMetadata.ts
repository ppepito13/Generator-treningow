import type { SyncMetadata, WithSyncMetadata } from '@/types/sync';

/**
 * Ensures that an entity has valid SyncMetadata attached.
 * If _sync is missing, initializes with version = 1 and fallback timestamp.
 */
export function ensureSyncMetadata<T extends WithSyncMetadata>(
  item: T,
  fallbackTimestamp: number = Date.now()
): T & { _sync: SyncMetadata } {
  if (item._sync && typeof item._sync.updatedAt === 'number' && typeof item._sync.version === 'number') {
    return {
      ...item,
      _sync: {
        updatedAt: item._sync.updatedAt,
        version: item._sync.version,
        isDeleted: Boolean(item._sync.isDeleted),
        ...(item._sync.isPurged ? { isPurged: true } : {}),
      },
    };
  }

  const existingUpdatedAt = item._sync?.updatedAt;
  const existingVersion = item._sync?.version;

  return {
    ...item,
    _sync: {
      updatedAt: typeof existingUpdatedAt === 'number' ? existingUpdatedAt : fallbackTimestamp,
      version: typeof existingVersion === 'number' && existingVersion > 0 ? existingVersion : 1,
      isDeleted: Boolean(item._sync?.isDeleted),
      ...(item._sync?.isPurged ? { isPurged: true } : {}),
    },
  };
}

/**
 * Touches an entity when created or modified, incrementing its version,
 * updating the timestamp to the current time, and ensuring isDeleted is false.
 */
export function touchSyncMetadata<T extends WithSyncMetadata>(
  item: T,
  timestamp: number = Date.now()
): T & { _sync: SyncMetadata } {
  const currentVersion = item._sync?.version ?? 0;
  return {
    ...item,
    _sync: {
      updatedAt: timestamp,
      version: currentVersion + 1,
      isDeleted: false,
    },
  };
}

/**
 * Soft deletes an entity (Tombstone), incrementing its version,
 * setting updatedAt to the current time, and setting isDeleted to true.
 */
export function markSyncDeleted<T extends WithSyncMetadata>(
  item: T,
  timestamp: number = Date.now()
): T & { _sync: SyncMetadata } {
  const currentVersion = item._sync?.version ?? 0;
  return {
    ...item,
    _sync: {
      updatedAt: timestamp,
      version: currentVersion + 1,
      isDeleted: true,
    },
  };
}

/**
 * Checks whether an entity has been soft-deleted (is a tombstone).
 */
export function isSyncDeleted(item: WithSyncMetadata | null | undefined): boolean {
  return item?._sync?.isDeleted === true;
}

/**
 * 7 days retention limit for trash items in milliseconds.
 */
export const TRASH_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Checks whether an exercise qualifies as a trash item:
 * - isDeleted is true
 * - isPurged is not true
 * - deletion timestamp is within the 7 days retention window
 */
export function isExerciseInTrash(
  item: WithSyncMetadata | null | undefined,
  now: number = Date.now()
): boolean {
  if (!item?._sync?.isDeleted || item._sync.isPurged) {
    return false;
  }
  const updatedAt = item._sync.updatedAt;
  if (typeof updatedAt !== 'number') {
    return false;
  }
  const age = now - updatedAt;
  return age >= 0 && age <= TRASH_RETENTION_MS;
}

/**
 * Calculates remaining days in trash for a given item (1 to 7).
 * Returns 0 if already expired.
 */
export function getTrashRemainingDays(
  item: WithSyncMetadata | null | undefined,
  now: number = Date.now()
): number {
  if (!item?._sync?.updatedAt) {
    return 0;
  }
  const elapsed = now - item._sync.updatedAt;
  const remainingMs = Math.max(0, TRASH_RETENTION_MS - elapsed);
  return Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
}

/**
 * Marks an entity as permanently purged from the trash.
 * Keeps the tombstone intact to prevent zombie recreation on sync.
 */
export function markSyncPurged<T extends WithSyncMetadata>(
  item: T,
  timestamp: number = Date.now()
): T & { _sync: SyncMetadata } {
  const currentVersion = item._sync?.version ?? 0;
  return {
    ...item,
    _sync: {
      updatedAt: timestamp,
      version: currentVersion + 1,
      isDeleted: true,
      isPurged: true,
    },
  };
}
