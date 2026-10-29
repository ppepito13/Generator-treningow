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
 * Pure heuristic filtering candidates to avoid consecutive repetition of the same
 * movement segment (e.g. PULL after PULL, PUSH after PUSH).
 *
 * Special safeguard for partner exercises (segment_id: 8 or tryb_pracy: "W_Parze"):
 * Because partner exercises may span different anatomical muscles, the heuristic
 * also checks `glowne_partie` overlap with the previous exercise.
 *
 * If filtering leaves no candidates, it gracefully falls back to the original candidates list
 * so strict balancing never empties the pool prematurely.
 */
export const filterBySegmentBalancing = (
  candidates: Exercise[],
  previousExercise?: Exercise,
  previousSegmentId?: number
): Exercise[] => {
  if (candidates.length === 0) return [];
  if (!previousExercise && previousSegmentId === undefined) return candidates;

  const lastSegment = previousSegmentId ?? previousExercise?.segment_id;

  const balanced = candidates.filter(candidate => {
    // 1. Avoid repeating the exact same movement segment.
    if (lastSegment !== undefined && candidate.segment_id === lastSegment) {
      return false;
    }

    // 2. Partner safeguard: if previous was partner/pair or candidate is partner/pair,
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

  // Soft fallback: if balancing eliminates all options, keep the initial candidates pool.
  return balanced.length > 0 ? balanced : candidates;
};

