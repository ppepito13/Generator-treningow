# Proposal: Faza 3.2 – Balans Mięśniowy, Kaskada i Strategie Losowania

## Why
W Fazie 3.1 wyekstrahowaliśmy podstawowe reguły domenowe sprzętu, filtrowania ćwiczeń i doboru stref. Jednak sam proces doboru ćwiczeń do stacji w `store.ts` wciąż zawiera monolityczne algorytmy z krytycznymi wadami:
1. Brak balansu mięśniowego – sąsiadujące stacje mogą losować ten sam segment ruchowy (np. dwa ćwiczenia PULL pod rząd).
2. Błąd logiczny stacji podwójnych – wymóg sprzętu dla 2 osób na poziomie filtra strefy uniemożliwiał wylosowanie ćwiczenia solo na unikalnym przyrządzie (np. kółka gimnastyczne, wyciąg) i sparowania go z ćwiczeniem bliźniaczym.
3. Potrójna duplikacja logiki doboru ćwiczenia alternatywnego `exerciseB` (w obwodzie oraz przy rerollach A i B).
4. Bezpośrednie modyfikowanie stanu Zustand (`set({ generationConflict: ... })`) wewnątrz logiki losującej, co uniemożliwia czyste testowanie jednostkowe strategii.

## What Changes
1. **Muscle Balancing Heuristic (`muscleBalancing.ts`)**:
   - Czysta funkcja oceniająca i filtrująca kandydatów tak, aby stacja $N$ nie powtarzała segmentu ruchowego stacji $N-1$ (`PULL`, `PUSH`, `LEGS`, `CORE`, itp.).
   - Obsługa stacji partnerskich (`segment_id: 8` lub `tryb_pracy: "W_Parze"`) poprzez badanie unikania powtórzeń `glowne_partie`.

2. **Obsługa Stacji Oddechowych (Breather)**:
   - W trybie standardowym (`isStrictDifficulty: false`): obniżenie trudności o 1-2 poziomy co 3 stacje (`(idx + 1) % 3 === 0`).
   - W trybie ścisłym (`isStrictDifficulty: true`): zachowanie zadanego poziomu trudności przy preferencji ćwiczeń oddechowych/stabilizacyjnych (`CORE`, `NEURO`, `MOBILITY`).

3. **Strategia Stacji Podwójnych (`pairStationStrategy.ts`)**:
   - Dla stacji z 2 osobami: jeśli wylosowano `W_Parze` lub sala posiada sprzęt x2 $\rightarrow$ obaj ćwiczą to samo ($exB = exA$).
   - Jeśli sala ma sprzęt x1 $\rightarrow$ dobór alternatywnego ćwiczenia $exB$ o trybie `Solo`, tej samej partii i segmencie, z wirtualnym odliczeniem inwentarza zużytego przez $exA$.

4. **Kaskadowy Fallback (`cascadeFallback.ts`)**:
   - Gdy pula ćwiczeń jest pusta: (1) bezpieczne poluzowanie trudności o 1 poziom (chyba że `isStrictDifficulty`), (2) złagodzenie balansu segmentów, (3) dopuszczenie powtórzenia ćwiczenia z innej stacji.
   - W przypadku braku możliwości wygenerowania: zwrócenie czystego obiektu konfliktu `GenerationFailure` bez dotykania Zustand Store.

5. **Czyste Strategie Obwodu, Treningu Synchronicznego i Rerolli (`circuitStrategy.ts`, `synchronizedStrategy.ts`, `rerollStrategy.ts`)**:
   - Wydzielenie logiki losującej do czystych funkcji przyjmujących wstrzykiwane źródło losowości (`randomFn: () => number = Math.random`) dla 100% determinizmu w testach.

6. **Kompleksowe Testy Jednostkowe Vitest (`generatorStrategies.test.ts`)**:
   - Pokrycie testami deterministycznymi wszystkich ścieżek: balansu, stacji oddechowych, par, treningu synchronicznego, rerolli i kaskady fallbacków.

## Capabilities

### New Capabilities
- `generator-strategies`: Czyste strategie domenowe losowania obwodu treningowego, treningu grupowego FBW oraz rerollowania stacji z balansem mięśniowym, przerwami oddechowymi i bezpiecznym doborem ćwiczeń w parach.

## Impact
- Brak zmian łamiących w istniejącym UI (kompatybilność interfejsów `Station`).
- Czysta architektura domeny przygotowana do ostatecznego podpięcia w Fazie 3.3.
- Pełna testowalność algorytmu w Vitest bez renderowania komponentów React i bez stanu Zustand.

