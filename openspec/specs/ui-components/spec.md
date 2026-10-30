# ui-components Specification

## Purpose
TBD - created by archiving change ui-headers-and-responsive-grids. Update Purpose after archive.

## Requirements

### Requirement: Spójny komponent nagłówka modułu (ModuleHeader)
Aplikacja MUST posiadać reużywalny komponent `ModuleHeader`, prezentujący ujednoliconą hierarchię: kafel z ikoną, tytuł modułu, podtytuł pomocniczy, opcjonalne akcje nagłówka oraz opcjonalny pasek zakładek wewnętrznych.

#### Scenario: Renderowanie nagłówka z akcjami i zakładkami
- **GIVEN** widok Zegara lub Studia wykorzystujący `ModuleHeader`
- **WHEN** nagłówek jest renderowany
- **THEN** wyświetla się w ramce `.glass-card` z zaokrągleniami `rounded-[2rem]` i spójną typografią.

### Requirement: Responsywna siatka stacji treningowych z obsługą Drag & Drop
Widok Zestawu (`CircuitList`) MUST wyświetlać stacje w układzie 1-kolumnowym na telefonach oraz 2-kolumnowym na tabletach/desktopie (`md:grid-cols-2`), wykorzystując strategię `rectSortingStrategy` z biblioteki `@dnd-kit/sortable`, umożliwiającą przeciąganie kafelków w dwóch wymiarach.

#### Scenario: Przeciąganie stacji w siatce dwukolumnowej
- **GIVEN** widok `CircuitList` na ekranie tabletu z dwiema kolumnami
- **WHEN** użytkownik przeciąga stację między kolumnami
- **THEN** biblioteka DnD poprawnie przelicza pozycje stacji bez błędów w układzie.

### Requirement: Responsywna siatka kart w Studio bazy
Widok Studia ćwiczeń (`ExerciseStudioView`) MUST wyświetlać karty ćwiczeń w siatce responsywnej (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`), efektywnie wykorzystując dostępną szerokość ekranu.

#### Scenario: Wyświetlanie bazy ćwiczeń na monitorze desktopowym
- **GIVEN** użytkownik przegląda Studio ćwiczeń na ekranie o szerokości powyżej breakpointu `lg`
- **WHEN** lista ćwiczeń jest renderowana
- **THEN** ćwiczenia wyświetlają się w siatce 3-kolumnowej z zachowaniem czytelności i funkcjonalności podglądu/edycji.

### Requirement: Brak przepełnienia poziomego w konfiguratorze Zegara (Zero Horizontal Overflow)
Wszystkie wiersze kroków czasowych oraz nagłówki bloków w widoku Zegara interwałowego MUST mieścić się w całości w kontenerze o minimalnej szerokości 360px bez wywoływania poziomego paska przewijania dokumentu (`scrollWidth <= clientWidth`).

#### Scenario: Konfiguracja kroków na ekranie o szerokości 360px
- **WHEN** użytkownik konfiguruje pętle i pojedyncze kroki w module Zegara na ekranie smartfona o szerokości 360px
- **THEN** cały rząd kroku (czas, nazwa, próbnik koloru, usuwanie) mieści się w granicach karty, a dokument nie posiada poziomego suwaka przewijania.

### Requirement: Elastyczne zawijanie etykiet przycisków akcji
Przyciski akcji zawierające opisy lub przekierowania o długości powyżej 30 znaków MUST zezwalać na wielowierszowe zawijanie tekstu (`whitespace-normal`) i dynamicznie dopasowywać swoją wysokość (`h-auto`), zapobiegając wylewaniu się tekstu poza obrys przycisku i karty.

#### Scenario: Wyświetlanie przycisku nawigacyjnego w kalkulatorze BMR/RFM/BMI
- **WHEN** użytkownik widzi przycisk przekierowania do powiązanego kalkulatora na małym ekranie telefonu
- **THEN** cały tekst etykiety przycisku zawija się estetycznie wewnątrz przycisku, nie wylewając się poza kontener ani krawędź ekranu.

### Requirement: Spójne przewijanie nagłówków widoków
Główny nagłówek widoku Zestawu treningowego (`CircuitList`) MUST przewijać się naturalnie wraz z listą stacji treningowych, chroniąc przestrzeń pod fizycznym wycięciem aparatu i integrując się z globalną nakładką paska statusu.

#### Scenario: Przewijanie stacji obwodu
- **WHEN** użytkownik przewija widok wygenerowanego obwodu ku górze
- **THEN** nagłówek obwodu przesuwa się płynnie pod globalną nakładką paska statusu, a stacje treningowe zajmują pełną dostępną przestrzeń roboczą.
