# Design: Obsługa Granularnych Uprawnień Dysku Google w Interfejsie Aplikacji

## 1. Architektura i Przepływ Danych

Wzorzec opiera się na oficjalnych rekomendacjach Google Identity Services dotyczących *Granular Permissions*:
Użytkownik logujący się przez Google może zaakceptować tożsamość (`openid email profile`), lecz pominąć zakresy usługowe (`drive.appdata`). Aplikacja traktuje ten stan jako udane logowanie tożsamości z ograniczonym zakresem uprawnień funkcjonalnych.

```
       [Użytkownik klika "Połącz z Kontem Google"]
                           │
                           ▼
               [Ekran Zgody OAuth Google]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
[Zaznaczono Dysk Google]    [Odznaczono Dysk Google]
             │                           │
  hasDriveScope = true        hasDriveScope = false
             │                           │
             ▼                           ▼
  [Plakietka: "Połączono"]    [Plakietka: "Wymaga uprawnień"]
  [Kopia: Aktywna]            [Komunikat: Kopia wstrzymana]
                              [Przycisk: "Nadaj dostęp do Dysku"]
```

## 2. Zmiany w Typach i Serwisie Autoryzacji
1. **`src/types/auth.ts`:**
   - Dodanie `hasDriveScope?: boolean` do interfejsu `GoogleUserProfile`.
2. **`src/services/auth/googleAuth.ts`:**
   - W `signInWithGoogleWeb`:
     - Wyznaczenie `hasDriveScope` na podstawie `tokenResponse.scope` oraz `hasGrantedAllScopes`.
     - Zapisanie sesji `saveAuthSession(session)` z tokenem dostępu.
     - Pobranie profilu `fetchGoogleUserProfile(accessToken)` i przypisanie `profile.hasDriveScope = hasDriveScope`.
     - Pomyślne rozwiązanie Promise: `settleResolve(profile)`.
   - W `signInWithGoogleNative`:
     - Zwrócenie profilu z domyślnym `hasDriveScope: true`.

## 3. Zmiany w Interfejsie Ustawień (`src/components/SettingsView.tsx`)
1. **Karta Konta Google:**
   - Jeśli `googleUser.hasDriveScope === false`:
     - Plakietka stanu: bursztynowa (`bg-amber-500/15 text-amber-400 border border-amber-500/30`) z etykietą `Wymaga uprawnień` i ikoną `AlertTriangle`.
     - Blok informacyjny: ostrzeżenie informujące, że kopia zapasowa ćwiczeń i sal jest nieaktywna z powodu braku zgody na Dysk Google.
     - Przycisk główny: **„Nadaj uprawnienie do Dysku Google”** (uruchamiający ponowną autoryzację `handleGoogleSignIn`, która dzięki `prompt: 'consent'` wyświetla ekran z checkboxem).
     - Przycisk pomocniczy: **„Odłącz konto Google”** (pozwalający na całkowite rozłączenie konta).
   - Jeśli `googleUser.hasDriveScope !== false`:
     - Plakietka stanu: szmaragdowa (`Połączono`) z ikoną `CheckCircle2`.
     - Przycisk: **„Odłącz konto Google”**.

## 4. Testy Jednostkowe
- `src/tests/store-auth.test.ts`: Test weryfikujący logowanie webowe z odznaczonym zakresem Dysku (`hasDriveScope === false`) oraz logowanie z pełnymi uprawnieniami (`hasDriveScope === true`).
- `src/tests/ui/SettingsView.test.tsx`: Test renderowania widoku Ustawień w stanie `hasDriveScope === false` (obecność ostrzeżenia, plakietki "Wymaga uprawnień" oraz przycisku doautoryzowania).

