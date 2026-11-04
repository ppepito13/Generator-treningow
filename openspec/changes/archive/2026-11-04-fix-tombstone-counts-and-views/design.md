# Design: Filtrowanie Nagrobków w Licznikach i Widokach

## Context

Wprowadzone w #40.2 miękkie usuwanie (*Tombstones*) zachowuje rekordy w `customExercises`, `customRooms`, `customEquipment` i `customIntervalPresets` z flagą `_sync.isDeleted = true`.
W widokach prezentacyjnych (`ExerciseStudioView`, `SettingsView`, `RoomStudioSubView`, `EquipmentStudioSubView`) liczniki pozycji lokalnych muszą opierać się wyłącznie na rekordach aktywnych (`!item._sync?.isDeleted`).

## Goals / Non-Goals

**Goals:**
- Zapewnienie, że liczniki zakładek, podsumowań i dialogów w UI odzwierciedlają wyłącznie aktywne wpisy.
- Usunięcie edycji ćwiczenia wbudowanego natychmiast zeruje licznik własnych ćwiczeń w zakładce i w Ustawieniach.
- Zabezpieczenie walidacji eksportu oraz dialogów resetu przed braniem pod uwagę nagrobków.

**Non-Goals:**
- Fizyczne usuwanie nagrobków z `localStorage` (nagrobki muszą pozostać w stanie magazynu trwałego na potrzeby chmury).
- Zmiana interfejsu synchronizacji (to domena #40.3).

## Decisions

1. **Filtrowanie w `ExerciseStudioView.tsx`:**
   - Obliczanie `customCount` jako `customExercises.filter((e) => !e._sync?.isDeleted).length` (lub bezpośrednio `allExercises.filter((e) => e.isCustom).length`).
   - W sekcji eksportu weryfikacja `activeCustomExercises.length === 0`.
2. **Filtrowanie w `SettingsView.tsx`:**
   - Obliczanie `customCount` jako `customExercises.filter((e) => !e._sync?.isDeleted).length`.
3. **Filtrowanie w `RoomStudioSubView.tsx` oraz `EquipmentStudioSubView.tsx`:**
   - Zastosowanie `!item._sync?.isDeleted` przy wyliczaniu `counts.customCount`, sprawdzaniu warunku eksportu i tekście w dialogu resetu.
4. **Filtrowanie w `IntervalTimerSubView.tsx`:**
   - Obliczanie `customIntervalPresets` jako `rawCustomIntervalPresets.filter((p) => !p._sync?.isDeleted)`.

## Risks / Trade-offs

- *[Ryzyko]* Pominięcie jakiegoś komponentu czytającego surowy stan store.
  - *Mitygacja:* Przeszukanie całego repozytorium pod kątem bezpośrednich odwołań do `.customExercises`, `.customRooms`, `.customEquipment`, `.customIntervalPresets`.

