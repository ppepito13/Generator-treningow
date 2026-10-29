# Proposal: Ulepszony Balans Sąsiednich Segmentów Ruchowych oraz Deduplikacja po Rdzeniu Nazwy (#31 i #32)

## Why
Podczas generowania obwodów treningowych oraz automatycznego re-rollu stacji dochodzi do dwóch niepożądanych sytuacji:
1. Brak dwustronnej kontroli sąsiedztwa i cykliczności pętli obwodu: ostatnia stacja obwodu może wylosować ten sam wzorzec ruchowy co stacja pierwsza (np. przejście z PUSH do PUSH), a automatyczny re-roll stacji w środku obwodu nie uwzględnia wzorców stacji poprzedniej ani następnej.
2. W niesąsiadujących stacjach obwodu mogą pojawiać się dwa warianty tego samego ćwiczenia o różnych ID (np. *Podciąganie klasyczne (Nachwyt)* na stacji 1 oraz *Podciąganie klasyczne (Podchwyt)* na stacji 4), obniżając różnorodność treningu.

Wprowadzenie dwustronnej kontroli sąsiedztwa, cykliczności pętli obwodu oraz deduplikacji po rdzeniu nazwy (`base_name`) z dopracowaną kaskadą ochronną zapewni metodyczną poprawność planów treningowych bez ograniczania swobody manualnej trenera.

## What Changes
- **Dwustronna kontrola sąsiedztwa (`excludedSegmentIds`)**: rozszerzenie heurystyki `filterBySegmentBalancing` w `muscleBalancing.ts` z jednostronnego sprawdzania w tył do wykluczania segmentów obu sąsiadów (`prev` i `next`).
- **Cykliczność obwodu (Circuit Loopback)**: uwzględnienie relacji sąsiedztwa między stacją ostatnią ($N-1$) a pierwszą ($0$) w `circuitStrategy.ts`.
- **Deduplikacja po rdzeniu nazwy (`normalizeExerciseBaseName`)**: normalizacja nazw ćwiczeń (odrzucanie nawiasów i dopisków wariantowych) oraz śledzenie `usedBaseNames` w całym obwodzie.
- **Kaskada degradacji z ochroną przed powtórzeniem wzorca (Movement & Name Cascade)**:
  1. Krok 1: aktualny poziom trudności + blokada obu sąsiadów + unikalny `base_name` + unikalne `id`.
  2. Krok 2: rozluźnienie poziomu trudności (`!isStrictDifficulty`) z zachowaniem blokady obu sąsiadów i unikalnego `base_name`.
  3. Krok 3: rozluźnienie sąsiedztwa do 1 sąsiada (blokada tylko bezpośredniego poprzednika `prev`) + unikalny `base_name`.
  4. Krok 4: dopuszczenie powtórzenia `base_name` (inny wariant ćwiczenia w innej części obwodu).
  5. Krok 5: pełny soft fallback w przypadku skrajnego braku sprzętu w strefie.
- **Integracja w automatycznym re-rollu (`rerollStrategy.ts`)**: podłączenie kaskady sąsiedztwa i `base_name` dla opcji "Losuj dowolne z bazy".
- **Zachowanie 100% swobody trenera**: ręczny wybór segmentu z menu, wyszukiwanie w liście oraz dodawanie ćwiczenia "z palca" (`setStationExercise`) pozostają nielimitowane regułami losowania.

## Capabilities

### Modified Capabilities
- `circuit-engine`: rozszerzenie wymagań balansu segmentów ruchowych o dwustronną kontrolę sąsiadów i cykliczność obwodu, dodanie wymagania deduplikacji po rdzeniu nazwy (`base_name`) oraz rozszerzenie kontraktu re-rollu o kontrolę sąsiedztwa.

## Impact
- `src/domain/generator/muscleBalancing.ts`: rozszerzenie o `excludedSegmentIds` i `normalizeExerciseBaseName`.
- `src/domain/generator/cascadeFallback.ts`: kaskadowe dopasowanie z priorytetem trudności przed rozluźnieniem sąsiedztwa.
- `src/domain/generator/circuitStrategy.ts`: obsługa styku pętli obwodu oraz puli `usedBaseNames`.
- `src/domain/generator/rerollStrategy.ts`: integracja kaskady dla typu `'A'` przy re-rollu automatycznym.
- `src/tests/domain/`: nowe testy jednostkowe weryfikujące dwustronny balans, brak powtórzeń `base_name` w obwodzie oraz zamknięcie pętli.

