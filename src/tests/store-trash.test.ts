import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/app/lib/store';
import { isExerciseInTrash, getTrashRemainingDays, TRASH_RETENTION_MS } from '@/domain/sync/syncMetadata';

describe('Zustand Store - Trash & Recycle Bin (#52)', () => {
  beforeEach(() => {
    useAppStore.setState({
      customExercises: [],
      customRooms: [],
      customEquipment: [],
      customIntervalPresets: [],
    });
  });

  describe('restoreCustomExercise', () => {
    it('restores soft-deleted exercise back to active state with incremented version', () => {
      const exercise = useAppStore.getState().addCustomExercise({
        nazwa: 'Ćwiczenie Testowe Kosz',
      });

      // Soft delete
      useAppStore.getState().removeCustomExercise(exercise.id_cwiczenia);
      let rawCustom = useAppStore.getState().customExercises;
      expect(rawCustom[0]._sync?.isDeleted).toBe(true);
      expect(useAppStore.getState().getAllExercises().some(e => e.id_cwiczenia === exercise.id_cwiczenia)).toBe(false);

      // Restore
      useAppStore.getState().restoreCustomExercise(exercise.id_cwiczenia);
      rawCustom = useAppStore.getState().customExercises;
      expect(rawCustom[0]._sync?.isDeleted).toBe(false);
      expect(rawCustom[0]._sync?.isPurged).toBeFalsy();
      expect(rawCustom[0]._sync?.version).toBe(3); // 1 (add) -> 2 (delete) -> 3 (restore)

      // Verified visible in active exercises
      const active = useAppStore.getState().getAllExercises();
      expect(active.some(e => e.id_cwiczenia === exercise.id_cwiczenia)).toBe(true);
    });

    it('ignores restore request if exercise id does not exist', () => {
      useAppStore.getState().restoreCustomExercise('non_existent_id');
      expect(useAppStore.getState().customExercises).toHaveLength(0);
    });
  });

  describe('permanentlyDeleteCustomExercise', () => {
    it('marks exercise tombstone as isPurged: true without dropping tombstone', () => {
      const exercise = useAppStore.getState().addCustomExercise({
        nazwa: 'Ćwiczenie do trwałego usunięcia',
      });
      useAppStore.getState().removeCustomExercise(exercise.id_cwiczenia);

      useAppStore.getState().permanentlyDeleteCustomExercise(exercise.id_cwiczenia);

      const rawCustom = useAppStore.getState().customExercises;
      expect(rawCustom).toHaveLength(1);
      expect(rawCustom[0]._sync?.isDeleted).toBe(true);
      expect(rawCustom[0]._sync?.isPurged).toBe(true);
      expect(rawCustom[0]._sync?.version).toBe(3);

      // Must NOT be in trash
      expect(isExerciseInTrash(rawCustom[0])).toBe(false);
    });
  });

  describe('emptyTrash', () => {
    it('purges all exercises currently qualifying as trash while preserving active exercises', () => {
      const ex1 = useAppStore.getState().addCustomExercise({ nazwa: 'Ćwiczenie Kosz 1' });
      const ex2 = useAppStore.getState().addCustomExercise({ nazwa: 'Ćwiczenie Kosz 2' });
      const exActive = useAppStore.getState().addCustomExercise({ nazwa: 'Aktywne Ćwiczenie' });

      useAppStore.getState().removeCustomExercise(ex1.id_cwiczenia);
      useAppStore.getState().removeCustomExercise(ex2.id_cwiczenia);

      // Verify 2 in trash
      const beforeTrash = useAppStore.getState().customExercises.filter(e => isExerciseInTrash(e));
      expect(beforeTrash).toHaveLength(2);

      // Empty trash
      useAppStore.getState().emptyTrash();

      const after = useAppStore.getState().customExercises;
      expect(after).toHaveLength(3);

      const purged1 = after.find(e => e.id_cwiczenia === ex1.id_cwiczenia);
      const purged2 = after.find(e => e.id_cwiczenia === ex2.id_cwiczenia);
      const active = after.find(e => e.id_cwiczenia === exActive.id_cwiczenia);

      expect(purged1?._sync?.isPurged).toBe(true);
      expect(purged2?._sync?.isPurged).toBe(true);
      expect(active?._sync?.isDeleted).toBe(false);
      expect(active?._sync?.isPurged).toBeFalsy();

      // Zero in trash now
      const afterTrash = after.filter(e => isExerciseInTrash(e));
      expect(afterTrash).toHaveLength(0);
    });
  });

  describe('7-day retention helper functions', () => {
    const now = 1700000000000;

    it('identifies exercise deleted within 7 days as in trash', () => {
      const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
      const exercise = {
        id_cwiczenia: 'test_1',
        nazwa: 'Test',
        _sync: {
          updatedAt: twoDaysAgo,
          version: 2,
          isDeleted: true,
        },
      };

      expect(isExerciseInTrash(exercise, now)).toBe(true);
      expect(getTrashRemainingDays(exercise, now)).toBe(5);
    });

    it('identifies exercise deleted more than 7 days ago as expired from trash', () => {
      const eightDaysAgo = now - 8 * 24 * 60 * 60 * 1000;
      const exercise = {
        id_cwiczenia: 'test_2',
        nazwa: 'Test',
        _sync: {
          updatedAt: eightDaysAgo,
          version: 2,
          isDeleted: true,
        },
      };

      expect(isExerciseInTrash(exercise, now)).toBe(false);
      expect(getTrashRemainingDays(exercise, now)).toBe(0);
    });

    it('excludes purged exercises regardless of age', () => {
      const oneHourAgo = now - 3600000;
      const exercise = {
        id_cwiczenia: 'test_3',
        nazwa: 'Test',
        _sync: {
          updatedAt: oneHourAgo,
          version: 2,
          isDeleted: true,
          isPurged: true,
        },
      };

      expect(isExerciseInTrash(exercise, now)).toBe(false);
    });

    it('TRASH_RETENTION_MS is exactly 7 days in milliseconds', () => {
      expect(TRASH_RETENTION_MS).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });
});

