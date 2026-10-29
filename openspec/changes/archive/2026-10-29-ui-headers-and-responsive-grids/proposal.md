# Propozycja Zmiany: Spójne Nagłówki Modułów i Wielokolumnowe Siatki Responsywne (ui-headers-and-responsive-grids)

## Why
W obecnym stanie aplikacji nagłówki poszczególnych modułów (Zestaw, Zegar, Narzędzia, Studio) posiadają odmienną strukturę wizualną, co obniża spójność interfejsu (UX). Ponadto na większych ekranach (tablety, laptopy) widok Zestawu oraz Studia bazy ćwiczeń wyświetla elementy w pojedynczej pionowej kolumnie, marnując dostępną przestrzeń poziomą.
W ramach drugiego kroku standaryzacji UI wprowadzamy ujednolicony komponent nagłówka modułu (`ModuleHeader`) oraz responsywne siatki wielokolumnowe (`rectSortingStrategy` dla DnD w Zestawie oraz 2/3-kolumnowy grid dla ćwiczeń w Studio).

## What Changes
1. **Wspólny komponent `ModuleHeader` (`src/components/ui/ModuleHeader.tsx`):**
   - Reużywalny nagłówek z kafelkiem ikony w akcencie, tytułem, podtytułem, slotem na przyciski akcji oraz opcjonalnym paskiem zakładek (SubTabs).
2. **Wdrożenie `ModuleHeader` w widokach:**
   - [src/components/CircuitList.tsx]
   - [src/components/TimerView.tsx]
   - [src/components/CalculatorsView.tsx]
   - [src/components/ExerciseStudioView.tsx]
3. **Responsywne siatki wielokolumnowe na tabletach i desktopie:**
   - [src/components/CircuitList.tsx]: Siatka 2-kolumnowa stacji (`grid-cols-1 md:grid-cols-2`) ze strategią `@dnd-kit/sortable` `rectSortingStrategy`.
   - [src/components/ExerciseStudioView.tsx]: Siatka 2/3-kolumnowa kart ćwiczeń (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
4. **Testy jednostkowe UI i weryfikacja:**
   - Nowy test renderowania `src/tests/ui/ModuleHeader.test.tsx`.
   - `npm run verify` oraz `npm run build`.
