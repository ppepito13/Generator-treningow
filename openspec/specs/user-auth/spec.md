# user-auth Specification

## Purpose

Zapewnia bezpieczne uwierzytelnianie użytkowników za pomocą Konta Google, zarządzanie sesją tożsamości w architekturze Offline-First oraz bezpieczne rozłączanie profilu.

## Requirements

### Requirement: Uwierzytelnianie za pomocą Konta Google
System MUST umożliwiać zalogowanie użytkownika za pośrednictwem Konta Google przy użyciu protokołu OAuth 2.0 z zakresem uprawnień tożsamości oraz dostępu do ukrytego folderu danych aplikacji (`https://www.googleapis.com/auth/drive.appdata`), gwarantując niezawodną obsługę w środowisku przeglądarki Web oraz natywnej aplikacji mobilnej Android (Capacitor), wraz z automatycznym zabezpieczeniem przed zawieszeniem interfejsu oraz prezentacją przyjaznych, zlokalizowanych komunikatów o błędach w języku polskim. W przypadku gdy użytkownik w oknie autoryzacji Google nie zaznaczy wymaganego uprawnienia do Dysku Google, system MUST odrzucić logowanie i poinformować o konieczności wyrażenia zgody.

#### Scenario: Udane logowanie przez okno dialogowe Google
- **WHEN** użytkownik wybierze opcję połączenia konta Google w aplikacji webowej
- **THEN** system inicjuje przepływ autoryzacyjny Google Identity Services z uprawnieniami `openid`, `email`, `profile` oraz `https://www.googleapis.com/auth/drive.appdata`
- **AND** po udanym uwierzytelnieniu pobiera identyfikator użytkownika, adres e-mail, nazwę wyświetlaną, opcjonalny adres awatara oraz token dostępowy `accessToken` uprawniający do operacji na Dysku Google

#### Scenario: Udane logowanie w środowisku mobilnym Android (Capacitor)
- **WHEN** użytkownik wybierze opcję połączenia konta Google w natywnej aplikacji mobilnej na systemie Android
- **THEN** system inicjuje natywny przepływ Google Sign-In / Credential Manager za pośrednictwem mostka Capacitor z żądanym zakresem `https://www.googleapis.com/auth/drive.appdata`
- **AND** po udanym uwierzytelnieniu przekazuje dane tożsamości oraz token `accessToken` do stanu sesji aplikacji

#### Scenario: Odrzucenie niepełnych uprawnień (brak zgody na Dysk Google)
- **WHEN** użytkownik w oknie Google pominie lub odznaczy pole wyboru uprawnienia do Dysku Google i kliknie Dalej
- **THEN** system wykrywa brak uprawnienia `drive.appdata` w przyznanym zakresie tokena
- **AND** natychmiast anuluje stan sesji, nie zapisuje profilu użytkownika jako połączonego
- **AND** prezentuje dedykowany komunikat błędu w języku polskim informujący o konieczności zaznaczenia pola wyboru Dysku Google

#### Scenario: Limit czasu i przerwanie logowania (Timeout & Focus Recovery)
- **WHEN** proces autoryzacji Google przekroczy zdefiniowany limit czasu (30 sekund) lub użytkownik powróci do aplikacji bez pomyślnego zakończenia sesji
- **THEN** system automatycznie anuluje stan oczekiwania na logowanie
- **AND** przywraca interaktywność przycisku logowania oraz prezentuje czytelny komunikat błędu

#### Scenario: Anulowanie lub błąd logowania
- **WHEN** użytkownik zamknie okno logowania Google lub wystąpi błąd sieciowy
- **THEN** system nie modyfikuje stanu tożsamości lokalnej
- **AND** ustawia status błędu z czytelnym dla użytkownika komunikatem

#### Scenario: Anulowanie logowania przez użytkownika
- **WHEN** użytkownik zamknie okno logowania Google lub anuluje wybór konta w natywnym interfejsie Androida
- **THEN** system nie modyfikuje stanu tożsamości lokalnej
- **AND** ustawia status błędu z czytelnym komunikatem w języku polskim („Logowanie zostało anulowane.”)

#### Scenario: Błąd braku konta lub braku powiązania w Google Cloud na Androidzie
- **WHEN** natywny menedżer poświadczeń Androida zgłosi brak dostępnych kont lub brak pasujących poświadczeń dla aplikacji
- **THEN** system prezentuje zrozumiałą instrukcję wskazującą na konieczność dodania konta w Ustawieniach telefonu lub zakończenie weryfikacji w Google Cloud

#### Scenario: Błąd sieciowy lub konfiguracji usług Google
- **WHEN** wystąpi błąd połączenia z siecią, brak usług Google Play lub niezarejestrowane źródło JavaScript (origin mismatch)
- **THEN** system prezentuje dedykowany komunikat wyjaśniający przyczynę w języku polskim bez surowych kodów technicznych

### Requirement: Zarządzanie Stanem Sesji Użytkownika
Aplikacja MUST przechowywać dane profilu zalogowanego użytkownika w pamięci stanu, w tle weryfikować ważność sesji przy dostępie do sieci z obsługą tokenów tożsamości Androida (ID token) oraz tokenów dostępowych Web, natychmiast wykrywać unieważnienie lub cofnięcie uprawnień przez użytkownika w usługach Google, oraz chronić integralność danych lokalnych w trybie Offline-First bez fałszywego prezentowania stanu połączenia ani natychmiastowego wylogowywania tuż po udanym połączeniu konta.

#### Scenario: Prawidłowe odzwierciedlenie stanu zalogowanego
- **WHEN** użytkownik posiada aktywną sesję Google
- **THEN** system udostępnia dane profilu (`id`, `email`, `name`, `picture`) dla modułów aplikacji
- **AND** flaga `isAuthenticated` przyjmuje wartość `true`

#### Scenario: Odporność pamięci lokalnej przy braku sesji
- **WHEN** aplikacja działa w stanie niezalogowanym
- **THEN** wszystkie lokalne ćwiczenia, sale i sprzęt działają bez zakłóceń w standardowym trybie Offline-First

#### Scenario: Cicha weryfikacja sesji w tle (Background Silent Revalidation)
- **WHEN** użytkownik wchodzi do widoku Ustawień lub aplikacja startuje z zapisanym profilem Google i urządzenie posiada połączenie z Internetem (`navigator.onLine`)
- **THEN** system w tle weryfikuje ważność tokenu sesji Google (token dostępowy lub token tożsamości ID token) bez blokowania interfejsu ani wymuszania interakcji użytkownika
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

#### Scenario: Trwałość nowo połączonej sesji na platformie Android
- **WHEN** użytkownik pomyślnie połączy konto Google w natywnej aplikacji Android
- **THEN** system utrwala token tożsamości `idToken` w pamięci sesji
- **AND** nie uruchamia natychmiastowej procedury unieważnienia sesji w tym samym cyklu logowania
- **AND** poprawnie prezentuje stan połączenia i profil użytkownika w widoku Ustawień

### Requirement: Bezpieczne Odpinanie Konta Google
System MUST umożliwiać odłączenie połączonego Konta Google z zachowaniem nienaruszonych danych autorskich na urządzeniu.

#### Scenario: Odłączenie konta przez użytkownika
- **WHEN** użytkownik potwierdzi chęć odpięcia konta Google
- **THEN** system czyści dane sesji użytkownika w pamięci podręcznej i przestawia status na niezalogowany
- **AND** pozostawia wszystkie lokalnie zapisane ćwiczenia, sale i sprzęt w stanie nienaruszonym
