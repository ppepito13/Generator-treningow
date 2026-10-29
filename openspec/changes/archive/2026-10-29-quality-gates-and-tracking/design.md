# Design: Infrastruktura Testów i Śledzenia Jakości

## 1. Architektura Bramki CI
Zastąpienie odrębnych kroków `npm run lint` i `npm run test` w `.github/workflows/ci.yml` jednym krokiem:
```yaml
      - name: Pełna bramka weryfikacji jakości
        run: npm run verify
```
Dzięki temu CI automatycznie egzekwuje `tsc --noEmit`, `next lint` i `vitest run`.

## 2. Architektura Testów UI w Vitest
- Zależności deweloperskie:
  - `jsdom`: lekka emulacja DOM.
  - `@testing-library/react`: testowanie komponentów w stylu użytkownika.
  - `@testing-library/jest-dom`: rozszerzone asercje DOM (`toBeInTheDocument`, `toHaveClass` itp.).
- Konfiguracja `vitest.config.ts`:
  - Dodanie `setupFiles: ['./src/tests/setup.ts']`.
  - Dla testów UI dedykowana konwencja `src/tests/ui/**/*.test.tsx` ze wskaźnikiem środowiska `// @vitest-environment jsdom` na początku pliku (lub per-plik), co zapobiega spowalnianiu testów czysto domenowych (które pozostają na `environment: 'node'`).
- Plik `src/tests/setup.ts`:
  - `import '@testing-library/jest-dom/vitest';`
  - Mockowanie `window.matchMedia` oraz ewentualnych braków środowiskowych w `jsdom`.

## 3. Test Integralności Danych (`src/tests/data-integrity.test.ts`)
- Sprawdzenie wszystkich ćwiczeń w `lista_cwiczen.json`:
  - Unikalność `id_cwiczenia`.
  - Zakres `poziom` pomiędzy 1 a 4.
  - Poprawny typ strefy (`A` | `B` | `C` | `D` | `E` | `RIG`).
  - Sprawdzenie czy klucze w `wymagania_sprzetowe` (po normalizacji) odpowiadają zdefiniowanym wpisom w `lista_sprzetu.json` lub znanym kategoriom bazowym.
- Sprawdzenie `sala.json`:
  - Dostępność zdefiniowanych stref i sprzętu.

## 4. Standaryzacja Śledzenia (TODO i CHANGELOG)
- `todo.md`:
  - Sekcja `### future` pod `## ✅ Zakończone` zostaje uporządkowana.
  - Odhaczenie punktu 5.
  - Dodanie numerowanych zadań #34 (Bramka CI), #35 (Testy integralności JSON), #36 (Testy renderowania UI).
- `CHANGELOG.md`:
  - Wprowadzenie nagłówka `## [Unreleased]`.
  - Przypisanie modułów Studio, kalkulatorów i timera do `[Unreleased]` oraz dopisanie nowo wprowadzonych zabezpieczeń testowych.
- `AGENTS.md` & `openspec/config.yaml`:
  - Dodanie żelaznej reguły obowiązku aktualizacji TODO i CHANGELOG przed archiwizacją zmiany.

