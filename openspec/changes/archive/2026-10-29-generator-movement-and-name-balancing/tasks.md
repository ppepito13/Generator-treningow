# Tasks: Ulepszony Balans Sąsiednich Segmentów Ruchowych oraz Deduplikacja po Rdzeniu Nazwy

- [x] 1.1 [src/domain/generator/muscleBalancing.ts] Implementacja funkcji `normalizeExerciseBaseName` oraz rozszerzenie `filterBySegmentBalancing` o obsługę `excludedSegmentIds`, `usedBaseNames` i opcji `softFallback`.
- [x] 1.2 [src/tests/domain/muscleBalancing.test.ts] Testy jednostkowe dla `normalizeExerciseBaseName` oraz dwustronnego wykluczania `excludedSegmentIds`.
- [x] 1.3 [src/domain/generator/cascadeFallback.ts] Rozszerzenie `CascadeFilterParams` o `excludedSegmentIds` oraz `usedBaseNames` wraz z wdrożeniem zaktualizowanych kroków kaskady.
- [x] 1.4 [src/tests/domain/cascadeFallback.test.ts] Testy jednostkowe weryfikujące priorytet poluzowania trudności przed rozluźnieniem sąsiedztwa i rdzenia nazwy.
- [x] 1.5 [src/domain/generator/circuitStrategy.ts] Integracja śledzenia `usedBaseNames` oraz cykliczności pętli obwodu (stacja $N-1$ wyklucza stację $0$).
- [x] 1.6 [src/domain/generator/rerollStrategy.ts] Integracja dwustronnej kontroli sąsiadów (`prev` i `next`) oraz deduplikacji `usedBaseNames` przy automatycznym re-rollu.
- [x] 1.7 [src/tests/domain/generatorStrategies.test.ts] Testy integracyjne generatora i re-rollu potwierdzające brak sąsiadujących duplikatów segmentów i `base_name`.
- [x] 1.8 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) potwierdzające 0 błędów i 100% zielonych testów.
- [x] 1.9 [Weryfikacja Android] Uruchomienie `npm run build` potwierdzające statyczny eksport `out/` pod aplikację mobilną Capacitor.

