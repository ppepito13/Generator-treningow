# Proposal: Interfejs Synchronizacji w Ustawieniach i Modal Konfliktów InitialSyncConflictDialog

## Why
W zadaniu #40.3a wdrożyliśmy silnik cyklu życia synchronizacji w tle (`syncCoordinator`) oraz automatyczną synchronizację debounced po edycji danych. Do tej pory użytkownik nie ma jednak wglądu w stan synchronizacji w module Ustawień – brakuje wizualnego indykatora stanu w czasie rzeczywistym, informacji o dacie ostatniej kopii zapasowej oraz możliwości ręcznego wymuszenia synchronizacji na żądanie. Ponadto przy pierwszym połączeniu konta na urządzeniu posiadającym już autorskie dane lokalne, gdy w chmurze istnieje już wcześniejsza kopia zapasowa, użytkownik powinien mieć świadomy wybór strategii połączenia (Wariant B).

Niniejsza zmiana (Część 2 z #40.3) implementuje wskaźniki synchronizacji w czasie rzeczywistym, przycisk ręcznego wywołania „Synchronizuj teraz” w `SettingsView` oraz modal wyboru `InitialSyncConflictDialog` (Wariant B) z trzema opcjami: scalenie (domyślne), zastąpienie z chmury lub nadpisanie chmury.

## What Changes
- **Wskaźnik statusu synchronizacji na żywo w Ustawieniach (`src/components/SettingsView.tsx`)**:
  - Reaktywny indykator stanu: zielony badge `Zsynchronizowano` z czytelnym formatem daty i godziny (np. *„Dzisiaj, 17:35”* lub *„04.11.2026, 17:35”*), niebieski spinner `Synchronizowanie...`, bursztynowy badge `Wstrzymana (brak Internetu)` oraz czerwony alert błędu z opisem i opcją ponowienia.
  - Przycisk akcji **„Synchronizuj teraz”** (ikona `RefreshCw` animująca rotację w trakcie synchronizacji) z blokadą wielokrotnego kliknięcia.
- **Modal Konfliktów przy Pierwszym Połączeniu (`src/components/InitialSyncConflictDialog.tsx`)**:
  - Wdrożenie komponentu dialogowego opartego na Radix UI (`Dialog`).
  - Wykrywanie warunku pierwszego połączenia (`lastSyncedAt === null`), obecności danych autorskich na urządzeniu oraz istniejącego pliku kopii w Google Drive.
  - Prezentacja 3 opcji decyzyjnych (Wariant B):
    1. **Scal dane (Zalecane / domyślnie zaznaczona)**: uruchamia algorytm Last-Write-Wins, łącząc unikalne elementy z obu źródeł.
    2. **Użyj danych z chmury**: pobiera backup z Dysku Google i zastępuje lokalny stan urządzenia.
    3. **Nadpisz chmurę danymi z tego urządzenia**: wysyła obecny stan urządzenia do chmury, nadpisując stary plik kopii.
- **Logika Koordynatora dla Stanu Początkowego (`src/services/sync/syncCoordinator.ts`)**:
  - Funkcja `checkInitialSyncConflict()` sprawdzająca czy zachodzi kolizja początkowa i zwracająca podsumowanie lokalne oraz zdalne.
  - Funkcja `resolveInitialSync(action)` realizująca wybraną przez użytkownika akcję w chmurze i store.
- **Testy Jednostkowe i UI**:
  - Pokrycie testami integracyjnymi komponentu `InitialSyncConflictDialog` oraz kafelka synchronizacji w `SettingsView`.

## Capabilities

### Modified Capabilities
- `settings-module`: Rozszerzenie sekcji Konta i Kopii Zapasowej w Ustawieniach o wskaźniki czasu rzeczywistego, przycisk ręcznej synchronizacji oraz modal wyboru `InitialSyncConflictDialog`.

## Impact
- **Kod źródłowy**: `src/components/SettingsView.tsx`, `src/components/InitialSyncConflictDialog.tsx` (nowy), `src/services/sync/syncCoordinator.ts`.
- **Testy**: `src/tests/ui/InitialSyncConflictDialog.test.tsx` (nowy), `src/tests/ui/SettingsView.test.tsx`.
- **Brak zmian destrukcyjnych (Non-breaking)**: Zachowanie pełnej kompatybilności Offline-First.
