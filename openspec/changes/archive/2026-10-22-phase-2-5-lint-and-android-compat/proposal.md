# Proposal

## Why

Po odmaskowaniu lintera w Fazie 2 komenda `npm run verify` ujawniła 41 ostrzeżeń ESLint. Ostrzeżenia te obejmują martwy kod, brakujące zależności w hookach timera/audio oraz zewnętrzne zależności od zasobów sieciowych (Google Fonts), które zagrażają stabilności odliczania w tle oraz działaniu aplikacji w trybie offline na urządzeniach mobilnych (Android / Capacitor). Rozwiązanie tych kwestii teraz zabezpiecza stabilność przed planowaną dekompozycją store (Faza 3).

## What Changes

- **Usunięcie martwego kodu (Grupa A)**: Eliminacja nieużywanych importów ikon `lucide-react`, zmiennych i parametrów w komponentach `ExerciseStudioView`, `IntervalTimerSubView`, `RoomStudioSubView`, `StationCard`, `TimerView`, `DifficultyLevelsSubView`, `EquipmentSelectionDialog`, `GenerationConflictDialog`, `useTimerAudioTTS` i `store.ts`.
- **Wyciszenie zmiennych funkcyjnych**: Oznaczenie nieużywanej zmiennej `circuit` w migracji store prefixem `_circuit`.
- **Identyfikacja komponentu**: Dodanie brakującego `displayName` w `StationCard.tsx`.
- **Optymalizacja fontów dla Androida (Offline-Ready)**: Zastąpienie zewnętrznego pobierania fontu z Google Fonts w `src/app/layout.tsx` wbudowanym modułem `next/font/google` (`Inter`), co eliminuje ostrzeżenie `@next/next/no-page-custom-font` i wbudowuje font w paczkę APK.
- **Bezpieczny refaktoring hooków Timera i Audio (Grupa C)**: Zastosowanie `useCallback` oraz referencji `useRef` dla `timerAudioSettings` w `GlobalIntervalTimerController.tsx` oraz `GymViewModal.tsx` w celu wyeliminowania ostrzeżeń `react-hooks/exhaustive-deps` bez wywoływania niepożądanych restartów `setInterval`.
- **Korekta zależności useMemo**: Usunięcie nadmiarowych zależności w `useMemo` w widokach `EquipmentStudioSubView`, `ExerciseManualSelector`, `ExerciseStudioView`, `RoomStudioSubView`, `StationCard`.
- **Uporządkowanie typów (Grupa B)**: Eliminacja luźnych typów `any` w komponentach interfejsu i handlerach zdarzeń.

## Capabilities

### New Capabilities
Brak nowych funkcjonalności biznesowych (zmiana o charakterze czysto refaktoryzacyjnym i higienicznym; `skip_specs: true`).

### Modified Capabilities
Brak zmian w kontraktach wymagań specyfikacji (`skip_specs: true`).

## Impact

- **Kod źródłowy**: Komponenty widoków, kontrolery zegara (`GlobalIntervalTimerController.tsx`, `GymViewModal.tsx`), `src/app/layout.tsx`, `store.ts`.
- **Środowisko mobilne (Android/Capacitor)**: Nienaruszalność integracji z `@capacitor/app` (obsługa przycisku Wstecz) oraz `@capacitor/share`. Pełna samowystarczalność offline zasobów graficznych i typograficznych.
- **Jakość i CI**: Polecenie `npm run verify` osiąga status: 0 błędów i 0 ostrzeżeń (czysty linter).
