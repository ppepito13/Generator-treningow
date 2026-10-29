# Design: Movement Balancing & Base Name Deduplication

## 1. Architektura i Koncepcja Rozwiązania

Rozszerzamy domenę generatora (`src/domain/generator/`) o precyzyjną, wielopoziomową kontrolę sąsiedztwa i deduplikacji w treningu:

### 1.1. Rozszerzenie `filterBySegmentBalancing` i usunięcie pułapki przedwczesnego fallbacku
W [src/domain/generator/muscleBalancing.ts](file:///c:/Users/lewan/Dev/Generator-treningow/src/domain/generator/muscleBalancing.ts):
- Sygnatura funkcji zostaje wzbogacona o obiekt opcji lub parametry:
  ```typescript
  export interface BalancingOptions {
    previousExercise?: Exercise;
    previousSegmentId?: number;
    excludedSegmentIds?: number[] | Set<number>;
    usedBaseNames?: Set<string>;
    softFallback?: boolean; // domyślnie true dla zgodności wstecznej, ale false w kaskadzie
  }
  ```
- **Kluczowa poprawka logiczna**: Gdy `softFallback === false`, funkcja przy braku kandydatów zwraca pustą tablicę `[]` zamiast powtórzonego segmentu (`candidates`). Umożliwia to kaskadzie ([cascadeFallback.ts](file:///c:/Users/lewan/Dev/Generator-treningow/src/domain/generator/cascadeFallback.ts)) przejście do Kroku 2 (poluzowanie poziomu trudności), zapobiegając niepożądanemu powtórzeniu wzorca.
- Zabezpieczenie stacji w parach (`hasOverlappingMuscles`) oraz wykluczenie segmentów z `excludedSegmentIds` działają w jednym, czystym przebiegu filtrującym.

### 1.2. Normalizacja rdzenia nazwy (`normalizeExerciseBaseName`)
Funkcja w [muscleBalancing.ts](file:///c:/Users/lewan/Dev/Generator-treningow/src/domain/generator/muscleBalancing.ts):
```typescript
export const normalizeExerciseBaseName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // usunięcie nawiasów, np. "(Nachwyt)", "(Archer)"
    .replace(/\s+/g, ' ')         // normalizacja spacji wielokrotnych
    .trim();
};
```
Eliminuje to powielanie 29 zidentyfikowanych w bazie par/grup wariantowych (np. nachwyt/podchwyt, deska na przedramionach/dłoniach) w ramach jednego treningu.

### 1.3. Precyzyjna kaskada w `cascadeFallback.ts`
Struktura parametrów `CascadeFilterParams` zostaje rozszerzona o:
- `excludedSegmentIds?: number[]`
- `usedBaseNames?: Set<string>`

Kroki kaskady:
1. **Krok 1 (Baza)**:
   - Zakres: `currentRange`
   - Wykluczenia: `excludedSegmentIds` (obaj sąsiedzi), `usedBaseNames`, `usedIds`
   - `softFallback: false`
2. **Krok 2 (Ochrona przed powtórzeniem wzorca – lżejszy/szerszy poziom trudności)**:
   - Warunek: `!isStrictDifficulty`
   - Zakres: `getLoosenedRange(currentRange)`
   - Wykluczenia: nadal pełne `excludedSegmentIds` i `usedBaseNames`
   - `softFallback: false`
3. **Krok 3 (Częściowe rozluźnienie sąsiedztwa)**:
   - Zakres: `currentRange` (lub loosened, jeśli Krok 2 nie pomógł)
   - Wykluczenia: blokada TYLKO bezpośredniego poprzednika (`previousSegmentId`), nadal unikalny `usedBaseNames`
4. **Krok 4 (Rozluźnienie rdzenia nazwy)**:
   - Dopuszczenie innego wariantu `usedBaseNames` (np. inny chwyt), gdy w strefie brakuje alternatyw
5. **Krok 5 (Ostateczny soft fallback)**:
   - Dopuszczenie powtórzenia ćwiczenia (`ignoreUsed: true`), by zapobiec zablokowaniu generatora

### 1.4. Integracja w generatorze obwodu (`circuitStrategy.ts`)
- Inicjalizacja `usedBaseNames = new Set<string>()`.
- Wyznaczanie sąsiadów:
  - Dla stacji $0$: brak lewego sąsiada (`previousSegmentId = undefined`).
  - Dla stacji pośrednich $1 \dots N-2$: sąsiad lewy `previousSegmentId = exA.segment_id`.
  - Dla stacji ostatniej $N-1$: sąsiad lewy (`previousSegmentId`) ORAZ sąsiad prawy (styk pętli: `generated[0].exerciseA.segment_id`) przekazywane do `excludedSegmentIds`.
- Rejestracja w `usedBaseNames`: dodawany zarówno `exA`, jak i ewentualny bliźniak `exB` na stacji podwójnej.

### 1.5. Integracja w automatycznym re-rollu (`rerollStrategy.ts`)
- Gdy `segmentId === undefined` (opcja "Losuj dowolne z bazy"):
  - Obliczenie indeksu lewego sąsiada: `(stationIndex - 1 + circuit.length) % circuit.length`.
  - Obliczenie indeksu prawego sąsiada: `(stationIndex + 1) % circuit.length`.
  - Jeśli `circuit.length > 1`: zebranie segmentów obu sąsiadów do `excludedSegmentIds`.
  - Zebranie rdzeni nazw ze wszystkich pozostałych stacji do `usedBaseNames`.
  - Podłączenie kaskady fallbacku chroniącej przed powtórzeniem wzorców i nazw.
