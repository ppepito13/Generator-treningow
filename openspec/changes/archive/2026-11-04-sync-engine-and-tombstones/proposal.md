# Proposal: Silnik Synchronizacji, Wersjonowanie i Obsługa Tombstones (#40.2)

## Why
W architekturze Offline-First opartej o Google Drive `appDataFolder` urządzenia wymieniają między sobą całościowe kopie zapasowe w formacie JSON. Bez jednoznacznych metadanych czasowych i wersjonowania oraz bez mechanizmu nagrobków (tombstones):
1. Usunięcie obiektu (ćwiczenia, sali, sprzętu, presetu) na jednym urządzeniu powoduje, że drugie urządzenie traktuje brak obiektu jako powód do jego ponownego przesłania (zjawisko „danych-widm” / Zombie Records).
2. Równoległa edycja tego samego obiektu na dwóch urządzeniach grozi przypadkowym i nieprzewidywalnym nadpisaniem nowszych zmian starszą wersją.
Konieczne jest wprowadzenie ustrukturyzowanych metadanych `_sync`, miękkiego usuwania (tombstones) oraz deterministycznego, bezkonfliktowego silnika scalania LWW (Last-Write-Wins).

## What Changes
1. **Model Danych (`src/types/sync.ts`):** Definicja interfejsu `SyncMetadata` (`updatedAt: number`, `version: number`, `isDeleted?: boolean`) oraz ustandaryzowanego formatu kopii zapasowej `SyncBackupPayload`.
2. **Czysta Logika Domenowa (`src/domain/sync/`):**
   - `syncMetadata.ts`: Pomocnicze funkcje nadawania metadanych przy tworzeniu, aktualizacji (`touch`) i oznaczaniu jako usunięty (`markDeleted`).
   - `mergeEngine.ts`: Deterministyczny silnik scalania tablic encji realizujący regułę Last-Write-Wins, badający tożsamość merytoryczną treści (pomijanie fałszywych kolizji przy identycznej treści) oraz rozstrzygający remisy za pomocą numeru wersji.
3. **Miękkie Usuwanie w Zustand Store (`src/app/lib/store.ts`):**
   - Aktualizacja metod usuwania (`removeCustomExercise`, `removeCustomRoom`, `removeCustomEquipment`, `deleteIntervalPreset`) do tworzenia tombstones zamiast bezpowrotnego usuwania z tablicy.
   - Aktualizacja metod pobierających (`getAllExercises`, `getAllRooms`, `getAllEquipment`, `customIntervalPresets`) do automatycznego wykluczania obiektów z flagą `_sync.isDeleted === true`.
   - Dodanie metody `mergeSyncPayload(remote: SyncBackupPayload)` integrującej silnik domenowy ze stanem store.
4. **Testy Jednostkowe:**
   - Wyizolowane testy domenowe `src/tests/domain/syncMergeEngine.test.ts` badające każdy wariant scalania (LWW, remis, tombstones, zmartwychwstanie danych).
   - Testy integracyjne w `src/tests/store-sync.test.ts`.

