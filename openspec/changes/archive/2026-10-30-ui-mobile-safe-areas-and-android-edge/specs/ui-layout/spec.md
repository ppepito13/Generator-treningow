# Spec Delta: ui-layout

## ADDED Requirements

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

