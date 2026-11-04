# settings-module Specification

## Purpose
Zapewnia dedykowany moduł ustawień aplikacji dostępny bezpośrednio z ekranu głównego, służący do konfiguracji preferencji systemowych, motywu oraz konta użytkownika.

## Requirements

### Requirement: Dedykowany punkt wejścia do Ustawień na Ekranie Głównym
Aplikacja MUST udostępniać przycisk z ikoną koła zębatego (Settings Trigger) w prawym górnym rogu sekcji nagłówka na ekranie głównym Generatora (`ConfigurationForm`), umożliwiający natychmiastowe przejście do modułu Ustawień.

#### Scenario: Użytkownik klika ikonę zębatki na ekranie głównym
- **WHEN** użytkownik klika przycisk zębatki na ekranie głównym generatora
- **THEN** aplikacja aktywuje zakładkę `settings` i wyświetla pełny widok modułu Ustawień

### Requirement: Dedykowany widok Ustawień z ustandaryzowanym nagłówkiem
Moduł Ustawień (`SettingsView`) MUST wykorzystywać ustandaryzowany komponent `ModuleHeader` prezentujący tytuł „Ustawienia”, podtytuł pomocniczy oraz przycisk powrotu do Generatora.

#### Scenario: Wyświetlenie nagłówka modułu Ustawień
- **WHEN** widok Ustawień zostaje wyrenderowany
- **THEN** nagłówek prezentuje ikonę koła zębatego, tytuł „Ustawienia” oraz przycisk umożliwiający powrót do widoku Generatora

### Requirement: Reaktywna nawigacja i obsługa powrotu (Auto-save)
Aplikacja MUST wspierać natychmiastowe zapisywanie wprowadzanych w ustawieniach zmian oraz bezproblemowy powrót do Generatora za pomocą przycisku w nagłówku lub sprzętowego przycisku wstecz na Androidzie, bez wymuszania dodatkowych okien dialogowych potwierdzenia.

#### Scenario: Użytkownik cofa się z widoku Ustawień
- **WHEN** użytkownik klika przycisk powrotu w nagłówku lub sprzętowy przycisk Back na urządzeniu mobilnym
- **THEN** aplikacja natychmiast przełącza aktywną zakładkę z powrotem na `generator`

