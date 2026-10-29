import { describe, it, expect } from 'vitest';
import {
  generateCircuitStrategy,
  generateSynchronizedStrategy,
  rerollExerciseStrategy,
} from '@/domain/generator';
import type { Exercise, RoomConfig, DifficultyLevel } from '@/app/lib/data';

const makeDiff = (min: number, max: number): DifficultyLevel => ({
  id: 'test_diff',
  nazwa_grupy: 'Test Diff',
  min_poziom: min,
  max_poziom: max,
  charakterystyka_biomechaniczna: '',
  przyklady_z_bazy: '',
  logika_algorytmu: '',
});

const makeEx = (overrides: Partial<Exercise>): Exercise => ({
  id_cwiczenia: 'ex-1',
  nazwa: 'Test Ex',
  wariant: '',
  segment_id: 1,
  segment_nazwa: 'PULL',
  tryb_pracy: 'Solo',
  poziom: 3,
  biomechanika: 'pull',
  glowne_partie: ['Plecy'],
  zaangazowane_miesnie: 'biceps',
  tagi_specjalne: [],
  kategorie_treningu: ['Siła'],
  instrukcja: '',
  ...overrides,
});

const makeRoom = (overrides: Partial<RoomConfig> = {}): RoomConfig => ({
  id_sali: 'room-1',
  nazwa_sali: 'Test Room',
  tryb_treningu: 'obwodowy',
  maksymalna_pojemnosc: { osoby: 12, stacje: 8 },
  strefy: [
    {
      id: 'z-elastic',
      nazwa: 'Strefa Podłogowa',
      typ: 'elastyczny',
      pojemnosc_stacji: 5,
      bazowa_pojemnosc_stacji: 5,
      kolejnosc_sortowania: 1,
    },
    {
      id: 'z-rig',
      nazwa: 'Klatka RIG',
      typ: 'klatka_rig',
      pojemnosc_stacji: 2,
      kolejnosc_sortowania: 2,
    },
  ],
  inwentarz: { drazek: 4, mata: 10, porecze: 2 },
  ...overrides,
});

