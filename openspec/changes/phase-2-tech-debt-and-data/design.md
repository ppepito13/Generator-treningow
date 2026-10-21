# Design

## Context
Aplikacja kompiluje się obecnie z maskowaniem błędów (`ignoreBuildErrors` w `next.config.ts`), a w kodzie występują 2 znane błędy TypeScript w `EquipmentStudioSubView.tsx` oraz `calendar.tsx`. Ponadto stan aplikacji zapisywany w `localStorage` (pod kluczem `kinetic-circuits-storage`) przez bibliotekę Zustand nie posiada zdefiniowanej wersji (`version`) ani funkcji migracji (`migrate`), co grozi awarią aplikacji u użytkowników w przypadku jakiejkolwiek zmiany modelu danych.

## Goals / Non-Goals

**Goals:**
- Wyeliminowanie wszystkich błędów zgłaszanych przez `tsc --noEmit`.
- Odblokowanie rygorystycznej kompilacji produkcyjnej w Next.js (`ignoreBuildErrors: false`).
- Zabezpieczenie danych użytkowników w `localStorage` poprzez dodanie wersji `1`, bezpiecznej migracji ze stanu v0 oraz filtracji `partialize`.
- Weryfikacja migracji testem jednostkowym w Vitest.

**Non-Goals:**
- Dekompozycja monolitu `store.ts` i ekstrakcja generatorów do osobnych modułów (zadanie zarezerwowane dla kolejnej zmiany: Faza 3).
- Zmiany w widokach UI i logice treningowej.

## Decisions

### Decyzja 1: Jawne typowanie EquipmentItem w EquipmentStudioSubView
W `EquipmentStudioSubView.tsx` wynik `allEquipment` będzie jawnie typowany jako `EquipmentItem[]`. W obiekcie fallbacku dodane zostanie pole `opis: undefined`.
*Alternatywa:* Rzutowanie `as any` lub `as EquipmentItem` w miejscu odczytu (odrzucona jako niezgodna ze standardami inżynierii).

### Decyzja 2: Dostosowanie calendar.tsx do API react-day-picker v9
Wersja 9 `react-day-picker` zmieniła interfejs `components`. Zamiast przestarzałych `IconLeft` i `IconRight`, użyjemy komponentu `Chevron` z weryfikacją `props.orientation`.
*Alternatywa:* Downgrade biblioteki do v8 (odrzucona, chcemy utrzymać aktualne zależności projektu).

### Decyzja 3: Zustand Persist z version, migrate i partialize
W pliku `store.ts` konfiguracja middleware `persist` zostanie rozszerzona o:
- `version: 1`
- `partialize`: Zapis do `localStorage` wyłącznie trwałych danych (`customExercises`, `customRooms`, `customEquipment`, `customIntervalPresets`, `timerAudioSettings`, `sharedUserProfile`, `selectedRoomId`). Stan UI (`activeView`, `navigationStack`, `circuit`, `isGenerated`) pozostaje wyłącznie w pamięci RAM.
- `migrate`: Obsługa stanu z `version === 0 || version === undefined`.

## Risks / Trade-offs

- **[Ryzyko] Uszkodzenie istniejących danych użytkownika po migracji** → **[Mitygacja]** Napisanie dedykowanego testu jednostkowego Vitest (`src/tests/store-migration.test.ts`), który ładuje przykładowy stan v0 i sprawdza poprawność konwersji do formatu v1 bez utraty danych.
