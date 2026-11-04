# Tasks

## 1. Moduł Mapowania Błędów i Testy Jednostkowe

- [x] 1.1 [src/services/auth/authErrors.ts] Utworzyć moduł mapujący techniczne wyjątki i kody błędów Google Auth na czytelne komunikaty w języku polskim (`formatAuthError`). Zweryfikować kompilację (`npx tsc --noEmit`).
- [x] 1.2 [src/tests/auth-errors.test.ts] Utworzyć testy jednostkowe pokrywające wszystkie scenariusze błędów (`NO_CREDENTIAL_AVAILABLE`, `SIGN_IN_CANCELED`, `PROVIDER_CONFIGURATION_ERROR`, `origin_mismatch`, network, timeout). Zweryfikować testem (`npx vitest run src/tests/auth-errors.test.ts`).

## 2. Integracja w Serwisie i Widoku Ustawień

- [x] 2.1 [src/services/auth/googleAuth.ts] Zaaplikować funkcję mapującą błędy w metodach `signInWithGoogleWeb` oraz `signInWithGoogleNative`. Zweryfikować linterem (`npx next lint`).
- [x] 2.2 [src/components/SettingsView.tsx] Zintegrować mapowanie w procedurze `handleGoogleSignIn`, aby przekazywać zmapowany komunikat do stanu `authError`. Zweryfikować kompilację (`npx tsc --noEmit`).

## 3. Bramka Jakościowa Projektu

- [x] 3.1 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: `tsc --noEmit`, `next lint`, 100% testów Vitest) oraz build statyczny (`npm run build`).

