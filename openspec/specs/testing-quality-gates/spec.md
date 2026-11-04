# testing-quality-gates Specification

## Purpose
TBD - created by archiving change quality-gates-and-tracking. Update Purpose after archive.

## Requirements

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

### Requirement: Testy integralności bazy danych JSON
Aplikacja MUST posiadać test automatyczny weryfikujący poprawność struktury i relacji w plikach JSON (`lista_cwiczen.json`, `lista_sprzetu.json`, `sala.json`, `poziomy_trudnosci.json`).

#### Scenario: Wykrycie literówki w sprzęcie lub błędnego ID ćwiczenia
- **GIVEN** plik bazy ćwiczeń `lista_cwiczen.json`
- **WHEN** uruchamiany jest test `data-integrity.test.ts`
- **THEN** test weryfikuje czy każde ćwiczenie posiada unikalne `id_cwiczenia`, poprawny poziom (1-4), a każdy wymagany sprzęt istnieje w `lista_sprzetu.json`.

### Requirement: Środowisko i testy renderowania komponentów UI
Projekt MUST posiadać skonfigurowane środowisko emulacji DOM (`jsdom`) oraz bibliotekę `@testing-library/react` z zestawem testów renderowania (smoke tests) dla kluczowych elementów interfejsu.

#### Scenario: Renderowanie dolnej nawigacji i kart ćwiczeń
- **GIVEN** komponenty `BottomNav` oraz `StationCard`
- **WHEN** komponenty są renderowane w środowisku testowym Vitest z `jsdom`
- **THEN** elementy interfejsu (zakładki nawigacji, nazwa stacji, ćwiczenie) renderują się poprawnie bez błędów konsoli i wyjątków React.

### Requirement: Obowiązkowe śledzenie w TODO i CHANGELOG
Każda zmiana w projekcie MUST być rejestrowana w `todo.md` jako numerowane zadanie oraz w `CHANGELOG.md` w sekcji `[Unreleased]` przed sfinalizowaniem i archiwizacją zmiany.

#### Scenario: Domknięcie zadania projektowego
- **GIVEN** ukończona zmiana OpenSpec
- **WHEN** zmiana przygotowywana jest do archiwizacji i commita
- **THEN** powiązane zadanie w `todo.md` jest oznaczone jako `[x]`, a do `CHANGELOG.md` w sekcji `[Unreleased]` dodany jest zwięzły wpis biznesowy.

### Requirement: Ustandaryzowane środowisko Node w procesie wdrożeniowym
Wdrożenie aplikacji na środowisko produkcyjne (Firebase Hosting) uruchamiane po scaleniu zmian do gałęzi `main` MUST używać ustandaryzowanego kroku `actions/setup-node@v4` z wersją Node.js 20 i pamięcią podręczną npm, gwarantując spójność środowiska z bramką jakości CI.

#### Scenario: Automatyczny deploy po scaleniu do main
- **GIVEN** scalenie gałęzi do `main`
- **WHEN** GitHub Actions uruchamia workflow `firebase-hosting-merge.yml`
- **THEN** środowisko runnera instaluje Node.js w wersji 20 z aktywnym cache npm przed wykonaniem `npm ci && npm run build`.
