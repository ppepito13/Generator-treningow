# Data Storage & State Specification Delta

## MODIFIED Requirements

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
- **WHEN** metody pobierające obiekty (`getAllExercises`, `getAllRooms`, `getAllEquipment`, `getAllIntervalPresets`) przygotowują listę dla generatora lub widoków aplikacji
- **THEN** wszystkie obiekty posiadające `_sync.isDeleted === true` są automatycznie wykluczane z wynikowej listy

#### Scenario: Spójność liczników i odznak zakładek w obecności nagrobków
- **WHEN** komponenty interfejsu (`ExerciseStudioView`, `SettingsView`, `RoomStudioSubView`, `EquipmentStudioSubView`) obliczają liczbę autorskich pozycji użytkownika dla zakładek, podsumowań lub eksportu
- **THEN** system zlicza wyłącznie rekordy aktywne (`!item._sync?.isDeleted`) i nie uwzględnia nagrobków (tombstones)
- **AND** usunięcie edycji ćwiczenia powoduje natychmiastowy spadek licznika pozycji lokalnych do zera

