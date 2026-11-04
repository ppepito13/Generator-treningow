# Proposal: Filtrowanie Nagrobków (Tombstones) w Licznikach i Widokach

## Why

Po wprowadzeniu obsługi miękkiego usuwania (*Tombstones*) w zadaniu #40.2 rekordy usunięte przez użytkownika pozostają w pamięci trwałej (`localStorage`) z flagą `_sync.isDeleted: true`, aby umożliwić synchronizację usunięć z chmurą. Jednak liczniki w nagłówkach zakładek Studia Ćwiczeń, Studia Sal, Studia Sprzętu oraz w module Ustawień odczytywały surową długość tablic w store (`customExercises.length`, `customRooms.length` itp.), zamiast filtrować wpisy aktywne (`!item._sync?.isDeleted`). W rezultacie po usunięciu edycji ćwiczenia zakładka „Zapisane lokalnie” oraz licznik w Ustawieniach wskazywały 1 element, podczas gdy lista ćwiczeń była pusta.

## What Changes

- Wprowadzenie w `ExerciseStudioView.tsx`, `SettingsView.tsx`, `RoomStudioSubView.tsx`, `EquipmentStudioSubView.tsx` oraz `IntervalTimerSubView.tsx` konsekwentnego filtrowania obiektów oznaczonych flagą `_sync.isDeleted === true` we wszystkich licznikach, zakładkach, warunkach eksportu i modalach resetu.
- Zagwarantowanie, że po usunięciu własnej edycji lub dodanego obiektu licznik pozycji lokalnych w zakładce i w Ustawieniach natychmiast wynosi 0.
- Dodanie testów jednostkowych i integracyjnych weryfikujących spójność liczników zakładek UI w obecności rekordów typu Tombstone.

## Capabilities

### Modified Capabilities
- `data-storage`: Rozszerzenie wymagania filtrowania nagrobków o liczniki, odznaki zakładek oraz okna dialogowe modułów Studia i Ustawień.

## Impact

- `src/components/ExerciseStudioView.tsx`: zaktualizowanie `counts.customCount`, walidacji eksportu oraz dialogu czyszczenia bazy.
- `src/components/SettingsView.tsx`: zaktualizowanie licznika `customCount` w sekcji „O Aplikacji”.
- `src/components/RoomStudioSubView.tsx`: zaktualizowanie licznika `counts.customCount` oraz walidacji eksportu.
- `src/components/EquipmentStudioSubView.tsx`: zaktualizowanie licznika `counts.customCount`, walidacji eksportu oraz dialogu resetu.
- `src/tests/ui/`: testy UI weryfikujące, że nagrobki nie podbijają liczników w interfejsie.

