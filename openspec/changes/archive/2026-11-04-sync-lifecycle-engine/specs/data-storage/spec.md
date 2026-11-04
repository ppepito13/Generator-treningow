# Data Storage & State Specification Delta

## ADDED Requirements

### Requirement: Automatyczny Cykl Życia Synchronizacji w Tle i Odporność Sieciowa
System SHALL udostępniać koordynator synchronizacji w tle (`syncCoordinator`), który automatycznie scala i wysyła dane do prywatnego folderu Google Drive (`appDataFolder`) po modyfikacji autorskich encji przez użytkownika (z opóźnieniem debouncing), wznawia synchronizację po powrocie połączenia sieciowego (`online`), zarządza stanem procesu (`syncStatus`, `lastSyncedAt`, `syncError`) w Zustand Store oraz zapobiega pętlom zwrotnym i wyścigom współbieżnym.

#### Scenario: Automatyczna synchronizacja po edycji danych z opóźnieniem debouncing
- **WHEN** zalogowany użytkownik z uprawnieniem do Dysku (`hasDriveScope === true`) doda, zmodyfikuje lub usunie autorskie ćwiczenie, salę, sprzęt lub preset interwałowy
- **THEN** system planuje automatyczną synchronizację z opóźnieniem debouncingu (2500 ms)
- **AND** wykonuje pełny cykl pobrania z chmury, scalenia LWW oraz aktualizacji pliku kopii zapasowej w chmurze

#### Scenario: Ignorowanie auto-sync podczas braku połączenia lub braku uprawnień
- **WHEN** użytkownik nie jest zalogowany, posiada `hasDriveScope === false` lub urządzenie jest w trybie offline (`navigator.onLine === false`)
- **THEN** system wstrzymuje żądania sieciowe synchronizacji
- **AND** zachowuje dane wyłącznie w magazynie lokalnym urządzenia bez zgłaszania awarii aplikacji

#### Scenario: Wznowienie synchronizacji po powrocie sieci (Online Event Listener)
- **WHEN** urządzenie odzyska połączenie internetowe i przeglądarka wyemituje zdarzenie `online`
- **THEN** koordynator synchronizacji automatycznie uruchamia jednorazowy cykl synchronizacji w tle dla zalogowanego użytkownika

#### Scenario: Ochrona przed zapętleniem synchronizacji (Infinite Loop Prevention)
- **WHEN** koordynator synchronizacji pobiera zdalne dane i zapisuje scaloną kolekcję do Zustand Store
- **THEN** operacja oznaczona jest flagą wykluczającą wywołanie kolejnego cyklu auto-sync
- **AND** system nie wpada w nieskończoną pętlę pobierania i wysyłania

#### Scenario: Odporność na wygaśnięcie tokena (401 Unauthorized)
- **WHEN** podczas próby pobrania lub wysłania pliku kopii zapasowej Google Drive zwróci błąd wygaśnięcia sesji (kod 401)
- **THEN** koordynator synchronizacji ustawia status `syncStatus: 'error'` z odpowiednim komunikatem o wygaśnięciu sesji
- **AND** nie niszczy ani nie modyfikuje lokalnych danych użytkownika

