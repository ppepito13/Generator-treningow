# Tasks: Faza 3.3 – Integracja ze Store i Czyszczenie Monolitu

- [x] 1.1 [src/domain/generator/types.ts] Dodanie pola `partialStations` do interfejsu `GenerationConflictData`.
- [x] 1.2 [src/domain/generator/circuitStrategy.ts] Przekazywanie `partialStations` w obiekcie `GenerationConflictData` przy braku ćwiczeń.
- [x] 1.3 [src/domain/generator/synchronizedStrategy.ts] Przekazywanie `partialStations` w obiekcie `GenerationConflictData` przy braku ćwiczeń.
- [x] 1.4 [src/tests/domain/generatorStrategies.test.ts] Test jednostkowy Vitest weryfikujący obecność `partialStations` w konflikcie generowania.
- [x] 1.5 [src/components/StationCard.tsx] Przełączenie importu `getValidExercisesForZone` na moduł domenowy oraz wstrzyknięcie `getAllExercises()`.
- [x] 1.6 [src/app/lib/store.ts] Usunięcie starych funkcji `generateCircuitStrategy`, `generateSynchronizedStrategy` oraz stuba `changeStationZone`.
- [x] 1.7 [src/app/lib/store.ts] Refaktoryzacja `generateCircuit` z delegacją do strategii domenowych i wstrzyknięciem `getAllExercises()`.
- [x] 1.8 [src/app/lib/store.ts] Refaktoryzacja `rerollExercise` z delegacją do `rerollExerciseStrategy` i wstrzyknięciem `getAllExercises()`.
- [x] 1.9 [src/app/lib/store.ts] Refaktoryzacja `resolveConflict` z obsługą `partialStations` oraz synchronizacją `stationCount` przy akcji `reduce`.
- [x] 1.10 [src/tests/store-integration.test.ts] Nowe testy integracyjne Vitest dla metod `generateCircuit`, `rerollExercise` i `resolveConflict` w Zustand Store.
- [x] 1.11 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) z wynikiem 0 błędów i 0 ostrzeżeń.
- [x] 1.12 [Weryfikacja Android] Uruchomienie `npm run build` weryfikujące generowanie statycznego eksportu `out/` pod Android Studio.

