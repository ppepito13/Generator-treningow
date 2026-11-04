# user-auth Specification Delta

## MODIFIED Requirements

### Requirement: Zarządzanie Stanem Sesji Użytkownika
Aplikacja MUST przechowywać dane profilu zalogowanego użytkownika w pamięci stanu, w tle weryfikować ważność sesji przy dostępie do sieci, natychmiast wykrywać unieważnienie lub cofnięcie uprawnień przez użytkownika w usługach Google, oraz chronić integralność danych lokalnych w trybie Offline-First bez fałszywego prezentowania stanu połączenia.

#### Scenario: Prawidłowe odzwierciedlenie stanu zalogowanego
- **WHEN** użytkownik posiada aktywną sesję Google
- **THEN** system udostępnia dane profilu (`id`, `email`, `name`, `picture`) dla modułów aplikacji
- **AND** flaga `isAuthenticated` przyjmuje wartość `true`

#### Scenario: Odporność pamięci lokalnej przy braku sesji
- **WHEN** aplikacja działa w stanie niezalogowanym
- **THEN** wszystkie lokalne ćwiczenia, sale i sprzęt działają bez zakłóceń w standardowym trybie Offline-First

#### Scenario: Cicha weryfikacja sesji w tle (Background Silent Revalidation)
- **WHEN** użytkownik wchodzi do widoku Ustawień lub aplikacja startuje z zapisanym profilem Google i urządzenie posiada połączenie z Internetem (`navigator.onLine`)
- **THEN** system w tle weryfikuje ważność tokenu dostępowego sesji Google bez blokowania interfejsu ani wymuszania interakcji użytkownika
- **AND** w przypadku pomyślnej weryfikacji utrzymuje stan `authenticated`

#### Scenario: Wykrycie cofnięcia uprawnień Google (Revocation Detection)
- **WHEN** cicha weryfikacja sesji Google zwróci błąd unieważnienia tokenu (`invalid_token`, `invalid_grant` lub kod 400/401 z API Google) oznaczający cofnięcie uprawnień aplikacji na koncie użytkownika
- **THEN** system automatycznie czyści zapamiętany profil `googleUser` oraz tokeny sesji
- **AND** przestawia status autoryzacji na `idle`
- **AND** prezentuje czytelny komunikat ostrzegawczy w języku polskim: „Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.”
- **AND** lokalnie zapisane sale, ćwiczenia i ustawienia użytkownika pozostają nienaruszone

#### Scenario: Odporność sesji w trybie Offline (Offline-First Preservation)
- **WHEN** weryfikacja sesji jest wywoływana, gdy urządzenie nie ma połączenia z Internetem (`!navigator.onLine`) lub wystąpi błąd sieciowy
- **THEN** system nie usuwa profilu `googleUser` ani nie resetuje sesji
- **AND** prezentuje bezpieczny stan pracy w trybie lokalnym („Lokalnie (Offline First)”)

