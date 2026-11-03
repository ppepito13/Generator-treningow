# Tasks

## 1. Zabezpieczenie Odporności i Mostek Natywny

- [x] 1.1 [package.json] Zainstalować pakiet `@capawesome/capacitor-google-sign-in` i zsynchronizować z platformą Android (`npx cap sync android`). Zweryfikować obecność zależności.
- [x] 1.2 [src/services/auth/googleAuth.ts] Zaimplementować mechanizm timeoutu (30s) oraz detekcji powrotu do aplikacji (`visibilitychange` / `focus`) zapobiegający zawieszaniu Promise w webowym przepływie GIS. Zweryfikować kompilację (`npx tsc --noEmit`).
- [x] 1.3 [src/services/auth/googleAuth.ts] Wdrożyć hybrydową ścieżkę autoryzacji (`Capacitor.isNativePlatform()`) z użyciem `@capawesome/capacitor-google-sign-in` dla natywnego systemu Android. Zweryfikować linterem (`npx next lint`).
- [x] 1.4 [GOOGLE_AUTH_SETUP.md] Rozszerzyć instrukcję o kroki konfiguracji klienta Android w Google Cloud Console (`com.pepitolabs.generator` i certyfikat SHA-1 z Android Studio).

## 2. Testy i Bramka Jakościowa

- [x] 2.1 [src/tests/store-auth.test.ts] Rozszerzyć testy jednostkowe o weryfikację reakcji na timeout, błędy logowania oraz powrót do stanu stabilnego. Zweryfikować testem (`npx vitest run src/tests/store-auth.test.ts`).
- [x] 2.2 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: `tsc --noEmit`, `next lint`, 100% testów Vitest) oraz build statyczny (`npm run build`).

