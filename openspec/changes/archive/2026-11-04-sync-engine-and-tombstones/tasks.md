# Tasks: Silnik Synchronizacji, Wersjonowanie i Obsługa Tombstones (#40.2)

## 1. Model i Typy

- [x] 1.1 [src/types/sync.ts] Zdefiniować interfejsy `SyncMetadata`, `WithSyncMetadata`, `SyncBackupPayload`, `SyncDataCollections` oraz `MergeCollectionResult`.
- [x] 1.2 [src/app/lib/data.ts] Rozszerzyć typ `Exercise` o opcjonalne metadane `_sync?: SyncMetadata`.
- [x] 1.3 [src/app/lib/data.ts] Rozszerzyć typ `RoomConfig` o opcjonalne metadane `_sync?: SyncMetadata`.

## 2. Moduł Domenowy Synchronizacji

- [x] 2.1 [src/domain/sync/syncMetadata.ts] Zaimplementować funkcje pomocnicze `ensureSyncMetadata`, `touchSyncMetadata` oraz `markSyncDeleted`.
- [x] 2.2 [src/domain/sync/mergeEngine.ts] Zaimplementować czysty algorytm scalania kolekcji `mergeEntityList` (obsługa LWW, tombstones i porównanie treści) oraz funkcję `mergeSyncData`.

## 3. Integracja ze Store

- [x] 3.1 [src/app/lib/store.ts] Zaktualizować metody usuwania ćwiczeń, sal, sprzętu i presetów na miękkie usuwanie (`markSyncDeleted`).
- [x] 3.2 [src/app/lib/store.ts] Zaktualizować metody `getAllExercises`, `getAllRooms`, `getAllEquipment` o wykluczanie obiektów z `_sync.isDeleted === true`.
- [x] 3.3 [src/app/lib/store.ts] Dodać metodę `mergeRemoteBackup(payload: SyncBackupPayload)` integrującą silnik scalania ze stanem store.

## 4. Testy Jednostkowe i Weryfikacja

- [x] 4.1 [src/tests/domain/syncMergeEngine.test.ts] Dodać testy jednostkowe silnika scalania (przypadki LWW, tombstones, remisy, identyczna treść, przywracanie).
- [x] 4.2 [src/tests/store-sync.test.ts] Dodać testy integracyjne Zustand Store weryfikujące miękkie usuwanie i scalanie stanu.
- [x] 4.3 [npm run verify] Uruchomić pełną lokalną bramkę jakości (`npm run verify`: TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów bez błędów i ostrzeżeń.

