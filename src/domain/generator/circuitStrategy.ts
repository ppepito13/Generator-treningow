import { ALL_EXERCISES } from '@/app/lib/data';
import type { Exercise, Station } from '@/app/lib/data';
import type { CircuitStrategyParams, GenerationResult, DifficultyRange } from './types';
import { selectRoomZonesForCircuit } from './zoneSelector';
import { applyCascadeFallback, getLoosenedRange } from './cascadeFallback';
import { resolvePairStationExercise } from './pairStationStrategy';
import { normalizeExerciseBaseName } from './muscleBalancing';

const BREATHER_SEGMENTS = new Set([4, 7, 9]); // CORE, NEURO, MOBILITY

/**
 * Pure strategy for generating a circuit training workout.
 *
 * Enforces:
 * - Zone selection according to gym capacity and rig ordering
 * - Breather stations every 3rd station ((idx + 1) % 3 === 0)
 * - Strict vs standard difficulty behavior on breathers
 * - Movement segment and muscle balancing between adjacent stations and loopback (last -> first)
 * - Global base exercise name deduplication (usedBaseNames)
 * - Safe pair resolution with virtual inventory tracking
 * - Deterministic random injection (randomFn)
 */
export const generateCircuitStrategy = (params: CircuitStrategyParams): GenerationResult => {
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

  const numDoubleStations = participants - stationCount;
  const isPairMode = participants > stationCount;

  const selectedZones = selectRoomZonesForCircuit(
    currentRoom.strefy,
    stationCount,
    isPairMode
  );

  const generated: Station[] = [];
  const usedIds = ignoreUsedFlag ? new Set<string>() : new Set<string>();
  const usedBaseNames = ignoreUsedFlag ? new Set<string>() : new Set<string>();
  let hasFlagAlready = false;
  let previousExercise: Exercise | undefined = undefined;
  let previousSegmentId: number | undefined = undefined;

  for (let idx = 0; idx < selectedZones.length; idx++) {
    const zone = selectedZones[idx];
    const isThisStationPair = idx < numDoubleStations;
    const isBreather = (idx + 1) % 3 === 0;

    let currentRange: DifficultyRange = {
      min: mainDiff.min_poziom,
      max: mainDiff.max_poziom,
    };

    if (isBreather && !isStrictDifficulty) {
      currentRange = {
        min: Math.max(1, mainDiff.min_poziom - 2),
        max: Math.max(1, mainDiff.min_poziom - 1),
      };
    }

    if (loosenDifficultyFlag && !isStrictDifficulty) {
      currentRange = getLoosenedRange(currentRange);
    }

    // Two-sided neighbor exclusion:
    // Left neighbor = previousSegmentId.
    // If this is the last station in a multi-station circuit, right neighbor in the loop is station 0.
    const excludedSegmentIds = new Set<number>();
    if (previousSegmentId !== undefined) {
      excludedSegmentIds.add(previousSegmentId);
    }
    if (idx === selectedZones.length - 1 && generated.length > 0) {
      excludedSegmentIds.add(generated[0].exerciseA.segment_id);
    }

    const fallbackResult = applyCascadeFallback({
      zone,
      baseRange: { min: mainDiff.min_poziom, max: mainDiff.max_poziom },
      currentRange,
      usedIds,
      isThisStationPair,
      currentRoom,
      hasFlagAlready,
      category,
      participantsCount: 1, // Exercise A requires 1 person's equipment
      allExercisesSource,
      isStrictDifficulty,
      previousExercise,
      previousSegmentId,
      excludedSegmentIds,
      usedBaseNames,
    });

    let pool = fallbackResult.pool;

    // Strict mode breather preference: prioritize core/neuro/mobility without dropping difficulty level
    if (isBreather && isStrictDifficulty && pool.length > 0) {
      const breatherCandidates = pool.filter(ex => BREATHER_SEGMENTS.has(ex.segment_id));
      if (breatherCandidates.length > 0) {
        pool = breatherCandidates;
      }
    }

    if (pool.length === 0) {
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

    const exA = pool[Math.floor(randomFn() * pool.length)];
    usedIds.add(exA.id_cwiczenia);
    usedBaseNames.add(normalizeExerciseBaseName(exA.nazwa));
    if (exA.nazwa.toLowerCase().includes('flaga')) {
      hasFlagAlready = true;
    }

    let exB: Exercise | undefined = undefined;
    if (isThisStationPair) {
      exB = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: allExercisesSource,
        currentRoom,
        diffRange: currentRange,
        usedIds,
        category,
        hasFlagAlready,
        randomFn,
      });

      if (exB && exB.id_cwiczenia !== exA.id_cwiczenia) {
        usedIds.add(exB.id_cwiczenia);
        usedBaseNames.add(normalizeExerciseBaseName(exB.nazwa));
        if (exB.nazwa.toLowerCase().includes('flaga')) {
          hasFlagAlready = true;
        }
      }
    }

    generated.push({
      id: `st-${idx}-${Date.now()}-${randomFn().toString(36).substring(2, 7)}`,
      zone,
      exerciseA: exA,
      exerciseB: exB,
      isPair: isThisStationPair,
    });

    previousExercise = exA;
    previousSegmentId = exA.segment_id;
  }

  return {
    success: true,
    stations: generated,
  };
};
