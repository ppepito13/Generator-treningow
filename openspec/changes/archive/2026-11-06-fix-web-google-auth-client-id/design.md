# Design: Architektura i mitygacja problemów logowania Google Web / Safari

## Context

Zobacz `proposal.md` – motywacja i tło problemu.

Aplikacja w warstwie przeglądarkowej wykorzystuje bibliotekę Google Identity Services (GIS). W architekturze Next.js Static Export (`output: 'export'`) zmienne z prefiksem `NEXT_PUBLIC_` są wstrzykiwane w kod w trakcie kompilacji `npm run build`. W przypadku braku pliku `.env.local` zmienna przybierała wartość `undefined`, co skutkowało błędem runtime.

## Goals / Non-Goals

**Goals:**
- Zagwarantowanie 100% odporności na brak zmiennej środowiskowej poprzez wielopoziomowy fallback produkcyjny w kodzie i plik `.env.production`.
- Całkowite odpięcie automatycznego procesu publikacji na Firebase z poziomu GitHub Actions.
- Wyeliminowanie opóźnienia pobierania skryptu autoryzacji Google w celu obejścia blokady wyskakujących okienek w Safari na iOS.
- Pełna wsteczna kompatybilność z istniejącymi testami jednostkowymi i integracyjnymi.

**Non-Goals:**
- Brak modyfikacji natywnego logowania Androida w pluginie `@capawesome/capacitor-google-sign-in` (działa poprawnie w oparciu o Android Credential Manager).
- Brak modyfikacji silnika synchronizacji chmurowej `SyncCoordinator` oraz formatu kopii zapasowej na Google Drive.

## Decisions

### 1. Podwójny mechanizm deklaracji Web Client ID (Kod + `.env.production`)
- **Wybór**: Wprowadzenie stałej `PRODUCTION_GOOGLE_CLIENT_ID = '973533321658-78hotq9qhh2ahmm8huf8js01br9jqo9v.apps.googleusercontent.com'` w `src/services/auth/googleAuth.ts` oraz utworzenie pliku `.env.production`.
- **Logika funkcji**:
  ```typescript
  export const getGoogleClientId = (): string => {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || PRODUCTION_GOOGLE_CLIENT_ID;
  };
  ```
- **Uzasadnienie**: Google Web Client ID dla aplikacji SPA/frontendowych jest jawnym, publicznym identyfikatorem (nie jest sekretem). Zabezpieczenie autoryzacji w Google opiera się na dozwolonych źródłach (*Authorized JavaScript Origins*), a nie na tajności identyfikatora. Zapewnia to działanie aplikacji niezależnie od tego, czy build odpala deweloper, skrypt, czy środowisko kontenerowe.
- **Rozważone alternatywy**:
  - *Tylko `.env.production`*: Odrzucono jako niewystarczające – jeśli w jakimkolwiek środowisku odczyt pliku zawiedzie, błąd by powrócił.
  - *Zmienna w sekretach GitHuba*: Odrzucono, ponieważ workflow GitHuba jest usuwany.

### 2. Usunięcie workflow `.github/workflows/firebase-hosting-merge.yml`
- **Wybór**: Usunięcie pliku workflow z repozytorium.
- **Uzasadnienie**: Zgodnie z decyzją dewelopera wdrożenia na hosting Firebase realizowane są świadomie i ręcznie wg instrukcji w `instrukcja-firebase.md`. Usunięcie workflow eliminuje niekontrolowane nadpisywanie produkcyjnego hostingu po scaleniach PR.

### 3. Preload biblioteki Google Identity Services w `SettingsView`
- **Wybór**: Wywołanie `void loadGoogleScript()` w hooku `useEffect` modułu `SettingsView`.
- **Uzasadnienie**: Safari na iOS blokuje okna `window.open` / `requestAccessToken`, jeśli nie zostaną wywołane synchronicznie w ramach bezpośredniego gestu użytkownika. Asynchroniczne oczekiwanie na pobranie skryptu z sieci (`await loadGoogleScript()`) wewnątrz handlera kliknięcia powodowało przekroczenie okna gestu w Safari. Preload w Ustawieniach gwarantuje, że skrypt jest już w pamięci podręcznej i kliknięcie natychmiast otwiera okno Google.

## Risks / Trade-offs

- **[Ryzyko: Potrzeba zmiany Client ID w przyszłości]** → **Mitygacja:** Zmienna środowiskowa `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` ma wyższy priorytet niż stała `PRODUCTION_GOOGLE_CLIENT_ID`. W razie migracji projektu wystarczy podać nową zmienną w `.env.local` lub zaktualizować stałą.
- **[Ryzyko: Preload skryptu Google zużywa transfer przy wejściu do Ustawień]** → **Mitygacja:** Skrypt `accounts.google.com/gsi/client` waży poniżej 50 KB, jest ładowany z nagłówkiem `async defer` i automatycznie cache'owany przez przeglądarkę.

