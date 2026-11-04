# Konfiguracja Autoryzacji Google OAuth 2.0 (Generator Sport's Way)

Niniejszy dokument opisuje strukturę i konfigurację uwierzytelniania Konta Google w projekcie Generator Sport's Way.

---

## 1. Identyfikator Klienta (Client ID)

- **Projekt Google Cloud / Firebase:** `studio-4238553363-af9c0`
- **Typ aplikacji:** Aplikacja internetowa (*Web Application*)
- **Client ID:** `973533321658-78hotq9qhh2ahmm8huf8js01br9jqo9v.apps.googleusercontent.com`
- **Zmienna środowiskowa:** `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (w pliku `.env.local`)

---

## 2. Autoryzowane Źródła JavaScript (Origins)

W [Google Cloud Console](https://console.cloud.google.com/) w sekcji **Poświadczenia** skonfigurowano następujące źródła:
- `http://localhost:9002` (środowisko deweloperskie)
- `https://localhost` (aplikacja mobilna Capacitor Android)
- `http://localhost`
- `https://studio-4238553363-af9c0.web.app` (Firebase Hosting)
- `https://generator.sportsway.eu` (domena produkcyjna)
- `https://www.generator.sportsway.eu`
- `https://generator.bartoszjaszczak.pl`

---

## 3. Zakresy Uprawnień (Scopes)

Aplikacja wnioskuje wyłącznie o minimalny zestaw uprawnień tożsamości użytkownika:
- `openid`: Podstawowy identyfikator konta
- `email`: Adres e-mail użytkownika
- `profile`: Imię i opcjonalny awatar do wyświetlenia w Ustawieniach

---

## 4. Bezpieczeństwo i Architektura

- **Oddzielenie Profilu od Tokenu:** Profil użytkownika (`id`, `name`, `email`, `picture`) jest zapisywany w `localStorage` (Zustand `partializeStoreState`), dzięki czemu sesja jest widoczna natychmiast po restarcie.
- **Krótkotrwały Token:** Token dostępowy (`access_token`) jest utrzymywany wyłącznie w pamięci operacyjnej (in-memory) serwisu `src/services/auth/googleAuth.ts`, co zapobiega atakom XSS na trwałe tokeny.
- **Zasada Offline-First:** Wszystkie dane sal, ćwiczeń i sprzętu działają w 100% lokalnie niezależnie od stanu połączenia z kontem Google.

---

## 5. Konfiguracja Natywnego Logowania na Androidzie (Capacitor)

W środowisku mobilnym Android aplikacja korzysta z natywnego menedżera tożsamości Android Credential Manager za pośrednictwem pluginu `@capawesome/capacitor-google-sign-in`.

Aby natywne okno logowania działało w emulatorze i na fizycznym telefonie:
1. W [Google Cloud Console](https://console.cloud.google.com/apis/credentials) w projekcie `studio-4238553363-af9c0` kliknij **+ Utwórz dane logowania** ➔ **Identyfikator klienta OAuth**.
2. Wybierz typ aplikacji: **Android**.
3. Wpisz nazwę: np. `Generator Android App`.
4. Wpisz nazwę pakietu (**Package name**): `com.pepitolabs.generator` (zgodnie z `capacitor.config.ts` i `android/app/build.gradle`).
5. Wklej odcisk certyfikatu podpisywania (**SHA-1 certificate fingerprint**):
   - W Android Studio otwórz zakładkę po prawej stronie: **Gradle ➔ Tasks ➔ android ➔ signingReport** (lub w terminalu: `cd android && ./gradlew signingReport`).
   - Skopiuj wartość `SHA-1` dla wariantu `debug` (oraz `release` przed publikacją).
6. Kliknij **Utwórz**.
7. W aplikacji mostek natywny automatycznie korzysta z `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (klienta Web), a Google Play Services na urządzeniu paruje żądanie z zarejestrowanym pakietem Androida.
