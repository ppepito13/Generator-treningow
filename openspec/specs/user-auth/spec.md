# user-auth Specification

## Purpose

Zapewnia bezpieczne uwierzytelnianie użytkowników za pomocą Konta Google, zarządzanie sesją tożsamości w architekturze Offline-First oraz bezpieczne rozłączanie profilu.

## Requirements

### Requirement: Uwierzytelnianie za pomocą Konta Google
System MUST umożliwiać zalogowanie użytkownika za pośrednictwem Konta Google przy użyciu protokołu OAuth 2.0 z minimalnym wymaganym zakresem uprawnień tożsamości.

#### Scenario: Udane logowanie przez okno dialogowe Google
- **WHEN** użytkownik wybierze opcję połączenia konta Google w aplikacji
- **THEN** system inicjuje przepływ autoryzacyjny Google Identity Services z uprawnieniami `openid`, `email`, `profile`
- **AND** po udanym uwierzytelnieniu pobiera identyfikator użytkownika, adres e-mail, nazwę wyświetlaną oraz opcjonalny adres awatara

#### Scenario: Anulowanie lub błąd logowania
- **WHEN** użytkownik zamknie okno logowania Google lub wystąpi błąd sieciowy
- **THEN** system nie modyfikuje stanu tożsamości lokalnej
- **AND** ustawia status błędu z czytelnym dla użytkownika komunikatem

### Requirement: Zarządzanie Stanem Sesji Użytkownika
Aplikacja MUST przechowywać dane profilu zalogowanego użytkownika w pamięci stanu oraz odzwierciedlać aktualny stan połączenia w interfejsie.

#### Scenario: Prawidłowe odzwierciedlenie stanu zalogowanego
- **WHEN** użytkownik posiada aktywną sesję Google
- **THEN** system udostępnia dane profilu (`id`, `email`, `name`, `picture`) dla modułów aplikacji
- **AND** flaga `isAuthenticated` przyjmuje wartość `true`

#### Scenario: Odporność pamięci lokalnej przy braku sesji
- **WHEN** aplikacja działa w stanie niezalogowanym
- **THEN** wszystkie lokalne ćwiczenia, sale i sprzęt działają bez zakłóceń w standardowym trybie Offline-First

### Requirement: Bezpieczne Odpinanie Konta Google
System MUST umożliwiać odłączenie połączonego Konta Google z zachowaniem nienaruszonych danych autorskich na urządzeniu.

#### Scenario: Odłączenie konta przez użytkownika
- **WHEN** użytkownik potwierdzi chęć odpięcia konta Google
- **THEN** system czyści dane sesji użytkownika w pamięci podręcznej i przestawia status na niezalogowany
- **AND** pozostawia wszystkie lokalnie zapisane ćwiczenia, sale i sprzęt w stanie nienaruszonym

