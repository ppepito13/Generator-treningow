import type { Exercise, Zone, RoomConfig, Station, DifficultyLevel } from '@/app/lib/data';

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

/** Pluggable pseudo-random generator producing floats in [0, 1). Defaults to Math.random. */
export type RandomFn = () => number;

/** Successful generation outcome containing the created stations. */
export interface GenerationSuccess {
  success: true;
  stations: Station[];
}

/** Conflict metadata returned when a circuit or station cannot be formed. */
export interface GenerationConflictData {
  type: 'generate' | 'reroll';
  requestedStations: number;
  availableStations: number;
  canLoosenDifficulty: boolean;
  partialStations?: Station[];
  contextData?: {
    action?: 'reroll' | 'changeZone';
    stationId?: string;
    paramType?: 'A' | 'B';
    segmentId?: number;
    newZoneId?: string;
  };
}

/** Failed generation outcome due to pool exhaustion or constraints. */
export interface GenerationFailure {
  success: false;
  conflict: GenerationConflictData;
}

/** Unified result of a generator strategy. */
export type GenerationResult = GenerationSuccess | GenerationFailure;

/** Parameters for the pure circuit strategy. */
export interface CircuitStrategyParams {
  currentRoom: RoomConfig;
  mainDiff: DifficultyLevel;
  participants: number;
  stationCount: number;
  isStrictDifficulty: boolean;
  loosenDifficultyFlag?: boolean;
  ignoreUsedFlag?: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}

/** Parameters for the pure synchronized training strategy. */
export interface SynchronizedStrategyParams {
  currentRoom: RoomConfig;
  mainDiff: DifficultyLevel;
  participants: number;
  stationCount: number;
  isStrictDifficulty: boolean;
  loosenDifficultyFlag?: boolean;
  ignoreUsedFlag?: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}

/** Parameters for rerolling an exercise on an existing station. */
export interface RerollStrategyParams {
  circuit: Station[];
  stationId: string;
  type: 'A' | 'B';
  segmentId?: number;
  loosen?: boolean;
  ignoreUsed?: boolean;
  currentRoom: RoomConfig;
  difficultyId: string;
  isStrictDifficulty: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}
