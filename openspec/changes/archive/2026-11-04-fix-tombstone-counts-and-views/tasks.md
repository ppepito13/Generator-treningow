# Tasks: Filtrowanie Nagrobków w Licznikach i Widokach

## 1. Komponenty UI i Liczniki

- [x] 1.1 [src/components/ExerciseStudioView.tsx] Zaktualizować wyliczanie `counts.customCount`, walidację `handleExport` oraz dialog czyszczenia bazy tak, aby filtrowały nagrobki (`!ex._sync?.isDeleted`).
- [x] 1.2 [src/components/SettingsView.tsx] Zaktualizować wyliczanie `customCount` w sekcji „O Aplikacji” o wykluczanie nagrobków (`!ex._sync?.isDeleted`).
- [x] 1.3 [src/components/RoomStudioSubView.tsx] Zaktualizować wyliczanie `counts.customCount` oraz walidację `handleExport` o wykluczanie nagrobków (`!r._sync?.isDeleted`).
- [x] 1.4 [src/components/EquipmentStudioSubView.tsx] Zaktualizować wyliczanie `counts.customCount`, walidację `handleExport` oraz dialog resetu o wykluczanie nagrobków (`!eq._sync?.isDeleted`).
- [x] 1.5 [src/components/IntervalTimerSubView.tsx] Zaktualizować selektor `customIntervalPresets` o filtrowanie obiektów z `!p._sync?.isDeleted`.

## 2. Testy i Bramka Jakości

- [x] 2.1 [src/tests/ui/ExerciseStudioViewTombstone.test.tsx] Dodać test UI weryfikujący, że po usunięciu nadpisania ćwiczenia wbudowanego licznik w zakładce „Zapisane lokalnie” oraz filtr pozycji lokalnych natychmiast pokazuje 0.
- [x] 2.2 [npm run verify] Uruchomić pełną lokalną bramkę jakości (`npm run verify`: TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów bez błędów i ostrzeżeń.
