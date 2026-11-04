import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/app/lib/store';
import type { SyncBackupPayload } from '@/types/sync';

describe('Zustand Store - Sync & Tombstones (#40.2)', () => {
  beforeEach(() => {
    useAppStore.setState({
      customExercises: [],
      customRooms: [],
      customEquipment: [],
      customIntervalPresets: [],
    });
  });

  describe('Exercises Soft Delete & Tombstones', () => {
    it('attaches _sync metadata when adding a custom exercise', () => {
      const exercise = useAppStore.getState().addCustomExercise({
        nazwa: 'Autorskie Pompki',
      });

      expect(exercise._sync).toBeDefined();
      expect(exercise._sync?.version).toBe(1);
      expect(exercise._sync?.isDeleted).toBe(false);
      expect(typeof exercise._sync?.updatedAt).toBe('number');
    });

    it('marks exercise as isDeleted (tombstone) without removing it from raw store array', () => {
      const exercise = useAppStore.getState().addCustomExercise({
        nazwa: 'Pompki do usunięcia',
      });

      useAppStore.getState().removeCustomExercise(exercise.id_cwiczenia);

      const rawCustom = useAppStore.getState().customExercises;
      expect(rawCustom).toHaveLength(1);
      expect(rawCustom[0]._sync?.isDeleted).toBe(true);
      expect(rawCustom[0]._sync?.version).toBe(2);

      // But getAllExercises must filter out tombstones!
      const visible = useAppStore.getState().getAllExercises();
      expect(visible.some((e) => e.id_cwiczenia === exercise.id_cwiczenia)).toBe(false);
    });
  });

  describe('Rooms Soft Delete & Tombstones', () => {
    it('attaches _sync metadata and soft deletes custom room', () => {
      const room = useAppStore.getState().addCustomRoom({
        nazwa_sali: 'Moja Sala Do Usunięcia',
      });

      expect(room._sync?.version).toBe(1);

      useAppStore.getState().removeCustomRoom(room.id_sali);

      const rawRooms = useAppStore.getState().customRooms;
      expect(rawRooms).toHaveLength(1);
      expect(rawRooms[0]._sync?.isDeleted).toBe(true);

      const visible = useAppStore.getState().getAllRooms();
      expect(visible.some((r) => r.id_sali === room.id_sali)).toBe(false);
    });
  });

  describe('Equipment Soft Delete & Tombstones', () => {
    it('attaches _sync metadata and soft deletes custom equipment', () => {
      const eq = useAppStore.getState().addCustomEquipment({
        nazwa: 'Nietypowy Odważnik',
      });

      expect(eq._sync?.version).toBe(1);

      useAppStore.getState().removeCustomEquipment(eq.id);

      const rawEquipment = useAppStore.getState().customEquipment;
      expect(rawEquipment).toHaveLength(1);
      expect(rawEquipment[0]._sync?.isDeleted).toBe(true);

      const visible = useAppStore.getState().getAllEquipmentItems();
      expect(visible.some((e) => e.id === eq.id)).toBe(false);
    });
  });

  describe('Interval Presets Soft Delete & Tombstones', () => {
    it('attaches _sync metadata and soft deletes interval presets', () => {
      const preset = {
        id: 'custom_preset_1',
        nazwa: 'Testowy Interwał',
        bloki: [],
        isCustom: true,
      };

      useAppStore.getState().addCustomIntervalPreset(preset);

      const stored = useAppStore.getState().customIntervalPresets[0];
      expect(stored._sync?.version).toBe(1);

      useAppStore.getState().removeCustomIntervalPreset(preset.id);

      const rawPresets = useAppStore.getState().customIntervalPresets;
      expect(rawPresets).toHaveLength(1);
      expect(rawPresets[0]._sync?.isDeleted).toBe(true);

      const visible = useAppStore.getState().getAllIntervalPresets();
      expect(visible.some((p) => p.id === preset.id)).toBe(false);
    });
  });

  describe('mergeRemoteBackup Integration', () => {
    it('applies remote backup and resolves collisions deterministically', () => {
      // Setup local item
      const localEx = useAppStore.getState().addCustomExercise({
        nazwa: 'Wersja Lokalna',
      });

      // Prepare remote payload where this item has newer version and different name
      const remotePayload: SyncBackupPayload = {
        schemaVersion: 1,
        clientVersion: '1.3.0',
        lastModified: Date.now() + 10000,
        data: {
          customExercises: [
            {
              ...localEx,
              nazwa: 'Wersja Zdalna Zwycięska',
              _sync: {
                updatedAt: (localEx._sync?.updatedAt ?? 0) + 5000,
                version: 2,
                isDeleted: false,
              },
            },
          ],
          customRooms: [],
          customEquipment: [],
          customIntervalPresets: [],
        },
      };

      const summary = useAppStore.getState().mergeRemoteBackup(remotePayload);

      expect(summary.exercises.conflictsResolved).toBe(1);
      expect(summary.exercises.updatedCount).toBe(1);

      const current = useAppStore.getState().getAllExercises();
      const match = current.find((e) => e.id_cwiczenia === localEx.id_cwiczenia);
      expect(match?.nazwa).toBe('Wersja Zdalna Zwycięska');
    });

    it('propagates remote tombstone to local state', () => {
      const localEx = useAppStore.getState().addCustomExercise({
        nazwa: 'Lokalnie Aktywne',
      });

      const remotePayload: SyncBackupPayload = {
        schemaVersion: 1,
        clientVersion: '1.3.0',
        lastModified: Date.now() + 10000,
        data: {
          customExercises: [
            {
              ...localEx,
              _sync: {
                updatedAt: (localEx._sync?.updatedAt ?? 0) + 5000,
                version: 2,
                isDeleted: true,
              },
            },
          ],
          customRooms: [],
          customEquipment: [],
          customIntervalPresets: [],
        },
      };

      const summary = useAppStore.getState().mergeRemoteBackup(remotePayload);

      expect(summary.exercises.deletedCount).toBe(1);

      // Raw array has the tombstone
      const raw = useAppStore.getState().customExercises;
      expect(raw.find((e) => e.id_cwiczenia === localEx.id_cwiczenia)?._sync?.isDeleted).toBe(true);

      // Visible list does not have it
      const visible = useAppStore.getState().getAllExercises();
      expect(visible.some((e) => e.id_cwiczenia === localEx.id_cwiczenia)).toBe(false);
    });
  });
});

