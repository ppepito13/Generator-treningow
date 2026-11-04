# Tasks: Optymalizacja CI/CD i usunięcie zbędnego workflow podglądów Firebase na PR (#51)

## 1. Konfiguracja GitHub Actions

- [x] 1.1 [.github/workflows/firebase-hosting-pull-request.yml] Usunąć plik workflow odpowiedzialny za generowanie tymczasowych podglądów Firebase Hosting na Pull Requestach i zweryfikować jego brak w repozytorium.
- [x] 1.2 [.github/workflows/firebase-hosting-merge.yml] Dodać ustandaryzowany krok konfiguracyjny `actions/setup-node@v4` z `node-version: 20` i `cache: 'npm'` przed krokiem `npm ci && npm run build` oraz zweryfikować poprawność składni YAML.

## 2. Dokumentacja i Weryfikacja

- [x] 2.1 [CHANGELOG.md] Dodać wpis w sekcji `## [Unreleased]` pod `### Zmieniono` dokumentujący usunięcie workflow podglądów Firebase na PR oraz ustandaryzowanie środowiska Node w deployu po merge (#51).
- [x] 2.2 [npm run verify] Uruchomić pełną lokalną bramkę jakości (TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów przed commitem.

