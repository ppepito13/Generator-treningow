# Tasks: Cicha weryfikacja sesji Google i detekcja cofnięcia uprawnień w tle (#50)

## 1. Serwis Autoryzacji i Obsługa Błędów

- [x] 1.1 [src/services/auth/authErrors.ts] Zabezpieczyć formatAuthError przed powielaniem prefiksu oraz dodać obsługę komunikatów o wygasłym tokenie
- [x] 1.2 [src/services/auth/googleAuth.ts] Wdrożyć trwały zapis sesji (localStorage) oraz procedurę validateGoogleSession sprawdzającą tokeninfo i stan online

## 2. Integracja ze Stanem Zustand i Widokiem Ustawień

- [x] 2.1 [src/app/lib/store.ts] Dodać akcję validateGoogleSessionState obsługującą czyszczenie profilu przy cofnięciu uprawnień i tryb offline
- [x] 2.2 [src/components/SettingsView.tsx] Podpiąć cichą weryfikację sesji w tle przy wejściu do Ustawień oraz prezentację komunikatu o cofnięciu dostępu

## 3. Testy Automatyczne i Weryfikacja Jakości

- [x] 3.1 [src/tests/store-auth.test.ts] Dodać testy jednostkowe dla validateGoogleSessionState (sesja poprawna, cofnięcie uprawnień, tryb offline)
- [x] 3.2 [package.json] Zweryfikować bramkę jakości komendą npm run verify oraz zbudować projekt
