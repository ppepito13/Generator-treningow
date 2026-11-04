# Tasks: Wymuszenie i Walidacja Zgody na Dostęp do Dysku Google (#40.1-fix)

## 1. Komunikaty Błędów i Autoryzacja

- [x] 1.1 [src/services/auth/authErrors.ts] Dodać obsługę i polskie tłumaczenie błędu `DRIVE_SCOPE_REQUIRED` informujące o konieczności zaznaczenia pola wyboru Dysku Google.
- [x] 1.2 [src/services/auth/googleAuth.ts] Dodać weryfikację `response.scope` w callbacku logowania webowego (odrzucenie błędem `DRIVE_SCOPE_REQUIRED` przy braku `drive.appdata`) oraz dodać `prompt: 'consent'`.

## 2. Testy Jednostkowe i Weryfikacja

- [x] 2.1 [src/tests/auth-errors.test.ts] Dodać test jednostkowy weryfikujący formatowanie błędu braku zgody na Dysk Google.
- [x] 2.2 [src/tests/store-auth.test.ts] Dodać test jednostkowy sprawdzający, czy brak uprawnienia `drive.appdata` przerywa logowanie i nie ustawia profilu użytkownika.
- [x] 2.3 [npm run verify] Uruchomić pełną lokalną bramkę jakości (TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów.
