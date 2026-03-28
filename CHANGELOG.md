# Changelog

Wszystkie istotne zmiany i wydania aplikacji będą dokumentowane w tym pliku.
Struktura oparta jest o standard [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

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
