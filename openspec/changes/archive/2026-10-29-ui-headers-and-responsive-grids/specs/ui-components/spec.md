# Capability: UI Components and Responsive Grids

## ADDED Requirements

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
