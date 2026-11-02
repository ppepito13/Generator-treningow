# settings-module Specification

## Purpose
Zapewnia dedykowany moduł ustawień aplikacji dostępny bezpośrednio z ekranu głównego, służący do konfiguracji preferencji systemowych, motywu oraz konta użytkownika.

## Requirements

### Requirement: Dedykowany punkt wejścia do Ustawień na Ekranie Głównym
Aplikacja MUST udostępniać przycisk z ikoną koła zębatego (Settings Trigger) w prawym górnym rogu sekcji nagłówka na ekranie głównym Generatora (`ConfigurationForm`), umożliwiający natychmiastowe przejście do modułu Ustawień.

#### Scenario: Użytkownik klika ikonę zębatki na ekranie głównym
- **WHEN** użytkownik klika przycisk zębatki na ekranie głównym generatora
- **THEN** aplikacja aktywuje zakładkę `settings` i wyświetla pełny widok modułu Ustawień

### Requirement: Dedykowany widok Ustawień z ustandaryzowanym nagłówkiem
Moduł Ustawień (`SettingsView`) MUST wykorzystywać ustandaryzowany komponent `ModuleHeader` prezentujący tytuł „Ustawienia”, podtytuł pomocniczy oraz przycisk powrotu do Generatora.

#### Scenario: Wyświetlenie nagłówka modułu Ustawień
- **WHEN** widok Ustawień zostaje wyrenderowany
- **THEN** nagłówek prezentuje ikonę koła zębatego, tytuł „Ustawienia” oraz przycisk umożliwiający powrót do widoku Generatora

### Requirement: Reaktywna nawigacja i obsługa powrotu (Auto-save)
Aplikacja MUST wspierać natychmiastowe zapisywanie wprowadzanych w ustawieniach zmian oraz bezproblemowy powrót do Generatora za pomocą przycisku w nagłówku lub sprzętowego przycisku wstecz na Androidzie, bez wymuszania dodatkowych okien dialogowych potwierdzenia.

#### Scenario: Użytkownik cofa się z widoku Ustawień
- **WHEN** użytkownik klika przycisk powrotu w nagłówku lub sprzętowy przycisk Back na urządzeniu mobilnym
- **THEN** aplikacja natychmiast przełącza aktywną zakładkę z powrotem na `generator`

### Requirement: Struktura sekcji konfiguracyjnych w Ustawieniach
Widok Ustawień MUST zawierać czytelnie wydzielone karty konfiguracyjne: sekcję Personalizacji (przygotowaną pod wybór motywu #15), sekcję Konta i Synchronizacji (przygotowaną pod integrację z Google #39 i #40) oraz sekcję Informacji o Aplikacji (wersja, autor).

#### Scenario: Prezentacja kart modułu Ustawień
- **WHEN** użytkownik przegląda widok Ustawień
- **THEN** widoczne są logiczne bloki z informacjami o motywie aplikacji, statusie synchronizacji chmurowej oraz wersji aplikacji
