# Tasks: Spójne Nagłówki Modułów i Wielokolumnowe Siatki Responsywne

- [x] 1.1 [src/components/ui/ModuleHeader.tsx] Utworzenie ustandaryzowanego komponentu nagłówka modułu z kafelkiem ikony, tytułem, podtytułem, slotem akcji i dziećmi.
- [x] 1.2 [src/tests/ui/ModuleHeader.test.tsx] Test renderowania komponentu `ModuleHeader` (weryfikacja wyświetlania tytułu, podtytułu, ikony i akcji).
- [x] 1.3 [src/components/TimerView.tsx] Zastąpienie dotychczasowej struktury nagłówka komponentem `ModuleHeader`.
- [x] 1.4 [src/components/CalculatorsView.tsx] Zastąpienie dotychczasowej struktury nagłówka komponentem `ModuleHeader`.
- [x] 1.5 [src/components/ExerciseStudioView.tsx] Zastąpienie dotychczasowej struktury nagłówka komponentem `ModuleHeader` oraz wdrożenie siatki 2/3-kolumnowej (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) dla listy ćwiczeń.
- [x] 1.6 [src/components/CircuitList.tsx] Zastosowanie siatki 2-kolumnowej (`md:grid-cols-2`) dla stacji treningowych oraz zmiana strategii sortowania na `rectSortingStrategy`.
- [x] 1.7 [Weryfikacja jakości] Uruchomienie `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) potwierdzające 0 błędów i 100% zielonych testów.
- [x] 1.8 [Weryfikacja Android] Uruchomienie `npm run build` potwierdzające czysty statyczny eksport `out/` pod aplikację mobilną Capacitor.
