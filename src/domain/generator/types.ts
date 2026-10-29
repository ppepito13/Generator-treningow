import type { Exercise, Zone, RoomConfig } from '@/app/lib/data';

/** Difficulty range used for filtering exercises by level. */
export interface DifficultyRange {
  min: number;
  max: number;
}

/** Parameters passed to the exercise filter (pure, no store dependency). */
export interface ExerciseFilterParams {
  zone: Zone;
  diffRange: DifficultyRange;
  usedIds: Set<string>;
  isThisStationPair: boolean;
  currentRoom: RoomConfig;
  segmentId?: number;
  ignoreUsed?: boolean;
  hasFlagAlready?: boolean;
  category?: string;
  participantsCount?: number;
  /** Optional DI override; falls back to ALL_EXERCISES from data.ts. */
  allExercisesSource?: Exercise[];
}

/** Parameters for zone selection in a circuit. */
export interface ZoneSelectionParams {
  allZones: Zone[];
  stationCount: number;
  isPairMode: boolean;
}
