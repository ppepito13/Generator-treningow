# Changelog

Wszystkie istotne zmiany i wydania aplikacji będą dokumentowane w tym pliku.
Struktura oparta jest o standard [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Dodano
- **Mobilny Edge-to-Edge i Globalna Ochrona Notch**: Wdrożenie natywnej obsługi Edge-to-Edge na Androidzie (`WindowCompat.setDecorFitsSystemWindows`) z przezroczystymi paskami systemowymi i jasnymi ikonami, globalnej nakładki `Global Top Shield` w `layout.tsx` chroniącej treść przed fizycznym wycięciem aparatu (notch / camera hole) we wszystkich widokach, oraz reaktywnego chowania paska `BottomNav` po wysunięciu wirtualnej klawiatury (`window.visualViewport`).
- **Kompaktowy Zegar Interwałowy (Color Dot Picker)**: Wdrożenie 2-wierszowych nagłówków bloków (pełna szerokość nazwy + bezpośrednio dostępne przyciski akcji) oraz kompaktowego próbnika barwnego (Color Dot Picker w okienku Popover) eliminującego poziome rozpychanie ekranu.
- **Dwukierunkowy Balans Sąsiedztwa i Deduplikacja Nazw (Base Name)**: Wdrożenie wielopoziomowej kaskady doboru ćwiczeń eliminującej powtórzenia tego samego wzorca ruchowego na sąsiadujących stacjach (w tym na styku pętli obwodu stacja ostatnia - pierwsza oraz przy automatycznym re-rollu) oraz zapobieganie występowaniu wielu wariantów tego samego ćwiczenia w jednym treningu (usedBaseNames) z zachowaniem pełnej swobody manualnej trenera.
- **Ujednolicone Nagłówki i Siatki Responsywne (ModuleHeader)**: Wdrożenie ustandaryzowanego komponentu nagłówka modułów (ModuleHeader) w widokach Zegara, Kalkulatorów i Studia oraz responsywnych siatek 2/3-kolumnowych w Zestawie (rectSortingStrategy w DnD) i Studio Ćwiczeń, optymalizujących wykorzystanie przestrzeni na większych ekranach.
- **Studio Zarządzania Bazą**: Moduły podglądu, wyszukiwania, edycji oraz eksportu bazy ćwiczeń, sprzętu, sal i konfiguracji poziomów trudności.
- **Zegar Treningowy**: Zaawansowany moduł czasomierza z obsługą treningu interwałowego, stopera i minutnika.
- **Kalkulatory Treningowe**: Kalkulator standardowy oraz moduły obliczeniowe BMI/RFM i zapotrzebowania kalorycznego BMR/TDEE.
- **Infrastruktura Testowa i Jakość**: Wdrożenie frameworka Vitest z testami jednostkowymi i integracyjnymi, pre-commit hook Husky oraz pełną bramką `npm run verify`.
- **Integralność Danych i Testy UI**: Automatyczna walidacja spójności bazy JSON ćwiczeń/sal oraz testy renderowania komponentów interfejsu w środowisku jsdom.

### Zmieniono
- **Przewijalny Nagłówek Obwodu (`CircuitList`)**: Ujednolicenie nagłówka "Twój Obwód" z estetyką pozostałych modułów oraz umożliwienie jego naturalnego przewijania z listą stacji treningowych pod ochroną `Global Top Shield`.
- **Pełnowymiarowy Pasek Nawigacji (`BottomNav`)**: Rozciągnięcie tła i efektu rozmycia na 100% szerokości ekranu oraz w obszar `safe-area-inset-bottom`.
- **Standaryzacja Układu i Marginesów Bezpiecznych**: Wprowadzono globalne klasy dla marginesów systemowych Androida (.app-safe-top, .app-safe-bottom) oraz ujednolicono szerokości kontenerów (.app-container-narrow, .app-container-wide) we wszystkich 5 modułach, eliminując ucinanie nagłówków pod notchem oraz optymalizując wyświetlanie na tabletach i desktopie.
- **Architektura Generatora**: Rozbicie monolitycznego pliku store na czystą architekturę domenową (`src/domain/generator/`) z heurystyką balansu mięśniowego (naprzemienność PUSH/PULL) i kaskadowym doborem trudności.
- **Bezpieczeństwo Danych (Zustand Persist v1)**: Wprowadzenie migracji stanu i selektywnego zapisu (`partialize`), chroniącego przed utratą danych użytkownika i białym ekranem.
- **Fonty Offline dla Androida**: Zastąpienie zewnętrznego CDN Google Fonts wbudowanym mechanizmem `next/font/google` dla 100% działania offline w aplikacji mobilnej Capacitor.

### Naprawiono
- **Poziome Przepełnienie i Błędy Responsywności Mobilnej**:
  - Wyeliminowano poziome rozpychanie strony w Zegarze i ucinanie zakładek dolnego menu ("Stu" zamiast "Studio") na ekranach smartfonów 360px-412px.
  - Wyeliminowano wylewanie się długich tekstów z przycisków przekierowań w kalkulatorach (BMR, RFM, BMI) poprzez elastyczne zawijanie `whitespace-normal`, dopasowanie wysokości `h-auto` i skrócenie etykiet.
  - Naprawiono obcinanie tekstu "os." w selektorze sal Generatora (`SelectTrigger` z elastyczną wysokością i `tracking-wider`).
  - Dodano globalną klasę `.scrollbar-none` eliminującą nakładanie się 12px suwaków Androida na ikony podmenu.
  - Dodano `overscroll-behavior-y: none;`, wyłączenie tap highlight (`-webkit-tap-highlight-color: transparent`) oraz zabezpieczenie pól formularza przed wymuszonym zoomem na iOS (16px).
- **Dług Technologiczny**: Usunięcie zdeprecjonowanych bibliotek, odmaskowanie kompilacji Next.js oraz usunięcie 100% ostrzeżeń i błędów ESLint.

## [1.3.0] - 2026-04-30
### Dodano
- **Hub Nawigacyjny (Bottom Nav)**: Całkowicie nowa struktura nawigacji oparta na dolnym pasku (Bottom Navigation) w stylu glassmorphism. Pozwala na natychmiastowe przełączanie między Generatorem, wygenerowanym Zestawem oraz przyszłymi modułami (Zegar, Kalkulatory).
- **Trwałość Treningu (Zustand Persist)**: Wprowadzono system automatycznego zapamiętywania wygenerowanego treningu w pamięci lokalnej urządzenia. Trening nie znika po odświeżeniu strony, zamknięciu przeglądarki czy ubiciu aplikacji przez system.
- **Szybkie dodawanie ćwiczeń**: Nowa funkcja w menu "re-roll" pozwalająca na ręczne wpisanie nazwy własnego ćwiczenia "na szybko" do aktualnego obwodu bez konieczności dodawania go do stałej bazy danych.
- **Potwierdzenie Zakończenia**: Nowy przycisk "Zakończ" (X) w widoku zestawu z systemowym potwierdzeniem, chroniący przed przypadkowym usunięciem treningu.

### Zmieniono
- **Architektura Tabs**: Rozdzielono widok Generatora od widoku Zestawu, co pozwala na powrót do edycji parametrów bez utraty wygenerowanych już ćwiczeń.
- **Ikona Re-roll**: Odświeżono ikonę losowania ćwiczenia na bardziej czytelną i intuicyjną.

### Naprawiono
- **Stan Nawigacji**: Rozwiązano problem z przyciskiem "Wstecz", który w poprzedniej wersji mógł nieoczekiwanie minimalizować aplikację.

## [1.2.0] - 2026-04-27
### Dodano
- **Rebranding**: Przebudowano identyfikację wizualną na ekranie głównym. Nowa nazwa: "Generator Treningów SW" wraz z nowym tagline "Elastyczne plany grupowe".
- **Sala "Ustawienia własne"**: Nowy moduł pozwalający na ręczny wybór sprzętu, typu treningu oraz liczby stacji niezależnie od predefiniowanych sal.
- **Ręczny wybór ćwiczeń**: Możliwość manualnej podmiany wylosowanego ćwiczenia poprzez wybór z pełnej, kategoryzowanej bazy danych.
- **Edge-to-Edge Status Bar**: Implementacja "szklanego" (frosted glass) paska statusu chroniącego systemowe ikony (zegar, bateria) na nowoczesnych urządzeniach z Androidem 16.

### Zmieniono
- **UX Mobile**: Całkowita rezygnacja z zagnieżdżonych menu typu dropdown na rzecz natywnych, responsywnych okien dialogowych (Action Sheets) wyśrodkowanych na ekranie.
- **Zarządzanie Stacjami**: Wprowadzono system Drag & Drop umożliwiający intuicyjną zmianę kolejności stacji w obwodzie.
- **Header "Twój Obwód"**: Odświeżono nagłówek listy treningowej – usunięto zbędne teksty ("Wstecz") i ikony na rzecz czystego, minimalistycznego interfejsu.
- **Optymalizacja Typografii**: Dostosowano rozmiary czcionek i interlinie dla nagłówków, zapewniając ich czytelność na małych ekranach bez zawijania w nieestetyczny sposób.

### Naprawiono
- **Sticky Header Bug**: Naprawiono błąd CSS uniemożliwiający "przyklejanie" się nagłówka na mobilnych przeglądarkach Webview.
- **Layout Clipping**: Rozwiązano problem ucinania przycisków funkcyjnych (np. "Gotowe") w oknach dialogowych na urządzeniach o niskiej rozdzielczości.
- **Safe Area Insets**: Poprawiono kalkulację bezpiecznych marginesów (paddingów) dla telefonów z wcięciem (notch) i aparatami typu punch-hole.

## [1.1.0] - 2026-04-02
### Dodano
- **Modularna Nawigacja**: System stosu widoków (Stack) z pełną obsługą sprzętowego przycisku wstecz na Androidzie.
- **Obsługa Konfliktów**: Nowy system alertów przy braku sprzętu z opcjami ratunkowymi (poluzowanie trudności, duplikaty, redukcja stacji).
- **Silnik Hybrydowy CNF**: Przejście bazy ćwiczeń na format JSON wspierający złożoną logikę sprzętową AND/OR.
- **Suwak Uczestników**: Czytelny, graficzny komponent Slider do wyboru liczby osób ćwiczących.
- **Safe Area Support**: Adaptacyjny padding dla urządzeń mobilnych (w tym Xiaomi, iPhone z notchem).
- **Identyfikacja Wizualna**: Wdrożono nową ikonę systemową aplikacji oraz banner promocyjny do wizytówki Sklepu Play, dostosowując je do palety kolorystycznej marki Trenera.

### Zmieniono
- **Logika FBW (Astoria)**: Uniezależnienie liczby stacji od liczby osób oraz ścisła blokada niedostępnego sprzętu.
- **UX**: Automatyczne przewijanie na górę strony po wygenerowaniu treningu.
- **UI**: Optymalizacja okna błędu pod wyświetlacze mobilne (brak ucinania tekstu).
- **Naming**: Zamiana etykiet na "Ćwiczenie 1", "Ćwiczenie 2" itd. dla lepszej przejrzystości.
- **Baza danych**: Aktualizacja parametrów sprzętowych i mnożników dla wybranych ćwiczeń.
- **Wersjonowanie**: Aktualizacja metadanych projektu (`package.json`: `"version": "1.1.0"`).

### Naprawiono
- **Platform Check**: Usunięcie błędów konsoli `runtime.lastError` przy udostępnianiu w przeglądarce.
- **Branding**: Zamiana domyślnego faviconu Firebase na oficjalne logo aplikacji.
- **Visuals**: Poprawa widoczności obramowania przycisków w oknie konfliktu.

## [1.0.1] - 2026-03-24
### Dodano
- Ustawienie spójnej i oficjalnej nazwy aplikacji "Generator Treningów SW" w warstwie Capacitor (konfiguracja ogólna) oraz warstwie natywnej Androida (`strings.xml`).
- Wygenerowano i wdrożono pełny, natywny zestaw najnowszego brandingu i ikon w doskonałej rozdzielczości (za pomocą wtyczki `@capacitor/assets`).
- Dodano systemowy i ustandaryzowany skrypt `update-version.ps1` dla dewelopera do 1-klikowego synchronizowania i przepychania wersji produkcyjnych pakietów (automatyzujący Webowe SemVer JSON oraz `versionCode` systemu Java dla AndroidStudio/Google Play).

### Zmieniono
- Zrefaktoryzowano system natywnego dzielenia się schematem (Podsumowania). Stare webowe wywołanie JavaScript `navigator.share` całkowicie ustąpiło miejsca płynnej, systemowej wtyczce z API mobilnego: `@capacitor/share`. Zniweluje to błędy zawieszania ekranu w natywnym interfejsie Androida.

## [1.0.0] - 2026-03-22
### Dodano
- Oficjalna pierwsza zamknięta publikacja Sali "Balaton" (Alpha w Google Play Console).
- Integracja i odpalenie generatora obwodowego jako pełnoprawnego, zoptymalizowanego archiwum App Bundle (.aab).
- Gotowy fundament pod wersję WebView.
