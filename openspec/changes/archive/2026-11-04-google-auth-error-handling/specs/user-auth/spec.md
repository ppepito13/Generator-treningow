# Spec Delta

## MODIFIED Requirements

### Requirement: Uwierzytelnianie za pomocą Konta Google
System MUST umożliwiać zalogowanie użytkownika za pośrednictwem Konta Google przy użyciu protokołu OAuth 2.0 z minimalnym zakresem uprawnień, gwarantując niezawodną obsługę w środowisku przeglądarki Web oraz natywnej aplikacji mobilnej Android (Capacitor), wraz z automatycznym zabezpieczeniem przed zawieszeniem interfejsu oraz prezentacją przyjaznych, zlokalizowanych komunikatów o błędach w języku polskim.

#### Scenario: Udane logowanie przez okno dialogowe Google
- **WHEN** użytkownik wybierze opcję połączenia konta Google w aplikacji webowej
- **THEN** system inicjuje przepływ autoryzacyjny Google Identity Services z uprawnieniami `openid`, `email`, `profile`
- **AND** po udanym uwierzytelnieniu pobiera identyfikator użytkownika, adres e-mail, nazwę wyświetlaną oraz opcjonalny adres awatara

#### Scenario: Udane logowanie w środowisku mobilnym Android (Capacitor)
- **WHEN** użytkownik wybierze opcję połączenia konta Google w natywnej aplikacji mobilnej na systemie Android
- **THEN** system inicjuje natywny przepływ Google Sign-In / Credential Manager za pośrednictwem mostka Capacitor
- **AND** po udanym uwierzytelnieniu przekazuje dane tożsamości do stanu aplikacji bez otwierania zewnętrznej przeglądarki

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
