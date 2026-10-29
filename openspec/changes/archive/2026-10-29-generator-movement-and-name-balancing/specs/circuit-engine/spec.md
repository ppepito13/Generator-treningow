# Spec Delta: circuit-engine

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Deduplikacja po Rdzeniu Nazwy (Base Name Deduplication)
System SHALL zapobiegać występowaniu w jednym obwodzie treningowym wielu wariantów tego samego ćwiczenia posiadających ten sam rdzeń nazwy (`base_name`), nawet jeśli posiadają one różne identyfikatory `id_cwiczenia`.

#### Scenario: Różne chwyty i warianty tego samego ćwiczenia
- **WHEN** w obwodzie wylosowano już ćwiczenie o określonym rdzeniu (np. *Podciąganie klasyczne (Nachwyt)*)
- **THEN** system wyklucza z puli kolejnych stacji inne warianty tego samego ćwiczenia (np. *Podciąganie klasyczne (Podchwyt)* lub wersje z dopiskami w nawiasach)
- **AND** dopuszcza powtórzenie rdzenia nazwy wyłącznie na etapie ostatecznego fallbacku, gdy w danej strefie brak innych pasujących ćwiczeń

#### Scenario: Zachowanie pełnej swobody manualnej trenera
- **WHEN** użytkownik ręcznie wybiera ćwiczenie z listy dialogowej lub wpisuje własną nazwę "z palca"
- **THEN** system nie blokuje wyboru, nawet jeśli ćwiczenie o tej samej nazwie lub segmencie istnieje już na innej stacji

