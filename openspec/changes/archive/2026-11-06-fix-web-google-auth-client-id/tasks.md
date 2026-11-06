# Tasks

## 1. Konfiguracja środowiska i czyszczenie CI/CD

- [x] 1.1 [.github/workflows/firebase-hosting-merge.yml] Usunąć plik workflow automatycznego deployu na Firebase z GitHub Actions, aby wyeliminować niekontrolowane nadpisywanie hostingu.
- [x] 1.2 [.gitignore] Dodać wyjątek `!.env.production` w regułach ignorowania plików środowiskowych `.env*`.
- [x] 1.3 [.env.production] Utworzyć plik środowiskowy z oficjalnym publicznym identyfikatorem `NEXT_PUBLIC_GOOGLE_CLIENT_ID=973533321658-78hotq9qhh2ahmm8huf8js01br9jqo9v.apps.googleusercontent.com`.

## 2. Implementacja logiki autoryzacji i ochrony Safari

- [x] 2.1 [src/services/auth/googleAuth.ts] Zdefiniować stałą `PRODUCTION_GOOGLE_CLIENT_ID` oraz zaktualizować funkcję `getGoogleClientId()`, aby zwracała `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || PRODUCTION_GOOGLE_CLIENT_ID`.
- [x] 2.2 [src/components/SettingsView.tsx] Dodać preload biblioteki Google Identity Services poprzez wywołanie `void loadGoogleScript()` w hooku `useEffect` widoku Ustawień pod kątem ochrony Safari na iOS.

## 3. Testy jednostkowe i bramka jakości

- [x] 3.1 [src/tests/store-auth.test.ts] Dodać test jednostkowy sprawdzający, że `getGoogleClientId()` poprawnie zwraca produkcyjny fallback `PRODUCTION_GOOGLE_CLIENT_ID`, gdy zmienna środowiskowa jest pusta lub niezdefiniowana.
- [x] 3.2 [npm run verify] Przeprowadzić pełną weryfikację bramki jakości (`tsc --noEmit`, `next lint`, `vitest run`) potwierdzając 0 błędów i 100% zdanych testów.

