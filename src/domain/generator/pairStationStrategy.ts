import type { Exercise, RoomConfig } from '@/app/lib/data';
import type { DifficultyRange, RandomFn } from './types';
import { ensureEquipment, canExerciseBeShared } from './equipmentRules';

/**
 * Produces a virtual copy of the gym inventory with equipment
 * reserved for `exercise` deducted.
 */
export const deductEquipment = (
  inventory: Record<string, number>,
  exercise: Exercise
): Record<string, number> => {
  const virtual = { ...inventory };
  if (!exercise.wymagania_sprzetowe || exercise.wymagania_sprzetowe.length === 0) {
    return virtual;
  }

  exercise.wymagania_sprzetowe.forEach(rule => {
    // If it's a single requirement object, deduct 1 unit per item
    if (!Array.isArray(rule)) {
      Object.entries(rule).forEach(([itemKey, qty]) => {
        virtual[itemKey] = Math.max(0, (virtual[itemKey] || 0) - qty);
      });
    } else if (rule.length > 0) {
      // For alternative (OR) choices, deduct from the first alternative that gym actually has
      const chosenAlt = rule.find(alt =>
        Object.entries(alt).every(([k, q]) => (virtual[k] || 0) >= q)
      ) || rule[0];

      Object.entries(chosenAlt).forEach(([itemKey, qty]) => {
        virtual[itemKey] = Math.max(0, (virtual[itemKey] || 0) - qty);
      });
    }
  });

  return virtual;
};

export interface ResolvePairParams {
  exerciseA: Exercise;
  candidatesSource: Exercise[];
  currentRoom: RoomConfig;
  diffRange: DifficultyRange;
  usedIds: Set<string>;
  category?: string;
  hasFlagAlready?: boolean;
  segmentId?: number;
  randomFn?: RandomFn;
}

/**
 * Resolves exerciseB for a double station (2 participants).
 *
 * Rules:
 * 1. Dedicated pair exercises (`tryb_pracy: "W_Parze"`) are performed together -> exB = exA.
 * 2. If room inventory supports 2 people doing exA concurrently -> exB = exA.
 * 3. If room inventory only supports 1 person for exA:
 *    - Selects a twin exercise exB with `tryb_pracy: "Solo"` (never a pair exercise).
 *    - Matches the muscle group or movement segment of exA.
 *    - Validates equipment availability against the inventory minus exA's reserved equipment.
 */
export const resolvePairStationExercise = (params: ResolvePairParams): Exercise => {
  const {
    exerciseA,
    candidatesSource,
    currentRoom,
    diffRange,
    usedIds,
    category = 'all',
    hasFlagAlready = false,
    segmentId,
    randomFn = Math.random,
  } = params;

  // 1. Dedicated pair exercise -> always performed together
  if (exerciseA.tryb_pracy === 'W_Parze') {
    return exerciseA;
  }

  // 2. Both participants can do the same solo exercise concurrently
  if (canExerciseBeShared(exerciseA, currentRoom)) {
    return exerciseA;
  }

  // 3. Equipment bottleneck -> select twin solo exercise with remaining virtual inventory
  const virtualInventory = deductEquipment(currentRoom.inwentarz, exerciseA);
  const virtualRoom: RoomConfig = {
    ...currentRoom,
    inwentarz: virtualInventory,
  };

  const matchesFilter = (ex: Exercise, checkUsed: boolean): boolean => {
    if (ex.id_cwiczenia === exerciseA.id_cwiczenia) return false;
    if (checkUsed && usedIds.has(ex.id_cwiczenia)) return false;
    if (ex.tryb_pracy === 'W_Parze' || ex.segment_id === 8) return false;

    // Difficulty level check
    const matchesLevel = ex.poziom === 0 || (ex.poziom >= diffRange.min && ex.poziom <= diffRange.max);
    if (!matchesLevel) return false;

    // Segment override (if passed)
    if (segmentId !== undefined && ex.segment_id !== segmentId) return false;

    // Category filter
    if (category !== 'all') {
      const matchCat = ex.kategorie_treningu?.some(
        c => c.toLowerCase() === 'all' || c.toLowerCase() === category.toLowerCase()
      );
      if (!matchCat) return false;
    }

    // Flag restriction
    if (hasFlagAlready && ex.nazwa.toLowerCase().includes('flaga')) {
      return false;
    }

    // Muscle or segment affinity with exerciseA
    const sharesMuscles =
      ex.glowne_partie?.includes('Wszystkie / Uniwersalne') ||
      ex.glowne_partie?.some(p => exerciseA.glowne_partie?.includes(p)) ||
      ex.segment_id === exerciseA.segment_id;

    if (!sharesMuscles) return false;

    // Inventory check against virtual room
    return ensureEquipment(ex, virtualRoom, 1);
  };

  // Primary attempt: exclude already used IDs
  let poolB = candidatesSource.filter(ex => matchesFilter(ex, true));

  // Fallback attempt: allow reusing exercises if pool is empty
  if (poolB.length === 0) {
    poolB = candidatesSource.filter(ex => matchesFilter(ex, false));
  }

  if (poolB.length === 0) {
    // If absolutely no candidate matches, fallback safely to exerciseA
    return exerciseA;
  }

  const chosenIndex = Math.floor(randomFn() * poolB.length);
  return poolB[chosenIndex] ?? exerciseA;
};

