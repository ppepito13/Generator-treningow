import { describe, it, expect } from 'vitest';
import { deductEquipment, resolvePairStationExercise } from '@/domain/generator/pairStationStrategy';
import type { Exercise, RoomConfig } from '@/app/lib/data';

const makeEx = (overrides: Partial<Exercise>): Exercise => ({
  id_cwiczenia: 'ex-1',
  nazwa: 'Dipy na poręczach',
  wariant: '',
  segment_id: 2,
  segment_nazwa: 'PUSH',
  tryb_pracy: 'Solo',
  poziom: 3,
  biomechanika: 'push',
  glowne_partie: ['Klatka piersiowa', 'Triceps'],
  zaangazowane_miesnie: 'klatka, triceps',
  tagi_specjalne: [],
  kategorie_treningu: ['Siła'],
  instrukcja: '',
  ...overrides,
});

const makeRoom = (inventory: Record<string, number> = {}): RoomConfig => ({
  id_sali: 'test-room',
  nazwa_sali: 'Test Room',
  tryb_treningu: 'obwodowy',
  maksymalna_pojemnosc: { osoby: 12, stacje: 8 },
  strefy: [],
  inwentarz: inventory,
});

describe('pairStationStrategy', () => {
  describe('deductEquipment', () => {
    it('subtracts simple equipment requirements correctly', () => {
      const ex = makeEx({
        wymagania_sprzetowe: [{ drazek: 1, kolka: 1 }],
      });
      const inventory = { drazek: 2, kolka: 1, mata: 5 };
      const virtual = deductEquipment(inventory, ex);

      expect(virtual).toEqual({ drazek: 1, kolka: 0, mata: 5 });
    });

    it('does not drop below 0', () => {
      const ex = makeEx({
        wymagania_sprzetowe: [{ hantle_10kg: 2 }],
      });
      const inventory = { hantle_10kg: 1 };
      const virtual = deductEquipment(inventory, ex);

      expect(virtual.hantle_10kg).toBe(0);
    });

    it('handles OR-arrays by deducting from the available alternative', () => {
      const ex = makeEx({
        wymagania_sprzetowe: [[{ porecze_stacjonarne: 1 }, { porecze_do_dipow: 1 }]],
      });
      const inventory = { porecze_do_dipow: 1 };
      const virtual = deductEquipment(inventory, ex);

      expect(virtual.porecze_do_dipow).toBe(0);
    });
  });

  describe('resolvePairStationExercise', () => {
    it('returns exA when exA is a dedicated partner exercise (W_Parze)', () => {
      const partnerEx = makeEx({
        id_cwiczenia: 'partner-ex',
        tryb_pracy: 'W_Parze',
        segment_id: 8,
      });
      const room = makeRoom();

      const result = resolvePairStationExercise({
        exerciseA: partnerEx,
        candidatesSource: [partnerEx],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['partner-ex']),
      });

      expect(result).toBe(partnerEx);
    });

    it('returns exA when gym has enough equipment for 2 people', () => {
      const exA = makeEx({
        id_cwiczenia: 'ex-dips',
        wymagania_sprzetowe: [{ porecze_do_dipow: 1 }],
      });
      // Gym has 2 dip bars -> both can do the same exercise
      const room = makeRoom({ porecze_do_dipow: 2 });

      const result = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: [exA],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['ex-dips']),
      });

      expect(result).toBe(exA);
    });

    it('selects a twin solo exercise when equipment is limited to 1 person', () => {
      const exA = makeEx({
        id_cwiczenia: 'ex-dips',
        wymagania_sprzetowe: [{ porecze_do_dipow: 1 }],
        glowne_partie: ['Klatka piersiowa'],
      });
      const twinExB = makeEx({
        id_cwiczenia: 'ex-pushups',
        nazwa: 'Pompki na macie',
        wymagania_sprzetowe: [{ mata: 1 }],
        glowne_partie: ['Klatka piersiowa'],
      });
      const room = makeRoom({ porecze_do_dipow: 1, mata: 2 });

      const result = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: [exA, twinExB],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['ex-dips']),
      });

      expect(result.id_cwiczenia).toBe('ex-pushups');
    });

    it('prevents twin exercise from stealing exA reserved equipment', () => {
      const exA = makeEx({
        id_cwiczenia: 'ex-rings-dip',
        wymagania_sprzetowe: [{ kolka_gimnastyczne: 1 }],
        glowne_partie: ['Klatka piersiowa'],
      });
      const ringsPushup = makeEx({
        id_cwiczenia: 'ex-rings-pushup',
        wymagania_sprzetowe: [{ kolka_gimnastyczne: 1 }],
        glowne_partie: ['Klatka piersiowa'],
      });
      const floorPushup = makeEx({
        id_cwiczenia: 'ex-floor-pushup',
        wymagania_sprzetowe: [],
        glowne_partie: ['Klatka piersiowa'],
      });

      // Only 1 set of rings in room
      const room = makeRoom({ kolka_gimnastyczne: 1 });

      const result = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: [exA, ringsPushup, floorPushup],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['ex-rings-dip']),
      });

      // ringsPushup cannot be chosen because exA took the only rings
      expect(result.id_cwiczenia).toBe('ex-floor-pushup');
    });

    it('never selects an exercise with tryb_pracy: "W_Parze" as twin exercise B', () => {
      const exA = makeEx({
        id_cwiczenia: 'ex-dips',
        wymagania_sprzetowe: [{ porecze: 1 }],
        glowne_partie: ['Klatka piersiowa'],
      });
      const partnerCandidate = makeEx({
        id_cwiczenia: 'ex-partner-pushups',
        tryb_pracy: 'W_Parze',
        segment_id: 8,
        glowne_partie: ['Klatka piersiowa'],
      });
      const soloCandidate = makeEx({
        id_cwiczenia: 'ex-solo-pushups',
        tryb_pracy: 'Solo',
        glowne_partie: ['Klatka piersiowa'],
      });
      const room = makeRoom({ porecze: 1 });

      const result = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: [exA, partnerCandidate, soloCandidate],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['ex-dips']),
      });

      expect(result.id_cwiczenia).toBe('ex-solo-pushups');
    });

    it('uses injected randomFn for deterministic selection', () => {
      const exA = makeEx({ id_cwiczenia: 'exA', wymagania_sprzetowe: [{ rig: 1 }] });
      const b1 = makeEx({ id_cwiczenia: 'b1', glowne_partie: exA.glowne_partie });
      const b2 = makeEx({ id_cwiczenia: 'b2', glowne_partie: exA.glowne_partie });
      const room = makeRoom({ rig: 1 });

      const result = resolvePairStationExercise({
        exerciseA: exA,
        candidatesSource: [exA, b1, b2],
        currentRoom: room,
        diffRange: { min: 1, max: 5 },
        usedIds: new Set(['exA']),
        randomFn: () => 0.99, // picks last item (b2)
      });

      expect(result.id_cwiczenia).toBe('b2');
    });
  });
});
