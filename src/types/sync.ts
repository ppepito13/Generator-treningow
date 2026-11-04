import type { Exercise, RoomConfig, EquipmentItem } from '@/app/lib/data';
import type { IntervalPreset } from '@/types/timer';

export interface SyncMetadata {
  updatedAt: number;
  version: number;
  isDeleted?: boolean;
}

export interface WithSyncMetadata {
  _sync?: SyncMetadata;
}

export interface SyncDataCollections {
  customExercises: Exercise[];
  customRooms: RoomConfig[];
  customEquipment: EquipmentItem[];
  customIntervalPresets: IntervalPreset[];
}

export interface SyncBackupPayload {
  schemaVersion: number;
  clientVersion: string;
  lastModified: number;
  data: SyncDataCollections;
}

export interface MergeCollectionResult<T> {
  merged: T[];
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  conflictsResolved: number;
}

export interface MergeSummary {
  exercises: MergeCollectionResult<Exercise>;
  rooms: MergeCollectionResult<RoomConfig>;
  equipment: MergeCollectionResult<EquipmentItem>;
  intervalPresets: MergeCollectionResult<IntervalPreset>;
  totalChanges: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface SyncLifecycleState {
  syncStatus: SyncStatus;
  lastSyncedAt: number | null;
  syncError: string | null;
}

export type InitialSyncConflictAction = 'merge' | 'pull' | 'push';

export interface SyncItemsCount {
  exercises: number;
  rooms: number;
  equipment: number;
  presets: number;
  total: number;
}

export interface InitialSyncConflictDetails {
  hasConflict: boolean;
  localCount: SyncItemsCount;
  remoteCount?: SyncItemsCount;
  remoteModifiedTime?: string;
}

