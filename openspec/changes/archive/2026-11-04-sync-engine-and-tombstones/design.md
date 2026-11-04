# Design: Silnik Synchronizacji, Wersjonowanie i Obsługa Tombstones

## 1. Architektura Silnika Synchronizacji

Silnik synchronizacji jest zorganizowany jako czysty moduł domenowy w `src/domain/sync/`, całkowicie niezależny od warstwy prezentacji i frameworka Next.js.

```
       Stan Lokalny (Zustand Store)       Kopia z Google Drive (JSON)
                    │                                 │
                    ▼                                 ▼
             [local collections]              [remote collections]
                    │                                 │
                    └───────────────┬─────────────────┘
                                    │
                                    ▼
                       [mergeEngine.ts: LWW]
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
      Nowszy wpis lokalny                     Nowszy wpis zdalny
                 │                                     │
           Zostaje lokalnie                    Pobierany do bazy
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
                    Zaktualizowany Stan Lokalny
                   (z zachowaniem Tombstones)
```

## 2. Model Danych (`src/types/sync.ts`)

```typescript
export interface SyncMetadata {
  updatedAt: number;
  version: number;
  isDeleted?: boolean;
}

export interface WithSyncMetadata {
  _sync?: SyncMetadata;
}

export interface SyncDataCollections {
  customExercises: Exercise[];
  customRooms: RoomConfig[];
  customEquipment: EquipmentItem[];
  customIntervalPresets: IntervalPreset[];
}

export interface SyncBackupPayload {
  schemaVersion: number;
  clientVersion: string;
  lastModified: number;
  data: SyncDataCollections;
}

export interface MergeCollectionResult<T> {
  merged: T[];
  addedCount: number;
  updatedCount: number;
  deletedCount: number;
  conflictsResolved: number;
}
```

## 3. Logika Domenowa

1. **`src/domain/sync/syncMetadata.ts`:**
   - `ensureSyncMetadata(item, timestamp)`: inicjalizacja `_sync: { updatedAt, version: 1 }` dla starszych rekordów bez metadanych.
   - `touchSyncMetadata(item)`: inkrementacja wersji (`version + 1`) i ustawienie bieżącego `updatedAt: Date.now()`.
   - `markSyncDeleted(item)`: ustawienie `isDeleted: true`, inkrementacja wersji i odświeżenie `updatedAt`.
2. **`src/domain/sync/mergeEngine.ts`:**
   - Wyznaczanie unikalnych ID obiektów (`id_cwiczenia` dla ćwiczeń, `id_sali` dla sal, `id` dla sprzętu i presetów).
   - Porównanie tożsamości treści (z pominięciem pól `_sync`) – jeśli treść jest identyczna, wybierane są metadane o wyższej wersji bez generowania sztucznych konfliktów.
   - Implementacja reguły Last-Write-Wins:
     - Gdy `remote._sync.updatedAt > local._sync.updatedAt`: przyjmuje wersję zdalną.
     - Gdy `local._sync.updatedAt > remote._sync.updatedAt`: zachowuje wersję lokalną.
     - Przy identycznym `updatedAt`: rozstrzygnięcie po `version`.
   - Obsługa Tombstones: jeśli wygrywający rekord ma `isDeleted: true`, pozostaje w tablicy jako tombstone.

## 4. Integracja z Zustand Store

- Metody `removeCustomExercise`, `removeCustomRoom`, `removeCustomEquipment` oraz `deleteIntervalPreset` nie usuwają rekordu fizycznie z tablicy, lecz wołają `markSyncDeleted(existingItem)`.
- Metody `getAllExercises`, `getAllRooms`, `getAllEquipment` filtrują wpisy: `!item._sync?.isDeleted`.
- Dodanie metody `mergeRemoteBackup(remotePayload: SyncBackupPayload): MergeSummary` w store.

