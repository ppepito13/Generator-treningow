# Tasks: Automatyczne Cofanie Uprawnień (Auto-Revoke) przy Braku Zgody na Dysk Google (#40.1-fix-revoke)

## 1. Implementacja w Serwisie Autoryzacji

- [x] 1.1 [src/services/auth/googleAuth.ts] Dodać funkcję `revokeGoogleToken(token: string)` unieważniającą token przez GIS `window.google.accounts.oauth2.revoke` oraz endpoint `https://oauth2.googleapis.com/revoke`.
- [x] 1.2 [src/services/auth/googleAuth.ts] W callbacku `signInWithGoogleWeb`, w przypadku braku uprawnienia `drive.appdata`, wywołać `revokeGoogleToken(accessToken)` przed wyczyszczeniem sesji i odrzuceniem logowania.

## 2. Testy Jednostkowe i Bramka Jakości

- [x] 2.1 [src/tests/store-auth.test.ts] Zaktualizować i rozszerzyć test jednostkowy o asercję sprawdzającą wywołanie funkcji `revoke` na tokenie dostępowym, gdy użytkownik odznaczy Dysk Google.
- [x] 2.2 [npm run verify] Uruchomić pełną lokalną bramkę jakości (`npm run verify`: TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów bez błędów i ostrzeżeń.
