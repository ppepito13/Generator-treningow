import type { Exercise } from '@/app/lib/data';

/**
 * Normalizes a list of muscle groups by ignoring wildcard/universal terms.
 */
const getSpecificMuscleGroups = (parties?: string[]): string[] => {
  if (!parties) return [];
  const genericTerms = new Set(['wszystkie / uniwersalne', 'full body', 'all']);
  return parties
    .map(p => p.trim())
    .filter(p => !genericTerms.has(p.toLowerCase()));
};

/**
 * Checks whether two exercises share any specific muscle groups.
 */
export const hasOverlappingMuscles = (exA: Exercise, exB: Exercise): boolean => {
  const musclesA = getSpecificMuscleGroups(exA.glowne_partie);
  const musclesB = new Set(getSpecificMuscleGroups(exB.glowne_partie).map(m => m.toLowerCase()));
  return musclesA.some(m => musclesB.has(m.toLowerCase()));
};

/**
 * Normalizes an exercise name to its core root name by removing parenthetical annotations,
 * extra whitespaces, and standardizing casing.
 * E.g.: "Podciąganie klasyczne (Nachwyt)" -> "podciąganie klasyczne"
 *       "Deska boczna (na przedramieniu)" -> "deska boczna"
 */
export const normalizeExerciseBaseName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export interface BalancingOptions {
  previousExercise?: Exercise;
  previousSegmentId?: number;
  excludedSegmentIds?: number[] | Set<number>;
  usedBaseNames?: Set<string>;
  softFallback?: boolean;
}

/**
 * Pure heuristic filtering candidates to avoid consecutive repetition of movement
 * segments (e.g. PULL after PULL, PUSH after PUSH) and duplicate base exercise names.
 *
 * Supports:
 * - Two-sided neighbor exclusion (`excludedSegmentIds`)
 * - Immediate predecessor segment avoidance (`previousSegmentId`)
 * - Global base name deduplication (`usedBaseNames`)
 * - Partner exercise muscle overlap safeguard
 * - Configurable soft fallback: if softFallback is false, returns empty array when no candidate
 *   meets strict balancing, allowing multi-stage cascade fallback to loosen difficulty first.
 */
export const filterBySegmentBalancing = (
  candidates: Exercise[],
  optionsOrPrevExercise?: Exercise | BalancingOptions,
  legacyPreviousSegmentId?: number,
  legacyExcludedSegmentIds?: number[] | Set<number>,
  legacyUsedBaseNames?: Set<string>,
  legacySoftFallback?: boolean
): Exercise[] => {
  if (candidates.length === 0) return [];

  let previousExercise: Exercise | undefined;
  let previousSegmentId: number | undefined;
  let excludedSegmentIds: Set<number> | undefined;
  let usedBaseNames: Set<string> | undefined;
  let softFallback = true;

  if (optionsOrPrevExercise && !('id_cwiczenia' in optionsOrPrevExercise)) {
    const opts = optionsOrPrevExercise as BalancingOptions;
    previousExercise = opts.previousExercise;
    previousSegmentId = opts.previousSegmentId;
    if (opts.excludedSegmentIds) {
      excludedSegmentIds = opts.excludedSegmentIds instanceof Set
        ? opts.excludedSegmentIds
        : new Set(opts.excludedSegmentIds);
    }
    usedBaseNames = opts.usedBaseNames;
    if (opts.softFallback !== undefined) {
      softFallback = opts.softFallback;
    }
  } else {
    previousExercise = optionsOrPrevExercise as Exercise | undefined;
    previousSegmentId = legacyPreviousSegmentId;
    if (legacyExcludedSegmentIds) {
      excludedSegmentIds = legacyExcludedSegmentIds instanceof Set
        ? legacyExcludedSegmentIds
        : new Set(legacyExcludedSegmentIds);
    }
    usedBaseNames = legacyUsedBaseNames;
    if (legacySoftFallback !== undefined) {
      softFallback = legacySoftFallback;
    }
  }

  const lastSegment = previousSegmentId ?? previousExercise?.segment_id;

  const balanced = candidates.filter(candidate => {
    // 1. Avoid repeating excluded segments (e.g. from both left & right neighbors)
    if (excludedSegmentIds && excludedSegmentIds.has(candidate.segment_id)) {
      return false;
    }

    // 2. Avoid repeating the immediate predecessor segment
    if (lastSegment !== undefined && candidate.segment_id === lastSegment) {
      return false;
    }

    // 3. Avoid repeating exercises sharing the same normalized base name in the circuit
    if (usedBaseNames && usedBaseNames.has(normalizeExerciseBaseName(candidate.nazwa))) {
      return false;
    }

    // 4. Partner safeguard: if previous was partner/pair or candidate is partner/pair,
    // prevent repeating identical main muscle groups.
    if (previousExercise) {
      const wasPartner = previousExercise.segment_id === 8 || previousExercise.tryb_pracy === 'W_Parze';
      const isPartner = candidate.segment_id === 8 || candidate.tryb_pracy === 'W_Parze';

      if ((wasPartner || isPartner) && hasOverlappingMuscles(candidate, previousExercise)) {
        return false;
      }
    }

    return true;
  });

  if (balanced.length > 0) return balanced;
  return softFallback ? candidates : [];
};
