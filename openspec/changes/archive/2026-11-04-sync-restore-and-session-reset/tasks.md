# Tasks: Przywracanie Danych z Chmury i Reset Sesji Synchronizacji

## 1. Stan Store i Logika Koordynatora

- [x] 1.1 [src/app/lib/store.ts] Dodanie zerowania `lastSyncedAt`, `syncStatus` i `syncError` w akcji `disconnectGoogleAccount`
- [x] 1.2 [src/services/sync/syncCoordinator.ts] Rozszerzenie `checkInitialSyncConflict` o detekcję nagrobków (tombstones) w kolekcjach
- [x] 1.3 [src/services/sync/syncCoordinator.ts] Dodanie wyeksportowanej funkcji `restoreFromCloudBackup` zastępującej stan store kopią z Dysku Google

## 2. Komponenty UI i Ustawienia

- [x] 2.1 [src/components/RestoreCloudBackupDialog.tsx] Implementacja komponentu modalu potwierdzenia przywrócenia kopii z chmury opartego na Radix Dialog
- [x] 2.2 [src/components/SettingsView.tsx] Dodanie przycisku „Przywróć kopię z chmury”, obsługa dialogu potwierdzenia i wywołanie `restoreFromCloudBackup`

## 3. Testy i Walidacja

- [x] 3.1 [src/tests/store-auth.test.ts] Weryfikacja zerowania `lastSyncedAt` przy odłączaniu konta w testach Zustand Store
- [x] 3.2 [src/tests/sync-coordinator.test.ts] Testy jednostkowe dla `restoreFromCloudBackup` oraz detekcji kolizji początkowej przy obecności nagrobków
- [x] 3.3 [src/tests/ui/RestoreCloudBackupDialog.test.tsx] Testy jednostkowe i interakcji dla komponentu modalu przywracania kopii
- [x] 3.4 [src/tests/ui/SettingsView.test.tsx] Testy obecności i kliknięcia przycisku „Przywróć kopię z chmury” w widoku Ustawień
