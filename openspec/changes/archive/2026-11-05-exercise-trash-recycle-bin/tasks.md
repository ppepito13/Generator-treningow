# Tasks

## 1. Warstwa Domenowa i Typy Synchronizacji

- [x] 1.1 [src/types/sync.ts] Rozszerzenie interfejsu `SyncMetadata` o opcjonalną flagę `isPurged?: boolean`.
- [x] 1.2 [src/domain/sync/syncMetadata.ts] Dodanie stałej `TRASH_RETENTION_MS` (7 dni) oraz funkcji pomocniczych `isExerciseInTrash` i `getTrashRemainingDays`.

## 2. Rozszerzenie Zustand Store

- [x] 2.1 [src/app/lib/store.ts] Dodanie definicji typów i implementacji akcji `restoreCustomExercise`, `permanentlyDeleteCustomExercise` oraz `emptyTrash` w store.

## 3. Komponent i Interfejs Studio Ćwiczeń

- [x] 3.1 [src/components/ExerciseStudioView.tsx] Dodanie trybu `deleted` do `filterMode` oraz 4. zakładki `Usunięte (X)` na pasku filtrów bazy.
- [x] 3.2 [src/components/ExerciseStudioView.tsx] Implementacja renderowania kart usuniętych ćwiczeń (czas usunięcia, licznik pozostałych dni, akcje „Przywróć” i „Usuń trwale”) oraz stanu pustego.
- [x] 3.3 [src/components/ExerciseStudioView.tsx] Implementacja paska informacyjnego kosza z przyciskiem „Opróżnij kosz” oraz modalem potwierdzenia usunięcia.
- [x] 3.4 [src/components/ExerciseStudioView.tsx] Dodanie akcji „Cofnij” (`ToastAction`) w powiadomieniu po usunięciu ćwiczenia w `handleDeleteSingle`.

## 4. Testy Jednostkowe i Integracyjne

- [x] 4.1 [src/tests/store-trash.test.ts] Utworzenie testów jednostkowych store dla operacji przywracania, trwałego usuwania i wygasania retencji 7 dni.
- [x] 4.2 [src/tests/ui/ExerciseStudioTrash.test.tsx] Utworzenie testów UI weryfikujących renderowanie 4. zakładki, liczników, akcji przywracania i modalu opróżniania kosza.

