import { ALL_EXERCISES } from '@/app/lib/data';
import type { Exercise, Station, Zone } from '@/app/lib/data';
import type { SynchronizedStrategyParams, GenerationResult, DifficultyRange } from './types';
import { getValidExercisesForZone } from './exerciseFilter';
import { filterBySegmentBalancing, normalizeExerciseBaseName } from './muscleBalancing';
import { getLoosenedRange } from './cascadeFallback';

/**
 * Pure strategy for generating a synchronized (group-wide) workout (e.g. Astoria room).
 * All participants perform the same exercise simultaneously in the main zone.
 *
 * Enforces:
 * - Equipment availability for all `participants` concurrently
 * - Movement segment and muscle balancing between consecutive stations/rounds
 * - Base name deduplication across rounds
 * - Difficulty range constraints and safe fallback
 * - Return of pure GenerationResult (success or failure)
 * - Deterministic random injection (randomFn)
 */
export const generateSynchronizedStrategy = (
  params: SynchronizedStrategyParams
): GenerationResult => {
  const {
    currentRoom,
    mainDiff,
    participants,
    stationCount,
    isStrictDifficulty,
    loosenDifficultyFlag = false,
    ignoreUsedFlag = false,
    category = 'all',
    allExercisesSource = ALL_EXERCISES,
    randomFn = Math.random,
  } = params;

  const generated: Station[] = [];
  const usedIds = new Set<string>();
  const usedBaseNames = new Set<string>();

  const mainZone: Zone = currentRoom.strefy[0] || {
    id: 'FBW_Virtual',
    nazwa: 'Przestrzeń FBW',
    typ: 'elastyczny',
    pojemnosc_stacji: participants,
    bazowa_pojemnosc_stacji: participants,
  };

  const baseRange: DifficultyRange = {
    min: mainDiff.min_poziom,
    max: mainDiff.max_poziom,
  };

  let activeRange = baseRange;
  if (loosenDifficultyFlag && !isStrictDifficulty) {
    activeRange = getLoosenedRange(baseRange);
  }

  let previousExercise: Exercise | undefined = undefined;
  let previousSegmentId: number | undefined = undefined;

  for (let idx = 0; idx < stationCount; idx++) {
    // 1. Primary query with active range
    let pool = getValidExercisesForZone(
      mainZone,
      activeRange,
      usedIds,
      false,
      currentRoom,
      undefined,
      ignoreUsedFlag,
      false,
      category,
      participants,
      allExercisesSource
    );

    // Apply segment balancing & base name deduplication
    let balanced = filterBySegmentBalancing(pool, {
      previousExercise,
      previousSegmentId,
      usedBaseNames,
      softFallback: false,
    });

    // 2. Fallback: if loosened query failed, try reverting to baseRange
    if (balanced.length === 0 && activeRange !== baseRange) {
      pool = getValidExercisesForZone(
        mainZone,
        baseRange,
        usedIds,
        false,
        currentRoom,
        undefined,
        ignoreUsedFlag,
        false,
        category,
        participants,
        allExercisesSource
      );
      balanced = filterBySegmentBalancing(pool, {
        previousExercise,
        previousSegmentId,
        usedBaseNames,
        softFallback: false,
      });
    }

    // 3. Fallback: relax base name deduplication if exhausted
    if (balanced.length === 0) {
      balanced = filterBySegmentBalancing(pool, {
        previousExercise,
        previousSegmentId,
        softFallback: false,
      });
    }

    // 4. Fallback: allow repeating used exercises if completely exhausted
    if (balanced.length === 0 && !ignoreUsedFlag) {
      pool = getValidExercisesForZone(
        mainZone,
        baseRange,
        usedIds,
        false,
        currentRoom,
        undefined,
        true,
        false,
        category,
        participants,
        allExercisesSource
      );
      balanced = filterBySegmentBalancing(pool, {
        previousExercise,
        previousSegmentId,
        softFallback: false,
      });
    }

    const finalPool = balanced.length > 0 ? balanced : pool;

    if (finalPool.length === 0) {
      return {
        success: false,
        conflict: {
          type: 'generate',
          requestedStations: stationCount,
          availableStations: generated.length,
          canLoosenDifficulty: !isStrictDifficulty,
          partialStations: [...generated],
        },
      };
    }

    const exA = finalPool[Math.floor(randomFn() * finalPool.length)];
    usedIds.add(exA.id_cwiczenia);
    usedBaseNames.add(normalizeExerciseBaseName(exA.nazwa));

    generated.push({
      id: `sync-${idx}-${Date.now()}-${randomFn().toString(36).substring(2, 7)}`,
      zone: mainZone,
      exerciseA: exA,
      isPair: false,
    });

    previousExercise = exA;
    previousSegmentId = exA.segment_id;
  }

  return {
    success: true,
    stations: generated,
  };
};
