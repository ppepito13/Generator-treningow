import { describe, it, expect } from 'vitest';
import { migrateStoreState, partializeStoreState } from '@/app/lib/store';

describe('Zustand Store Persist Migration & Partialize', () => {
  describe('Migration from v0 to v1', () => {
    it('preserves all user data and preferences from v0 snapshot', () => {
      const v0State = {
        customExercises: [{ id: 'ex-1', nazwa: 'Pompki na poręczach' }],
        customRooms: [{ id: 'room-1', nazwa_sali: 'Sala A' }],
        customEquipment: [{ id: 'eq-1', nazwa: 'Kettlebell 16kg' }],
        customIntervalPresets: [{ id: 'preset-1', name: 'Tabata 20/10' }],
        timerAudioSettings: { soundEnabled: true, volume: 0.8 },
        sharedUserProfile: { weightKg: 80, heightCm: 180 },
        calculatorResults: { bmi: { value: 24.7 } },
        selectedRoomId: 'room-1',
        participants: 12,
        stationCount: 6,
        difficultyId: 'sredni',
        isStrictDifficulty: true,
        customRoomMode: 'synchroniczny',
        customRoomCategory: 'crossfit',
        customRoomEquipment: ['eq-1'],
        activeTab: 'studio',
      };

      const migrated = migrateStoreState(v0State, 0);

      expect(migrated).toMatchObject(v0State);
    });

    it('explicitly removes ephemeral circuit data if present in v0 snapshot', () => {
      const v0StateWithCircuit = {
        customExercises: [{ id: 'ex-1', nazwa: 'Pompki' }],
        circuit: [
          { stationNumber: 1, exerciseA: { id: 'ex-1', nazwa: 'Pompki' } }
        ],
        activeView: 'CIRCUIT',
        isGenerated: true,
      };

      const migrated = migrateStoreState(v0StateWithCircuit, 0);

      expect(migrated).not.toHaveProperty('circuit');
      expect(migrated).toMatchObject({
        customExercises: [{ id: 'ex-1', nazwa: 'Pompki' }],
      });
    });

    it('returns state unchanged when version is already 1 or higher', () => {
      const v1State = {
        customExercises: [{ id: 'ex-1', nazwa: 'Przysiad' }],
        activeTab: 'generator',
      };

      const result = migrateStoreState(v1State, 1);
      expect(result).toEqual(v1State);
    });
  });

  describe('Partialize Filter (Allowlist of 16 fields)', () => {
    it('serializes only the 16 allowed fields and excludes ephemeral/runtime state', () => {
      const fullMockState = {
        // 16 Persisted fields
        customExercises: [{ id: 'ex-1', nazwa: 'Plank' }],
        customRooms: [{ id: 'room-1', nazwa_sali: 'CrossBox' }],
        customEquipment: [{ id: 'eq-1', nazwa: 'Hantle' }],
        customIntervalPresets: [{ id: 'p-1', name: 'Interwał' }],
        timerAudioSettings: { soundEnabled: true },
        sharedUserProfile: { age: 30 },
        calculatorResults: { bmr: 1800 },
        selectedRoomId: 'room-custom',
        participants: 10,
        stationCount: 5,
        difficultyId: 'trudny',
        isStrictDifficulty: false,
        customRoomMode: 'obwodowy',
        customRoomCategory: 'ogolnorozwojowy',
        customRoomEquipment: ['eq-1'],
        activeTab: 'calculators',

        // 6 Ephemeral fields (MUST be omitted)
        circuit: [{ id: 'station-1' }],
        activeView: 'CIRCUIT',
        navigationStack: ['HOME', 'CIRCUIT'],
        isGenerated: true,
        generationConflict: { type: 'generate' },
        activeIntervalExecution: { isRunning: true },

        // Mock store actions/methods (MUST be omitted)
        reset: () => {},
        generateCircuit: () => {},
      };

      const partial = partializeStoreState(fullMockState as unknown as Parameters<typeof partializeStoreState>[0]);

      const expectedPersistedKeys = [
        'customExercises',
        'customRooms',
        'customEquipment',
        'customIntervalPresets',
        'timerAudioSettings',
        'sharedUserProfile',
        'calculatorResults',
        'selectedRoomId',
        'participants',
        'stationCount',
        'difficultyId',
        'isStrictDifficulty',
        'customRoomMode',
        'customRoomCategory',
        'customRoomEquipment',
        'activeTab',
      ];

      expect(Object.keys(partial).sort()).toEqual(expectedPersistedKeys.sort());

      // Assert ephemeral state omission
      expect(partial).not.toHaveProperty('circuit');
      expect(partial).not.toHaveProperty('activeView');
      expect(partial).not.toHaveProperty('navigationStack');
      expect(partial).not.toHaveProperty('isGenerated');
      expect(partial).not.toHaveProperty('generationConflict');
      expect(partial).not.toHaveProperty('activeIntervalExecution');
      expect(partial).not.toHaveProperty('reset');
      expect(partial).not.toHaveProperty('generateCircuit');
    });
  });
});
