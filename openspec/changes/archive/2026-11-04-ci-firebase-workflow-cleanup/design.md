# Design: Optymalizacja CI/CD i usunięcie zbędnego workflow podglądów Firebase na PR (#51)

## Context
W repozytorium istnieją trzy pliki workflow w `.github/workflows/`:
1. `ci.yml` – główna, w 100% sprawna bramka jakości (typecheck, lint, vitest), uruchamiana na push i pull_request.
2. `firebase-hosting-pull-request.yml` – automatyczny workflow Firebase CLI próbujący wdrażać preview channel na każdym PR. Kończy się błędem z powodu brakujących poświadczeń i braku konfiguracji środowiska Node.
3. `firebase-hosting-merge.yml` – workflow wdrożenia produkcyjnego po scaleniu z gałęzią `main`.

## Goals / Non-Goals

**Goals:**
- Usunięcie pliku `.github/workflows/firebase-hosting-pull-request.yml`, aby żaden PR nie uruchamiał niepotrzebnego wdrożenia preview.
- Dodanie kroku `actions/setup-node@v4` z wersją Node 20 oraz cache npm w `.github/workflows/firebase-hosting-merge.yml`.
- Zagwarantowanie, że Pull Requesty są weryfikowane wyłącznie przez zielony check `CI Quality Gates / verify`.

**Non-Goals:**
- Zmiana zachowania bramki jakości `ci.yml` (pozostaje nienaruszona).
- Zmiana kodu produkcyjnego aplikacji w `src/`.
- Modyfikacja konfiguracji Firebase (`firebase.json`, `.firebaserc`).

## Decisions
- **Decyzja 1: Całkowite usunięcie zamiast warunku `if: false`**:
  * *Uzasadnienie:* Użytkownik wyraźnie zadeklarował, że nie potrzebuje podglądów na Firebase dla PR-ów. Martwe pliki konfiguracyjne wprowadzają dług techniczny i dezinformację. Usunięcie pliku jest najczystszym rozwiązaniem.
  * *Alternatywy:* Pozostawienie pliku z wyłączeniem triggera lub naprawa sekretu (odrzucone jako niepotrzebny narzut czasowy i limitów).
- **Decyzja 2: Ujednolicenie wersji Node 20 w workflow merge**:
  * *Uzasadnienie:* W `ci.yml` używamy `node-version: 20` z `cache: 'npm'`. Zastosowanie tego samego kroku w `firebase-hosting-merge.yml` eliminuje ryzyko niespójności wersji Node i optymalizuje czas instalacji zależności przez `npm ci`.

## Risks / Trade-offs
- **[Brak podglądu webowego dla recenzentów na PR]** → Zgodne z decyzją architektoniczną. Testy odbywają się lokalnie oraz na urządzeniach mobilnych, a przed merge działa pełna bramka CI (126 testów).

