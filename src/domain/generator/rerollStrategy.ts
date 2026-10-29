import { ALL_EXERCISES } from '@/app/lib/data';
import type { Exercise, Station } from '@/app/lib/data';
import type { DifficultyRange, GenerationConflictData, RerollStrategyParams } from './types';
import { getValidExercisesForZone } from './exerciseFilter';
import { resolvePairStationExercise } from './pairStationStrategy';
import { getLoosenedRange } from './cascadeFallback';

export interface RerollSuccess {
  success: true;
  circuit: Station[];
}

export interface RerollFailure {
  success: false;
  conflict: GenerationConflictData;
}

export type RerollResult = RerollSuccess | RerollFailure;

/**
 * Pure strategy for rerolling an individual exercise (A or B) on a station.
 *
 * Preserves:
 * - Breather status for every 3rd station
 * - Flag uniqueness across the circuit
 * - Pair synchronization and twin exercise constraints
 * - Returns updated circuit or GenerationConflictData for UI modals
 */
export const rerollExerciseStrategy = (
  params: RerollStrategyParams & { mainDiff: { min_poziom: number; max_poziom: number } }
): RerollResult => {
  const {
    circuit,
    stationId,
    type,
    segmentId,
    loosen = false,
    ignoreUsed = false,
    currentRoom,
    mainDiff,
    isStrictDifficulty,
    category = 'all',
    allExercisesSource = ALL_EXERCISES,
    randomFn = Math.random,
  } = params;

  const stationIndex = circuit.findIndex(s => s.id === stationId);
  if (stationIndex === -1) {
    return {
      success: false,
      conflict: {
        type: 'reroll',
        requestedStations: 1,
        availableStations: 0,
        canLoosenDifficulty: false,
      },
    };
  }

  const station = circuit[stationIndex];

  // Collect IDs used on other stations
  const usedOnOtherStations = new Set<string>();
  circuit.forEach(s => {
    if (s.id !== stationId) {
      usedOnOtherStations.add(s.exerciseA.id_cwiczenia);
      if (s.exerciseB) usedOnOtherStations.add(s.exerciseB.id_cwiczenia);
    }
  });

  const currentAtStationIds = new Set<string>();
  currentAtStationIds.add(station.exerciseA.id_cwiczenia);
  if (station.exerciseB) currentAtStationIds.add(station.exerciseB.id_cwiczenia);

  const fullUsedIds = new Set([...usedOnOtherStations, ...currentAtStationIds]);

  const hasFlagAlready = circuit.some(
    s =>
      s.id !== stationId &&
      (s.exerciseA.nazwa.toLowerCase().includes('flaga') ||
        (s.exerciseB && s.exerciseB.nazwa.toLowerCase().includes('flaga')))
  );

  const isCurrentlyBreather = !isStrictDifficulty && (stationIndex + 1) % 3 === 0;
  let currentRange: DifficultyRange = {
    min: mainDiff.min_poziom,
    max: mainDiff.max_poziom,
  };

  if (isCurrentlyBreather) {
    currentRange = {
      min: Math.max(1, mainDiff.min_poziom - 2),
      max: Math.max(1, mainDiff.min_poziom - 1),
    };
  }

  let searchRange = { ...currentRange };
  if (loosen && !isStrictDifficulty) {
    searchRange = getLoosenedRange(currentRange);
  }

  if (type === 'A') {
    // Primary query for Exercise A
    let pool = getValidExercisesForZone(
      station.zone,
      searchRange,
      fullUsedIds,
      station.isPair,
      currentRoom,
      segmentId,
      ignoreUsed,
      hasFlagAlready,
      category,
      1,
      allExercisesSource
    );

    // Fallback 1: Allow duplicates from other stations, but exclude current
    if (pool.length === 0) {
      pool = getValidExercisesForZone(
        station.zone,
        searchRange,
        currentAtStationIds,
        station.isPair,
        currentRoom,
        segmentId,
        true,
        hasFlagAlready,
        category,
        1,
        allExercisesSource
      );
    }

    // Fallback 2: Revert to base range if searchRange was loosened/shifted
    if (pool.length === 0 && searchRange !== currentRange) {
      pool = getValidExercisesForZone(
        station.zone,
        currentRange,
        currentAtStationIds,
        station.isPair,
        currentRoom,
        segmentId,
        true,
        hasFlagAlready,
        category,
        1,
        allExercisesSource
      );
    }

    if (pool.length === 0) {
      const dryLoosenRange = getLoosenedRange(currentRange);
      const dryPool = getValidExercisesForZone(
        station.zone,
        dryLoosenRange,
        currentAtStationIds,
        station.isPair,
        currentRoom,
        segmentId,
        true,
        hasFlagAlready,
        category,
        1,
        allExercisesSource
      );

      return {
        success: false,
        conflict: {
          type: 'reroll',
          requestedStations: 1,
          availableStations: 0,
          canLoosenDifficulty: !isStrictDifficulty && dryPool.length > 0,
          contextData: { action: 'reroll', stationId, paramType: type, segmentId },
        },
      };
    }

    const newExA = pool[Math.floor(randomFn() * pool.length)];

    let newExB: Exercise | undefined = undefined;
    if (station.isPair) {
      newExB = resolvePairStationExercise({
        exerciseA: newExA,
        candidatesSource: allExercisesSource,
        currentRoom,
        diffRange: currentRange,
        usedIds: usedOnOtherStations,
        category,
        hasFlagAlready,
        segmentId,
        randomFn,
      });
    }

    const newCircuit = [...circuit];
    newCircuit[stationIndex] = {
      ...station,
      exerciseA: newExA,
      exerciseB: newExB,
    };

    return {
      success: true,
      circuit: newCircuit,
    };
  }

  // type === 'B'
  if (station.isPair) {
    const newExB = resolvePairStationExercise({
      exerciseA: station.exerciseA,
      candidatesSource: allExercisesSource,
      currentRoom,
      diffRange: searchRange,
      usedIds: fullUsedIds,
      category,
      hasFlagAlready,
      segmentId,
      randomFn,
    });

    if (newExB.id_cwiczenia === station.exerciseA.id_cwiczenia && station.exerciseB && station.exerciseB.id_cwiczenia !== station.exerciseA.id_cwiczenia) {
      // Could not find a distinct twin exercise
      return {
        success: false,
        conflict: {
          type: 'reroll',
          requestedStations: 1,
          availableStations: 0,
          canLoosenDifficulty: !isStrictDifficulty,
          contextData: { action: 'reroll', stationId, paramType: type, segmentId },
        },
      };
    }

    const newCircuit = [...circuit];
    newCircuit[stationIndex] = {
      ...station,
      exerciseB: newExB,
    };

    return {
      success: true,
      circuit: newCircuit,
    };
  }

  return {
    success: true,
    circuit,
  };
};
