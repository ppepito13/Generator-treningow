import { describe, it, expect } from 'vitest';
import { applyCascadeFallback } from '@/domain/generator/cascadeFallback';
import type { Exercise, Zone, RoomConfig } from '@/app/lib/data';

const mockZone: Zone = {
  id: 'z-rig',
  nazwa: 'Klatka RIG',
  typ: 'stala',
  pojemnosc_stacji: 2,
  bazowa_pojemnosc_stacji: 2,
};

const mockRoom: RoomConfig = {
  id_sali: 'room-test',
  nazwa_sali: 'Sala Testowa',
  tryb_treningu: 'obwodowy',
  maksymalna_pojemnosc: { osoby: 20, stacje: 10 },
  strefy: [mockZone],
  inwentarz: {},
};

const makeEx = (overrides: Partial<Exercise>): Exercise => ({
  id_cwiczenia: 'ex-1',
  nazwa: 'Test Exercise',
  wariant: '',
  segment_id: 1,
  segment_nazwa: 'PULL',
  tryb_pracy: 'Solo',
  poziom: 3,
  biomechanika: 'pull',
  glowne_partie: ['Plecy'],
  zaangazowane_miesnie: 'najszerszy',
  tagi_specjalne: [],
  kategorie_treningu: ['all'],
  instrukcja: '',
  ...overrides,
});

describe('cascadeFallback', () => {
  it('Step 1: selects candidate adhering to both neighbor exclusions and unique base name at base range', () => {
    const exercises: Exercise[] = [
      makeEx({ id_cwiczenia: 'e1', nazwa: 'Podciąganie klasyczne (Nachwyt)', segment_id: 1, poziom: 3 }),
      makeEx({ id_cwiczenia: 'e2', nazwa: 'Pompki na poręczach (Dips)', segment_id: 2, poziom: 3 }),
      makeEx({ id_cwiczenia: 'e3', nazwa: 'Przysiady bułgarskie', segment_id: 3, poziom: 3 }),
    ];

    const result = applyCascadeFallback({
      zone: mockZone,
      baseRange: { min: 3, max: 3 },
      currentRange: { min: 3, max: 3 },
      usedIds: new Set(),
      isThisStationPair: false,
      currentRoom: mockRoom,
      allExercisesSource: exercises,
      isStrictDifficulty: false,
      excludedSegmentIds: new Set([1]), // exclude PULL
      usedBaseNames: new Set(['pompki na poręczach']), // exclude dips base name
    });

    expect(result.pool.map(e => e.id_cwiczenia)).toEqual(['e3']);
    expect(result.loosenedDifficulty).toBe(false);
    expect(result.relaxedBalancing).toBe(false);
  });

  it('Step 2: loosens difficulty before relaxing neighbor balancing when isStrictDifficulty is false', () => {
    // At level 3, only PULL (segment 1) is available.
    // At level 2 (loosened), PUSH (segment 2) is available!
    const exercises: Exercise[] = [
      makeEx({ id_cwiczenia: 'e-pull-3', nazwa: 'Podciąganie siłowe', segment_id: 1, poziom: 3 }),
      makeEx({ id_cwiczenia: 'e-push-2', nazwa: 'Pompki klasyczne', segment_id: 2, poziom: 2 }),
    ];

    const result = applyCascadeFallback({
      zone: mockZone,
      baseRange: { min: 3, max: 3 },
      currentRange: { min: 3, max: 3 },
      usedIds: new Set(),
      isThisStationPair: false,
      currentRoom: mockRoom,
      allExercisesSource: exercises,
      isStrictDifficulty: false,
      excludedSegmentIds: new Set([1]), // PULL is excluded
      previousSegmentId: 1,
    });

    // Should choose loosened PUSH (level 2) rather than repeating PULL (level 3)!
    expect(result.pool.map(e => e.id_cwiczenia)).toEqual(['e-push-2']);
    expect(result.loosenedDifficulty).toBe(true);
    expect(result.relaxedBalancing).toBe(false);
  });

  it('Step 3: relaxes neighbor balancing instead of loosening difficulty when isStrictDifficulty is true', () => {
    const exercises: Exercise[] = [
      makeEx({ id_cwiczenia: 'e-pull-3', nazwa: 'Podciąganie siłowe', segment_id: 1, poziom: 3 }),
      makeEx({ id_cwiczenia: 'e-push-2', nazwa: 'Pompki klasyczne', segment_id: 2, poziom: 2 }),
    ];

    const result = applyCascadeFallback({
      zone: mockZone,
      baseRange: { min: 3, max: 3 },
      currentRange: { min: 3, max: 3 },
      usedIds: new Set(),
      isThisStationPair: false,
      currentRoom: mockRoom,
      allExercisesSource: exercises,
      isStrictDifficulty: true, // strict! Cannot loosen to level 2!
      excludedSegmentIds: new Set([1]),
      previousSegmentId: 1,
    });

    // Cannot loosen to level 2, so it falls back to relaxing balancing at level 3
    expect(result.pool.map(e => e.id_cwiczenia)).toEqual(['e-pull-3']);
    expect(result.loosenedDifficulty).toBe(false);
    expect(result.relaxedBalancing).toBe(true);
  });

  it('Step 4: relaxes base name deduplication if no other exercise exists', () => {
    const exercises: Exercise[] = [
      makeEx({ id_cwiczenia: 'e-pull-podchwyt', nazwa: 'Podciąganie klasyczne (Podchwyt)', segment_id: 1, poziom: 3 }),
    ];

    const result = applyCascadeFallback({
      zone: mockZone,
      baseRange: { min: 3, max: 3 },
      currentRange: { min: 3, max: 3 },
      usedIds: new Set(),
      isThisStationPair: false,
      currentRoom: mockRoom,
      allExercisesSource: exercises,
      isStrictDifficulty: true,
      excludedSegmentIds: new Set([2]), // neighbor is PUSH, so PULL is allowed
      previousSegmentId: 2,
      usedBaseNames: new Set(['podciąganie klasyczne']), // already used elsewhere
    });

    // Since it's the only exercise, Step 4 relaxes usedBaseNames
    expect(result.pool.map(e => e.id_cwiczenia)).toEqual(['e-pull-podchwyt']);
    expect(result.relaxedBalancing).toBe(true);
  });
});
