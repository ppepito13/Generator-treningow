# Spec Delta: data-storage

## ADDED Requirements

### Requirement: Klient Danych w Google Drive appDataFolder
System SHALL udostępniać klienta REST API Google Drive v3 operującego na przestrzeni `appDataFolder`, umożliwiającego bezserwerowe wyszukiwanie, pobieranie, tworzenie oraz aktualizację pojedynczego pliku kopii zapasowej w formacie JSON z wykorzystaniem tokena autoryzacyjnego Bearer.

#### Scenario: Wyszukiwanie istniejącego pliku kopii w chmurze
- **WHEN** klient wykonuje zapytanie wyszukiwania w Google Drive z parametrem `spaces=appDataFolder`
- **THEN** system zwraca identyfikator istniejącego pliku kopii zapasowej lub `null`, jeśli plik jeszcze nie został utworzony

#### Scenario: Pobranie zawartości kopii zapasowej
- **WHEN** klient pobiera plik z Google Drive z parametrem `alt=media`
- **THEN** system zwraca sparsowaną zawartość pliku JSON lub zgłasza błąd w przypadku problemów z siecią lub brakiem uprawnień

#### Scenario: Utworzenie lub aktualizacja pliku kopii
- **WHEN** klient przesyła zaktualizowany stan danych do Google Drive
- **THEN** system tworzy plik w `appDataFolder` zapytaniem multipart przy pierwszym zapisie lub aktualizuje istniejący plik zapytaniem PATCH

