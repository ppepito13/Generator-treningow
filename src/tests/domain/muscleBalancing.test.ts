import { describe, it, expect } from 'vitest';
import {
  filterBySegmentBalancing,
  hasOverlappingMuscles,
  normalizeExerciseBaseName,
} from '@/domain/generator/muscleBalancing';
import type { Exercise } from '@/app/lib/data';

const makeEx = (overrides: Partial<Exercise>): Exercise => ({
  id_cwiczenia: 'ex-1',
  nazwa: 'Test Exercise',
  wariant: '',
  segment_id: 1,
  segment_nazwa: 'PULL',
  tryb_pracy: 'Solo',
  poziom: 2,
  biomechanika: 'pull',
  glowne_partie: ['Plecy'],
  zaangazowane_miesnie: 'biceps, najszerszy',
  tagi_specjalne: [],
  kategorie_treningu: ['Siła'],
  instrukcja: '',
  ...overrides,
});

describe('muscleBalancing', () => {
  describe('normalizeExerciseBaseName', () => {
    it('removes parenthetical notes and trims lowercase', () => {
      expect(normalizeExerciseBaseName('Podciąganie klasyczne (Nachwyt)')).toBe('podciąganie klasyczne');
      expect(normalizeExerciseBaseName('Podciąganie klasyczne (Podchwyt)')).toBe('podciąganie klasyczne');
      expect(normalizeExerciseBaseName('Deska boczna (na przedramieniu)')).toBe('deska boczna');
    });

    it('collapses multiple spaces and cleans edges', () => {
      expect(normalizeExerciseBaseName('   Pompki   na   podwyższeniu   (Skrzynia)   ')).toBe('pompki na podwyższeniu');
    });

    it('leaves standard names intact', () => {
      expect(normalizeExerciseBaseName('Pompki klasyczne')).toBe('pompki klasyczne');
      expect(normalizeExerciseBaseName('Przysiady')).toBe('przysiady');
    });
  });

  describe('hasOverlappingMuscles', () => {
    it('detects common muscle groups', () => {
      const a = makeEx({ glowne_partie: ['Klatka piersiowa', 'Triceps'] });
      const b = makeEx({ glowne_partie: ['Barki', 'Klatka piersiowa'] });
      expect(hasOverlappingMuscles(a, b)).toBe(true);
    });

    it('returns false when muscle groups are completely disjoint', () => {
      const a = makeEx({ glowne_partie: ['Plecy'] });
      const b = makeEx({ glowne_partie: ['Nogi'] });
      expect(hasOverlappingMuscles(a, b)).toBe(false);
    });

    it('ignores generic wildcards like Full Body', () => {
      const a = makeEx({ glowne_partie: ['Full Body', 'Plecy'] });
      const b = makeEx({ glowne_partie: ['Full Body', 'Klatka piersiowa'] });
      expect(hasOverlappingMuscles(a, b)).toBe(false);
    });
  });

  describe('filterBySegmentBalancing', () => {
    it('returns all candidates when no previous context is provided', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 1 }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 2 }),
      ];
      expect(filterBySegmentBalancing(candidates)).toEqual(candidates);
    });

    it('filters out candidates with the same segment as previousSegmentId', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 1, segment_nazwa: 'PULL' }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 2, segment_nazwa: 'PUSH' }),
        makeEx({ id_cwiczenia: 'c3', segment_id: 3, segment_nazwa: 'LEGS' }),
      ];

      const result = filterBySegmentBalancing(candidates, undefined, 1);
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c2', 'c3']);
    });

    it('filters out candidates with the same segment as previousExercise', () => {
      const prev = makeEx({ id_cwiczenia: 'prev', segment_id: 2, segment_nazwa: 'PUSH' });
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 1 }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 2 }),
      ];

      const result = filterBySegmentBalancing(candidates, prev);
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c1']);
    });

    it('filters out both neighbors when excludedSegmentIds are passed', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c-pull', segment_id: 1, segment_nazwa: 'PULL' }),
        makeEx({ id_cwiczenia: 'c-push', segment_id: 2, segment_nazwa: 'PUSH' }),
        makeEx({ id_cwiczenia: 'c-legs', segment_id: 3, segment_nazwa: 'LEGS' }),
        makeEx({ id_cwiczenia: 'c-core', segment_id: 4, segment_nazwa: 'CORE' }),
      ];

      // Exclude left neighbor PULL (1) and right neighbor PUSH (2)
      const result = filterBySegmentBalancing(candidates, {
        excludedSegmentIds: new Set([1, 2]),
      });
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c-legs', 'c-core']);
    });

    it('filters out candidates sharing a normalized base name with usedBaseNames', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', nazwa: 'Podciąganie klasyczne (Podchwyt)', segment_id: 1 }),
        makeEx({ id_cwiczenia: 'c2', nazwa: 'Podciąganie australijskie', segment_id: 1 }),
      ];

      const usedBaseNames = new Set(['podciąganie klasyczne']);
      const result = filterBySegmentBalancing(candidates, { usedBaseNames });
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c2']);
    });

    it('applies partner safeguard when previous exercise was a partner exercise', () => {
      const prevPartner = makeEx({
        id_cwiczenia: 'partner-1',
        segment_id: 8,
        tryb_pracy: 'W_Parze',
        glowne_partie: ['Core'],
      });

      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 4, glowne_partie: ['Core'] }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 1, glowne_partie: ['Plecy'] }),
      ];

      const result = filterBySegmentBalancing(candidates, prevPartner);
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c2']);
    });

    it('applies partner safeguard when candidate is a partner exercise with overlapping muscles', () => {
      const prev = makeEx({
        id_cwiczenia: 'prev',
        segment_id: 2,
        tryb_pracy: 'Solo',
        glowne_partie: ['Klatka piersiowa'],
      });

      const candidates = [
        makeEx({
          id_cwiczenia: 'c-partner',
          segment_id: 8,
          tryb_pracy: 'W_Parze',
          glowne_partie: ['Klatka piersiowa', 'Barki'],
        }),
        makeEx({
          id_cwiczenia: 'c-legs',
          segment_id: 3,
          glowne_partie: ['Nogi'],
        }),
      ];

      const result = filterBySegmentBalancing(candidates, prev);
      expect(result.map(e => e.id_cwiczenia)).toEqual(['c-legs']);
    });

    it('returns original candidates as soft fallback if strict balancing leaves 0 options (default softFallback = true)', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 1 }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 1 }),
      ];

      const result = filterBySegmentBalancing(candidates, undefined, 1);
      expect(result).toEqual(candidates);
    });

    it('returns empty array when softFallback is false and no candidate passes balancing', () => {
      const candidates = [
        makeEx({ id_cwiczenia: 'c1', segment_id: 1 }),
        makeEx({ id_cwiczenia: 'c2', segment_id: 1 }),
      ];

      const result = filterBySegmentBalancing(candidates, {
        previousSegmentId: 1,
        softFallback: false,
      });
      expect(result).toEqual([]);
    });
  });
});
