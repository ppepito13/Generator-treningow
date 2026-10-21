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

### Requirement: Mechanizm Breather (Regeneracja)
System SHALL obniżać poziom trudności ćwiczenia o 1-2 poziomy na co 3. stacji obwodu (`(idx + 1) % 3 === 0`), chyba że włączony jest tryb rygorystyczny (`isStrictDifficulty === true`).

#### Scenario: Standardowe obniżenie trudności
- **WHEN** generowana jest co trzecia stacja obwodu i tryb rygorystyczny jest wyłączony
- **THEN** system wybiera ćwiczenie o poziomie trudności niższym o 1-2 od bazowego

### Requirement: Walidacja Sprzętu (CNF Logic)
System SHALL weryfikować dostępność sprzętu w inwentarzu sali zgodnie ze strukturą CNF (koniunkcja alternatyw) zdefiniowaną dla każdego ćwiczenia.

#### Scenario: Skalowanie sprzętu na stacji podwójnej
- **WHEN** stacja pracuje w trybie pary (2 osoby)
- **THEN** system mnoży wymagane sztuki sprzętu przez liczbę uczestników na stacji
