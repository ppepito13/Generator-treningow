# Tasks: Standaryzacja Układu i Marginesów Bezpiecznych UI

- [x] 1.1 [src/app/globals.css] Zdefiniowanie globalnych klas narzędziowych dla bezpiecznych marginesów (`.app-safe-top`, `.app-safe-bottom`) oraz kontenerów (`.app-container-narrow`, `.app-container-wide`).
- [x] 1.2 [src/components/ConfigurationForm.tsx] Zastosowanie klas `.app-safe-top`, `.app-safe-bottom` oraz `.app-container-narrow` w kontenerze głównym formularza generatora.
- [x] 1.3 [src/components/CircuitList.tsx] Zastosowanie wyśrodkowanego kontenera `.app-container-wide` dla listy stacji oraz ujednolicenie marginesów sticky headera.
- [x] 1.4 [src/components/TimerView.tsx] Zastąpienie sztywnego `pt-4` i `pb-28` klasami `.app-safe-top`, `.app-safe-bottom` i `.app-container-wide`.
- [x] 1.5 [src/components/CalculatorsView.tsx] Zastąpienie sztywnego `pt-4` i `pb-28` klasami `.app-safe-top`, `.app-safe-bottom` i `.app-container-wide`.
- [x] 1.6 [src/components/ExerciseStudioView.tsx] Zastąpienie sztywnego `pt-4` i `pb-28` klasami `.app-safe-top`, `.app-safe-bottom` i `.app-container-wide`.
- [x] 1.7 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) potwierdzające 0 błędów i 100% zielonych testów UI/domenowych.
- [x] 1.8 [Weryfikacja Android] Uruchomienie `npm run build` potwierdzające czysty statyczny eksport `out/` pod aplikację mobilną Capacitor.
