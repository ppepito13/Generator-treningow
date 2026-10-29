# Circuit Engine Delta Specification: Balancing, Cascades, and Pure Strategies

## Purpose
Rozszerzenie i doprecyzowanie specyfikacji silnika generowania treningów obwodowych i synchronicznych o heurystykę balansu segmentów, adaptację stacji oddechowych w trybie strict, obsługę stacji podwójnych z ćwiczeniem bliźniaczym oraz czyste kontrakty strategii.

## MODIFIED Requirements

### Requirement: Mechanizm Breather (Regeneracja)
System SHALL dostosowywać logikę stacji oddechowej (`(idx + 1) % 3 === 0`) w zależności od trybu rygorystyczności (`isStrictDifficulty`).

#### Scenario: Standardowe obniżenie trudności
- **WHEN** generowana jest co trzecia stacja obwodu i tryb rygorystyczny jest wyłączony (`isStrictDifficulty === false`)
- **THEN** system obniża zakres trudności o 1-2 poziomy w dół w stosunku do bazowego poziomu trudności

#### Scenario: Stacja oddechowa w trybie rygorystycznym (Strict)
- **WHEN** generowana jest co trzecia stacja obwodu i `isStrictDifficulty === true`
- **THEN** system zachowuje wyjściowy zakres trudności
- **AND** nadaje priorytet ćwiczeniom o charakterze stabilizacyjnym, posturalnym lub mobilnościowym (segmenty `CORE`, `NEURO`, `MOBILITY`)

## ADDED Requirements

### Requirement: Balans Segmentów Ruchowych (Muscle & Segment Balancing)
System SHALL zapobiegać bezpośredniemu powtórzeniu tego samego segmentu biomechanicznego na sąsiadujących stacjach obwodu.

#### Scenario: Kolejna stacja po ćwiczeniu PULL lub PUSH
- **WHEN** stacja $N-1$ posiada ćwiczenie z określonego segmentu ruchowego (np. `PULL`, `PUSH`, `LEGS`, `CORE`)
- **THEN** system preferuje dla stacji $N$ ćwiczenie z innego segmentu ruchowego
- **AND** nie wybiera ćwiczenia z tego samego segmentu, dopóki w przefiltrowanej puli dostępne są alternatywne segmenty

#### Scenario: Bezpiecznik stacji partnerskich
- **WHEN** na stacji wylosowane zostanie ćwiczenie partnerskie (`segment_id === 8` lub `tryb_pracy === "W_Parze"`)
- **THEN** system weryfikuje `glowne_partie` ćwiczenia i zapobiega powieleniu dominującej partii mięśniowej ze stacji poprzedniej

### Requirement: Strategia Stacji Podwójnych i Ćwiczeń Bliźniaczych (Pair Stations & Twin Exercise)
System SHALL obsługiwać stacje dwuosobowe z podziałem na ćwiczenia wspólne oraz ćwiczenia bliźniacze przy ograniczeniach sprzętowych.

#### Scenario: Ćwiczenie dedykowane dla par
- **WHEN** dla stacji podwójnej wylosowane zostaje ćwiczenie o `tryb_pracy === "W_Parze"`
- **THEN** obaj uczestnicy wykonują to samo ćwiczenie razem (`exerciseB` jest identyczne z `exerciseA`)

#### Scenario: Ćwiczenie solo ze sprzętem dla 2 osób
- **WHEN** dla stacji podwójnej wylosowane zostaje ćwiczenie `tryb_pracy === "Solo"`
- **AND** sala posiada wyposażenie pozwalające na równoległe wykonanie ćwiczenia przez 2 osoby
- **THEN** obaj uczestnicy wykonują to samo ćwiczenie na równoległych stanowiskach (`exerciseB` jest identyczne z `exerciseA`)

#### Scenario: Ćwiczenie solo z brakiem sprzętu na drugą osobę (Ćwiczenie Bliźniacze)
- **WHEN** dla stacji podwójnej wylosowane zostaje ćwiczenie `tryb_pracy === "Solo"`, a sala posiada sprzęt tylko dla 1 osoby
- **THEN** system dobiera dla drugiego uczestnika ćwiczenie bliźniacze `exerciseB`
- **AND** `exerciseB` musi posiadać `tryb_pracy === "Solo"` (zakaz ćwiczeń w parze)
- **AND** `exerciseB` musi odpowiadać tej samej partii mięśniowej lub segmentowi co `exerciseA`
- **AND** `exerciseB` musi być bezsprzętowe lub wymagać wyłącznie sprzętu pozostałego w sali po zarezerwowaniu sprzętu dla `exerciseA`

### Requirement: Czysty Kontrakt Strategii i Kaskada Fallbacków (Pure Strategy Contracts)
Strategie losowania obwodu, treningu synchronicznego i rerolli SHALL być czystymi funkcjami bez efektów ubocznych na stanie aplikacji i ze wstrzykiwanym źródłem losowości.

#### Scenario: Determinizm testowy
- **WHEN** do strategii przekazany zostaje deterministyczny generator `randomFn: () => number`
- **THEN** funkcja zwraca w 100% powtarzalny układ stacji dla tych samych parametrów wejściowych

#### Scenario: Zwracanie błędu braku ćwiczeń
- **WHEN** pomimo kaskady fallbacków (poluzowanie trudności o 1 poziom, złagodzenie balansu, powtórzenie ćwiczeń) nie można skompletować stacji
- **THEN** strategia zwraca obiekt `{ success: false, conflict: GenerationConflictData }` zamiast bezpośrednio modyfikować stan Zustand
