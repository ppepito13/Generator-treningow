# data-storage Specification Delta

## ADDED Requirements

### Requirement: Kosz Usuniętych Ćwiczeń i Retencja Nagrobków (Trash & Tombstone Retention)
System SHALL zarządzać cyklem życia nagrobków usuniętych ćwiczeń autorskich w Zustand Store, kwalifikując je do widoku Kosza przez 7 dni od momentu usunięcia, udostępniając akcje przywracania do stanu aktywnego oraz trwałego usunięcia z zabezpieczeniem flagą `isPurged: true`.

#### Scenario: Kwalifikacja ćwiczeń do Kosza na podstawie 7-dniowej retencji
- **WHEN** ćwiczenie autorskie posiada znacznik `_sync.isDeleted: true` oraz nie posiada flagi `isPurged: true`
- **AND** upłynęło nie więcej niż 7 dni od znacznika czasu `_sync.updatedAt` (`Date.now() - updatedAt <= 7 * 24 * 60 * 60 * 1000`)
- **THEN** system kwalifikuje to ćwiczenie jako pozycję w Koszu i uwzględnia je w liczniku usuniętych ćwiczeń

#### Scenario: Automatyczne ukrycie przedawnionych nagrobków po 7 dniach
- **WHEN** od usunięcia ćwiczenia autorskiego upłynęło więcej niż 7 dni (`Date.now() - updatedAt > 7 * 24 * 60 * 60 * 1000`)
- **THEN** system nie wyświetla go w widoku Kosza ani nie wlicza do licznika usuniętych
- **AND** zachowuje nagrobek w pamięci trwałej, uniemożliwiając powrót ćwiczenia ze starszych kopii w chmurze

#### Scenario: Przywrócenie ćwiczenia z Kosza (restoreCustomExercise)
- **WHEN** użytkownik wywoła akcję przywrócenia ćwiczenia `restoreCustomExercise(id)`
- **THEN** system usuwa flagę `isDeleted` (`isDeleted: false`), usuwa ewentualną flagę `isPurged`, aktualizuje `updatedAt` na bieżący czas i inkrementuje wersję `version`
- **AND** ćwiczenie powraca do bazy aktywnej oraz planuje automatyczną synchronizację w tle

#### Scenario: Trwałe usunięcie ćwiczenia z Kosza (permanentlyDeleteCustomExercise)
- **WHEN** użytkownik wywoła trwałe usunięcie ćwiczenia `permanentlyDeleteCustomExercise(id)`
- **THEN** system oznacza nagrobek flagą `isPurged: true` z nową wersją i aktualnym timestampem
- **AND** pozycja natychmiast znika z widoku Kosza, a zachowany nagrobek uniemożliwia pobranie ćwiczenia z Google Drive jako zombie record

#### Scenario: Opróżnienie Kosza (emptyTrash)
- **WHEN** użytkownik wywoła operację opróżnienia Kosza `emptyTrash()`
- **THEN** system oznacza flagą `isPurged: true` wszystkie ćwiczenia kwalifikujące się obecnie do Kosza
- **AND** planuje automatyczną synchronizację zmian w tle

