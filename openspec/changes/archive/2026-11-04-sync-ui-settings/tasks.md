# Tasks: Interfejs Synchronizacji w Ustawieniach i Modal Konfliktów

## 1. Logika Koordynatora dla Stanu Początkowego

- [x] 1.1 [src/services/sync/syncCoordinator.ts] Dodanie funkcji pomocniczej `formatLastSyncedAt` do formatowania daty ostatniej kopii
- [x] 1.2 [src/services/sync/syncCoordinator.ts] Dodanie funkcji `checkInitialSyncConflict` sprawdzającej obecność lokalnych danych i kopii zdalnej
- [x] 1.3 [src/services/sync/syncCoordinator.ts] Dodanie funkcji `resolveInitialSync` realizującej wybraną strategię (merge, pull, push)

## 2. Komponent Modalu Konfliktów

- [x] 2.1 [src/components/InitialSyncConflictDialog.tsx] Implementacja komponentu modalu opartego na Radix Dialog z 3 wariantami wyboru (scalenie domyślne)

## 3. Interfejs w Ustawieniach

- [x] 3.1 [src/components/SettingsView.tsx] Dodanie reaktywnego wskaźnika statusu synchronizacji, czasu ostatniej kopii oraz przycisku „Synchronizuj teraz”
- [x] 3.2 [src/components/SettingsView.tsx] Podpięcie sprawdzania konfliktu początkowego po zalogowaniu i osadzenie `InitialSyncConflictDialog`

## 4. Testy i Weryfikacja Jakości

- [x] 4.1 [src/tests/sync-coordinator.test.ts] Dodanie testów jednostkowych dla `formatLastSyncedAt`, `checkInitialSyncConflict` i `resolveInitialSync`
- [x] 4.2 [src/tests/ui/InitialSyncConflictDialog.test.tsx] Utworzenie testów jednostkowych i interakcji dla komponentu dialogu
- [x] 4.3 [src/tests/ui/SettingsView.test.tsx] Aktualizacja testów widoku Ustawień pod kątem nowego wskaźnika synchronizacji i przycisku
