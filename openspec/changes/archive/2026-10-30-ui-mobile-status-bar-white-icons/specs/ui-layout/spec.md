# Spec Delta: ui-layout

## ADDED Requirements

### Requirement: Trwałe wymuszenie białych ikon paska statusu w cyklu życia aplikacji
Aplikacja Android MUST utrzymywać białe ikony paska statusu (zegar, stan baterii, łączność) w całym cyklu życia aktywności, w tym po zniknięciu ekranu splash screen, podczas odzyskiwania focusu okna oraz po zmianie orientacji lub motywu systemowego.

#### Scenario: Uruchomienie aplikacji i przejście przez splash screen na Androidzie w trybie Light
- **WHEN** aplikacja kończy wyświetlanie ekranu splash screen i przekazuje sterowanie do WebView na urządzeniu z systemowym motywem jasnym
- **THEN** pasek statusu zachowuje białe ikony i biały zegar bez powrotu do domyślnych czarnych ikon systemowych.
