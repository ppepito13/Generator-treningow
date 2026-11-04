# settings-module Specification Delta

## ADDED Requirements

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

