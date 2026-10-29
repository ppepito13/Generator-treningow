# Propozycja Zmiany: Rozszerzenie Bramek Jakości, Testów UI oraz Śledzenia Wydań (quality-gates-and-tracking)

## Dlaczego ta zmiana jest potrzebna?
Aplikacja działa w trybie produkcyjnym na urządzeniach mobilnych (Android / Capacitor) oraz w przeglądarce. Aby zagwarantować bezwzględne bezpieczeństwo przed regresją, brakami w integralności danych oraz awariami interfejsu (biały ekran) przed przystąpieniem do dalszych zmian w logice generatora i UI, konieczne jest:
1. **Domknięcie zdalnej bramki CI (GitHub Actions):** Uruchamianie pełnego `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) w workflow CI, aby błędy typowania i lintera były blokowane przed mergem.
2. **Automatyczne testy integralności bazy danych (`data-integrity.test.ts`):** Statyczna weryfikacja plików JSON (`lista_cwiczen.json`, `lista_sprzetu.json`, `sala.json`), chroniąca przed literówkami w nazwach sprzętu, nieistniejącymi strefami czy błędnymi poziomami trudności.
3. **Środowisko i testy renderowania UI:** Rozszerzenie Vitest o `jsdom` i `@testing-library/react` oraz stworzenie testów dymnych (smoke tests) dla krytycznych komponentów interfejsu (`BottomNav`, `StationCard`, formularz generatora).
4. **Ścisła dyscyplina śledzenia w TODO i CHANGELOG:** Uporządkowanie dotychczasowej sekcji `future` w `todo.md` i przeniesienie jej do zorganizowanej sekcji `[Unreleased]` w `CHANGELOG.md`, a także ustanowienie żelaznej zasady aktualizowania `todo.md` i `CHANGELOG.md` przy każdym zadaniu.

## Co dokładnie zostanie zrobione?
- Zaktualizowanie `todo.md`: odhaczenie zadania 5, reorganizacja `future` -> `[Unreleased]`, dopisanie zadań #34, #35, #36.
- Uzupełnienie `AGENTS.md` oraz `openspec/config.yaml` o regułę nakazującą aktualizację `todo.md` i `CHANGELOG.md` przed zamknięciem każdej zmiany.
- Zaktualizowanie `.github/workflows/ci.yml` do wykonywania `npm run verify`.
- Utworzenie testu `src/tests/data-integrity.test.ts` weryfikującego spójność relacyjną danych JSON.
- Instalacja `jsdom`, `@testing-library/react` i `@testing-library/jest-dom` w `devDependencies`.
- Konfiguracja `src/tests/setup.ts` i `vitest.config.ts` pod kątem testów komponentów.
- Utworzenie zestawu testów renderowania UI (`src/tests/ui/BottomNav.test.tsx`, `src/tests/ui/StationCard.test.tsx`, `src/tests/ui/GeneratorSmoke.test.tsx`).
- Aktualizacja `CHANGELOG.md` o sekcję `## [Unreleased]` zawierającą ukończone moduły oraz nowe zabezpieczenia jakościowe.

