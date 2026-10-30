# Proposal: Mobilny Edge-to-Edge, Bezpieczne Marginesy i Globalna Ochrona Pasków Systemowych

## Why
Testy manualne na fizycznych urządzeniach z systemem Android (Pixel, Samsung) oraz w emulatorach wykazały defekty systemowej integracji interfejsu: odcięty czarny pasek wokół nawigacji gestami Androida (brak Edge-to-Edge), brak ochrony treści pod obiektywem aparatu (camera hole / notch) podczas przewijania w 4 z 5 widoków, zasłanianie aktywnych pól przez dolny pasek nawigacyjny (`BottomNav`) przy wysuniętej klawiaturze ekranowej oraz wyświetlanie natywnych 12-pikselowych suwaków przewijania nad ikonami podmenu. Zmiana ta wprowadza pełną integrację Edge-to-Edge oraz spójne zachowanie platformowe Android, iOS i Web.

## What Changes
- **Natywna integracja Android Edge-to-Edge**: Aktywacja `WindowCompat.setDecorFitsSystemWindows(getWindow(), false)` w `MainActivity.java` oraz konfiguracja przezroczystych pasków systemowych (`statusBarColor`, `navigationBarColor`) i jasnych ikon (`windowLightStatusBar = false`, `windowLightNavigationBar = false`) w `styles.xml`.
- **Globalna nakładka rozmycia góry (Global Top Shield)**: Przeniesienie nakładki `backdrop-blur` z gradientową maską z `ConfigurationForm.tsx` bezpośrednio do `src/app/layout.tsx`, gwarantując ochronę czytelności paska statusu i notcha we wszystkich 5 modułach aplikacji.
- **Pełnowymiarowy dolny pasek nawigacji (`BottomNav`)**: Rozciągnięcie tła i efektu rozmycia na pełną szerokość ekranu (`w-full`) oraz w dół aż do dolnej krawędzi fizycznej (`pb-[env(safe-area-inset-bottom)]`), z wyśrodkowaniem ikon.
- **Reaktywne ukrywanie paska nawigacji przy klawiaturze**: Automatyczne chowanie `BottomNav` (`translate-y-full opacity-0 pointer-events-none`) przy wykryciu wirtualnej klawiatury za pomocą `window.visualViewport`.
- **Uzupełnienie stylów globalnych w `globals.css`**: Wdrożenie klasy `.scrollbar-none` (ukrywanie pasków przewijania w przeglądarkach i WebView), wyłączenie gestu pull-to-refresh (`overscroll-behavior-y: none`), usunięcie systemowego podświetlenia kliknięcia (`-webkit-tap-highlight-color: transparent`) oraz zabezpieczenie pól formularza przed wymuszonym zoomem na iOS (minimalny font 16px na mobile).

## Capabilities

### Modified Capabilities
- `ui-layout`: Rozszerzenie wymagań o natywny tryb Edge-to-Edge, globalną nakładkę ochrony status baru (Global Top Shield) oraz reaktywne chowanie paska dolnego przy aktywnej klawiaturze ekranowej.

## Impact
- `android/app/src/main/java/com/pepitolabs/generator/MainActivity.java` (włączenie rysowania za paskami systemowymi)
- `android/app/src/main/res/values/styles.xml` (przezroczystość pasków i jasne ikony)
- `src/app/globals.css` (klasy `.scrollbar-none`, style mobilne i ochrona inputów)
- `src/app/layout.tsx` (Global Top Shield)
- `src/components/BottomNav.tsx` (Edge-to-Edge, detekcja klawiatury)
- `src/components/ConfigurationForm.tsx` (usunięcie zduplikowanej lokalnej nakładki)

