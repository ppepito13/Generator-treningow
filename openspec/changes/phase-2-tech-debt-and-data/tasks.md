# Tasks

## 1. Naprawa błędów TypeScript

- [ ] 1.1 Popraw typowanie w `src/components/EquipmentStudioSubView.tsx` (jawny typ `EquipmentItem[]`) i zweryfikuj brak błędu TS2339
- [ ] 1.2 Zaktualizuj komponent nawigacji w `src/components/ui/calendar.tsx` pod API `react-day-picker` v9 (`Chevron`)
- [ ] 1.3 Popraw typowanie w `vitest.config.ts` i zweryfikuj czysty wynik poleceniem `npm run typecheck` (`tsc --noEmit` -> 0 błędów)

## 2. Odmaskowanie kompilacji produkcyjnej

- [ ] 2.1 Usuń flagi `ignoreBuildErrors: true` oraz `ignoreDuringBuilds: true` z pliku `next.config.ts`
- [ ] 2.2 Uruchom `npm run build` i zweryfikuj, czy pełny build produkcyjny przechodzi bez flag maskujących

## 3. Zustand Persist Migration (Zabezpieczenie localStorage)

- [ ] 3.1 Napisz test jednostkowy `src/tests/store-migration.test.ts` w Vitest weryfikujący bezpieczną migrację stanu v0 do v1
- [ ] 3.2 Zaimplementuj w `src/app/lib/store.ts` konfigurację `version: 1`, funkcję `migrate()` oraz filtr `partialize`
- [ ] 3.3 Uruchom `npm run test` i zweryfikuj, że wszystkie testy jednostkowe przechodzą na zielono
- [ ] 3.4 Dodaj w interfejsie użytkownika dyskretny monit o możliwości wyeksportowania własnej bazy danych przed aktualizacją

## Workflow follow-up

- Zarchiwizuj zmianę poleceniem `openspec archive phase-2-tech-debt-and-data`.
- Scal gałąź do `main` i usuń gałąź roboczą.
