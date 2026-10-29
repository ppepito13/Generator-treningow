import type { Exercise, Zone, RoomConfig } from '@/app/lib/data';
import type { DifficultyRange } from './types';
import { getValidExercisesForZone } from './exerciseFilter';
import { filterBySegmentBalancing } from './muscleBalancing';

export const MAX_DIFFICULTY_LOOSENING = 1;

export interface CascadeFilterParams {
  zone: Zone;
  baseRange: DifficultyRange;
  currentRange: DifficultyRange;
  usedIds: Set<string>;
  isThisStationPair: boolean;
  currentRoom: RoomConfig;
  segmentId?: number;
  hasFlagAlready?: boolean;
  category?: string;
  participantsCount?: number;
  allExercisesSource?: Exercise[];
  isStrictDifficulty: boolean;
  previousExercise?: Exercise;
  previousSegmentId?: number;
}

export interface CascadeFallbackResult {
  pool: Exercise[];
  loosenedDifficulty: boolean;
  ignoredUsed: boolean;
  relaxedBalancing: boolean;
}

/**
 * Calculates a loosened difficulty range (±1 level, bounded between 1 and 10).
 */
export const getLoosenedRange = (range: DifficultyRange): DifficultyRange => ({
  min: Math.max(1, range.min - MAX_DIFFICULTY_LOOSENING),
  max: Math.min(10, range.max + MAX_DIFFICULTY_LOOSENING),
});

/**
 * Executes a deterministic multi-stage cascade fallback when candidate exercises
 * for a station cannot be found under initial strict constraints.
 *
 * Cascade Steps:
 * 1. Standard candidate query with active range and segment balancing.
 * 2. If empty and !isStrictDifficulty: loosen difficulty range by 1 level.
 * 3. If empty: relax muscle balancing constraint (allow repeating previous segment).
 * 4. If empty: allow repeating exercises used on other stations (ignoreUsed = true).
 * 5. If empty and !isStrictDifficulty: combine loosened difficulty + ignoreUsed.
 * 6. Pool exhausted -> returns empty pool for conflict handling.
 */
export const applyCascadeFallback = (params: CascadeFilterParams): CascadeFallbackResult => {
  const {
    zone,
    currentRange,
    usedIds,
    isThisStationPair,
    currentRoom,
    segmentId,
    hasFlagAlready = false,
    category = 'all',
    participantsCount = 1,
    allExercisesSource,
    isStrictDifficulty,
    previousExercise,
    previousSegmentId,
  } = params;

  // Step 1: Base query with current range
  const basePool = getValidExercisesForZone(
    zone,
    currentRange,
    usedIds,
    isThisStationPair,
    currentRoom,
    segmentId,
    false,
    hasFlagAlready,
    category,
    participantsCount,
    allExercisesSource
  );

  const balancedBase = filterBySegmentBalancing(basePool, previousExercise, previousSegmentId);
  if (balancedBase.length > 0) {
    return {
      pool: balancedBase,
      loosenedDifficulty: false,
      ignoredUsed: false,
      relaxedBalancing: false,
    };
  }

  // Step 2: Loosen difficulty (if permitted by strict mode)
  if (!isStrictDifficulty) {
    const loosenedRange = getLoosenedRange(currentRange);
    const loosenedPool = getValidExercisesForZone(
      zone,
      loosenedRange,
      usedIds,
      isThisStationPair,
      currentRoom,
      segmentId,
      false,
      hasFlagAlready,
      category,
      participantsCount,
      allExercisesSource
    );
    const balancedLoosened = filterBySegmentBalancing(loosenedPool, previousExercise, previousSegmentId);
    if (balancedLoosened.length > 0) {
      return {
        pool: balancedLoosened,
        loosenedDifficulty: true,
        ignoredUsed: false,
        relaxedBalancing: false,
      };
    }
  }

  // Step 3: Relax muscle balancing (if basePool had exercises before segment balancing)
  if (basePool.length > 0) {
    return {
      pool: basePool,
      loosenedDifficulty: false,
      ignoredUsed: false,
      relaxedBalancing: true,
    };
  }

  // Step 4: Allow duplicate exercises (ignoreUsed = true)
  const reusedPool = getValidExercisesForZone(
    zone,
    currentRange,
    usedIds,
    isThisStationPair,
    currentRoom,
    segmentId,
    true,
    hasFlagAlready,
    category,
    participantsCount,
    allExercisesSource
  );

  if (reusedPool.length > 0) {
    const balancedReused = filterBySegmentBalancing(reusedPool, previousExercise, previousSegmentId);
    return {
      pool: balancedReused.length > 0 ? balancedReused : reusedPool,
      loosenedDifficulty: false,
      ignoredUsed: true,
      relaxedBalancing: balancedReused.length === 0,
    };
  }

  // Step 5: Combine duplicate exercises + loosened difficulty (if not strict)
  if (!isStrictDifficulty) {
    const loosenedRange = getLoosenedRange(currentRange);
    const reusedLoosenedPool = getValidExercisesForZone(
      zone,
      loosenedRange,
      usedIds,
      isThisStationPair,
      currentRoom,
      segmentId,
      true,
      hasFlagAlready,
      category,
      participantsCount,
      allExercisesSource
    );
    if (reusedLoosenedPool.length > 0) {
      return {
        pool: reusedLoosenedPool,
        loosenedDifficulty: true,
        ignoredUsed: true,
        relaxedBalancing: true,
      };
    }
  }

  // Step 6: Fully exhausted
  return {
    pool: [],
    loosenedDifficulty: false,
    ignoredUsed: false,
    relaxedBalancing: false,
  };
};

