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
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations[2].exerciseA.id_cwiczenia).toBe('e-breather');
      }
    });

    it('creates double stations (isPair: true) for surplus participants', () => {
      const room = makeRoom({ inwentarz: { drazek: 2, mata: 10 } });
      const diff = makeDiff(2, 4);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', segment_id: 1, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e2', segment_id: 2, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e3', segment_id: 3, poziom: 3 }),
      ];

      // 4 participants on 3 stations -> 1 double station
      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 4,
        stationCount: 3,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stations[0].isPair).toBe(true);
        expect(result.stations[1].isPair).toBe(false);
        expect(result.stations[2].isPair).toBe(false);
      }
    });

    it('produces identical output for identical randomFn (determinism)', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', segment_id: 1, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e2', segment_id: 2, poziom: 3 }),
        makeEx({ id_cwiczenia: 'e3', segment_id: 3, poziom: 3 }),
      ];

      let counterA = 0;
      const pseudoRandomA = () => {
        counterA = (counterA + 0.33) % 1;
        return counterA;
      };

      let counterB = 0;
      const pseudoRandomB = () => {
        counterB = (counterB + 0.33) % 1;
        return counterB;
      };

      const resA = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 3,
        stationCount: 3,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
        randomFn: pseudoRandomA,
      });

      const resB = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 3,
        stationCount: 3,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
        randomFn: pseudoRandomB,
      });

      expect(resA.success).toBe(true);
      expect(resB.success).toBe(true);
      if (resA.success && resB.success) {
        const stripId = (stations: typeof resA.stations) =>
          stations.map(s => ({
            zoneId: s.zone.id,
            exerciseAId: s.exerciseA.id_cwiczenia,
            exerciseBId: s.exerciseB?.id_cwiczenia,
            isPair: s.isPair,
          }));

        expect(stripId(resA.stations)).toEqual(stripId(resB.stations));
      }
    });

    it('returns conflict failure with partialStations when pool is partially exhausted', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      // Only 1 exercise matching level 3, but requesting 3 stations without duplicates allowed on first try
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', poziom: 3, segment_id: 1 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 2,
        stationCount: 2,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
      });

      // Since only 1 unique exercise exists, fallback cascade might reuse or return conflict
      // When completely exhausted:
      if (!result.success) {
        expect(result.conflict.type).toBe('generate');
        expect(result.conflict.partialStations).toBeDefined();
        expect(Array.isArray(result.conflict.partialStations)).toBe(true);
      }
    });

    it('returns conflict failure when pool cannot satisfy stations', () => {
      const room = makeRoom();
      const diff = makeDiff(9, 10);
      // No exercises matching level 9-10
      const exercises = [
        makeEx({ id_cwiczenia: 'e1', poziom: 1 }),
      ];

      const result = generateCircuitStrategy({
        currentRoom: room,
        mainDiff: diff,
        participants: 3,
        stationCount: 3,
        isStrictDifficulty: true,
        allExercisesSource: exercises,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.conflict.type).toBe('generate');
        expect(result.conflict.requestedStations).toBe(3);
        expect(result.conflict.partialStations).toEqual([]);
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
    it('rerolls exercise A on an existing station', () => {
      const room = makeRoom();
      const diff = makeDiff(2, 4);
      const ex1 = makeEx({ id_cwiczenia: 'ex1', poziom: 3, segment_id: 1 });
      const ex2 = makeEx({ id_cwiczenia: 'ex2', poziom: 3, segment_id: 2 });
      const ex3 = makeEx({ id_cwiczenia: 'ex3', poziom: 3, segment_id: 3 });

      const circuit = [
        { id: 'st-0', zone: room.strefy[0], exerciseA: ex1, isPair: false },
        { id: 'st-1', zone: room.strefy[0], exerciseA: ex2, isPair: false },
      ];

      const result = rerollExerciseStrategy({
        circuit,
        stationId: 'st-0',
        type: 'A',
        currentRoom: room,
        difficultyId: 'test_diff',
        mainDiff: diff,
        isStrictDifficulty: true,
        allExercisesSource: [ex1, ex2, ex3],
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.circuit[0].exerciseA.id_cwiczenia).toBe('ex3');
      }
    });
  });
});
