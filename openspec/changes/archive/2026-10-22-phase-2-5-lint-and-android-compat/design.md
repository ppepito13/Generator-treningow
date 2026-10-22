# Design

## Context

Komenda `next lint` ujawniła 41 ostrzeżeń po odmaskowaniu lintera w Fazie 2. Aplikacja jest wdrażana hybrydowo: jako statyczny eksport webowy oraz jako aplikacja Android (Capacitor WebView). W sali treningowej aplikacja działa często bez dostępu do sieci, co czyni zewnętrzne zasoby sieciowe podatnymi na awarie, a zarządzanie cyklem życia timerów w WebView wymaga szczególnej ostrożności. Szczegółowe uzasadnienie znajduje się w `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Wyeliminowanie 100% z 41 ostrzeżeń zgłaszanych przez `next lint`, doprowadzając `npm run verify` do stanu 0 błędów i 0 ostrzeżeń.
- Pełna ochrona integracji natywnych Capacitora (obsługa przycisku Wstecz, okno udostępniania treningu).
- Zagwarantowanie poprawnego działania fontów w trybie offline na telefonie poprzez wbudowanie ich w APK (`next/font/google`).
- Zapewnienie stabilności pętli zegara interwałowego (`GlobalIntervalTimerController.tsx` i `GymViewModal.tsx`) bez restartów interwałów i zapętleń re-renderów.

**Non-Goals:**
- Dekompozycja pliku `store.ts` (rezerwacja na Fazę 3).
- Zmiany w logice biznesowej generatora treningów ani algorytmach losowania stacji.
- Dodawanie nowych ekranów czy zmiana stylistyki UI.

## Decisions

### Decision 1: Czyszczenie martwego kodu (Grupa A)
Nieużywane importy ikon z `lucide-react` (np. `Sparkles`, `Layers`, `FileJson`, `Zap`, `Mic`) oraz nieużywane zmienne i parametry w komponentach zostaną usunięte.  
*Alternatywa:* Pozostawienie martwego kodu lub dodanie `// eslint-disable-next-line` (odrzucono – zmniejsza czytelność i zaciemnia audyt kodu).

### Decision 2: Wbudowanie czcionki Inter za pomocą `next/font/google`
W pliku `src/app/layout.tsx` usunięte zostaną tagi `<link href="https://fonts.googleapis.com">`. Zamiast nich użyty zostanie wbudowany mechanizm `next/font/google` (`import { Inter } from 'next/font/google'`).
*Uzasadnienie:*
1. Eliminuje ostrzeżenie `@next/next/no-page-custom-font`.
2. Podczas statycznego exportu Next.js pobiera i zapisuje pliki woff2 lokalnie w katalogu `out/` – dzięki temu na telefonie z Androidem w trybie samolotowym lub w piwnicznej siłowni czcionka renderuje się natychmiast bez oczekiwania na sieć.

### Decision 3: Wzorzec stabilnych referencji dla Timera i Audio (Grupa C)
W `GlobalIntervalTimerController.tsx` i `GymViewModal.tsx` ostrzeżenia `react-hooks/exhaustive-deps` wynikają z odwołań do `timerAudioSettings` oraz funkcji zapowiedzi.
- `timerAudioSettings` będzie przechowywane w referencji: `const audioSettingsRef = useRef(timerAudioSettings); useEffect(() => { audioSettingsRef.current = timerAudioSettings; });`. Dzięki temu wewnątrz interwału odczytywany jest aktualny stan bez wymuszania restartu `setInterval` przy zmianie suwaka głośności.
- Funkcje zapowiedzi (`announceStep`, `announceStepStart`) zostaną opakowane w `useCallback` lub będą korzystać ze stabilnych referencji, co pozwala bezpiecznie umieścić je w tablicach zależności `useEffect`.
- W selektorach `useMemo` w widokach sal i sprzętu usunięte zostaną nadmiarowe zależności, które nie są bezpośrednio odczytywane w ciele memoizowanej funkcji.

### Decision 4: Identyfikacja memoizowanych komponentów i zmienne funkcyjne
- W `StationCard.tsx` dodany zostanie jawny identyfikator: `StationCard.displayName = 'StationCard';`.
- W migracji `store.ts` destrukturyzacja pomijająca `circuit` otrzyma konwencyjny prefix `_`: `const { circuit: _circuit, ...rest } = persistedState || {};`, co informuje linter o celowym pominięciu zmiennej.

## Risks / Trade-offs

- **[Risk] Przerwanie odliczania timera przy zmianie zależności w useEffect** → **[Mitigation]** Użycie wzorca `useRef` dla `timerAudioSettings` zapobiega niszczeniu i odtwarzaniu `setInterval` co sekundę. Weryfikacja manualna zachowania timera.
- **[Risk] Przypadkowe usunięcie kodu powiązanego z Androidem** → **[Mitigation]** Wszystkie importy `@capacitor/*` oraz obsługa `App.addListener('backButton')` są chronione w teście manualnym i sprawdzone w `git diff`.
- **[Risk] Błąd kompilacji fontu przy static export** → **[Mitigation]** Next.js natywnie wspiera `next/font/google` z `output: 'export'` od wersji 13.4+. Zostanie to zweryfikowane pełnym `npm run build`.
