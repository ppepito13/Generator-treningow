# Proposal: Silnik Cyklu Życia Synchronizacji w Tle i Zwiększenie Limitu Czasu

## Why
W zadaniach #40.1 i #40.2 wdrożyliśmy klienta Google Drive API oraz deterministyczny silnik scalania Last-Write-Wins (LWW) z obsługą nagrobków (Tombstones). Do tej pory synchronizacja nie posiada jednak automatycznego koordynatora cyklu życia – aplikacja nie wykonuje samoczynnej synchronizacji po zmianie danych, nie wznawia synchronizacji po powrocie połączenia sieciowego i nie śledzi statusu operacji w czasie rzeczywistym. Ponadto dotychczasowy twardy limit czasu oczekiwania na logowanie Google (35s) okazał się w warunkach rzeczywistych zbyt krótki przy weryfikacji dwuetapowej (2FA) i ekranie uprawnień Dysku Google.

Niniejsza zmiana (Część 1 z #40.3) wdraża scentralizowany koordynator synchronizacji (`syncCoordinator`), automatyczną synchronizację z debouncingiem po zmianach danych użytkownika w Zustand Store, reakcję na zdarzenia powrotu sieci (`online`) oraz wydłuża limit czasu logowania Google do 60 sekund.

## What Changes
- **Zwiększenie limitu czasu logowania Google (Timeout 60s)**: Zwiększenie stałej `AUTH_TIMEOUT_MS` w module logowania z 35 sekund do 60 sekund oraz aktualizacja komunikatów i testów, gwarantując komfortowe przejście 2FA i zaznaczenie uprawnień.
- **Koordynator Synchronizacji (`src/services/sync/syncCoordinator.ts`)**: Utworzenie wyspecjalizowanego serwisu orkiestrującego pełny przepływ synchronizacji:
  - Weryfikacja warunków startowych (sesja Google, uprawnienie `hasDriveScope`, stan sieci `navigator.onLine`, flaga aktywności).
  - Pobranie zdalnego backupu z Google Drive (`findBackupFile` + `downloadBackupFile`).
  - Scalenie danych algorytmem LWW za pośrednictwem `mergeSyncData`.
  - Atomowy zapis scalonego stanu do Zustand Store.
  - Wysłanie zaktualizowanego stanu do chmury (`uploadBackupFile`).
  - Zabezpieczenie przed pętlami zwrotnymi (Infinite Sync Loops) oraz współbieżnymi wywołaniami (Race Conditions).
- **Zarządzanie Stanem Synchronizacji w Zustand Store (`src/app/lib/store.ts`)**:
  - Rozszerzenie stanu o pola: `syncStatus` (`'idle' | 'syncing' | 'success' | 'error' | 'offline'`), `lastSyncedAt` (`number | null`), `syncError` (`string | null`).
  - Akcje `setSyncStatus`, `setLastSyncedAt`, `triggerSync`.
  - Integracja debounced auto-sync (np. opóźnienie 2.5s) przy modyfikacji kolekcji autorskich (ćwiczenia, sale, sprzęt, presety).
- **Detekcja Powrotu Sieci (Network Lifecycle)**:
  - Globalny listener zdarzenia `online` wznawiający synchronizację po odzyskaniu łączności internetowej.
- **Testy Jednostkowe i Integracyjne**:
  - Pokrycie scenariuszy pomyślnej synchronizacji, braku sieci, wygasłego tokenu, debouncingu oraz braku pętli zwrotnych.

## Capabilities

### Modified Capabilities
- `user-auth`: Wydłużenie limitu czasu logowania Google do 60 sekund dla zapewnienia bezproblemowej autoryzacji 2FA.
- `data-storage`: Wprowadzenie koordynatora synchronizacji chmurowej, debounced auto-sync, reakcji na powrót sieci `online` oraz śledzenia statusu w Zustand Store.

## Impact
- **Kod źródłowy**: `src/services/auth/googleAuth.ts`, `src/services/sync/syncCoordinator.ts` (nowy), `src/app/lib/store.ts`, `src/types/sync.ts`, `src/types/auth.ts`.
- **Testy**: Aktualizacja testów autoryzacji i dodanie dedykowanych testów cyklu synchronizacji w `src/tests/sync-coordinator.test.ts`.
- **Brak zmian destrukcyjnych (Non-breaking)**: Praca w trybie Offline-First pozostaje w 100% zachowana; aplikacja w pełni działa bez zalogowania i bez Internetu.