### Requirement: Struktura sekcji konfiguracyjnych w Ustawieniach
Widok Ustawień MUST zawierać czytelnie wydzielone karty konfiguracyjne: sekcję Personalizacji (przygotowaną pod wybór motywu #15), sekcję Konta i Synchronizacji (przygotowaną pod integrację z Google #39 i #40) oraz sekcję Informacji o Aplikacji (wersja z bezpiecznego źródła prawdy, dynamiczna liczba ćwiczeń w bazie oraz oficjalny adres WWW).

#### Scenario: Prezentacja kart modułu Ustawień
- **WHEN** użytkownik przegląda widok Ustawień
- **THEN** widoczne są logiczne bloki z informacjami o motywie aplikacji, statusie synchronizacji chmurowej, wersji aplikacji, liczbie dostępnych ćwiczeń oraz oficjalnym odnośniku WWW

### Requirement: Dynamiczny wskaźnik bazy ćwiczeń w Ustawieniach
Sekcja Informacji o Aplikacji MUST prezentować dynamiczną liczbę ćwiczeń uwzględniającą fabryczną bazę ćwiczeń oraz ćwiczenia autorskie użytkownika zapisane w pamięci lokalnej urządzenia.

#### Scenario: Użytkownik posiada wyłącznie bazę fabryczną
- **WHEN** użytkownik otwiera moduł Ustawień i nie posiada zapisanych ćwiczeń autorskich
- **THEN** sekcja O Aplikacji wyświetla liczbę ćwiczeń fabrycznych w formacie informującym o bazie (np. „270 w bazie”)

#### Scenario: Użytkownik posiada ćwiczenia autorskie lub zmodyfikowane
- **WHEN** użytkownik posiada w pamięci lokalnej co najmniej jedno ćwiczenie autorskie lub zmodyfikowane
- **THEN** sekcja O Aplikacji wyświetla liczbę bazy fabrycznej wraz z wyszczególnieniem ćwiczeń autorskich (np. „270 w bazie (+X własnych)”)

### Requirement: Oficjalny odnośnik internetowy w Ustawieniach
Sekcja Informacji o Aplikacji MUST zawierać klikalny odnośnik do oficjalnej strony internetowej projektu (`https://sportsway.eu/`), który otwiera się w bezpiecznym oknie zewnętrznej przeglądarki.

#### Scenario: Kliknięcie odnośnika strony WWW
- **WHEN** użytkownik klika pozycję strony WWW w sekcji O Aplikacji
- **THEN** aplikacja otwiera adres `https://sportsway.eu/` w zewnętrznej przeglądarce za pomocą bezpiecznego odnośnika (`target="_blank"` oraz `rel="noopener noreferrer"`)

### Requirement: Interfejs Integracji z Kontem Google w Ustawieniach
Sekcja Konta w widoku Ustawień MUST dynamicznie reagować na stan sesji Google użytkownika, prezentując odpowiedni interfejs logowania lub kartę połączonego profilu.

#### Scenario: Prezentacja stanu niezalogowanego
- **WHEN** użytkownik nie połączył konta Google z aplikacją
- **THEN** sekcja Konta wyświetla stan „Niezalogowany” z oficjalną, wielokolorową ikoną Google
- **AND** udostępnia aktywny przycisk „Połącz z Kontem Google” zawierający wielokolorową ikonę Google

#### Scenario: Prezentacja połączonego profilu Google
- **WHEN** użytkownik pomyślnie połączył konto Google
- **THEN** sekcja Konta wyświetla awatar, nazwę użytkownika, adres e-mail oraz zielony indykator statusu „Połączono z Google”
- **AND** udostępnia przycisk „Odłącz konto Google”

### Requirement: Modal Ostrzegawczy przy Odpinaniu Konta
Próba odłączenia konta Google przez użytkownika MUST wywoływać modal potwierdzenia z wymaganym ręcznym zatwierdzeniem oraz czytelnym komunikatem ostrzegawczym.

#### Scenario: Wywołanie okna ostrzegawczego
- **WHEN** zalogowany użytkownik kliknie przycisk „Odłącz konto Google”
- **THEN** aplikacja wyświetla modal dialogowy z ostrzeżeniem informującym, że odłączenie wstrzyma synchronizację w chmurze i nie usunie danych lokalnych z urządzenia
- **AND** wymaga kliknięcia przycisku zatwierdzenia, aby sfinalizować odłączenie

#### Scenario: Anulowanie odpięcia konta
- **WHEN** użytkownik w oknie dialogowym kliknie „Anuluj” lub kliknie poza obszar okna
- **THEN** okno zamyka się, a konto Google pozostaje nadal połączone z aplikacją

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



### Requirement: Dedykowane Przywracanie Danych z Chmury (Restore from Cloud)
Moduł Ustawień w sekcji Konta i Kopii Zapasowej MUST udostępniać dedykowaną akcję przywracania kopii zapasowej z Dysku Google („Przywróć kopię z chmury”), zabezpieczoną modalem potwierdzenia (`RestoreCloudBackupDialog`), która pobiera zdalny plik i zastępuje lokalny stan urządzenia bez propagowania lokalnych nagrobków usunięć.

#### Scenario: Użytkownik wywołuje przywracanie danych z chmury
- **WHEN** użytkownik klika przycisk „Przywróć kopię z chmury” w module Ustawień
- **THEN** aplikacja wyświetla modal dialogowy ostrzegający o zastąpieniu lokalnych danych kopią z chmury
- **AND** wymaga kliknięcia przycisku zatwierdzenia

#### Scenario: Użytkownik potwierdza przywrócenie danych
- **WHEN** użytkownik w modalu kliknie „Przywróć dane z chmury”
- **THEN** system pobiera plik kopii z Dysku Google, zastępuje lokalne kolekcje w store zawartością z chmury, aktualizuje czas ostatniej synchronizacji i wyświetla powiadomienie o sukcesie

#### Scenario: Użytkownik anuluje przywracanie
- **WHEN** użytkownik w modalu kliknie „Anuluj” lub zamknie modal
- **THEN** modal zamyka się, a lokalny stan urządzenia pozostaje nienaruszony

### Requirement: Ochrona Kopii Chmurowej przed Samowolnym Uploadem Nagrobków
Aplikacja MUST wstrzymać automatyczną synchronizację w tle po zalogowaniu na urządzeniu, jeśli na Dysku Google istnieje już plik kopii zapasowej, a na urządzeniu istnieją jakiekolwiek rekordy autorskie (w tym nagrobki usunięć), i wyświetlić modal wyboru strategii początkowej (`InitialSyncConflictDialog`).

#### Scenario: Logowanie na urządzeniu zawierającym nagrobki przy istniejącej kopii w chmurze
- **WHEN** użytkownik łączy konto Google na urządzeniu z `lastSyncedAt === null`
- **AND** w chmurze Google Drive istnieje plik kopii, a lokalnie istnieją rekordy (nawet oznaczone jako usunięte `isDeleted: true`)
- **THEN** aplikacja wstrzymuje automatyczny upload i wyświetla modal `InitialSyncConflictDialog`

### Requirement: Reset Stanu Synchronizacji przy Odłączeniu Konta
Odłączenie konta Google (`disconnectGoogleAccount`) MUST wyzerować znacznik czasu ostatniej synchronizacji (`lastSyncedAt: null`) oraz zresetować stan `syncStatus` na `idle`.

#### Scenario: Odłączenie konta przez użytkownika
- **WHEN** użytkownik potwierdzi odłączenie konta Google w oknie dialogowym
- **THEN** profil użytkownika zostaje usunięty ze store
- **AND** pole `lastSyncedAt` zostaje ustawione na `null`, a `syncStatus` na `idle`
