# Tasks: Uspójnienie Stanu Autoryzacji i Obsługa Częściowych Uprawnień Dysku Google (#40.1-granular-scope)

## 1. Typy i Serwis Autoryzacji

- [x] 1.1 [src/types/auth.ts] Dodać pole `hasDriveScope?: boolean` do interfejsu `GoogleUserProfile`.
- [x] 1.2 [src/services/auth/googleAuth.ts] W `signInWithGoogleWeb` zapisać `profile.hasDriveScope = hasDriveScope` i pomyślnie rozwiązać Promise, a w `signInWithGoogleNative` ustawić `hasDriveScope: true`.

## 2. Interfejs Użytkownika (SettingsView)

- [x] 2.1 [src/components/SettingsView.tsx] W karcie konta Google dodać obsługę stanu `googleUser.hasDriveScope === false` (bursztynowa plakietka „Wymaga uprawnień”, komunikat o wstrzymaniu kopii oraz przycisk „Nadaj uprawnienie do Dysku Google”).

## 3. Testy Jednostkowe i Bramka Jakości

- [x] 3.1 [src/tests/store-auth.test.ts] Zaktualizować testy jednostkowe logowania weryfikujące ustawianie flagi `hasDriveScope` w profilu użytkownika.
- [x] 3.2 [src/tests/ui/SettingsView.test.tsx] Dodać test jednostkowy renderowania karty konta z ostrzeżeniem i przyciskiem doautoryzowania przy `hasDriveScope === false`.
- [x] 3.3 [npm run verify] Uruchomić pełną lokalną bramkę jakości (`npm run verify`: TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów bez błędów i ostrzeżeń.
