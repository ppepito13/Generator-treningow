# Tasks

## 1. Typy i Serwis Autoryzacji Google

- [x] 1.1 [src/types/auth.ts] Zdefiniować interfejsy tożsamości użytkownika Google (`GoogleUserProfile`: id, email, name, picture), statusów sesji (`AuthStatus`) oraz kontraktu klienta autoryzacji. Zweryfikować kompilację TypeScript (`npx tsc --noEmit`).
- [x] 1.2 [src/services/auth/googleAuth.ts] Zaimplementować serwis autoryzacyjny Google Identity Services (inicjalizacja klienta tokenów, pobieranie danych profilu z Google userinfo API, obsługa błędów i defensywny fallback przy braku Client ID). Zweryfikować brak błędów lintera (`npx next lint`).
- [x] 1.3 [.env.local.example] Dodać plik szablonu zmiennych środowiskowych z kluczem `NEXT_PUBLIC_GOOGLE_CLIENT_ID` oraz utworzyć instrukcję `GOOGLE_AUTH_SETUP.md`. Zweryfikować obecność plików na dysku.

## 2. Integracja ze Stanem Zustand Store

- [x] 2.1 [src/app/lib/store.ts] Rozszerzyć AppState o pole `googleUser`, `authStatus` oraz akcje `setGoogleUser`, `setAuthStatus`, `disconnectGoogleAccount` z zachowaniem migracji stanu v1 i serializacji w `partializeStoreState`. Zweryfikować kompilację (`npx tsc --noEmit`).
- [x] 2.2 [src/tests/store-auth.test.ts] Utworzyć testy jednostkowe stanu autoryzacji w Zustand Store (logowanie, zapis profilu, odpinanie konta z czyszczeniem sesji i zachowaniem danych lokalnych). Zweryfikować testem (`npx vitest run src/tests/store-auth.test.ts`).

## 3. Komponenty UI i Modal Ostrzegawczy w Ustawieniach

- [x] 3.1 [src/components/DisconnectAccountDialog.tsx] Utworzyć modal potwierdzenia odłączenia konta Google na bazie Radix UI AlertDialog z ostrzeżeniem o wstrzymaniu synchronizacji i zachowaniu danych lokalnych. Zweryfikować kompilację (`npx tsc --noEmit`).
- [x] 3.2 [src/components/SettingsView.tsx] Zintegrować sekcję Konta z serwisem autoryzacji Google, stanem store, przyciskiem łączenia konta oraz modalem DisconnectAccountDialog. Zweryfikować brak błędów lintera (`npx next lint`).
- [x] 3.3 [src/tests/ui/SettingsView.test.tsx] Zaktualizować i rozszerzyć testy widoku Ustawień o weryfikację prezentacji stanu niezalogowanego, połączonego konta Google oraz wywołania modalu odpinania. Zweryfikować testem (`npx vitest run src/tests/ui/SettingsView.test.tsx`).

## 4. Pełna Weryfikacja Jakościowa

- [x] 4.1 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: `tsc --noEmit`, `next lint`, 100% testów Vitest) oraz zweryfikować build statyczny (`npm run build`).

