# Tasks: Faza 3.2 – Balans Mięśniowy, Kaskada i Strategie Losowania

- [x] 1.1 [src/domain/generator/types.ts] Rozszerzenie typów domenowych o interfejsy `RandomFn`, `GenerationResult`, `CircuitStrategyParams`, `SynchronizedStrategyParams`, `RerollStrategyParams`.
- [x] 1.2 [src/domain/generator/muscleBalancing.ts] Implementacja heurystyki balansu segmentów ruchowych i partii mięśniowych (`filterBySegmentBalancing`).
- [x] 1.3 [src/tests/domain/muscleBalancing.test.ts] Testy jednostkowe Vitest dla heurystyki balansu segmentów i partii partnerskich.
- [x] 1.4 [src/domain/generator/cascadeFallback.ts] Implementacja kaskadowego fallbacku dla pustej puli ćwiczeń (`applyCascadeFallback`).
- [x] 1.5 [src/domain/generator/pairStationStrategy.ts] Ekstrakcja bezpiecznego doboru ćwiczenia bliźniaczego B z wirtualnym odliczeniem sprzętu (`resolvePairStationExercises`).
- [x] 1.6 [src/tests/domain/pairStationStrategy.test.ts] Testy jednostkowe Vitest dla reguł stacji podwójnych, ćwiczeń bliźniaczych i odliczania inwentarza.
- [x] 1.7 [src/domain/generator/circuitStrategy.ts] Implementacja czystej strategii generowania obwodu `generateCircuitStrategy` z balansem, stacjami oddechowymi i parami.
- [x] 1.8 [src/domain/generator/synchronizedStrategy.ts] Implementacja czystej strategii treningu synchronicznego `generateSynchronizedStrategy`.
- [x] 1.9 [src/domain/generator/rerollStrategy.ts] Implementacja czystej strategii rerollu ćwiczenia na stacji `rerollExerciseStrategy`.
- [x] 1.10 [src/domain/generator/index.ts] Re-eksport nowych funkcji i typów w publicznym barrel export modułu domenowego.
- [x] 1.11 [src/tests/domain/generatorStrategies.test.ts] Testy jednostkowe Vitest dla `generateCircuitStrategy`, `generateSynchronizedStrategy`, determinizmu losowości i kaskady.
- [x] 1.12 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) z wynikiem 0 błędów i 0 ostrzeżeń.

