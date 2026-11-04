import type {
  MergeCollectionResult,
  MergeSummary,
  SyncBackupPayload,
  SyncDataCollections,
  WithSyncMetadata,
} from '@/types/sync';
import type { Exercise, RoomConfig, EquipmentItem } from '@/app/lib/data';
import type { IntervalPreset } from '@/types/timer';
import { ensureSyncMetadata } from './syncMetadata';

/**
 * Strips the _sync property and sorts all object keys recursively
 * to allow deterministic deep-equality comparisons.
 */
export function canonicalize(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(canonicalize);
  }
  const sortedKeys = Object.keys(obj as Record<string, unknown>).sort();
  const result: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    if (key === '_sync') continue;
    result[key] = canonicalize((obj as Record<string, unknown>)[key]);
  }
  return result;
}

/**
 * Checks whether two entities have identical business content (ignoring _sync).
 */
export function areContentsEqual<T extends WithSyncMetadata>(a: T, b: T): boolean {
  return JSON.stringify(canonicalize(a)) === JSON.stringify(canonicalize(b));
}

/**
 * Merges two arrays of entities with Last-Write-Wins (LWW) conflict resolution and Tombstones support.
 *
 * Rules:
 * 1. Only local exists -> preserve local.
 * 2. Only remote exists -> adopt remote.
 * 3. Both exist:
 *    - If content and isDeleted are identical, pick the record with higher version / newer timestamp (no conflict).
 *    - If content or isDeleted differs:
 *      * Higher `updatedAt` wins.
 *      * If `updatedAt` equal: higher `version` wins.
 *      * If `updatedAt` and `version` equal: deterministic JSON string comparison tie-breaker.
 */
export function mergeEntityList<T extends WithSyncMetadata>(
  localList: T[] = [],
  remoteList: T[] = [],
  getId: (item: T) => string
): MergeCollectionResult<T> {
  const result: T[] = [];
  let addedCount = 0;
  let updatedCount = 0;
  let deletedCount = 0;
  let conflictsResolved = 0;

  const remoteMap = new Map<string, T>();
  for (const item of remoteList) {
    const id = getId(item);
    if (id) {
      remoteMap.set(id, item);
    }
  }

  const seenIds = new Set<string>();

  // 1. Process all local items
  for (const rawLocal of localList) {
    const id = getId(rawLocal);
    if (!id) continue;
    seenIds.add(id);

    const local = ensureSyncMetadata(rawLocal);
    const rawRemote = remoteMap.get(id);

    if (!rawRemote) {
      // Exists only locally -> keep local
      result.push(local);
      continue;
    }

    const remote = ensureSyncMetadata(rawRemote);
    const contentEqual = areContentsEqual(local, remote);
    const localDeleted = Boolean(local._sync.isDeleted);
    const remoteDeleted = Boolean(remote._sync.isDeleted);

    if (contentEqual && localDeleted === remoteDeleted) {
      // Content is identical: take higher version/timestamp without counting a conflict
      const remoteIsNewer =
        remote._sync.version > local._sync.version ||
        (remote._sync.version === local._sync.version && remote._sync.updatedAt > local._sync.updatedAt);

      result.push(remoteIsNewer ? remote : local);
      continue;
    }

    // Content or deletion status differs -> Conflict!
    conflictsResolved++;

    let remoteWins = false;
    if (remote._sync.updatedAt > local._sync.updatedAt) {
      remoteWins = true;
    } else if (remote._sync.updatedAt < local._sync.updatedAt) {
      remoteWins = false;
    } else if (remote._sync.version > local._sync.version) {
      remoteWins = true;
    } else if (remote._sync.version < local._sync.version) {
      remoteWins = false;
    } else {
      // Deterministic tie-breaker
      remoteWins = JSON.stringify(canonicalize(remote)) >= JSON.stringify(canonicalize(local));
    }

    if (remoteWins) {
      result.push(remote);
      if (!localDeleted && remoteDeleted) {
        deletedCount++;
      } else if (localDeleted && !remoteDeleted) {
        addedCount++;
      } else {
        updatedCount++;
      }
    } else {
      result.push(local);
    }
  }

  // 2. Process remaining remote items not present locally
  for (const rawRemote of remoteList) {
    const id = getId(rawRemote);
    if (!id || seenIds.has(id)) continue;

    const remote = ensureSyncMetadata(rawRemote);
    result.push(remote);

    if (remote._sync.isDeleted) {
      deletedCount++;
    } else {
      addedCount++;
    }
  }

  return {
    merged: result,
    addedCount,
    updatedCount,
    deletedCount,
    conflictsResolved,
  };
}

/**
 * Merges all four customizable collections from local and remote states.
 */
export function mergeSyncData(
  local: Partial<SyncDataCollections> = {},
  remote: Partial<SyncDataCollections> = {}
): {
  mergedCollections: SyncDataCollections;
  summary: MergeSummary;
} {
  const exercisesResult = mergeEntityList<Exercise>(
    local.customExercises || [],
    remote.customExercises || [],
    (item) => item.id_cwiczenia
  );

  const roomsResult = mergeEntityList<RoomConfig>(
    local.customRooms || [],
    remote.customRooms || [],
    (item) => item.id_sali
  );

  const equipmentResult = mergeEntityList<EquipmentItem>(
    local.customEquipment || [],
    remote.customEquipment || [],
    (item) => item.id
  );

  const presetsResult = mergeEntityList<IntervalPreset>(
    local.customIntervalPresets || [],
    remote.customIntervalPresets || [],
    (item) => item.id
  );

  const summary: MergeSummary = {
    exercises: exercisesResult,
    rooms: roomsResult,
    equipment: equipmentResult,
    intervalPresets: presetsResult,
    totalChanges:
      exercisesResult.addedCount +
      exercisesResult.updatedCount +
      exercisesResult.deletedCount +
      roomsResult.addedCount +
      roomsResult.updatedCount +
      roomsResult.deletedCount +
      equipmentResult.addedCount +
      equipmentResult.updatedCount +
      equipmentResult.deletedCount +
      presetsResult.addedCount +
      presetsResult.updatedCount +
      presetsResult.deletedCount,
  };

  const mergedCollections: SyncDataCollections = {
    customExercises: exercisesResult.merged,
    customRooms: roomsResult.merged,
    customEquipment: equipmentResult.merged,
    customIntervalPresets: presetsResult.merged,
  };

  return {
    mergedCollections,
    summary,
  };
}

/**
 * Helper to construct a SyncBackupPayload from collections.
 */
export function createSyncBackupPayload(
  collections: SyncDataCollections,
  clientVersion: string = '1.3.0'
): SyncBackupPayload {
  return {
    schemaVersion: 1,
    clientVersion,
    lastModified: Date.now(),
    data: collections,
  };
}

