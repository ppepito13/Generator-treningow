# Design

## Context

Dotychczasowe logowanie Google Identity Services (GIS) polegało wyłącznie na webowym `initTokenClient`. W środowisku Capacitor na Androidzie (gdzie kod działa w WebView) system przekierowuje popup do zewnętrznej przeglądarki Chrome. Ponieważ Chrome i aplikacja Capacitor to odrębne procesy systemowe Androida, `window.opener` jest nullem, a mechanizm `postMessage` nie jest w stanie przekazać tokenu z powrotem do aplikacji. Dodatkowo brak timeoutu i detekcji fokusu powodował trwałe zawieszenie stanu `isSigningIn` na kręcącym się spinnerze.

## Goals / Non-Goals

**Goals:**
- Twardy limit czasu (30 sekund) oraz detekcja powrotu fokusu (`visibilitychange` / `window.onfocus`) z automatycznym resetem stanu oczekiwania i prezentacją błędu.
- Obsługa natywnego logowania w środowisku Capacitor na Androidzie za pośrednictwem pluginu `@capawesome/capacitor-google-sign-in` (Credential Manager / Play Services).
- Bezszwowe zachowanie działania webowego GIS w tradycyjnych przeglądarkach desktopowych.
- Zaktualizowanie dokumentacji `GOOGLE_AUTH_SETUP.md` o konfigurację klienta Android (SHA-1 fingerprint) w Google Cloud Console.

**Non-Goals:**
- Implementacja synchronizacji danych z chmurą Google (rezerwowana na zadanie #40).
- Zmiana schematu stanu Zustand Store (zachowujemy istniejący interfejs `googleUser`, `authStatus`, `authError`).

## Decisions

1. **Hybrydowy Serwis Autoryzacji (`src/services/auth/googleAuth.ts`):**
   - Sprawdzenie platformy przez `Capacitor.isNativePlatform()`.
   - Jeśli środowisko jest natywne (Android / iOS): wywołanie natywnego mostka `GoogleSignIn.signIn()`, który korzysta z systemowego okna logowania Androida i natychmiast zwraca profil przez JNI.
   - Jeśli środowisko to przeglądarka WWW: wywołanie webowego GIS `initTokenClient`.
2. **Mechanizm Fail-Safe i Zarządzanie Cyklem Życia Promise:**
   - Każde wywołanie logowania jest opakowane w funkcję z twardym stoperem (30 sekund) oraz nasłuchiwaniem na `document.visibilitychange` / `window.onfocus`.
   - Po powrocie aplikacji na pierwszy plan (np. po zamknięciu okna przez użytkownika) uruchamia się krótki timer (3 sekundy) – jeśli w tym czasie nie nadejdzie token, Promise zostaje odrzucony z błędem anulowania, a wszystkie listenery i timery są natychmiast sprzątane.
3. **Wybór Pluginu `@capawesome/capacitor-google-sign-in`:**
   - Wybrany jako oficjalnie utrzymywany i zgodny z Capacitor 8 (w odróżnieniu od porzuconego `@codetrix-studio/capacitor-google-auth`).

## Risks / Trade-offs

- [Risk] Brak skonfigurowanego klienta Android w konsoli Google Cloud:
  - *Mitigation:* Złapanie błędu natywnego i wyświetlenie czytelnej instrukcji o konieczności zarejestrowania SHA-1 w Google Cloud Console.
- [Risk] Kompatybilność testów jednostkowych Vitest w środowisku jsdom:
  - *Mitigation:* `Capacitor.isNativePlatform()` w środowisku Node/jsdom zwraca `false`, co pozwala na bezproblemowe uruchamianie dotychczasowych testów webowych bez mockowania natywnych bibliotek Androida.

