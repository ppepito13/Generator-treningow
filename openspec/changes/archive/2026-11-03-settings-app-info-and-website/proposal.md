# Proposal

## Why
Sekcja „O Aplikacji” w module Ustawień (`SettingsView`) zawierała tymczasowo zahardkodowaną wartość liczby ćwiczeń (`40 ćwiczeń kalibrowanych` zamiast faktycznych 270 ćwiczeń bazowych i dynamicznych ćwiczeń użytkownika) oraz statyczny ciąg wersji. Ponadto brakowało bezpośredniego, oficjalnego odnośnika do strony internetowej projektu (`https://sportsway.eu/`). Wprowadzenie tej zmiany eliminuje dezinformację użytkownika, urealnia stan bazy offline oraz wzmacnia obecność marki Sport's Way.

## What Changes
- **Dynamiczny licznik bazy ćwiczeń (#42 - Wariant B):** Zastąpienie zahardkodowanego napisu reaktywnym licznikiem prezentującym bazę fabryczną (`ALL_EXERCISES.length` = 270) oraz liczbę ćwiczeń autorskich/zmodyfikowanych lokalnie przez użytkownika (`customExercises.length`), np. `270 w bazie` lub `270 w bazie (+X własnych)`.
- **Oficjalny odnośnik do strony WWW (#43):** Dodanie w sekcji „O Aplikacji” klikalnego wiersza kierującego do `https://sportsway.eu/` z bezpiecznymi atrybutami `target="_blank"` i `rel="noopener noreferrer"` oraz ikoną `ExternalLink`, zapewniającego poprawne otwieranie w zewnętrznej przeglądarce w środowisku Capacitor Android i Web.
- **Bezpieczne źródło wersji aplikacji:** Zastąpienie zahardkodowanego stringu wersji centralną stałą czytającą z `app-version.json` z defensywnym fallbackiem (`v1.3.0`), gwarantującą niezawodne działanie w kompilacji statycznej Next.js (Firebase Hosting & Capacitor Android APK).

## Capabilities

### New Capabilities
(brak)

### Modified Capabilities
- `settings-module`: Rozszerzenie wymagań sekcji „O Aplikacji” w module Ustawień o prezentację dynamicznego licznika ćwiczeń (z podziałem na bazę fabryczną i autorską), oficjalnego adresu WWW z linkiem zewnętrznym oraz niezawodnej wersji aplikacji.

## Impact
- **Pliki kodu:** `src/components/SettingsView.tsx`, nowy plik stałych konfiguracyjnych `src/config/appInfo.ts`.
- **Testy:** `src/tests/ui/SettingsView.test.tsx` (aktualizacja asercji i weryfikacja nowych elementów).
- **Zależności:** Brak nowych bibliotek; wykorzystanie istniejących ikon `Database`, `ExternalLink` z `lucide-react`.

