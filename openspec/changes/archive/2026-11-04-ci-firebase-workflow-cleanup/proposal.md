# Proposal: Optymalizacja CI/CD i usunięcie zbędnego workflow podglądów Firebase na PR (#51)

## Why
Automatyczny workflow `.github/workflows/firebase-hosting-pull-request.yml` wygenerowany przez Firebase CLI generował fałszywe błędy (czerwone krzyżyki) przy każdym tworzonym Pull Requeście ze względu na brakujące/wygasłe poświadczenia serwisowe i brakujące środowisko Node. Aplikacja mobilna (Capacitor) i webowa jest weryfikowana lokalnie przez programistę, a właściwy deploy na Firebase powinien następować wyłącznie po zmergowaniu przetestowanego kodu do gałęzi `main`. Usunięcie zbędnego workflow oszczędza darmowe limity minut GitHub Actions oraz eliminuje dezinformację w statusach PR.

## What Changes
- **Usunięcie workflow podglądów PR**: Całkowite usunięcie pliku `.github/workflows/firebase-hosting-pull-request.yml`.
- **Ustandaryzowanie wdrożenia produkcyjnego po merge**: Dodanie oficjalnego kroku `actions/setup-node@v4` (wersja Node 20 z cache npm) do `.github/workflows/firebase-hosting-merge.yml`, gwarantującego spójne środowisko budowania aplikacji produkcyjnej po merge z `ci.yml`.
- **Czysta bramka CI**: Statusy PR opierają się wyłącznie na merytorycznej bramce jakości `CI Quality Gates` (`ci.yml` - typecheck, lint, testy).

## Capabilities

### New Capabilities
Brak nowych zdolności systemowych.

### Modified Capabilities
- `testing-quality-gates`: Uściślenie wymagań dotyczących procesów CI/CD – pull requesty są weryfikowane wyłącznie przez bramkę jakości kodu, bez prób wdrażania tymczasowych środowisk preview, natomiast wdrożenie produkcyjne na gałęzi `main` posiada ustandaryzowane środowisko wykonawcze Node.js.

## Impact
- **Pliki konfiguracyjne**:
  - Usunięcie: `.github/workflows/firebase-hosting-pull-request.yml`
  - Modyfikacja: `.github/workflows/firebase-hosting-merge.yml`
- **Infrastruktura**: GitHub Actions i Firebase Hosting.
- **Wpływ na kod źródłowy**: Brak zmian w kodzie aplikacji (`src/`), brak regresji.

