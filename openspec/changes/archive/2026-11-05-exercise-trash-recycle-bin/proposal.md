# Proposal: Kosz Usuniętych Ćwiczeń (Trash / Recycle Bin) z 7-Dniową Retencją

## Why
Obecnie po usunięciu autorskiego ćwiczenia w Studio, Auto-Sync w tle w ciągu 2,5 sekundy wysyła nagrobek (`isDeleted: true`) na Dysk Google, uniemożliwiając użytkownikowi łatwe wycofanie pomyłki lub odzyskanie skasowanego ćwiczenia. Wprowadzenie dedykowanej zakładki Kosza w Studio z 7-dniową retencją pozwala przekształcić istniejący mechanizm nagrobków w przyjazną dla trenera funkcję odzyskiwania danych z natychmiastowym przyciskiem „Cofnij” i bezpiecznym trwałym usuwaniem.

## What Changes
- **Nowa 4. zakładka filtrów w Studio Ćwiczeń (`Usunięte (X)`):** Obok zakładek *Wszystkie*, *Wbudowane* i *Zapisane lokalnie* pojawia się zakładka *Usunięte* z dynamicznym licznikiem ćwiczeń w koszu.
- **7-dniowa retencja:** Wyświetlanie w koszu wyłącznie ćwiczeń usuniętych nie dawniej niż 7 dni temu (`Date.now() - updatedAt <= 7 dni`).
- **Karty ćwiczeń w Koszu:** Dedykowany widok z informacją o dacie usunięcia, liczniku pozostałych dni (np. *„Pozostało: 6 dni”*), zielonym przyciskiem *„Przywróć”* oraz czerwonym *„Usuń trwale”*.
- **Pasek informacyjny i „Opróżnij kosz”:** Baner z informacją o automatycznym wygasaniu po 7 dniach, przycisk czyszczenia całego kosza z modalem potwierdzenia oraz estetyczny stan pusty (Empty State).
- **Akcja „Cofnij” w Toaście:** Po usunięciu ćwiczenia dymek Toast zawiera bezpośredni przycisk `Cofnij` (ToastAction) cofający usunięcie jednym kliknięciem.
- **Rozszerzenie Zustand Store o akcje kosza:** Metody `restoreCustomExercise`, `permanentlyDeleteCustomExercise` (zabezpieczenie flagą `isPurged: true` chroniące przed zombie records) oraz `emptyTrash`.
- **Gwarancja 100% izolacji:** Wykluczenie usuniętych pozycji ze wszystkich pul losowania generatora obwodów i eksportu bazy.

## Capabilities

### Modified Capabilities
- `data-storage`: Wprowadzenie metod zarządzania cyklem życia nagrobków w Koszu (przywracanie, flaga `isPurged`, retencja 7 dni, opróżnianie kosza).
- `ui-components`: Czwarta zakładka „Usunięte (X)” w filtrach Studio Ćwiczeń, karty ćwiczeń w koszu, modal potwierdzenia opróżnienia kosza oraz akcja „Cofnij” w Toaście powiadomienia.

## Impact
- **Store & Typy:** `src/app/lib/store.ts`, `src/types/sync.ts`, `src/domain/sync/syncMetadata.ts`.
- **UI:** `src/components/ExerciseStudioView.tsx`.
- **Testy:** Rozszerzenie testów store (`src/tests/store-sync.test.ts`), testów UI (`src/tests/ui/ExerciseStudioViewTombstone.test.tsx`) oraz dodanie dedykowanych testów kosza.

