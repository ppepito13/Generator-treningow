import { ALL_EXERCISES } from '@/app/lib/data';
import type { Exercise, Station } from '@/app/lib/data';
import type { DifficultyRange, GenerationConflictData, RerollStrategyParams } from './types';
import { getValidExercisesForZone } from './exerciseFilter';
import { resolvePairStationExercise } from './pairStationStrategy';
import { applyCascadeFallback, getLoosenedRange } from './cascadeFallback';
import { normalizeExerciseBaseName } from './muscleBalancing';

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
 * - Two-sided neighbor segment exclusion (prev and next in circuit loop) on automatic reroll
 * - Base exercise name deduplication against other stations in the circuit
 * - Unrestricted segment choice when user explicitly selects a segment from the menu
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
  const usedBaseNamesOnOtherStations = new Set<string>();
  circuit.forEach(s => {
    if (s.id !== stationId) {
      usedOnOtherStations.add(s.exerciseA.id_cwiczenia);
      usedBaseNamesOnOtherStations.add(normalizeExerciseBaseName(s.exerciseA.nazwa));
      if (s.exerciseB) {
        usedOnOtherStations.add(s.exerciseB.id_cwiczenia);
        usedBaseNamesOnOtherStations.add(normalizeExerciseBaseName(s.exerciseB.nazwa));
      }
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

  // Two-sided neighbor determination with circuit loopback
  const excludedSegmentIds = new Set<number>();
  let prevStationExercise: Exercise | undefined = undefined;
  if (circuit.length > 1) {
    const prevIndex = (stationIndex - 1 + circuit.length) % circuit.length;
    const nextIndex = (stationIndex + 1) % circuit.length;
    const prevStation = circuit[prevIndex];
    const nextStation = circuit[nextIndex];

    if (prevStation && prevStation.id !== stationId) {
      excludedSegmentIds.add(prevStation.exerciseA.segment_id);
      prevStationExercise = prevStation.exerciseA;
    }
    if (nextStation && nextStation.id !== stationId) {
      excludedSegmentIds.add(nextStation.exerciseA.segment_id);
    }
  }

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
    // When segmentId is undefined (user clicked "Losuj dowolne z bazy"):
    // apply two-sided neighbor exclusion and base name deduplication.
    // When segmentId is provided by user ("Wybierz segment..."):
    // honor the user's manual choice without neighbor segment exclusion.
    const fallbackResult = applyCascadeFallback({
      zone: station.zone,
      baseRange: { min: mainDiff.min_poziom, max: mainDiff.max_poziom },
      currentRange: searchRange,
      usedIds: ignoreUsed ? currentAtStationIds : fullUsedIds,
      isThisStationPair: station.isPair,
      currentRoom,
      segmentId,
      hasFlagAlready,
      category,
      participantsCount: 1,
      allExercisesSource,
      isStrictDifficulty,
      previousExercise: prevStationExercise,
      previousSegmentId: prevStationExercise?.segment_id,
      excludedSegmentIds: segmentId === undefined ? excludedSegmentIds : undefined,
      usedBaseNames: usedBaseNamesOnOtherStations,
    });

    const pool = fallbackResult.pool;

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
