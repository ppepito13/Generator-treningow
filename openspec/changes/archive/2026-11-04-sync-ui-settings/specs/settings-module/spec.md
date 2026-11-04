# settings-module Specification Delta

## ADDED Requirements

### Requirement: Wskaźnik Statusu Synchronizacji i Ręczna Akcja w Ustawieniach
Sekcja Konta i Kopii Zapasowej w module Ustawień MUST prezentować w czasie rzeczywistym aktualny stan synchronizacji chmurowej (`syncStatus`), datę i godzinę ostatniej pomyślnej kopii zapasowej (`lastSyncedAt`) oraz udostępniać aktywny przycisk ręcznego wywołania synchronizacji („Synchronizuj teraz”) z zabezpieczeniem przed wielokrotnym kliknięciem podczas trwającej operacji.

#### Scenario: Prezentacja stanu pomyślnej synchronizacji
- **WHEN** użytkownik posiada połączone konto Google z uprawnieniem do Dysku, a ostatnia synchronizacja zakończyła się sukcesem
- **THEN** sekcja Ustawień wyświetla zielony wskaźnik statusu „Zsynchronizowano”
- **AND** prezentuje sformatowany czas ostatniej kopii (np. „Dzisiaj, 17:35” lub „Wczoraj, 14:20”)

#### Scenario: Prezentacja trwającej synchronizacji
- **WHEN** koordynator synchronizacji wykonuje operację pobierania lub wysyłania danych (`syncStatus === 'syncing'`)
- **THEN** sekcja Ustawień prezentuje obracającą się ikonę oraz napis „Synchronizowanie...”
- **AND** przycisk „Synchronizuj teraz” jest zablokowany (disabled)

#### Scenario: Prezentacja stanu offline lub błędu synchronizacji
- **WHEN** urządzenie jest w trybie offline lub wystąpił błąd synchronizacji (`syncStatus === 'offline'` lub `syncStatus === 'error'`)
- **THEN** sekcja Ustawień prezentuje odpowiedni komunikat ostrzegawczy
- **AND** w przypadku błędu udostępnia możliwość ponowienia operacji

#### Scenario: Ręczne wymuszenie synchronizacji przez użytkownika
- **WHEN** użytkownik kliknie przycisk „Synchronizuj teraz”
- **THEN** aplikacja natychmiast uruchamia pełny cykl synchronizacji w tle i aktualizuje wskaźniki statusu

### Requirement: Modal Konfliktów przy Pierwszym Połączeniu Konta (InitialSyncConflictDialog)
Gdy użytkownik po raz pierwszy łączy konto Google na urządzeniu posiadającym już zapisane lokalnie autorskie ćwiczenia, sale, sprzęt lub presety, a na Dysku Google istnieje już wcześniejszy plik kopii zapasowej, aplikacja MUST wyświetlić modal `InitialSyncConflictDialog` (Wariant B) umożliwiający świadomy wybór strategii początkowej: scalenie (domyślne), zastąpienie danymi z chmury lub nadpisanie chmury stanem z tego urządzenia.

#### Scenario: Wyświetlenie modalu przy wykryciu kolizji początkowej
- **WHEN** użytkownik pomyślnie uwierzytelni się kontem Google z uprawnieniem do Dysku
- **AND** na urządzeniu istnieją autorskie dane, a w chmurze Google Drive istnieje już plik kopii zapasowej, a urządzenie nie było wcześniej zsynchronizowane (`lastSyncedAt === null`)
- **THEN** aplikacja wstrzymuje automatyczne pobieranie i wyświetla modal `InitialSyncConflictDialog`
- **AND** prezentuje podsumowanie elementów oraz 3 opcje wyboru z domyślnie zaznaczoną opcją scalenia

#### Scenario: Użytkownik wybiera opcję scalenia danych (Zalecane)
- **WHEN** użytkownik w modalu zatwierdzi domyślną opcję „Scal dane (Zalecane)”
- **THEN** system scala obie kolekcje według reguły Last-Write-Wins, zapisuje wynik w store i wysyła zaktualizowany stan do chmury

#### Scenario: Użytkownik wybiera zastąpienie danymi z chmury
- **WHEN** użytkownik w modalu wybierze opcję „Użyj danych z chmury” i zatwierdzi wybór
- **THEN** system zastępuje lokalne autorskie kolekcje zawartością pobraną z Dysku Google

#### Scenario: Użytkownik wybiera nadpisanie chmury danymi z urządzenia
- **WHEN** użytkownik w modalu wybierze opcję „Nadpisz chmurę danymi z tego urządzenia” i zatwierdzi wybór
- **THEN** system wysyła obecny stan urządzenia na Dysk Google, nadpisując istniejący tam plik kopii
