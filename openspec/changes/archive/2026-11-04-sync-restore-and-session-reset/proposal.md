# Proposal: Przywracanie Danych z Chmury i Reset Sesji Synchronizacji

## Why
W trakcie testów eksploracyjnych zadania #40.3 wykryto dwa kluczowe przypadki brzegowe:
1. Gdy użytkownik usunął autorskie ćwiczenie (tworząc lokalny nagrobek Tombstone `isDeleted: true`), a następnie połączył ponownie konto Google, silnik sprawdzał liczbę aktywnych elementów na urządzeniu (`!isDeleted`), otrzymywał 0 i automatycznie wyzwalał cichą synchronizację w tle (`performSync`). W efekcie Last-Write-Wins natychmiast nadpisywał kopię w Google Drive informacją o usunięciu ćwiczenia, uniemożliwiając użytkownikowi odzyskanie danych z chmury.
2. Funkcja `disconnectGoogleAccount` w Zustand Store nie zerowała znacznika `lastSyncedAt`, przez co ponowne połączenie konta nie traktowało urządzenia jako nowego stanu sesji.

Niniejsza propozycja (#40.4) rozwiązuje te problemy poprzez:
- Wstrzymanie cichej automatycznej synchronizacji po zalogowaniu, gdy w Google Drive istnieje już plik kopii zapasowej, i bezwzględne zapytanie użytkownika za pomocą modalu `InitialSyncConflictDialog` (również gdy na urządzeniu istnieją nagrobki usunięć).
- Reset znacznika `lastSyncedAt` na `null` podczas odłączania konta Google.
- Wdrożenie dedykowanej akcji i modalu potwierdzenia **„Przywróć kopię z chmury”** w Ustawieniach, która pozwala w dowolnym momencie nadpisać stan lokalny kopią z Dysku Google i wyczyścić lokalne nagrobki.

## What Changes
- **Reset sesji przy odłączeniu (`src/app/lib/store.ts`)**:
  - `disconnectGoogleAccount`: ustawienie `lastSyncedAt: null`, `syncStatus: 'idle'` oraz `syncError: null`.
- **Wykrywanie kolizji z uwzględnieniem nagrobków (`src/services/sync/syncCoordinator.ts`)**:
  - Aktualizacja `checkInitialSyncConflict()`: badanie łącznej liczby rekordów autorskich w store (w tym nagrobków `customExercises.length > 0` lub sale/sprzęt/presety), aby obecność nagrobków nie była mylona z czystym urządzeniem.
  - Zabezpieczenie przed samowolnym wywołaniem `performSync()` po zalogowaniu w `SettingsView.tsx`, jeśli na Dysku Google istnieje już wcześniejszy backup.
- **Funkcja przywracania stanu z chmury (`src/services/sync/syncCoordinator.ts`)**:
  - Implementacja `restoreFromCloudBackup()`: pobiera plik z Google Drive, zastępuje kolekcje w store (kasując lokalne nagrobki), aktualizuje `lastSyncedAt` i ustawia status `idle`.
- **Interfejs Ustawień (`src/components/SettingsView.tsx` oraz `src/components/RestoreCloudBackupDialog.tsx`)**:
  - Dodanie przycisku pomocniczego **„Przywróć kopię z chmury”** w panelu synchronizacji.
  - Utworzenie prostego modalu potwierdzenia `RestoreCloudBackupDialog` z ostrzeżeniem o wycofaniu lokalnych zmian i przyciskami *„Anuluj”* / *„Przywróć dane z chmury”*.
- **Testy Jednostkowe i UI**:
  - Testy resetu sesji w store.
  - Testy `restoreFromCloudBackup` oraz detekcji kolizji z nagrobkami.
  - Testy komponentu `RestoreCloudBackupDialog` i interakcji w `SettingsView`.

## Capabilities

### Modified Capabilities
- `settings-module`: Rozszerzenie sekcji Konta i Kopii Zapasowej o dedykowaną akcję przywracania z chmury, modal potwierdzenia oraz ochronę przed nadpisywaniem chmury nagrobkami po ponownym połączeniu konta.

## Impact
- **Kod źródłowy**: `src/app/lib/store.ts`, `src/services/sync/syncCoordinator.ts`, `src/components/SettingsView.tsx`, `src/components/RestoreCloudBackupDialog.tsx` (nowy).
- **Testy**: `src/tests/sync-coordinator.test.ts`, `src/tests/ui/SettingsView.test.tsx`, `src/tests/ui/RestoreCloudBackupDialog.test.tsx` (nowy).
- **Kompatybilność**: Pełna zgodność wsteczna Offline-First i eksportu Capacitor Android.

