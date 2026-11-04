# Spec Delta: testing-quality-gates

## MODIFIED Requirements

### Requirement: Pełna bramka weryfikacji w CI (GitHub Actions)
Serwer ciągłej integracji GitHub Actions MUST uruchamiać pełen zestaw kontroli jakości `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) przy każdym pushu na gałęzie robocze oraz przy tworzeniu pull requestów do `main`. Weryfikacja PR MUST być ograniczona do kontroli jakości kodu i nie może uruchamiać tymczasowych wdrożeń Firebase Hosting Preview.

#### Scenario: Wykrycie błędu typowania lub testu w CI
- **GIVEN** kod zawierający błąd typowania TypeScript lub niezgodność testu Vitest
- **WHEN** następuje push lub PR do gałęzi `main`
- **THEN** job GitHub Actions kończy się błędem (kod wyjścia != 0) i blokuje możliwość automatycznego wdrożenia.

#### Scenario: Pull Request bez zbędnych podglądów chmurowych
- **GIVEN** otwarty Pull Request do gałęzi `main`
- **WHEN** GitHub Actions uruchamia workflow sprawdzający
- **THEN** wykonywany jest wyłącznie job `CI Quality Gates / verify`, a żaden job tymczasowego podglądu Firebase nie jest uruchamiany.

## ADDED Requirements

### Requirement: Ustandaryzowane środowisko Node w procesie wdrożeniowym
Wdrożenie aplikacji na środowisko produkcyjne (Firebase Hosting) uruchamiane po scaleniu zmian do gałęzi `main` MUST używać ustandaryzowanego kroku `actions/setup-node@v4` z wersją Node.js 20 i pamięcią podręczną npm, gwarantując spójność środowiska z bramką jakości CI.

#### Scenario: Automatyczny deploy po scaleniu do main
- **GIVEN** scalenie gałęzi do `main`
- **WHEN** GitHub Actions uruchamia workflow `firebase-hosting-merge.yml`
- **THEN** środowisko runnera instaluje Node.js w wersji 20 z aktywnym cache npm przed wykonaniem `npm ci && npm run build`.

