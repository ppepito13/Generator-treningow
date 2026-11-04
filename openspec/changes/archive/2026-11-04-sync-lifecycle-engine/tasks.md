# Tasks: Silnik Cyklu Życia Synchronizacji w Tle

## 1. Konfiguracja Autoryzacji i Typy Synchronizacji

- [x] 1.1 [src/services/auth/googleAuth.ts] Zwiększyć stałą `AUTH_TIMEOUT_MS` z 35000 do 60000 ms dla stabilnej autoryzacji 2FA.
- [x] 1.2 [src/types/sync.ts] Zdefiniować typ `SyncStatus` (`'idle' | 'syncing' | 'success' | 'error' | 'offline'`) oraz interfejs stanu cyklu życia synchronizacji `SyncLifecycleState`.

## 2. Koordynator Synchronizacji (SyncCoordinator)

- [x] 2.1 [src/services/sync/syncCoordinator.ts] Utworzyć serwis `SyncCoordinator` realizujący orkiestrację cyklu: pobranie backupu z Google Drive, scalenie LWW z lokalnym stanem, atomowy zapis do store i wysłanie zaktualizowanego pliku z zabezpieczeniem `isSyncing` przed pętlami zwrotnymi.
- [x] 2.2 [src/services/sync/syncCoordinator.ts] Zaimplementować funkcję `scheduleDebouncedSync` (opóźnienie 2500 ms) oraz rejestrację zdarzenia sieciowego `online` (`initSyncNetworkListeners`) wznawiającego synchronizację po odzyskaniu łączności.

## 3. Integracja z Zustand Store

- [x] 3.1 [src/app/lib/store.ts] Rozszerzyć stan `AppState` o pola `syncStatus`, `lastSyncedAt`, `syncError` oraz akcję `triggerSync` odpytującą `SyncCoordinator`.
- [x] 3.2 [src/app/lib/store.ts] Podpiąć wywołanie `scheduleDebouncedSync` pod akcje modyfikujące autorskie kolekcje (`addCustomExercise`, `removeCustomExercise`, `addCustomRoom`, `removeCustomRoom`, `addCustomEquipment`, `removeCustomEquipment`, `addCustomIntervalPreset`, `removeCustomIntervalPreset`).

## 4. Testy i Weryfikacja Jakości

- [x] 4.1 [src/tests/auth-errors.test.ts] Uaktualnić testy sprawdzające limit czasu logowania Google pod limit 60 sekund.
- [x] 4.2 [src/tests/sync-coordinator.test.ts] Utworzyć zestaw testów jednostkowych dla `SyncCoordinator` pokrywających: udaną synchronizację (pobranie -> scalenie -> upload), debouncing wielu edycji, ignorowanie podczas trybu offline i brak zapętlenia.
- [x] 4.3 [npm run verify] Uruchomić pełną lokalną bramkę jakości (`tsc --noEmit`, `next lint`, `vitest run`) i zweryfikować 100% zdanych testów bez błędów i ostrzeżeń.

