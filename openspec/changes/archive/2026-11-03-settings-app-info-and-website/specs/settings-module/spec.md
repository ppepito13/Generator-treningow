# Spec Delta

## MODIFIED Requirements

### Requirement: Struktura sekcji konfiguracyjnych w Ustawieniach
Widok Ustawień MUST zawierać czytelnie wydzielone karty konfiguracyjne: sekcję Personalizacji (przygotowaną pod wybór motywu #15), sekcję Konta i Synchronizacji (przygotowaną pod integrację z Google #39 i #40) oraz sekcję Informacji o Aplikacji (wersja z bezpiecznego źródła prawdy, dynamiczna liczba ćwiczeń w bazie oraz oficjalny adres WWW).

#### Scenario: Prezentacja kart modułu Ustawień
- **WHEN** użytkownik przegląda widok Ustawień
- **THEN** widoczne są logiczne bloki z informacjami o motywie aplikacji, statusie synchronizacji chmurowej, wersji aplikacji, liczbie dostępnych ćwiczeń oraz oficjalnym odnośniku WWW

## ADDED Requirements

### Requirement: Dynamiczny wskaźnik bazy ćwiczeń w Ustawieniach
Sekcja Informacji o Aplikacji MUST prezentować dynamiczną liczbę ćwiczeń uwzględniającą fabryczną bazę ćwiczeń oraz ćwiczenia autorskie użytkownika zapisane w pamięci lokalnej urządzenia.

#### Scenario: Użytkownik posiada wyłącznie bazę fabryczną
- **WHEN** użytkownik otwiera moduł Ustawień i nie posiada zapisanych ćwiczeń autorskich
- **THEN** sekcja O Aplikacji wyświetla liczbę ćwiczeń fabrycznych w formacie informującym o bazie (np. „270 w bazie”)

#### Scenario: Użytkownik posiada ćwiczenia autorskie lub zmodyfikowane
- **WHEN** użytkownik posiada w pamięci lokalnej co najmniej jedno ćwiczenie autorskie lub zmodyfikowane
- **THEN** sekcja O Aplikacji wyświetla liczbę bazy fabrycznej wraz z wyszczególnieniem ćwiczeń autorskich (np. „270 w bazie (+X własnych)”)

### Requirement: Oficjalny odnośnik internetowy w Ustawieniach
Sekcja Informacji o Aplikacji MUST zawierać klikalny odnośnik do oficjalnej strony internetowej projektu (`https://sportsway.eu/`), który otwiera się w bezpiecznym oknie zewnętrznej przeglądarki.

#### Scenario: Kliknięcie odnośnika strony WWW
- **WHEN** użytkownik klika pozycję strony WWW w sekcji O Aplikacji
- **THEN** aplikacja otwiera adres `https://sportsway.eu/` w zewnętrznej przeglądarce za pomocą bezpiecznego odnośnika (`target="_blank"` oraz `rel="noopener noreferrer"`)

