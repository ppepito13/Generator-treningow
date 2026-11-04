# Proposal

## Why

Obecna implementacja logowania Google Identity Services (GIS) w `googleAuth.ts` opiera się wyłącznie na webowym mechanizmie popup (`initTokenClient`), który w środowisku mobilnym Android WebView (Capacitor) nie posiada dostępu do `window.opener` w zewnętrznym Chrome i gubi odpowiedź z tokenem. Dodatkowo brak mechanizmu timeoutu oraz nasłuchu powrotu fokusu powoduje trwałe zawieszenie interfejsu aplikacji na spinnerze „Łączenie z Google...” w przypadku błędu, odrzucenia uprawnień lub zamknięcia okna.

## What Changes

- **Zabezpieczenie odporności (Fail-Safe Timeout & Focus)**: Dodanie twardego 30-sekundowego timeoutu do żądania logowania oraz detektora powrotu użytkownika do aplikacji (`document.visibilitychange` / `window.onfocus`), który w przypadku braku tokenu natychmiast przerywa stan oczekiwania, zdejmuje spinner i prezentuje czytelny błąd.
- **Natywne logowanie na Androidzie (Capacitor)**: Integracja oficjalnego pluginu `@capawesome/capacitor-google-sign-in` dla Capacitor 8, uruchamiającego natywny systemowy Google Credential Manager na urządzeniach z Androidem (`Capacitor.isNativePlatform()`), z zachowaniem webowego GIS w przeglądarce komputerowej.
- **Aktualizacja instrukcji konfiguracji Android Client ID**: Aktualizacja `GOOGLE_AUTH_SETUP.md` o kroki rejestracji klienta Android z odciskiem SHA-1 w Google Cloud Console.
- **Aktualizacja testów jednostkowych**: Weryfikacja obsługi timeoutu, detekcji błędu oraz ścieżek platformowych.

## Capabilities

### New Capabilities
<!-- Brak nowych capabilities - rozwijamy user-auth -->

### Modified Capabilities
- `user-auth`: Wprowadzenie wymogów odporności czasowej (Timeout & Focus Recovery) oraz obsługi natywnego mechanizmu uwierzytelniania w środowisku mobilnym.

## Impact

- Kod autoryzacji: `src/services/auth/googleAuth.ts`, `package.json` (instalacja `@capawesome/capacitor-google-sign-in`).
- Konfiguracja Androida: `android/` (`variables.gradle` / `build.gradle` jeśli wymagane przez plugin, `npx cap sync`).
- UI: `src/components/SettingsView.tsx` (płynna obsługa błędów timeoutu i reset stanu ładowania).
- Testy: `src/tests/store-auth.test.ts` / `src/tests/google-auth.test.ts`.

