# Spec Delta

## ADDED Requirements

### Requirement: Deterministyczny Dobór Stref Obwodu (Circuit Zone Slot Selection)
Silnik generatora obwodowego dla Sali Balaton MUST wyznaczać strefy w oparciu o deterministyczną matrycę slotów obwodu (Circuit Slot Mapping), gwarantującą obecność Wolnej Podłogi na stacji 3 oraz dynamiczne pozycjonowanie Drabinek i stacji końcowych.

#### Scenario: Generowanie Podstawowej Piątki (5 stacji)
- **WHEN** użytkownik generuje obwód o wielkości 5 stacji w Sali Balaton
- **THEN** system przydziela strefy w kolejności: 1: Moduł 0, 2: Moduł 1, 3: Wolna Podłoga, 4: Moduł 2, 5: Moduł 3
- **AND** wyklucza strefę Drabinek ściennych

#### Scenario: Włączenie Drabinek przy 6 stacjach
- **WHEN** użytkownik generuje obwód o wielkości 6 stacji w Sali Balaton
- **THEN** system włącza strefę Drabinek ściennych i pozycjonuje ją przestrzennie na pozycji 4
- **AND** wynikowy obwód ma kolejność: 1: Moduł 0, 2: Moduł 1, 3: Wolna Podłoga, 4: Drabinki, 5: Moduł 2, 6: Moduł 3

#### Scenario: Generowanie z dostępnymi kółkami gimnastycznymi (7-9 stacji)
- **WHEN** kółka gimnastyczne są dostępne w inwentarzu sali i istnieją ćwiczenia dla zadanego poziomu
- **THEN** dla 7 stacji system dodaje Kółka na pozycji 7
- **AND** dla 8 stacji system dodaje Ścianę na pozycji 8
- **AND** dla 9 stacji system dodaje drugą stację Wolnej Podłogi na pozycji 9

#### Scenario: Dynamiczny fallback przy braku kółek gimnastycznych
- **WHEN** kółka gimnastyczne są niedostępne w inwentarzu lub brak ćwiczeń dla zadanego poziomu
- **THEN** system pomija strefę Kółek
- **AND** dla 7 stacji umieszcza Ścianę na pozycji 7
- **AND** dla 8 stacji umieszcza Ścianę na pozycji 7 oraz drugą Wolną Podłogę na pozycji 8
- **AND** dla 9 stacji umieszcza Ścianę na pozycji 7 oraz dwie kolejne Wolne Podłogi na pozycjach 8 i 9

#### Scenario: Redukcja obwodu poniżej 5 stacji
- **WHEN** użytkownik wybiera liczbę stacji mniejszą niż 5 (np. 1-4 stacje)
- **THEN** system redukuje stacje od końca Podstawowej Piątki (odpowiednio odrzucając Moduł 3, następnie Moduł 2, następnie Wolną Podłogę)

