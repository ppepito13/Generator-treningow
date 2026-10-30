# ui-layout Specification

## Purpose
TBD - created by archiving change ui-layout-and-safe-areas. Update Purpose after archive.

## Requirements

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

### Requirement: Pełnoekranowy tryb Edge-to-Edge na platformie Android
Aplikacja uruchomiona w środowisku natywnym Android MUST rysować interfejs w trybie Edge-to-Edge za przezroczystymi paskami systemowymi (pasek statusu i pasek nawigacji gestami), zachowując jasne ikony systemowe paska statusu i nawigacji.

#### Scenario: Rysowanie aplikacji pod paskami systemowymi Androida
- **WHEN** aplikacja jest uruchamiana na urządzeniu z systemem Android
- **THEN** pasek statusu oraz pasek nawigacji gestami posiadają przezroczyste tło, a ikony systemowe są białe i czytelne na ciemnym tle aplikacji.

### Requirement: Globalna ochrona paska statusu i wcięcia ekranu (Global Top Shield)
Układ główny aplikacji MUST posiadać globalną, pozycjonowaną na stałe przy górnej krawędzi nakładkę rozmycia tła (`backdrop-blur`) z maską gradientową, zapobiegającą kolizji przewijanej treści z fizycznym wycięciem aparatu (notch / camera hole) i zegarem systemowym.

#### Scenario: Przewijanie treści w dowolnym module aplikacji
- **WHEN** użytkownik przewija treść w dowolnym z widoków (Generator, Zestaw, Zegar, Narzędzia, Studio) ku górze ekranu
- **THEN** treść płynnie rozmywa się i wygasza pod górnym paskiem systemowym, nie kolidując z obiektywem aparatu.

### Requirement: Reaktywność dolnego paska nawigacji na klawiaturę ekranową
Dolny pasek nawigacyjny `BottomNav` MUST automatycznie ukrywać się poza dolną krawędź ekranu w momencie aktywacji wirtualnej klawiatury ekranowej, odsłaniając aktywne pole edycji.

#### Scenario: Wprowadzanie tekstu w polu formularza na urządzeniu mobilnym
- **WHEN** użytkownik aktywuje pole tekstowe i pojawia się wirtualna klawiatura ekranowa
- **THEN** komponent `BottomNav` natychmiast płynnie zjeżdża w dół poza widoczny obszar ekranu, a po zamknięciu klawiatury powraca na swoje miejsce.

### Requirement: Obsługa systemowej nawigacji 3-przyciskowej w Androidzie
Dolny pasek nawigacyjny `BottomNav` oraz dolne marginesy treści MUST dynamicznie uwzględniać wysokość systemowego paska nawigacji 3-przyciskowej Androida (48dp), unosząc ikony nawigacyjne ponad przyciski sprzętowe/wirtualne systemu.

#### Scenario: Uruchomienie aplikacji w trybie nawigacji 3-przyciskowej
- **WHEN** aplikacja działa na urządzeniu Android z włączoną 3-przyciskową belką nawigacyjną (wstecz, home, ostatnie)
- **THEN** pasek `BottomNav` unosi swoje przyciski o wysokość paska systemowego, a jego tło rozmycia wypełnia przestrzeń pod przyciskami bez zasłaniania etykiet.

### Requirement: Programowe wymuszenie jasnych ikon paska statusu
Aktywność natywna Androida MUST wymusić jasne (białe) ikony zegara, baterii i łączności w kontrolerze okna (`WindowInsetsControllerCompat`), zapobiegając renderowaniu czarnych ikon przy włączonym motywie jasnym w systemie Android.

#### Scenario: Uruchomienie na telefonie z systemowym trybem jasnym
- **WHEN** telefon lub emulator posiada włączony systemowy motyw jasny (Light Mode)
- **THEN** pasek statusu w aplikacji wyświetla biały zegar i białe ikony systemowe czytelne na ciemnym tle aplikacji.
