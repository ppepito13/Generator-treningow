# Proposal

## Why
Aplikacja posiada błędy kompilacji TypeScript, które dotychczas były celowo maskowane flagą `ignoreBuildErrors` w konfiguracji Next.js. Dodatkowo brak wersjonowania stanu w magazynie `localStorage` (Zustand `persist`) stanowi krytyczne ryzyko wystąpienia "Białego Ekranu Śmierci" u istniejących użytkowników przy jakiejkolwiek przyszłej zmianie struktury danych. Ta zmiana usuwa dług technologiczny, odblokowuje czystą kompilację i zabezpiecza dane użytkowników.

## What Changes
- Poprawa błędów typowania TypeScript w `EquipmentStudioSubView.tsx` (pole `opis`) oraz `calendar.tsx` (dostosowanie do API `react-day-picker` v9).
- Usunięcie flag maskujących `ignoreBuildErrors: true` oraz `ignoreDuringBuilds: true` w `next.config.ts`.
- Wdrożenie wersjonowania (`version: 1`), funkcji migracji (`migrate`) oraz wykluczenia stanu nawigacji i modali (`partialize`) w konfiguracji Zustand `persist` w `store.ts`.
- Dodanie w interfejsie użytkownika dyskretnego monitu informującego o możliwości wykonania kopii zapasowej danych.

## Capabilities

### New Capabilities
Brak.

### Modified Capabilities
- `data-storage`: Wprowadzenie jawnego wersjonowania stanu (v1), migracji z v0 oraz filtracji `partialize` w `localStorage`.

## Impact
- `src/components/EquipmentStudioSubView.tsx`
- `src/components/ui/calendar.tsx`
- `next.config.ts`
- `src/app/lib/store.ts`
- `src/tests/store-migration.test.ts` (nowy test jednostkowy)
