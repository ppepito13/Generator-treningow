# Circuit Engine Delta Specification: Store Integration & Conflict Resolution

## Purpose
Specyfikacja integracji Zustand Store z modułami domenowymi generatora, wstrzykiwania pełnej bazy ćwiczeń (w tym ćwiczeń użytkownika) oraz bezpiecznej obsługi częściowego obwodu w modalu konfliktu.

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Obsługa Częściowego Obwodu w Konflikcie (Partial Circuit Resolution)
W przypadku niemożliwości skompletowania żądanej liczby stacji system SHALL zachowywać dotychczas wygenerowane stacje i umożliwiać ich natychmiastowe zastosowanie.

#### Scenario: Wybór akcji zmniejszenia liczby stacji
- **WHEN** generator nie jest w stanie zapełnić żądanej liczby stacji (`stationCount`)
- **AND** użytkownik wybierze w modalu konfliktu akcję redukcji (`action === 'reduce'`)
- **THEN** system ustawia obwód na wygenerowane częściowe stacje (`conflict.partialStations`)
- **AND** aktualizuje parametr `stationCount` do faktycznie dostępnej liczby stacji (`conflict.availableStations`)
- **AND** przełącza aktywny widok na podgląd obwodu treningowego
