# Circuit Engine Specification

## Purpose
Definiuje logikę i reguły biznesowe silnika generowania treningów obwodowych (Sala Balaton) oraz synchronicznych (Sala Astoria) w aplikacji Kinetic Circuits.

## Requirements

### Requirement: Obwodowa Strategia Generowania (Circuit Strategy)
System SHALL generować obwody treningowe dopasowane do liczby uczestników i liczby dostępnych stacji w wybranej sali.

#### Scenario: Większa liczba uczestników niż stacji
- **WHEN** liczba uczestników przekracza liczbę stacji
- **THEN** system przypisuje wybranym stacjom tryb pracy w parze (`isPair: true`)
- **AND** liczba stacji nie przekracza liczby uczestników

#### Scenario: Ćwiczenia drążkowe
- **WHEN** losowane jest ćwiczenie wymagające drążka/konstrukcji klatki
- **THEN** system przypisuje je wyłącznie do stacji w strefie `klatka_rig`

#### Scenario: Uwzględnianie ćwiczeń użytkownika (Custom Exercises)
- **WHEN** użytkownik dodał własne ćwiczenie lub nadpisał ćwiczenie bazowe w Exercise Studio
- **THEN** system przekazuje zaktualizowaną listę ćwiczeń (`getAllExercises()`) do silnika strategii
- **AND** ćwiczenia użytkownika biorą udział w losowaniu oraz podmianie manualnej na stacjach

### Requirement: Mechanizm Breather (Regeneracja)
System SHALL dostosowywać logikę stacji oddechowej (`(idx + 1) % 3 === 0`) w zależności od trybu rygorystyczności (`isStrictDifficulty`).

#### Scenario: Standardowe obniżenie trudności
- **WHEN** generowana jest co trzecia stacja obwodu i tryb rygorystyczny jest wyłączony (`isStrictDifficulty === false`)
- **THEN** system obniża zakres trudności o 1-2 poziomy w dół w stosunku do bazowego poziomu trudności

#### Scenario: Stacja oddechowa w trybie rygorystycznym (Strict)
- **WHEN** generowana jest co trzecia stacja obwodu i `isStrictDifficulty === true`
- **THEN** system zachowuje wyjściowy zakres trudności
- **AND** nadaje priorytet ćwiczeniom o charakterze stabilizacyjnym, posturalnym lub mobilnościowym (segmenty `CORE`, `NEURO`, `MOBILITY`)

### Requirement: Walidacja Sprzętu (CNF Logic)
System SHALL weryfikować dostępność sprzętu w inwentarzu sali zgodnie ze strukturą CNF (koniunkcja alternatyw) zdefiniowaną dla każdego ćwiczenia.

#### Scenario: Skalowanie sprzętu na stacji podwójnej
- **WHEN** stacja pracuje w trybie pary (2 osoby)
- **THEN** system mnoży wymagane sztuki sprzętu przez liczbę uczestników na stacji

### Requirement: Balans Segmentów Ruchowych (Muscle & Segment Balancing)
System SHALL zapobiegać bezpośredniemu powtórzeniu tego samego segmentu biomechanicznego na sąsiadujących stacjach obwodu, uwzględniając dwustronne sąsiedztwo oraz cykliczność pętli obwodu treningowego.

#### Scenario: Kolejna stacja po ćwiczeniu PULL lub PUSH
- **WHEN** stacja $N-1$ posiada ćwiczenie z określonego segmentu ruchowego (np. `PULL`, `PUSH`, `LEGS`, `CORE`)
- **THEN** system preferuje dla stacji $N$ ćwiczenie z innego segmentu ruchowego
- **AND** nie wybiera ćwiczenia z tego samego segmentu, dopóki w przefiltrowanej puli dostępne są alternatywne segmenty

#### Scenario: Dwustronna kontrola sąsiadów przy automatycznym re-rollu
- **WHEN** użytkownik wykonuje automatyczny re-roll ćwiczenia na stacji $i$ (opcja "Losuj dowolne z bazy")
- **THEN** system wyklucza z losowania segment stacji poprzedniej ($i-1$) oraz segment stacji następnej ($i+1$)
- **AND** w przypadku braku ćwiczeń w pierwszej kolejności sprawdza ćwiczenia o 1 poziom lżejsze (`!isStrictDifficulty`), zanim dopuści powtórzenie segmentu

#### Scenario: Cykliczność pętli obwodu (Circuit Loopback)
- **WHEN** generowana jest ostatnia stacja obwodu ($N-1$)
- **THEN** system traktuje stację początkową ($0$) jako prawego sąsiada
- **AND** wyklucza zarówno segment stacji przedostatniej ($N-2$), jak i segment stacji pierwszej ($0$)

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

### Requirement: Obsługa Częściowego Obwodu w Konflikcie (Partial Circuit Resolution)
W przypadku niemożliwości skompletowania żądanej liczby stacji system SHALL zachowywać dotychczas wygenerowane stacje i umożliwiać ich natychmiastowe zastosowanie.

#### Scenario: Wybór akcji zmniejszenia liczby stacji
- **WHEN** generator nie jest w stanie zapełnić żądanej liczby stacji (`stationCount`)
- **AND** użytkownik wybierze w modalu konfliktu akcję redukcji (`action === 'reduce'`)
- **THEN** system ustawia obwód na wygenerowane częściowe stacje (`conflict.partialStations`)
- **AND** aktualizuje parametr `stationCount` do faktycznie dostępnej liczby stacji (`conflict.availableStations`)
- **AND** przełącza aktywny widok na podgląd obwodu treningowego

### Requirement: Deduplikacja po Rdzeniu Nazwy (Base Name Deduplication)
System SHALL zapobiegać występowaniu w jednym obwodzie treningowym wielu wariantów tego samego ćwiczenia posiadających ten sam rdzeń nazwy (`base_name`), nawet jeśli posiadają one różne identyfikatory `id_cwiczenia`.

#### Scenario: Różne chwyty i warianty tego samego ćwiczenia
- **WHEN** w obwodzie wylosowano już ćwiczenie o określonym rdzeniu (np. *Podciąganie klasyczne (Nachwyt)*)
- **THEN** system wyklucza z puli kolejnych stacji inne warianty tego samego ćwiczenia (np. *Podciąganie klasyczne (Podchwyt)* lub wersje z dopiskami w nawiasach)
- **AND** dopuszcza powtórzenie rdzenia nazwy wyłącznie na etapie ostatecznego fallbacku, gdy w danej strefie brak innych pasujących ćwiczeń

#### Scenario: Zachowanie pełnej swobody manualnej trenera
- **WHEN** użytkownik ręcznie wybiera ćwiczenie z listy dialogowej lub wpisuje własną nazwę "z palca"
- **THEN** system nie blokuje wyboru, nawet jeśli ćwiczenie o tej samej nazwie lub segmencie istnieje już na innej stacji
