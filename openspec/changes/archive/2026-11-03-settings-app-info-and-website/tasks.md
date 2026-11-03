# Tasks

## 1. Konfiguracja metadanych aplikacji

- [x] 1.1 [src/config/appInfo.ts] Utworzyć moduł konfiguracyjny eksportujący `APP_VERSION` (czytający z `app-version.json` z bezpiecznym fallbackiem `v1.3.0`), `APP_WEBSITE_URL` (`https://sportsway.eu/`) oraz `APP_WEBSITE_DISPLAY` (`sportsway.eu`) i zweryfikować kompilację TypeScript (`npx tsc --noEmit`).

## 2. Implementacja widoku Ustawień

- [x] 2.1 [src/components/SettingsView.tsx] Zaktualizować sekcję „O Aplikacji”: zastąpić zahardkodowany licznik ćwiczeń reaktywnym formatem Wariantu B (`baseCount` z `ALL_EXERCISES.length` oraz `customCount` z `customExercises.length`), podpiąć dynamiczną wersję `APP_VERSION` oraz dodać klikalny wiersz z oficjalnym odnośnikiem WWW (`APP_WEBSITE_URL`, `target="_blank"`, `rel="noopener noreferrer"`, ikona `ExternalLink`). Zweryfikować brak błędów lintera (`npx next lint`).

## 3. Testy jednostkowe i weryfikacja jakościowa

- [x] 3.1 [src/tests/ui/SettingsView.test.tsx] Zaktualizować i rozszerzyć zestaw testów jednostkowych o weryfikację obecności odnośnika do strony WWW z prawidłowymi atrybutami bezpieczeństwa, poprawność renderowania wersji aplikacji oraz reaktywnego wskaźnika liczby ćwiczeń (przy zerowej i dodatniej liczbie ćwiczeń autorskich). Zweryfikować wykonaniem testu (`npx vitest run src/tests/ui/SettingsView.test.tsx`).
- [x] 3.2 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: TypeScript, ESLint, 100% testów Vitest) i upewnić się, że nie występują żadne regresje.

