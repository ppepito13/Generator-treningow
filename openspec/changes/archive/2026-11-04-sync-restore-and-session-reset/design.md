# Technical Design: Przywracanie Danych z Chmury i Reset Sesji Synchronizacji

## Context
W module Ustawień użytkownik posiada możliwość synchronizacji danych z Dyskiem Google. Wdrożona w #40.2 obsługa nagrobków (Tombstones) zapobiega rekordom-widmom przy normalnej pracy, jednak w scenariuszu ponownego łączenia konta lub chęci wycofania lokalnych błędów brakuje mechanizmu twardego przywrócenia bazy z Dysku Google oraz ochrony przed automatycznym uploadem nagrobków do chmury.

## Goals / Non-Goals

**Goals:**
- Uniemożliwić cichy upload nagrobków do chmury tuż po zalogowaniu, gdy na Google Drive istnieje już wcześniejszy backup.
- Wyzerowanie znacznika `lastSyncedAt: null` przy odłączeniu konta Google.
- Dedykowana akcja `restoreFromCloudBackup()` pobierająca kopię zapasową z Google Drive i nadpisująca lokalny stan store bez pozostawiania lokalnych nagrobków.
- Dedykowany przycisk „Przywróć kopię z chmury” oraz komponent modalu `RestoreCloudBackupDialog` w `SettingsView.tsx`.

**Non-Goals:**
- Modyfikacja algorytmu porównywania treści w `mergeEngine.ts` (LWW przy normalnym `performSync` pozostaje nienaruszone).
- Tworzenie historii wersji w chmurze (Google Drive appDataFolder operuje na pojedynczym pliku JSON).

## Decisions

### 1. Rozróżnienie faktycznie czystego urządzenia od urządzenia z nagrobkami
* **Decyzja:** W `checkInitialSyncConflict()` sprawdzamy zarówno elementy aktywne, jak i obecność nagrobków:
  `const hasAnyRecords = (store.customExercises?.length ?? 0) > 0 || (store.customRooms?.length ?? 0) > 0 || ...;`
  Jeśli w chmurze istnieje plik, a lokalnie istnieją jakiekolwiek rekordy (aktywne lub nagrobki), traktujemy to jako kolizję początkową i wymuszamy wyświetlenie `InitialSyncConflictDialog` (lub pytamy użytkownika).
* **Uzasadnienie:** Zapobiega to sytuacji, w której usunięcie wszystkich ćwiczeń na urządzeniu powoduje cichy upload nagrobków i skasowanie kopii w chmurze przed decyzją użytkownika.

### 2. Dedykowany komponent modalu `RestoreCloudBackupDialog.tsx`
* **Decyzja:** Utworzenie odrębnego komponentu dialogowego opartego na Radix UI (`Dialog`).
* **Uzasadnienie:** Zgodność ze standardami czystej architektury projektu, łatwość testowania w izolacji i czytelność `SettingsView`.

### 3. Reset stanu w `disconnectGoogleAccount`
* **Decyzja:** Ustawienie `lastSyncedAt: null`, `syncStatus: 'idle'` i `syncError: null` podczas wywoływania `disconnectGoogleAccount()`.
* **Uzasadnienie:** Po odpięciu konta urządzenie nie ma aktywnej powiązanej sesji chmurowej. Ponowne zalogowanie powinno umożliwić świadomy wybór strategii początkowej.

## Risks / Trade-offs

* **[Risk]** Użytkownik przypadkowo kliknie „Przywróć z chmury” i straci nowo dodane lokalnie ćwiczenia.
  - **Mitigation:** Wymóg jawnego potwierdzenia w modalu `RestoreCloudBackupDialog` z wyraźnym ostrzeżeniem o wycofaniu lokalnych zmian.
* **[Risk]** Błąd pobierania pliku podczas przywracania (np. brak sieci lub brak pliku w chmurze).
  - **Mitigation:** Obsługa błędów w `restoreFromCloudBackup()`, prezentacja toasta o błędzie i zachowanie obecnego stanu lokalnego bez uszkodzenia bazy.