describe('generatorStrategies', () => {
  describe('generateCircuitStrategy', () => {
    it('generates the exact requested number of stations', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', segment_id: 1, segment_nazwa: 'PULL', poziom: 3 }),
        makeEx({ id_cwiczenia: 'e2', segment_id: 2, segment_nazwa: 'PUSH', poziom: 3 }),
        makeEx({ id_cwiczenia: 'e3', segment_id: 3, segment_nazwa: 'LEGS', poziom: 3 }),
        makeEx({ id_cwiczenia: 'e4', segment_id: 4, segment_nazwa: 'CORE', poziom: 2 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 4,
        stationCount: 4,
        isStrictDifficulty: false,
        allExercisesSource: exercises,
        randomFn: () => 0.1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations).toHaveLength(4);
      }
    });

    it('enforces breather difficulty drop every 3rd station when not strict', () => {
      const room = makeRoom();
      const diff = makeDiff(5, 6);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', segment_id: 1, poziom: 5 }),
        makeEx({ id_cwiczenia: 'e2', segment_id: 2, poziom: 5 }),
        // Breather exercise (level 3 or 4)
        makeEx({ id_cwiczenia: 'e-breather', segment_id: 4, poziom: 3 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 3,
        stationCount: 3,
        isStrictDifficulty: false,
        allExercisesSource: exercises,
        randomFn: () => 0,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations[2].exerciseA.id_cwiczenia).toBe('e-breather');
      }
    });

    it('deduplicates base names across the circuit (no variants of the same base exercise)', () => {
      const room = makeRoom();
      const diff = makeDiff(3, 3);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', nazwa: 'Podciąganie klasyczne (Nachwyt)', segment_id: 1, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e2', nazwa: 'Pompki klasyczne', segment_id: 2, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e3', nazwa: 'Przysiady', segment_id: 3, poziom: 3 }),
        // Same base name as e1, but different ID and variant:
        makeEx({ id_cwiczenia: 'e4', nazwa: 'Podciąganie klasyczne (Podchwyt)', segment_id: 1, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e5', nazwa: 'Wznosy nóg w zwisie', segment_id: 4, poziom: 3 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 4,
        stationCount: 4,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
        randomFn: () => 0.1,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const baseNames = result.stations.map(s => s.exerciseA.nazwa.toLowerCase());
        const hasNachwyt = baseNames.some(n => n.includes('nachwyt'));
        const hasPodchwyt = baseNames.some(n => n.includes('podchwyt'));
        // Both variants MUST NOT appear in the same workout
        expect(hasNachwyt && hasPodchwyt).toBe(false);
      }
    });

    it('enforces circuit loopback (last station avoids segment of station 0)', () => {
      const room = makeRoom();
      const diff = makeDiff(3, 3);
      // Station 0: PUSH (2)
      // Station 1: PULL (1)
      // Station 2 (last): neighbor left is PULL (1), neighbor right in loop is PUSH (2).
      // Available candidate LEGS (3) should be chosen!
      const exercises = [
        makeEx({ id_cwiczenia: 'e-push', nazwa: 'Dips', segment_id: 2, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e-pull', nazwa: 'Pullups', segment_id: 1, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e-legs', nazwa: 'Squats', segment_id: 3, poziom: 3 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 3,
        stationCount: 3,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
        randomFn: () => 0,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations[0].exerciseA.segment_id).toBe(2); // PUSH
        expect(result.stations[1].exerciseA.segment_id).toBe(1); // PULL
        expect(result.stations[2].exerciseA.segment_id).toBe(3); // LEGS (neither 1 nor 2!)
      }
    });
  });

  describe('generateSynchronizedStrategy', () => {
    it('generates group-wide stations with isPair = false', () => {
      const room = makeRoom({
        inwentarz: { mata: 10 },
      });
      const diff = makeDiff(2, 4);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', segment_id: 1, poziom: 3, wymagania_sprzetowe: [{ mata: 1 }] }),
        makeEx({ id_cwiczenia: 'e2', segment_id: 2, poziom: 3, wymagania_sprzetowe: [{ mata: 1 }] }),
      ];

      const result = generateSynchronizedStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 6,
        stationCount: 2,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations).toHaveLength(2);
        expect(result.stations.every(s => !s.isPair)).toBe(true);
      }
    });
  });

  describe('rerollExerciseStrategy', () => {
    it('rerolls exercise A avoiding both left and right neighbors on automatic reroll', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      // Station 0: PULL (1)
      // Station 1: to be rerolled
      // Station 2: PUSH (2)
      const exPull = makeEx({ id_cwiczenia: 'ex-pull', nazwa: 'Podciąganie', poziom: 3, segment_id: 1 });
      const exOld = makeEx({ id_cwiczenia: 'ex-old', nazwa: 'Stare ćwiczenie', poziom: 3, segment_id: 4 });
      const exPush = makeEx({ id_cwiczenia: 'ex-push', nazwa: 'Dips', poziom: 3, segment_id: 2 });
      const exLegs = makeEx({ id_cwiczenia: 'ex-legs', nazwa: 'Przysiady', poziom: 3, segment_id: 3 });
      const exPullVariant = makeEx({ id_cwiczenia: 'ex-pull-2', nazwa: 'Podciąganie (Podchwyt)', poziom: 3, segment_id: 1 });

      const circuit = [
        { id: 'st-0', zone: room.strefy[0], exerciseA: exPull, isPair: false },
        { id: 'st-1', zone: room.strefy[0], exerciseA: exOld, isPair: false },
        { id: 'st-2', zone: room.strefy[0], exerciseA: exPush, isPair: false },
      ];

      const result = rerollExerciseStrategy({
        circuit,
        stationId: 'st-1',
        type: 'A',
        currentRoom: room,
        difficultyId: 'test_diff',
        mainDiff: diff,
        isStrictDifficulty: true,
        allExercisesSource: [exPull, exOld, exPush, exLegs, exPullVariant],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        // Must avoid PULL (st-0), PUSH (st-2), and base name 'podciąganie' -> only LEGS qualifies!
        expect(result.circuit[1].exerciseA.id_cwiczenia).toBe('ex-legs');
      }
    });

    it('honors user manual segment selection even if adjacent to neighbor', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      const exPull = makeEx({ id_cwiczenia: 'ex-pull', nazwa: 'Podciąganie', poziom: 3, segment_id: 1 });
      const exOld = makeEx({ id_cwiczenia: 'ex-old', nazwa: 'Stare ćwiczenie', poziom: 3, segment_id: 4 });
      const exPush = makeEx({ id_cwiczenia: 'ex-push', nazwa: 'Dips', poziom: 3, segment_id: 2 });
      const exPushPompki = makeEx({ id_cwiczenia: 'ex-pompki', nazwa: 'Pompki', poziom: 3, segment_id: 2 });

      const circuit = [
        { id: 'st-0', zone: room.strefy[0], exerciseA: exPush, isPair: false },
        { id: 'st-1', zone: room.strefy[0], exerciseA: exOld, isPair: false },
      ];

      // User explicitly requests segment 2 (PUSH) from menu:
      const result = rerollExerciseStrategy({
        circuit,
        stationId: 'st-1',
        type: 'A',
        segmentId: 2, // explicit choice
        currentRoom: room,
        difficultyId: 'test_diff',
        mainDiff: diff,
        isStrictDifficulty: true,
        allExercisesSource: [exPull, exOld, exPush, exPushPompki],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.circuit[1].exerciseA.id_cwiczenia).toBe('ex-pompki');
      }
    });
  });
});
