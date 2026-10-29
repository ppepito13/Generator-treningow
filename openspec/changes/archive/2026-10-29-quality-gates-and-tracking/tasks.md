# Tasks: Rozszerzenie Bramek Jakości, Testów UI oraz Śledzenia Wydań

- [x] 1.1 [todo.md] Aktualizacja punktu 5 na ukończony, uporządkowanie sekcji future oraz dodanie nowych numerowanych zadań #34, #35, #36.
- [x] 1.2 [CHANGELOG.md] Utworzenie sekcji `## [Unreleased]` i uzupełnienie wpisów dla modułów Studio, kalkulatorów oraz usprawnień testowych.
- [x] 1.3 [AGENTS.md] Dodanie żelaznej zasady nakazującej obowiązkowe śledzenie zadań w `todo.md` i `CHANGELOG.md` przed archiwizacją zmian.
- [x] 1.4 [openspec/config.yaml] Dodanie reguły śledzenia wydań do konfiguracji OpenSpec.
- [x] 1.5 [.github/workflows/ci.yml] Zastąpienie wybiórczych komend krokiem `npm run verify` egzekwującym pełną bramkę jakości w GitHub Actions.
- [x] 1.6 [src/tests/data-integrity.test.ts] Utworzenie testów automatycznych weryfikujących integralność i relacje w plikach JSON bazy ćwiczeń, sprzętu i sal.
- [x] 1.7 [package.json] Dodanie zależności `jsdom`, `@testing-library/react` i `@testing-library/jest-dom` do `devDependencies`.
- [x] 1.8 [src/tests/setup.ts] Utworzenie konfiguracji środowiska DOM dla Vitest wraz z mockami `matchMedia`.
- [x] 1.9 [vitest.config.ts] Rejestracja pliku `setupFiles` w konfiguracji testów.
- [x] 1.10 [src/tests/ui/BottomNav.test.tsx] Test renderowania i przełączania zakładek w komponencie dolnej nawigacji.
- [x] 1.11 [src/tests/ui/StationCard.test.tsx] Test renderowania karty stacji w trybie pojedynczym oraz w parze.
- [x] 1.12 [src/tests/ui/GeneratorSmoke.test.tsx] Test dymny (smoke test) poprawnego renderowania głównego formularza generatora.
- [x] 1.13 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) z wynikiem 0 błędów i 0 ostrzeżeń.
- [x] 1.14 [Weryfikacja Android] Uruchomienie `npm run build` potwierdzające czysty statyczny eksport `out/` pod aplikację mobilną.
