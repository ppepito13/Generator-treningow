# Tasks: Poprawka trwałości sesji Google na Androidzie i eliminacja samoczynnego wylogowania (#50)

## 1. Serwis Autoryzacji i Widok Ustawień

- [x] 1.1 [src/services/auth/googleAuth.ts] Utrwalić idToken w signInWithGoogleNative oraz wdrożyć obsługę walidacji id_token w validateGoogleSession
- [x] 1.2 [src/components/SettingsView.tsx] Ograniczyć weryfikację sesji w useEffect do jednorazowego uruchomienia przy montowaniu widoku

## 2. Testy Automatyczne i Weryfikacja Jakości

- [x] 2.1 [src/tests/store-auth.test.ts] Dodać testy jednostkowe dla zapisu sesji z idToken oraz zachowania profilu po zalogowaniu na Androidzie
- [x] 2.2 [package.json] Zweryfikować bramkę jakości npm run verify oraz zbudować projekt
