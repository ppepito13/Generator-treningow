# Spec Delta: user-auth

## MODIFIED Requirements

### Requirement: Uwierzytelnianie za pomocą Konta Google
System MUST umożliwiać zalogowanie użytkownika za pośrednictwem Konta Google przy użyciu protokołu OAuth 2.0 z zakresem uprawnień tożsamości oraz dostępu do ukrytego folderu danych aplikacji (`https://www.googleapis.com/auth/drive.appdata`), gwarantując niezawodną obsługę w środowisku przeglądarki Web oraz natywnej aplikacji mobilnej Android (Capacitor). System MUST gwarantować stałą dostępność poprawnego produkcyjnego identyfikatora Google Client ID nawet w przypadku braku zmiennej środowiskowej w procesie kompilacji, oraz eliminować opóźnienia ładowania skryptu autoryzacji chroniąc przed blokadą wyskakujących okienek w Safari na iOS. W przypadku gdy użytkownik w oknie autoryzacji Google zaloguje się, lecz pominie opcjonalne uprawnienie do Dysku Google, system MUST zapisać profil użytkownika z jawnym oznaczeniem braku uprawnień do Dysku (`hasDriveScope: false`), zachować spójność z Kontem Google oraz udostępnić w interfejsie możliwość doautoryzowania dostępu.

#### Scenario: Udane logowanie przez okno dialogowe Google
- **WHEN** użytkownik wybierze opcję połączenia konta Google w aplikacji webowej
- **THEN** system inicjuje przepływ autoryzacyjny Google Identity Services z uprawnieniami `openid`, `email`, `profile` oraz `https://www.googleapis.com/auth/drive.appdata`
- **AND** po udanym uwierzytelnieniu pobiera identyfikator użytkownika, adres e-mail, nazwę wyświetlaną, opcjonalny adres awatara oraz token dostępowy `accessToken` uprawniający do operacji na Dysku Google

#### Scenario: Udane logowanie w środowisku mobilnym Android (Capacitor)
- **WHEN** użytkownik wybierze opcję połączenia konta Google w natywnej aplikacji mobilnej na systemie Android
- **THEN** system inicjuje natywny przepływ Google Sign-In / Credential Manager za pośrednictwem mostka Capacitor z żądanym zakresem `https://www.googleapis.com/auth/drive.appdata`
- **AND** po udanym uwierzytelnieniu przekazuje dane tożsamości oraz token `accessToken` do stanu sesji aplikacji

#### Scenario: Dostępność produkcyjnego identyfikatora Client ID bez zmiennej środowiskowej
- **WHEN** aplikacja webowa zostanie skompilowana w środowisku bez zdefiniowanej zmiennej `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **THEN** funkcja pobierania identyfikatora klienta bezpiecznie stosuje stały produkcyjny fallback `PRODUCTION_GOOGLE_CLIENT_ID`
- **AND** przycisk logowania Google inicjuje proces autoryzacji zamiast rzucać błąd braku identyfikatora

#### Scenario: Płynne otwarcie okna autoryzacji w mobilnym Safari (ochrona przed blokadą popupu)
- **WHEN** użytkownik wchodzi do modułu Ustawień w przeglądarce Safari na urządzeniu mobilnym (iOS)
- **THEN** system wstępnie ładuje skrypt biblioteki Google Identity Services w tle
- **AND** po kliknięciu przycisku połączenia konta okno autoryzacji Google otwiera się synchronicznie w ramach gestu użytkownika bez blokady wyskakujących okienek przez Safari

#### Scenario: Odrzucenie niepełnych uprawnień (brak zgody na Dysk Google)
- **WHEN** użytkownik w oknie Google pominie lub odznaczy pole wyboru uprawnienia do Dysku Google i kliknie Dalej
- **THEN** system zapisuje profil użytkownika ze statusem połączenia, oznaczając brak uprawnienia do Dysku Google (`hasDriveScope: false`)
- **AND** wstrzymuje operacje synchronizacji w chmurze
- **AND** prezentuje w module Ustawień status „Wymaga uprawnień” oraz dedykowany przycisk umożliwiający doautoryzowanie dostępu do Dysku Google

#### Scenario: Limit czasu i przerwanie logowania (Timeout & Focus Recovery)
- **WHEN** proces autoryzacji Google przekroczy zdefiniowany limit czasu (60 sekund) lub użytkownik powróci do aplikacji bez pomyślnego zakończenia sesji
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

