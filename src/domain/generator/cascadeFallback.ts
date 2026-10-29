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
  excludedSegmentIds?: number[] | Set<number>;
  usedBaseNames?: Set<string>;
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
 * 1. Base query with active range, full neighbor balancing (excludedSegmentIds), and unique base names.
 * 2. If empty and !isStrictDifficulty: loosen difficulty range by 1 level to avoid supersets / muscle overload,
 *    still strictly enforcing two-sided neighbor exclusion and base name deduplication.
 * 3. If empty: relax two-sided neighbor balancing to only the immediate predecessor (previousSegmentId).
 * 4. If empty: relax base name deduplication (allow different variants of the same base exercise).
 * 5. If empty: relax muscle balancing entirely on basePool (allow repeating previous segment).
 * 6. If empty: allow repeating exercises used on other stations (ignoreUsed = true).
 * 7. If empty and !isStrictDifficulty: combine loosened difficulty + ignoreUsed.
 * 8. Pool exhausted -> returns empty pool for conflict handling.
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
    excludedSegmentIds,
    usedBaseNames,
  } = params;

  // Step 1: Base query with current range and strict two-sided balancing & base name deduplication
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

  const balancedBase = filterBySegmentBalancing(basePool, {
    previousExercise,
    previousSegmentId,
    excludedSegmentIds,
    usedBaseNames,
    softFallback: false,
  });

  if (balancedBase.length > 0) {
    return {
      pool: balancedBase,
      loosenedDifficulty: false,
      ignoredUsed: false,
      relaxedBalancing: false,
    };
  }

  // Step 2: Loosen difficulty by 1 level while strictly preserving neighbor & base name protection
  let loosenedPool: Exercise[] = [];
  if (!isStrictDifficulty) {
    const loosenedRange = getLoosenedRange(currentRange);
    loosenedPool = getValidExercisesForZone(
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

    const balancedLoosened = filterBySegmentBalancing(loosenedPool, {
      previousExercise,
      previousSegmentId,
      excludedSegmentIds,
      usedBaseNames,
      softFallback: false,
    });

    if (balancedLoosened.length > 0) {
      return {
        pool: balancedLoosened,
        loosenedDifficulty: true,
        ignoredUsed: false,
        relaxedBalancing: false,
      };
    }
  }

  // Step 3: Partially relax neighbor balancing (only exclude immediate predecessor, not both neighbors)
  if (excludedSegmentIds) {
    const partiallyBalancedBase = filterBySegmentBalancing(basePool, {
      previousExercise,
      previousSegmentId,
      usedBaseNames,
      softFallback: false,
    });

    if (partiallyBalancedBase.length > 0) {
      return {
        pool: partiallyBalancedBase,
        loosenedDifficulty: false,
        ignoredUsed: false,
        relaxedBalancing: true,
      };
    }

    if (!isStrictDifficulty && loosenedPool.length > 0) {
      const partiallyBalancedLoosened = filterBySegmentBalancing(loosenedPool, {
        previousExercise,
        previousSegmentId,
        usedBaseNames,
        softFallback: false,
      });

      if (partiallyBalancedLoosened.length > 0) {
        return {
          pool: partiallyBalancedLoosened,
          loosenedDifficulty: true,
          ignoredUsed: false,
          relaxedBalancing: true,
        };
      }
    }
  }

  // Step 4: Relax base name deduplication (allow different variant of the same base name, still avoiding predecessor)
  if (usedBaseNames && usedBaseNames.size > 0) {
    const nameRelaxedBase = filterBySegmentBalancing(basePool, {
      previousExercise,
      previousSegmentId,
      softFallback: false,
    });

    if (nameRelaxedBase.length > 0) {
      return {
        pool: nameRelaxedBase,
        loosenedDifficulty: false,
        ignoredUsed: false,
        relaxedBalancing: true,
      };
    }
  }

  // Step 5: Relax muscle balancing entirely (if basePool had exercises before segment balancing)
  if (basePool.length > 0) {
    return {
      pool: basePool,
      loosenedDifficulty: false,
      ignoredUsed: false,
      relaxedBalancing: true,
    };
  }

  // Step 6: Allow duplicate exercises from other stations (ignoreUsed = true)
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
    const balancedReused = filterBySegmentBalancing(reusedPool, {
      previousExercise,
      previousSegmentId,
      softFallback: false,
    });
    return {
      pool: balancedReused.length > 0 ? balancedReused : reusedPool,
      loosenedDifficulty: false,
      ignoredUsed: true,
      relaxedBalancing: balancedReused.length === 0,
    };
  }

  // Step 7: Combine duplicate exercises + loosened difficulty (if not strict)
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

  // Step 8: Fully exhausted
  return {
    pool: [],
    loosenedDifficulty: false,
    ignoredUsed: false,
    relaxedBalancing: false,
  };
};
