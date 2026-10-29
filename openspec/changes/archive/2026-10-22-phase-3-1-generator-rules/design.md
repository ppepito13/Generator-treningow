# Design

## Context

Obecny plik `src/app/lib/store.ts` zawiera zarówno stan Zustand, jak i reguły domenowe weryfikacji sprzętu, wyliczania pojemności stref oraz filtrowania ćwiczeń. Funkcja `getValidExercisesForZone` odpytuje bezpośrednio `useAppStore.getState().getAllExercises()`. Zmiana ta wydziela te mechanizmy do czystych modułów w `src/domain/generator/`.

## Goals / Non-Goals

**Goals:**
- Utworzenie modularnej struktury w `src/domain/generator/` z jawnym podziałem odpowiedzialności:
  - `types.ts`: kontrakty danych
  - `equipmentRules.ts`: weryfikacja sprzętowa
  - `exerciseFilter.ts`: selekcja i filtrowanie ćwiczeń
  - `zoneSelector.ts`: algorytm alokacji i sortowania stref sali
  - `index.ts`: punkt wejściowy
- Zapewnienie pełnej czystości funkcji (pure functions) bez odwołań do stanu Zustand (`Dependency Injection` dla bazy ćwiczeń).
- Zachowanie 100% kompatybilności wstecznej dla UI (`StationCard.tsx`, `store.ts`) poprzez re-eksport w `src/app/lib/store.ts`.
- Pokrycie wydzielonych modułów testami jednostkowymi Vitest.

**Non-Goals:**
- Modyfikacja algorytmów losowania `generateCircuitStrategy` oraz `generateSynchronizedStrategy` (odroczone do Fazy 3.2).
- Modyfikacja akcji `store.ts` takich jak `rerollExercise` czy `changeStationZone` (odroczone do Fazy 3.2 i 3.3).
- Zmiana interfejsu użytkownika lub wyglądu stacji.

## Decisions

### 1. Struktura katalogu `src/domain/generator/`
Zamiast jednego dużego pliku domenowego wydzielamy 4 małe, wyspecjalizowane pliki:
- `types.ts` – wspólne definicje interfejsów parametrów filtrowania i generatora.
- `equipmentRules.ts` – `ensureEquipment`, `getEquipmentString`, `canExerciseBeShared`.
- `exerciseFilter.ts` – `getValidExercisesForZone` przyjmująca opcjonalne lub domyślne `allExercises: Exercise[]`.
- `zoneSelector.ts` – `selectRoomZonesForCircuit` wydzielona z `generateCircuitStrategy` (wyliczanie limitów stref elastycznych i klatki RIG).

*Alternatywa odrzucona:* Pozostawienie wszystkiego w jednym pliku `generatorDomain.ts` – utrudniałoby to realizację mikro-zadań i zwiększało narzut kontekstu AI.

### 2. Dependency Injection dla bazy ćwiczeń
Funkcja `getValidExercisesForZone` nie może odpytywać `useAppStore.getState()`. Źródło ćwiczeń jest przekazywane jako jawny parametr:
```ts
export const getValidExercisesForZone = (
  zone: Zone,
  diffRange: { min: number; max: number },
  usedIds: Set<string>,
  isThisStationPair: boolean,
  currentRoom: RoomConfig,
  segmentId?: number,
  ignoreUsed: boolean = false,
  hasFlagAlready: boolean = false,
  category: string = 'all',
  participantsCount: number = 1,
  allExercisesSource?: Exercise[]
): Exercise[] => { ... }
```
Domyślnym fallbackiem wewnątrz funkcji jest statyczna tablica `ALL_EXERCISES` z `data.ts`, a wywołania ze store mogą wstrzykiwać `get().getAllExercises()`.

### 3. Kompatybilny re-eksport w `store.ts`
Aby zapobiec przerwaniu importów w istniejących plikach (np. `StationCard.tsx`), w `store.ts` dodajemy:
```ts
export { getValidExercisesForZone, ensureEquipment, canExerciseBeShared, getEquipmentString } from '@/domain/generator';
```

## Risks / Trade-offs

- **[Ryzyko] Niezgodność sygnatur przy eksporcie** → **Mitygacja:** Sygnatury funkcji w `src/domain/generator/` zachowują 100% zgodności z obecnymi sygnaturami ze `store.ts`.
- **[Ryzyko] Cykliczne importy** → **Mitygacja:** Moduły w `src/domain/generator/` importują wyłącznie typy i stałe z `@/app/lib/data` i `@/types`, nie importują niczego ze `store.ts`.
