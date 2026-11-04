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

