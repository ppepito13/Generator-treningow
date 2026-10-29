# Capability: UI Layout and Safe Areas

## ADDED Requirements

### Requirement: Globalne klasy bezpiecznych marginesów (Safe Areas)
Arkusz stylów aplikacji MUST definiować uniwersalne klasy narzędziowe dla marginesu górnego (ochrona przed wcięciem w ekranie i paskiem statusu) oraz marginesu dolnego (ochrona przed dolnym paskiem nawigacji `BottomNav`).

#### Scenario: Wyświetlanie widoku na urządzeniu mobilnym z notchem
- **GIVEN** widok aplikacji uruchomiony w WebView na systemie Android
- **WHEN** widok wykorzystuje klasę bezpiecznego marginesu górnego
- **THEN** treść widoku jest odsunięta od górnej krawędzi o co najmniej `max(env(safe-area-inset-top), 48px)`.

### Requirement: Spójne szerokości kontenerów widoków
Główne widoki aplikacji MUST wykorzystywać ustandaryzowane szerokości kontenerów: widoki formularzowe (Generator) MUST posiadać ograniczenie szerokości do maks. 512px (`max-w-lg`), a widoki list i modułów narzędziowych (Zestaw, Zegar, Kalkulatory, Studio) MUST posiadać wyśrodkowany kontener o maksymalnej szerokości `max-w-4xl` lub `max-w-5xl`.

#### Scenario: Wyświetlanie Zestawu na szerokim monitorze
- **GIVEN** użytkownik otwiera widok Zestawu (`CircuitList`) na ekranie desktopowym
- **WHEN** stacje treningowe są renderowane na ekranie
- **THEN** lista stacji jest wycentrowana w kontenerze o ograniczonej szerokości i nie rozciąga się na 100% szerokości okna.

### Requirement: Niezależność widoku pełnoekranowego (Gym View)
Marginesy dolne pod `BottomNav` MUST być aplikowane na poziomie pojedynczych widoków-zakładek, a nie globalnego znacznika `<main>`, aby tryb pełnoekranowy sali treningowej (`GymViewModal`) mógł pokrywać cały ekran bez sztucznego pustego paska na dole.

#### Scenario: Otwarcie trybu siłownianego Zegara
- **GIVEN** użytkownik uruchamia Zegar w trybie `GymViewModal`
- **WHEN** modal pokrywa ekran
- **THEN** modal zajmuje 100% wysokości okna bez dolnego paddingu nawigacyjnego.
