# user-auth Specification Delta

## MODIFIED Requirements

### Requirement: Uwierzytelnianie za pomocą Konta Google
System MUST umożliwiać zalogowanie użytkownika za pośrednictwem Konta Google przy użyciu protokołu OAuth 2.0 z zakresem uprawnień tożsamości oraz dostępu do ukrytego folderu danych aplikacji (`https://www.googleapis.com/auth/drive.appdata`), gwarantując niezawodną obsługę w środowisku przeglądarki Web oraz natywnej aplikacji mobilnej Android (Capacitor), wraz z automatycznym zabezpieczeniem przed zawieszeniem interfejsu oraz prezentacją przyjaznych, zlokalizowanych komunikatów o błędach w języku polskim. W przypadku gdy użytkownik w oknie autoryzacji Google nie zaznaczy wymaganego uprawnienia do Dysku Google, system MUST unieważnić otrzymany token (auto-revoke w Google), odrzucić logowanie i poinformować o konieczności wyrażenia zgody.

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
- **AND** natychmiast wysyła żądanie unieważnienia otrzymanego tokenu (`revoke`) do serwerów Google, usuwając powiązanie aplikacji z Konta Google użytkownika
- **AND** czyści stan lokalnej sesji i nie zapisuje profilu użytkownika jako połączonego
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
