# Design: Faza 3.3 – Integracja ze Store i Czyszczenie Monolitu

## Context & Architectural Scope
Faza 3.3 domyka refaktoryzację silnika generatora (Faza 3 w SDD Master Plan). Przenosimy odpowiedzialność za losowanie i rerolle z monolitu `src/app/lib/store.ts` do przetestowanych strategii domenowych z `src/domain/generator/`.

## Changes to Domain Types & Strategies
1. **Rozszerzenie `GenerationConflictData` w `src/domain/generator/types.ts`**:
   ```typescript
   export interface GenerationConflictData {
     type: 'generate' | 'reroll';
     requestedStations: number;
     availableStations: number;
     canLoosenDifficulty: boolean;
     partialStations?: Station[]; // Dodane: częściowo ułożony obwód
     contextData?: { ... };
   }
   ```
2. **Zachowanie `partialStations` w strategiach**:
   W `circuitStrategy.ts` i `synchronizedStrategy.ts`: przy napotkaniu braku ćwiczeń w pętli stacji przypisujemy `partialStations: generated`.

## Store Refactoring (`src/app/lib/store.ts`)
1. **Usunięcie starych implementacji**:
   - Usunięcie wewnętrznych funkcji `generateCircuitStrategy` i `generateSynchronizedStrategy`.
   - Usunięcie martwego stuba `changeStationZone` z interfejsu `AppState` oraz stanu store.
2. **Delegacja w `generateCircuit`**:
   - Wywołanie `generateCircuitStrategy` (dla sal obwodowych) lub `generateSynchronizedStrategy` (dla sal synchronicznych) z przekazaniem `allExercisesSource: get().getAllExercises()`.
   - Jeśli `result.success`: ustawienie `circuit: result.stations`, `isGenerated: true`, `generationConflict: null` i przejście do zakładki `circuit`.
   - Jeśli `!result.success`: ustawienie `generationConflict: result.conflict`.
3. **Delegacja w `rerollExercise`**:
   - Wywołanie `rerollExerciseStrategy` z wstrzyknięciem parametrów i `allExercisesSource: get().getAllExercises()`.
   - Aktualizacja stanu na podstawie `RerollResult`.
4. **Refaktoryzacja `resolveConflict`**:
   - `action === 'reduce'`: przypisanie `circuit = conflict.partialStations || []`, `stationCount = conflict.availableStations`, `isGenerated = true`, `generationConflict = null`, przejście do zakładki `circuit`.
   - `action === 'loosen'`: ponowne uruchomienie generatora / rerollu z flagą `loosen: true`.
   - `action === 'duplicate'`: ponowne uruchomienie generatora / rerollu z flagą `ignoreUsed: true`.
   - `action === 'cancel'`: czyszczenie `generationConflict: null`.
5. **Re-eksporty dla wstecznej kompatybilności**:
   - `export { MAX_DIFFICULTY_LOOSENING } from '@/domain/generator';`

## Component Updates (`src/components/StationCard.tsx`)
1. Zmiana importu `getValidExercisesForZone` na bezpośrednio z `@/domain/generator`.
2. Pobranie `getAllExercises = useAppStore(state => state.getAllExercises)` i przekazanie wyniku do wywołania `getValidExercisesForZone` w `availableSegmentsA`.

## Verification & Build
- `npm run verify`: 0 błędów TypeScript, 0 błędów/ostrzeżeń ESLint, 100% testów zielonych.
- `npm run build`: Weryfikacja statycznego eksportu Next.js (`out/`) pod Capacitor / Android Studio.

