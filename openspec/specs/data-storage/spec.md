# Data Storage & State Specification

## Purpose
Definiuje architekturę przechowywania danych użytkownika oraz mechanizm trwałości stanu w paradygmacie Offline-First.

## Requirements

### Requirement: Magazyn Lokalny (Local Storage)
System SHALL przechowywać wszystkie trwałe dane użytkownika w `localStorage` pod kluczem `kinetic-circuits-storage`.

#### Scenario: Odczyt danych w trybie offline
- **WHEN** aplikacja uruchamia się bez dostępu do Internetu
- **THEN** system odczytuje konfiguracje sal, własne ćwiczenia i sprzęt bezpośrednio z pamięci lokalnej urządzenia

### Requirement: Odporność na Regresję i Wersjonowanie Stanu (Zero-Regression)
System SHALL wersjonować strukturę stanu magazynu `localStorage` (wersja `>= 1`) i zapewniać bezpieczną migrację danych ze starszych wersji (v0).

#### Scenario: Migracja starej wersji danych bez awarii
- **WHEN** użytkownik posiada w pamięci stan zapisany w formacie v0 (bez numeru wersji)
- **THEN** system wykonuje procedurę migracji do v1 bez czyszczenia danych i bez wywołania białego ekranu

#### Scenario: Separacja stanu UI od danych trwałych
- **WHEN** aplikacja zapisuje stan do magazynu lokalnego
- **THEN** system wyklucza z serializacji stan nawigacji i modali (`activeView`, `navigationStack`, `circuit`, `isGenerated`, `generationConflict`, `activeIntervalExecution`) przez `partialize`, zapobiegając zapętleniu UI

#### Scenario: Stan v0 zawiera dane obwodu (circuit)
- **WHEN** użytkownik posiada w `localStorage` stan v0 zawierający niepustą tablicę `circuit`
- **THEN** po migracji do v1 pole `circuit` jest nieobecne w zapisanym stanie i aplikacja inicjalizuje się z pustym obwodem (żadne ćwiczenia z poprzedniej sesji nie są wyświetlane)

#### Scenario: localStorage jest niedostępne
- **WHEN** przeglądarka blokuje dostęp do `localStorage` (np. Safari w trybie prywatnym, przekroczony limit przestrzeni)
- **THEN** aplikacja inicjalizuje się z domyślnymi wartościami w pamięci RAM bez wywołania awarii, a użytkownik może normalnie korzystać z aplikacji w bieżącej sesji (dane nie są utrwalane między przeładowaniami)
