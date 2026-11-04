# Technical Design: Interfejs Synchronizacji w Ustawieniach i Modal Konfliktów

## Context
W zadaniu #40.3a zaimplementowaliśmy niskopoziomowy silnik cyklu życia synchronizacji (`syncCoordinator.ts`) oraz rozszerzyliśmy stan Zustand Store o pola `syncStatus`, `lastSyncedAt` i `syncError`. Niniejszy projekt dostarcza warstwę prezentacji (UI) w module Ustawień oraz modal decyzyjny przy pierwszym połączeniu konta (Wariant B).

## Goals / Non-Goals

**Goals:**
- Dedykowany komponent modalu `InitialSyncConflictDialog` (Wariant B) z 3 opcjami: scalenie (domyślne), zastąpienie z chmury, nadpisanie chmury.
- Funkcje pomocnicze w `syncCoordinator.ts` do detekcji kolizji początkowej (`checkInitialSyncConflict`) i wykonania wybranej strategii (`resolveInitialSync`).
- Reaktywny panel statusu synchronizacji w czasie rzeczywistym w `SettingsView.tsx` (zielony / niebieski / bursztynowy / czerwony).
- Przycisk ręcznej synchronizacji („Synchronizuj teraz”) z animacją rotacji.
- Formatowanie czasu ostatniej kopii (np. *„Dzisiaj, 17:35”* lub *„Wczoraj, 14:20”*).

**Non-Goals:**
- Dalsze modyfikacje algorytmu Last-Write-Wins (silnik LWW z #40.2 i #40.3a pozostaje nienaruszony).
- Zmiany w widokach treningu czy zegara.

## Decisions

### 1. Dedykowany komponent `InitialSyncConflictDialog.tsx`
* **Decyzja:** Utworzenie odrębnego pliku `src/components/InitialSyncConflictDialog.tsx` zamiast rozbudowywania `SettingsView.tsx`.
* **Uzasadnienie:** Czysta modularność, łatwość testowania jednostkowego w izolacji oraz utrzymanie przejrzystości kodu widoku Ustawień.
* **Architektura komponentu:** Trzy klikalne kafelki wyboru (karty z ikonami i radiowym wskaźnikiem wyboru). Domyślnie aktywna opcja `merge` (Scal dane).

### 2. Rozszerzenie `syncCoordinator.ts` o `checkInitialSyncConflict` i `resolveInitialSync`
* **Decyzja:** Umieszczenie logiki weryfikacji i wykonania rozstrzygnięcia początkowego w serwisie koordynatora.
* **Uzasadnienie:** `SettingsView` oraz `InitialSyncConflictDialog` pozostają komponentami prezentacyjnymi, a operacje sieciowe Google Drive i manipulacje stanem store są hermetyzowane w koordynatorze.

### 3. Logika detekcji kolizji początkowej
* **Warunki kolizji:**
  1. `store.lastSyncedAt === null` (pierwsze logowanie na tym urządzeniu).
  2. Liczba aktywnych autorskich elementów na urządzeniu > 0 (`customExercises.filter(!_sync.isDeleted).length > 0` lub sale/sprzęt/presety).
  3. Istnieje zdalny plik na Google Drive (`findBackupFile`).
* **W przeciwnym wypadku:** Jeśli urządzenie jest czyste, po zalogowaniu następuje automatyczne pobranie bez pytania; jeśli chmura jest pusta, następuje automatyczny pierwszy upload.

## Risks / Trade-offs

* **[Risk]** Użytkownik zamknie modal bez wyboru (kliknięcie poza modal).
  - **Mitigation:** Bezpieczne zachowanie domyślne: odłożenie synchronizacji do kolejnego wejścia lub ponownego kliknięcia w Ustawieniach, bez utraty danych na urządzeniu ani w chmurze.
* **[Risk]** Błąd sieciowy podczas wykonywania `resolveInitialSync`.
  - **Mitigation:** Wyłapanie błędu, ustawienie stanu `syncStatus: 'error'` w store i prezentacja czytelnego komunikatu w modalu/Ustawieniach.
