# Proposal

## Why

Plik `src/app/lib/store.ts` rozrósł się do ponad 1330 linii kodu i łączy w sobie zarządzanie stanem UI, logikę odtwarzacza audio z timerem oraz niskopoziomowe reguły biznesowe weryfikacji sprzętu, filtrowania ćwiczeń i doboru stref. 
Algorytmy losowania posiadają ukryte sprzężenie zwrotne do globalnego singletonu Zustand (`useAppStore.getState()`), co uniemożliwia ich niezależne i deterministyczne testowanie w Vitest. Wydzielenie czystych reguł domenowych do folderu `src/domain/generator/` stanowi fundament pod wprowadzenie zaawansowanego balansu partii mięśniowych w Fazie 3.2.

## What Changes

- Utworzenie wyizolowanej warstwy domenowej generatora w katalogu `src/domain/generator/`.
- **Typy domenowe (`types.ts`):** Zdefiniowanie interfejsów parametrów generatora, kontekstu sali, stref oraz kryteriów filtrowania.
- **Weryfikacja sprzętu (`equipmentRules.ts`):** Ekstrakcja czystych funkcji `ensureEquipment`, `getEquipmentString`, `canExerciseBeShared` ze `store.ts`.
- **Filtrowanie ćwiczeń (`exerciseFilter.ts`):** Ekstrakcja funkcji `getValidExercisesForZone` jako czystej funkcji przyjmującej listę ćwiczeń jako argument (`Dependency Injection`), eliminując zależność od `useAppStore.getState()`. Uwzględnienie obsługi reguły pojedynczej flagi (`hasFlagAlready`).
- **Dobór stref sali (`zoneSelector.ts`):** Ekstrakcja algorytmu selekcji stref (klatka RIG na pozycji 2, forcedZones, dynamiczne limity stref elastycznych `floorLimit`).
- **Testy jednostkowe Vitest:** Dodanie zestawu testów dla weryfikacji sprzętu, filtrów ćwiczeń i alokacji stref.
- **Kompatybilność wsteczna:** Utworzenie barrel exportu `src/domain/generator/index.ts` oraz re-eksport funkcji w `store.ts`, zapobiegając przerwaniu importów w komponentach UI (np. `StationCard.tsx`).

## Capabilities

### New Capabilities
Brak (zmiana o charakterze czystego refaktoringu architektonicznego i wydzielenia warstwy domeny).

### Modified Capabilities
Brak spec-level changes. Zmiana deklaruje `skip_specs: true`.

## Impact

- **Dotknięte pliki:**
  - `src/app/lib/store.ts` (re-eksport wyekstrahowanych funkcji domenowych)
  - Nowo utworzone pliki w `src/domain/generator/`
  - Nowe testy jednostkowe w `src/tests/domain/`
- **Ryzyko regresji:** Minimalne; kod źródłowy funkcji zostaje przeniesiony w formie czystej logiki, a re-eksport w `store.ts` gwarantuje 100% ciągłości działania istniejących komponentów UI.
