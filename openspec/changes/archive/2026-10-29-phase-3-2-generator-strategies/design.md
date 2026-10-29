# Design: Faza 3.2 – Balans Mięśniowy, Kaskada i Strategie Losowania

## Context & Architectural Boundary
W Fazie 3.2 tworzymy czystą warstwę strategii losowania w katalogu `src/domain/generator/`. Moduły te są bezstanowe, nie importują Zustand Store, React ani komponentów UI. Zamiast tego przyjmują wszystkie zależności jako parametry (Dependency Injection) i wstrzykiwane źródło losowości (`randomFn: () => number`).

## Data Structures & Types (`src/domain/generator/types.ts`)

```typescript
export type RandomFn = () => number;

export interface GenerationSuccess {
  success: true;
  stations: Station[];
}

export interface GenerationFailure {
  success: false;
  conflict: {
    type: 'generate' | 'reroll';
    requestedStations: number;
    availableStations: number;
    canLoosenDifficulty: boolean;
    contextData?: {
      action?: 'reroll' | 'changeZone';
      stationId?: string;
      paramType?: 'A' | 'B';
      segmentId?: number;
      newZoneId?: string;
    };
  };
}

export type GenerationResult = GenerationSuccess | GenerationFailure;

export interface CircuitStrategyParams {
  currentRoom: RoomConfig;
  mainDiff: DifficultyLevel;
  participants: number;
  stationCount: number;
  isStrictDifficulty: boolean;
  loosenDifficultyFlag?: boolean;
  ignoreUsedFlag?: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}

export interface SynchronizedStrategyParams {
  currentRoom: RoomConfig;
  mainDiff: DifficultyLevel;
  participants: number;
  stationCount: number;
  isStrictDifficulty: boolean;
  loosenDifficultyFlag?: boolean;
  ignoreUsedFlag?: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}

export interface RerollStrategyParams {
  circuit: Station[];
  stationId: string;
  type: 'A' | 'B';
  segmentId?: number;
  loosen?: boolean;
  ignoreUsed?: boolean;
  currentRoom: RoomConfig;
  difficultyId: string;
  isStrictDifficulty: boolean;
  category?: string;
  allExercisesSource?: Exercise[];
  randomFn?: RandomFn;
}
```

## Decisions

### 1. Rozwiązanie konfliktu inwentarza sprzętowego przy doborze B
- **Problem**: Gdy stacja dwuosobowa korzysta z ćwiczenia solo na unikalnym sprzęcie (np. 1 kółka gimnastyczne), drugie ćwiczenie $exB$ nie może żądać tego samego sprzętu.
- **Decyzja**: Funkcja pomocnicza `deductEquipment(inventory, exercise)` tworzy wirtualną kopię inwentarza z odliczoną ilością sprzętu zajętą przez $exA$. Dobór $exB$ sprawdza dostępność sprzętu w tym pomniejszonym inwentarzu.

### 2. Heurystyka Balansu Segmentów (`muscleBalancing.ts`)
- Filtruje kandydatów tak, aby `candidate.segment_id !== previousSegmentId`.
- Jeśli kandydat ma `segment_id === 8` (PARTNER) lub `tryb_pracy === 'W_Parze'`, weryfikowane jest `glowne_partie`: kandydat nie może powielać dominującej partii z poprzedniej stacji.
- Jeśli po odfiltrowaniu pula byłaby pusta, filtr balansu jest łagodzony (miękki fallback).

### 3. Logika Stacji Oddechowych
- Wywoływana gdy `(stationIdx + 1) % 3 === 0`.
- Gdy `isStrictDifficulty === false`: obniżenie trudności o 1-2 poziomy.
- Gdy `isStrictDifficulty === true`: preferencja ćwiczeń z segmentów `CORE (4)`, `NEURO (7)`, `MOBILITY (9)` w ramach wyjściowego zakresu trudności.

### 4. Spójny Moduł Par (`pairStationStrategy.ts`)
- Pojedyncza funkcja `resolvePairStationExercises(exA, candidates, room, diffRange, usedIds, randomFn)` zastępuje 3 zduplikowane bloki kodu w `store.ts`.

### 5. Kaskada Fallbacków (`cascadeFallback.ts`)
Gdy pula ćwiczeń jest pusta:
1. Próba 1: Poluzowanie trudności o 1 poziom w dół i w górę (`MAX_DIFFICULTY_LOOSENING = 1`, o ile nie zablokowane przez `isStrictDifficulty`).
2. Próba 2: Złagodzenie balansu segmentów (dopuszczenie tego samego segmentu).
3. Próba 3: Dopuszczenie powtórzenia ćwiczenia z innej stacji (`ignoreUsed = true`).
4. Próba 4: Zwrócenie `GenerationFailure` z informacją o konflikcie.

## Risks & Mitigations
- **Ryzyko**: Mała sala z niewielką liczbą przyrządów nie pozwoli wygenerować obwodu bez powtórzeń.
  - *Mitygacja*: Kaskadowy fallback automatycznie łagodzi ograniczenia krok po kroku.
- **Ryzyko**: Testy losowości podatne na przypadkowość (flaky tests).
  - *Mitygacja*: Każda funkcja losująca przyjmuje `randomFn?: RandomFn`, co pozwala na przekazanie deterministycznego PRNG (np. `seededRandom`) w testach Vitest.

