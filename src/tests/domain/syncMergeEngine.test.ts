import { describe, it, expect } from 'vitest';
import {
  areContentsEqual,
  mergeEntityList,
  mergeSyncData,
} from '@/domain/sync/mergeEngine';
import type { Exercise } from '@/app/lib/data';

describe('syncMergeEngine (Domain)', () => {
  describe('canonicalize and areContentsEqual', () => {
    it('should ignore _sync field when comparing content', () => {
      const a = {
        id: 'ex-1',
        name: 'Pompki',
        _sync: { updatedAt: 1000, version: 1 },
      };
      const b = {
        id: 'ex-1',
        name: 'Pompki',
        _sync: { updatedAt: 2000, version: 2 },
      };
      expect(areContentsEqual(a, b)).toBe(true);
    });

    it('should detect differences in business properties', () => {
      const a = {
        id: 'ex-1',
        name: 'Pompki',
        _sync: { updatedAt: 1000, version: 1 },
      };
      const b = {
        id: 'ex-1',
        name: 'Pompki diamentowe',
        _sync: { updatedAt: 1000, version: 1 },
      };
      expect(areContentsEqual(a, b)).toBe(false);
    });

    it('should be agnostic to object key insertion order', () => {
      const a = { alpha: 1, beta: 'test', _sync: { updatedAt: 100, version: 1 } };
      const b = { beta: 'test', alpha: 1, _sync: { updatedAt: 200, version: 2 } };
      expect(areContentsEqual(a, b)).toBe(true);
    });
  });

  describe('mergeEntityList', () => {
    it('should keep local items when remote has no items', () => {
      const local = [
        { id: '1', name: 'A', _sync: { updatedAt: 100, version: 1 } },
      ];
      const result = mergeEntityList(local, [], (item) => item.id);

      expect(result.merged).toHaveLength(1);
      expect(result.merged[0].id).toBe('1');
      expect(result.addedCount).toBe(0);
      expect(result.updatedCount).toBe(0);
    });

    it('should add remote items when local does not have them', () => {
      const remote = [
        { id: '2', name: 'B', _sync: { updatedAt: 100, version: 1 } },
      ];
      const result = mergeEntityList([], remote, (item) => item.id);

      expect(result.merged).toHaveLength(1);
      expect(result.merged[0].id).toBe('2');
      expect(result.addedCount).toBe(1);
    });

    it('should not register conflict if business content is identical', () => {
      const local = [
        { id: '1', name: 'A', _sync: { updatedAt: 100, version: 1 } },
      ];
      const remote = [
        { id: '1', name: 'A', _sync: { updatedAt: 200, version: 2 } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged).toHaveLength(1);
      expect(result.merged[0]._sync.version).toBe(2);
      expect(result.conflictsResolved).toBe(0);
      expect(result.updatedCount).toBe(0);
    });

    it('should resolve collision in favor of remote if remote has newer updatedAt (LWW)', () => {
      const local = [
        { id: '1', name: 'Old Name', _sync: { updatedAt: 100, version: 1 } },
      ];
      const remote = [
        { id: '1', name: 'Newer Name', _sync: { updatedAt: 200, version: 1 } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0].name).toBe('Newer Name');
      expect(result.updatedCount).toBe(1);
      expect(result.conflictsResolved).toBe(1);
    });

    it('should resolve collision in favor of local if local has newer updatedAt', () => {
      const local = [
        { id: '1', name: 'Local Newer', _sync: { updatedAt: 300, version: 1 } },
      ];
      const remote = [
        { id: '1', name: 'Remote Older', _sync: { updatedAt: 100, version: 2 } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0].name).toBe('Local Newer');
      expect(result.updatedCount).toBe(0);
      expect(result.conflictsResolved).toBe(1);
    });

    it('should break tie using version when updatedAt is identical', () => {
      const local = [
        { id: '1', name: 'Version 2', _sync: { updatedAt: 500, version: 2 } },
      ];
      const remote = [
        { id: '1', name: 'Version 3', _sync: { updatedAt: 500, version: 3 } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0].name).toBe('Version 3');
      expect(result.updatedCount).toBe(1);
    });

    it('should apply remote Tombstone over older active local record (Soft Delete Sync)', () => {
      const local = [
        { id: '1', name: 'Active Locally', _sync: { updatedAt: 100, version: 1, isDeleted: false } },
      ];
      const remote = [
        { id: '1', name: 'Deleted Remotely', _sync: { updatedAt: 200, version: 2, isDeleted: true } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0]._sync.isDeleted).toBe(true);
      expect(result.deletedCount).toBe(1);
      expect(result.conflictsResolved).toBe(1);
    });

    it('should preserve local tombstone over older active remote record (Zombie Record Prevention)', () => {
      const local = [
        { id: '1', name: 'Deleted Locally', _sync: { updatedAt: 300, version: 2, isDeleted: true } },
      ];
      const remote = [
        { id: '1', name: 'Active Remotely', _sync: { updatedAt: 100, version: 1, isDeleted: false } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0]._sync.isDeleted).toBe(true);
      expect(result.updatedCount).toBe(0);
      expect(result.conflictsResolved).toBe(1);
    });

    it('should handle un-deletion (resurrection) if remote recreated record with newer timestamp', () => {
      const local = [
        { id: '1', name: 'Deleted Locally', _sync: { updatedAt: 100, version: 2, isDeleted: true } },
      ];
      const remote = [
        { id: '1', name: 'Re-added Remotely', _sync: { updatedAt: 400, version: 3, isDeleted: false } },
      ];
      const result = mergeEntityList(local, remote, (item) => item.id);

      expect(result.merged[0]._sync.isDeleted).toBe(false);
      expect(result.merged[0].name).toBe('Re-added Remotely');
      expect(result.addedCount).toBe(1);
    });
  });

  describe('mergeSyncData', () => {
    it('should aggregate changes across all collections', () => {
      const localExercises: Exercise[] = [
        {
          id_cwiczenia: 'ex-1',
          nazwa: 'Przysiady',
          wariant: '',
          segment_id: 1,
          segment_nazwa: 'Nogi',
          tryb_pracy: 'Solo',
          biomechanika: 'Ogólna',
          poziom: 1,
          glowne_partie: ['Nogi'],
          zaangazowane_miesnie: 'Czworogłowy',
          tagi_specjalne: [],
          kategorie_treningu: ['FBW'],
          instrukcja: 'Opis',
          _sync: { updatedAt: 100, version: 1 },
        },
      ];

      const remoteExercises: Exercise[] = [
        {
          id_cwiczenia: 'ex-1',
          nazwa: 'Przysiady ze sztangą',
          wariant: '',
          segment_id: 1,
          segment_nazwa: 'Nogi',
          tryb_pracy: 'Solo',
          biomechanika: 'Ogólna',
          poziom: 2,
          glowne_partie: ['Nogi'],
          zaangazowane_miesnie: 'Czworogłowy',
          tagi_specjalne: [],
          kategorie_treningu: ['FBW'],
          instrukcja: 'Nowy opis',
          _sync: { updatedAt: 200, version: 2 },
        },
        {
          id_cwiczenia: 'ex-2',
          nazwa: 'Wykroki',
          wariant: '',
          segment_id: 1,
          segment_nazwa: 'Nogi',
          tryb_pracy: 'Solo',
          biomechanika: 'Ogólna',
          poziom: 1,
          glowne_partie: ['Nogi'],
          zaangazowane_miesnie: 'Pośladkowy',
          tagi_specjalne: [],
          kategorie_treningu: ['FBW'],
          instrukcja: 'Opis',
          _sync: { updatedAt: 150, version: 1 },
        },
      ];

      const { mergedCollections, summary } = mergeSyncData(
        { customExercises: localExercises },
        { customExercises: remoteExercises }
      );

      expect(mergedCollections.customExercises).toHaveLength(2);
      expect(mergedCollections.customExercises[0].nazwa).toBe('Przysiady ze sztangą');
      expect(summary.exercises.updatedCount).toBe(1);
      expect(summary.exercises.addedCount).toBe(1);
      expect(summary.totalChanges).toBe(2);
    });
  });
});

