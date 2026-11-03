# Design

## Context
Zobacz `proposal.md` w celu zapoznania się z motywacją biznesową. Komponent `SettingsView` prezentuje w sekcji „O Aplikacji” stałe dane techniczne. Dotychczasowy kod zawierał zahardkodowany tekst o 40 ćwiczeniach i statyczną wersję v1.3.0, a także nie posiadał odnośnika do oficjalnej witryny projektu.

## Goals / Non-Goals

**Goals:**
- Reaktywne wyliczanie liczby ćwiczeń z podziałem na fabryczną bazę i modyfikacje/dodatki użytkownika (Wariant B).
- Bezpieczne wstrzyknięcie wersji aplikacji z `app-version.json` z defensywnym fallbackiem, niezależne od środowiska uruchomieniowego (Firebase Hosting, lokalny dev, Capacitor Android).
- Zapewnienie bezpiecznego, klikalnego odnośnika do `https://sportsway.eu/` bez rozbijania WebView na Androidzie.
- Pełna zgodność z testami jednostkowymi i zachowanie 100% zielonych bramek jakości (`npm run verify`).

**Non-Goals:**
- Ingerencja w silnik generatora, kaskadę ani struktury bazy ćwiczeń.
- Instalacja dodatkowych natywnych wtyczek Capacitora (np. `@capacitor/browser`).
- Zmiany w pozostałych sekcjach Ustawień (Motyw #15, Chmura #39/#40).

## Decisions

### Decyzja 1: Pobieranie liczby ćwiczeń przez atomowy selector Zustand
- **Wybór:** Pobieramy `customExercises = useAppStore(s => s.customExercises)` oraz importujemy `ALL_EXERCISES` z `@/app/lib/data`.
- **Uzasadnienie:** Stała `ALL_EXERCISES.length` reprezentuje niemutowalną bazę fabryczną (270 ćwiczeń). Selektor `state.customExercises` reaguje tylko na zmiany w customowej bazie. Unikamy wywoływania `getAllExercises()` wewnątrz renderu, co alokowałoby nową tablicę przy każdym ticku Zustand.
- **Alternatywa odrzucona:** `useAppStore(s => s.getAllExercises().length)` – tworzy nową tablicę obiektów i triggeruje zbędne re-rendery.

### Decyzja 2: Wydzielenie stałych konfiguracyjnych do `src/config/appInfo.ts`
- **Wybór:** Nowy plik `src/config/appInfo.ts` grupujący metadane aplikacji:
  ```ts
  import appVersionData from '../../app-version.json';

  export const APP_VERSION = `v${appVersionData?.versionName ?? '1.3.0'}`;
  export const APP_WEBSITE_URL = 'https://sportsway.eu/';
  export const APP_WEBSITE_DISPLAY = 'sportsway.eu';
  ```
- **Uzasadnienie:** Next.js przy statycznym exporcie inlinuje importowany JSON bezpośrednio do chunków JS w trakcie builda. Klient w runtime nie wykonuje fetchowania. Zastosowanie operatora `?? '1.3.0'` gwarantuje defensywność na wypadek anomalii w strukturze pliku.
- **Alternatywa odrzucona:** Importowanie `app-version.json` bezpośrednio w wielu komponentach UI lub asynchroniczne wywołanie `App.getInfo()` z `@capacitor/app` (które powodowałoby migotanie UI i wymagałoby obsługi stanu ładowania).

### Decyzja 3: Standardowy element `<a>` dla strony WWW
- **Wybór:** Użycie natywnego HTML `<a href={APP_WEBSITE_URL} target="_blank" rel="noopener noreferrer">` z ikoną `ExternalLink`.
- **Uzasadnienie:** Capacitor WebView automatycznie przechwytuje odnośniki z `target="_blank"` i deleguje je do systemowego Intentu Androida (otwarcie w domyślnej przeglądarce). W wersji przeglądarkowej otwiera nową kartę. Jest to wzorzec lżejszy i bardziej niezawodny niż dodawanie nowej zależności pluginu.

## Risks / Trade-offs

- **[Ryzyko: Szerokość wiersza na ekranach 360px]** → **Mitygacja:** Format tekstu `{baseCount} w bazie (+{customCount} własnych)` zajmuje ok. 24-26 znaków. W kontenerze `app-container-narrow` wiersz z flexboxem i `justify-between` mieści się bez łamania wiersza na ekranach o szerokości od 320px wzwyż.
- **[Ryzyko: Rozsynchronizowanie wersji w testach UI]** → **Mitygacja:** Testy w `src/tests/ui/SettingsView.test.tsx` zaimportują `APP_VERSION` lub sprawdzą regexem format wersji `^v\d+\.\d+\.\d+$`, co uniezależni testy od podbijania numerów w `app-version.json`.

