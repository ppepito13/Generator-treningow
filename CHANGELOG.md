# Changelog

Wszystkie istotne zmiany i wydania aplikacji będą dokumentowane w tym pliku.
Struktura oparta jest o standard [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
