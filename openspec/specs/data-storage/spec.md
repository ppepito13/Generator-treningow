# Data Storage & State Specification

## Purpose
Definiuje architekturę przechowywania danych użytkownika oraz mechanizm trwałości stanu w paradygmacie Offline-First.

## Requirements

### Requirement: Magazyn Lokalny (Local Storage)
System SHALL przechowywać wszystkie trwałe dane użytkownika w `localStorage` pod kluczem `kinetic-circuits-storage`.

#### Scenario: Odczyt danych w trybie offline
- **WHEN** aplikacja uruchamia się bez dostępu do Internetu
- **THEN** system odczytuje konfiguracje sal, własne ćwiczenia i sprzęt bezpośrednio z pamięci lokalnej urządzenia

### Requirement: Odporność na Regresję i Wersjonowanie Stanu (Zero-Regression)
System SHALL wersjonować strukturę stanu magazynu `localStorage` (wersja `>= 1`) i zapewniać bezpieczną migrację danych ze starszych wersji (v0).

#### Scenario: Migracja starej wersji danych bez awarii
- **WHEN** użytkownik posiada w pamięci stan zapisany w formacie v0 (bez numeru wersji)
- **THEN** system wykonuje procedurę migracji do v1 bez czyszczenia danych i bez wywołania białego ekranu

#### Scenario: Separacja stanu UI od danych trwałych
- **WHEN** aplikacja zapisuje stan do magazynu lokalnego
- **THEN** system wyklucza z serializacji stan nawigacji i modali (`activeView`, `navigationStack`, `circuit`, `isGenerated`, `generationConflict`, `activeIntervalExecution`) przez `partialize`, zapobiegając zapętleniu UI

#### Scenario: Stan v0 zawiera dane obwodu (circuit)
- **WHEN** użytkownik posiada w `localStorage` stan v0 zawierający niepustą tablicę `circuit`
- **THEN** po migracji do v1 pole `circuit` jest nieobecne w zapisanym stanie i aplikacja inicjalizuje się z pustym obwodem (żadne ćwiczenia z poprzedniej sesji nie są wyświetlane)

#### Scenario: localStorage jest niedostępne
- **WHEN** przeglądarka blokuje dostęp do `localStorage` (np. Safari w trybie prywatnym, przekroczony limit przestrzeni)
- **THEN** aplikacja inicjalizuje się z domyślnymi wartościami w pamięci RAM bez wywołania awarii, a użytkownik może normalnie korzystać z aplikacji w bieżącej sesji (dane nie są utrwalane między przeładowaniami)

### Requirement: Nienaruszalność Metadanych przy Edycji Ćwiczeń
System SHALL zachowywać pełną integralność danych ćwiczenia (w tym wymagania sprzętowe `wymagania_sprzetowe`, biomechanikę `biomechanika`, zaangażowane mięśnie `zaangazowane_miesnie`, tagi specjalne `tagi_specjalne` oraz kategorie `kategorie_treningu`) podczas edycji i nadpisywania ćwiczeń wbudowanych oraz własnych w module Studio Ćwiczeń.

#### Scenario: Edycja ćwiczenia wbudowanego zachowuje wymagany sprzęt
- **WHEN** użytkownik edytuje w Studio ćwiczenie wbudowane posiadające zdefiniowany sprzęt (np. drążek) i zapisuje formularz
- **THEN** zapisane ćwiczenie w `customExercises` zachowuje oryginalne `wymagania_sprzetowe` oraz biomechanikę, a generator poprawnie uwzględnia sprzęt przy doborze stacji

#### Scenario: Tworzenie nowego ćwiczenia własnego z domyślnymi wartościami
- **WHEN** użytkownik tworzy w Studio zupełnie nowe ćwiczenie bez podania opcjonalnych parametrów
- **THEN** system przypisuje bezpieczne wartości domyślne bez wywoływania błędów w generatorze

### Requirement: Konfiguracja Stref i Limitów Sal Treningowych
Baza konfiguracji sal treningowych SHALL udostępniać zaktualizowane limity pojemności dla Sali Balaton oraz ustandaryzowaną flagę wymuszenia obecności strefy w obwodzie treningowym.

#### Scenario: Parametry pojemności i stref Sali Balaton
- **WHEN** aplikacja wczytuje konfigurację Sali Balaton z `sala.json`
- **THEN** maksymalna pojemność wynosi 9 stacji i 18 osób
- **AND** strefa `Strefa_Wolna_Przestrzen` posiada bazową pojemność stacji równą 6

#### Scenario: Ustandaryzowana flaga wymuszenia strefy
- **WHEN** strefa treningowa ma brać obligatoryjny udział w podstawowym zestawie obwodu
- **THEN** pole strefy nosi nazwę `wymuszona_w_obwodzie: true`
- **AND** system zachowuje kompatybilność w przypadku odczytu starszych sal użytkownika posiadających atrybut `blokada_zmiany_recznej`

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


### Requirement: Wersjonowanie Danych i Silnik Scalania LWW z Obsługą Tombstones
System SHALL zaopatrywać autorskie encje użytkownika (własne ćwiczenia, sale, inwentarz sprzętu oraz presety interwałowe) w metadane synchronizacji `_sync` (`updatedAt`, `version`, `isDeleted`), zapewniać miękkie usuwanie chroniące przed danymi-widmami (zombie records) oraz udostępniać deterministyczny algorytm scalania Last-Write-Wins (LWW) porównujący tożsamość treści i znaczniki czasu.

#### Scenario: Nadawanie metadanych synchronizacji przy tworzeniu i edycji
- **WHEN** użytkownik tworzy lub modyfikuje ćwiczenie, salę, sprzęt lub preset interwałowy
- **THEN** system nadaje lub aktualizuje obiekt `_sync` o bieżący timestamp `updatedAt` oraz inkrementuje monotoniczny licznik `version`

#### Scenario: Miękkie usuwanie encji (Tombstones) zapobiegające powracaniu danych
- **WHEN** użytkownik usuwa encję ze swojej bazy
- **THEN** system nie usuwa natychmiast rekordu z tablicy w pamięci trwałej
- **AND** oznacza encję flagą `_sync.isDeleted: true` z nowym znacznikiem `updatedAt` i wyższą wersją
- **AND** obiekt zostaje natychmiast ukryty przed interfejsem użytkownika i generatorem treningów

#### Scenario: Deterministyczne scalanie LWW przy kolizji edycji
- **WHEN** silnik scalania porównuje lokalną i zdalną wersję encji o tym samym identyfikatorze, a ich treść merytoryczna różni się
- **THEN** wersja z nowszym znacznikiem czasu `updatedAt` wygrywa i zastępuje starszą wersję
- **AND** w przypadku remisu znaczników czasu rozstrzygnięcie następuje na korzyść wyższej wersji `version`

#### Scenario: Pomijanie kolizji przy tożsamej treści merytorycznej
- **WHEN** encja została zmodyfikowana na obu urządzeniach, lecz jej zawartość merytoryczna jest identyczna
- **THEN** system nie traktuje wpisu jako błędu i przyjmuje wyższy numer wersji oraz nowszy timestamp

#### Scenario: Filtrowanie nagrobków (tombstones) w widokach i generatorze
- **WHEN** metody pobierające obiekty (`getAllExercises`, `getAllRooms`, `getAllEquipment`) przygotowują listę dla generatora lub widoków aplikacji
- **THEN** wszystkie obiekty posiadające `_sync.isDeleted === true` są automatycznie wykluczane z wynikowej listy
