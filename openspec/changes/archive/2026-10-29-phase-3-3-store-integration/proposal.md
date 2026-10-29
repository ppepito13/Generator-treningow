# Proposal: Faza 3.3 – Integracja ze Store i Czyszczenie Monolitu

## Why
W Fazach 3.1 i 3.2 stworzyliśmy i przetestowaliśmy czyste moduły domenowe w `src/domain/generator/` (reguły sprzętu, dobór stref, balans segmentów, stacje oddechowe, obsługa par, kaskada fallbacków i strategie losowania).
Jednak główny plik `src/app/lib/store.ts` nadal liczy ponad 1220 linii i zawiera stare, monolityczne funkcje losowania, które:
1. Nie korzystają z nowego balansu mięśniowego ani naprawionej logiki par.
2. Zawierają ponad 350 linii martwego i powielonego kodu.
3. W modalu konfliktu nie przekazują bezpiecznie częściowych stacji przy akcji „Zmniejsz ilość stacji”.
4. Komponent `StationCard.tsx` importuje funkcję pomocniczą z monolitu zamiast z warstwy domeny.

## What Changes
1. **Rozszerzenie `GenerationConflictData` o `partialStations`**:
   - Dodanie pola `partialStations?: Station[]` w `types.ts` oraz przekazywanie wygenerowanych stacji w strategiach obwodu i treningu synchronicznego w przypadku wyczerpania puli.
2. **Podpięcie strategii domenowych w Zustand Store (`src/app/lib/store.ts`)**:
   - Zastąpienie wewnętrznej logiki `generateCircuit` i `rerollExercise` wywołaniami `generateCircuitStrategy`, `generateSynchronizedStrategy` oraz `rerollExerciseStrategy`.
   - Wstrzykiwanie pełnej bazy ćwiczeń (`get().getAllExercises()`) zawierającej ćwiczenia standardowe, nadpisane oraz dodane przez użytkownika.
   - Refaktoryzacja `resolveConflict`: obsługa akcji `reduce` (przypisanie `partialStations` i aktualizacja `stationCount`), `loosen` i `duplicate`.
   - Usunięcie martwego stuba `changeStationZone` i starych funkcji monolitycznych.
3. **Przełączenie importów w `src/components/StationCard.tsx`**:
   - Bezpośredni import `getValidExercisesForZone` z `@/domain/generator`.
   - Przekazywanie `getAllExercises()` z Zustand Store do wywołania filtru na kafelku, gwarantując widoczność ćwiczeń własnych użytkownika.
4. **Bramka Jakości i Eksport Android (`out/`)**:
   - Uruchomienie `npm run verify` (0 błędów TypeScript, 0 błędów ESLint, 100% testów Vitest zielonych).
   - Uruchomienie `npm run build` weryfikujące poprawność statycznego eksportu Next.js pod Android Studio / Capacitor.

## Capabilities

### Modified Capabilities
- `circuit-engine`: Integracja Zustand Store z czystymi strategiami domenowymi oraz bezpieczna obsługa akcji modalu konfliktu generowania.

## Impact
- Odchudzenie `src/app/lib/store.ts` o ponad 350 linii kodu.
- 100% spójności reguł losowania w UI z czystą domeną.
- Pełna zgodność z Android Studio i Capacitor (`npm run build`).

