# Tasks: Eliminacja przepełnienia poziomego pasków filtrów w Studio

## 1. Implementacja responsywnego suwaka (Wariant A) w podwidokach Studio

- [x] 1.1 [src/components/ExerciseStudioView.tsx] Dodać klasy `max-w-full overflow-x-auto scrollbar-none` do kontenera filtrów źródeł oraz `shrink-0 whitespace-nowrap` do każdego przycisku filtra (Wszystkie, Wbudowane, Zapisane lokalnie, Usunięte)
- [x] 1.2 [src/components/RoomStudioSubView.tsx] Dodać klasy `max-w-full overflow-x-auto scrollbar-none` do kontenera filtrów źródeł oraz `shrink-0 whitespace-nowrap` do każdego przycisku filtra (Wszystkie, Wbudowane, Zapisane lokalnie)
- [x] 1.3 [src/components/EquipmentStudioSubView.tsx] Dodać klasy `max-w-full overflow-x-auto scrollbar-none` do kontenera filtrów źródeł oraz `shrink-0 whitespace-nowrap` do każdego przycisku filtra (Wszystkie, Wbudowane, Własne)

## 2. Testy i automatyczna bramka jakości

- [x] 2.1 [src/tests/ui/ExerciseStudioTrash.test.tsx] Dodać asercję testową weryfikującą obecność klas `overflow-x-auto` i `scrollbar-none` na kontenerze paska filtrów w widoku Studio Ćwiczeń
- [x] 2.2 [npm run verify] Uruchomić pełną weryfikację jakości (`tsc --noEmit`, `next lint`, `vitest run`) potwierdzając 0 błędów i 100% testów zielonych

