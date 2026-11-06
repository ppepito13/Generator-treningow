# Proposal: Naprawa Google Client ID w wersji Web i ochrona logowania Safari

## Why

Wersja webowa aplikacji wdrożona na Firebase Hosting (używana bezpośrednio przez użytkowników iPhone'ów oraz w przeglądarkach desktopowych) zgłasza błąd uniemożliwiający połączenie konta Google: `Brak skonfigurowanego identyfikatora Google Client ID`. 

Przyczyną jest architektoniczny brak produkcyjnego fallbacku w funkcji `getGoogleClientId()`, która polega wyłącznie na zmiennej środowiskowej `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID`. Dodatkowo w repozytorium pozostawał aktywny zbędny workflow GitHub Actions (`.github/workflows/firebase-hosting-merge.yml`), który przy każdym scaleniu gałęzi budował projekt w środowisku pozbawionym pliku `.env.local` i nadpisywał hosting produkcyjny niesprawnym buildem.

Naprawa jest krytyczna, aby umożliwić użytkownikom przeglądarek (w tym na urządzeniach iOS) bezawaryjne łączenie konta Google oraz synchronizację z Dyskiem Google, przy jednoczesnym wyeliminowaniu ryzyka blokowania popupu logowania przez restrykcyjne mechanizmy Safari.

## What Changes

- **Stały Fallback Produkcyjny Client ID**: Wprowadzenie stałej `PRODUCTION_GOOGLE_CLIENT_ID` (`973533321658-78hotq9qhh2ahmm8huf8js01br9jqo9v.apps.googleusercontent.com`) w `src/services/auth/googleAuth.ts`, gwarantującej prawidłowy identyfikator publiczny Web Client ID nawet przy braku pliku `.env.local`.
- **Wsparcie dla `.env.production`**: Utworzenie pliku `.env.production` z oficjalnym identyfikatorem klienta i dodanie wyjątku `!.env.production` w `.gitignore`.
- **Usunięcie Zbędnego Workflow Deployu**: Całkowite usunięcie pliku `.github/workflows/firebase-hosting-merge.yml` – wdrożenia na Firebase Hosting będą realizowane w 100% manualnie przez dewelopera wg `instrukcja-firebase.md`.
- **Preload Biblioteki Google dla Safari (iOS)**: Wywołanie `loadGoogleScript()` w tle w hooku `useEffect` modułu `SettingsView`, aby skrypt Google GIS znajdował się w pamięci podręcznej przed kliknięciem przycisku, co zapobiega asynchronicznej blokadzie wyskakującego okienka autoryzacji w Safari na iOS.
- **Weryfikacja i Testy**: Aktualizacja testów jednostkowych w `src/tests/store-auth.test.ts` weryfikujących działanie fallbacku oraz przeprowadzenie weryfikacji manualnej.

## Capabilities

### Modified Capabilities
- `user-auth`: Wprowadzenie gwarancji dostępności identyfikatora klienta Google Client ID w buildach produkcyjnych Web oraz eliminacja opóźnienia ładowania skryptu autoryzacji chroniąca przed blokadą popupów w mobilnym Safari.

## Impact

- **Zmodyfikowane pliki**:
  - `src/services/auth/googleAuth.ts`
  - `src/components/SettingsView.tsx`
  - `src/tests/store-auth.test.ts`
  - `.gitignore`
- **Nowe pliki**:
  - `.env.production`
- **Usunięte pliki**:
  - `.github/workflows/firebase-hosting-merge.yml`
- **Wpływ na CI/CD i hosting**: Eliminacja samowolnych nadpisań hostingu Firebase przez GitHub Actions.

