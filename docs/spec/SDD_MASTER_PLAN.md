# Spec-Driven Development (SDD) – Master Plan & Playbook

**Wersja:** 5.0 (OpenSpec Engine & Zero-Regression)  
**Data:** 2026-10-21  
**Silnik SDD:** Oficjalny framework **OpenSpec (OPSX)** z interaktywnym Dashboardem (`npm run spec:view` / `openspec view`).  
**Status:** Aktywne (Single Source of Truth zarządza `openspec/`)

---

## 🏗 Architektura Pracy (Workflow z OpenSpec)

Przyjmujemy nowoczesny **GitHub Flow + OpenSpec OPSX** zoptymalizowany pod pracę 1 Developer + Agenci AI:
1. **`main` to produkcja:** Zmiany na gałęzi `main` automatycznie publikują się na produkcję (Firebase Hosting).
2. **OpenSpec Dashboard:** Interaktywna konsola `npm run spec:view` (`openspec view`) dostępna w przeglądarce podglądu specyfikacji i zadań.
3. **Standaryzowane Zmiany (Changes):** Każda faza/funkcja to pakiet w `openspec/changes/<change-name>/` (`proposal.md`, `specs/`, `design.md`, `tasks.md`).
4. **Feature Branches:** Każda zmiana OpenSpec realizowana jest na dedykowanej gałęzi (np. `fix/tech-debt-and-data`).
5. **Quality Gates & CI:** Push i PR uruchamiają weryfikację GitHub Actions (`npm run verify`: typecheck, linter, testy Vitest).
6. **Firebase Preview Channels:** Po pomyślnym CI Firebase generuje tymczasowy link Preview URL do testów na urządzeniu.
7. **Archiwizacja (`openspec archive`):** Po zatwierdzeniu przez PO zmiana jest scalana do głównej bazy `openspec/specs/`, a gałąź do `main`.
8. **Język dokumentacji i kodu:**
   - Specyfikacje, proposals, dialogi z użytkownikiem, opisy ćwiczeń i UI: **język polski (`pl`)**.
   - Kod źródłowy aplikacji, TypeScript, nazwy zmiennych, funkcji i komentarze w kodzie: **język angielski (`en`)**.
9. **Ekonomia Tokenów i Atomowe Mikro-Zadania (Token Budget First):**
   - Zakaz tworzenia wielkich, zbiorczych zadań. Duże fazy są szatkowane na małe, niezależne pakiety (np. Faza 3 dzielona na Faza 3.1, 3.2 itd.).
   - W `tasks.md` każde zadanie musi być atomowe (1 zadanie = 1 konkretny plik / 1 funkcja / 1 test) z jawną ścieżką do pliku w opisie.
   - W fazie `opsx-apply` agent skupia się wyłącznie na bieżącym zadaniu, nie czyta całego repozytorium i natychmiast oznacza checkbox `[x]`.
   - Umożliwia to natychmiastowe przerywanie i wznawianie prac na innym modelu/koncie bez utraty postępu i bez zbędnego zużycia tokenów.

---

## 🗺 Fazy Wdrożenia (Playbook)

Poniższe kroki muszą być wykonywane **sekwencyjnie**. Agent realizujący zadanie musi zatrzymać się po każdej pod-fazie i poprosić o akceptację.

### Faza 1: Fundamenty, Czystość i Tooling (Branch: `chore/setup-tooling`)
Cel: Przygotowanie siatki bezpieczeństwa. Zatrzymanie złego kodu przed opuszczeniem komputera.

- [x] **1.1 Bezpieczne usunięcie martwego kodu (Genkit):** 
  - Usunięcie zależności `@genkit-ai/google-genai`, `genkit` z `package.json`.
  - Usunięcie martwych skryptów NPM (`genkit:dev`).
  - *Zrealizowano: usunięto ~500 zbędnych pakietów.*
- [x] **1.2 Konfiguracja Lintera (ESLint):**
  - Utworzenie `.eslintrc.json` z regułami dopasowanymi do Next.js 15.
  - Zweryfikowano `npm run lint` – brak błędów blokujących.
- [x] **1.3 Instalacja środowiska Testowego (Vitest):**
  - Zainstalowano `vitest`, `@vitejs/plugin-react`, `vite-tsconfig-paths`.
  - Utworzono `vitest.config.ts` oraz sanity test `src/tests/sanity.test.ts`.
  - Zweryfikowano `npm run test` – testy przechodzą na zielono.
- [x] **1.4 Lokalne blokady (Husky & Lint-staged):**
  - Zainstalowano `husky` i `lint-staged`, skonfigurowano hook pre-commit.
- [x] **1.5 CI/CD & Firebase Preview (GitHub Actions):**
  - Wygenerowano `.github/workflows/ci.yml`, `firebase-hosting-pull-request.yml` i `firebase-hosting-merge.yml`.

### Faza 2: Dług Technologiczny i Ochrona Danych (Branch: `fix/tech-debt-and-data`)
Cel: Aplikacja musi kompilować się bez maskowania błędów, a dane użytkowników muszą być bezpieczne.

- [x] **2.1 Naprawa błędów TypeScript (Czysty typecheck):**
  - [x] 2.1.1 `EquipmentStudioSubView.tsx`: Dodanie opcjonalnego pola `opis?: string` do inline typu wyposażenia (`useMemo<EquipmentItem[]>`).
  - [x] 2.1.2 `calendar.tsx`: Dostosowanie komponentu do API `react-day-picker` v9 (`Chevron` z obsługą `orientation`).
  - [x] 2.1.3 Weryfikacja: Uruchomienie `npm run typecheck` (`tsc --noEmit`) – wynik: 0 błędów.
- [x] **2.2 Odmaskowanie kompilacji Next.js:**
  - [x] 2.2.1 Usunięcie flagi `ignoreBuildErrors: true` w `next.config.ts`.
  - [x] 2.2.2 Usunięcie flagi `ignoreDuringBuilds: true` w `next.config.ts`.
  - [x] 2.2.3 Weryfikacja: Uruchomienie `npm run build` na czysto – kompilacja produkcyjna bez błędów.
- [x] **2.3 Zustand Persist Migration (Zabezpieczenie danych i ochrona przed białym ekranem):**
  - [x] 2.3.1 Utworzenie testu migracji w Vitest (`src/tests/store-migration.test.ts`) symulującego format v0 i v1 oraz test partialize (5 testów pass).
  - [x] 2.3.2 Dodanie `version: 1` oraz funkcji `migrate()` w `store.ts` (oczyszczanie `circuit`).
  - [x] 2.3.3 Skonfigurowanie `partialize` na 16 polach stanu biznesowego, wykluczając stany ulotne (`circuit`, `activeView`, itp.).
  - [x] 2.3.4 Dodanie w interfejsie aplikacji dyskretnego monitu z przypomnieniem o możliwości wyeksportowania danych JSON.
  - [x] 2.3.5 Weryfikacja: Uruchomienie testów Vitest oraz builda produkcyjnego.

### Faza 2.5: Higiena Kodu i Czyszczenie Ostrzeżeń ESLint (Branch: `chore/lint-cleanup-and-android-compat`)
Cel: Eliminacja 41 ostrzeżeń ESLint ujawnionych po odmaskowaniu lintera, z bezwzględnym zachowaniem kompatybilności z aplikacją mobilną (Android / Capacitor).

- [x] **2.5.1 Czyszczenie martwego kodu i nieużywanych importów (Grupa A):**
  - Usunięcie nieużywanych importów ikon (`lucide-react`) oraz niepotrzebnych definicji w komponentach Studio, Timer i StationCard.
  - Dodanie `displayName` w `StationCard.tsx`.
  - Wyciszenie zmiennej `_circuit` w migracji stanu `store.ts`.
  - Weryfikacja: nienaruszalność importów `@capacitor/*` oraz obsługi przycisku sprzętowego Wstecz.
- [x] **2.5.2 Optymalizacja fontów pod tryb Offline w Androidzie:**
  - Zastąpienie zewnętrznego tagu `<link href="fonts.googleapis.com">` w `src/app/layout.tsx` wbudowanym mechanizmem `next/font/google` (`Inter`).
  - Likwidacja ostrzeżenia `@next/next/no-page-custom-font` oraz zagwarantowanie dostępności fontu na telefonie w trybie samolotowym/offline.
- [x] **2.5.3 Bezpieczny refaktoring hooków Timera i Audio (Grupa C):**
  - Zastosowanie `useCallback` i stabilnych referencji `useRef` dla `timerAudioSettings` w `GlobalIntervalTimerController.tsx` oraz `GymViewModal.tsx`.
  - Usunięcie ostrzeżeń `react-hooks/exhaustive-deps` bez wprowadzania restartów `setInterval` ani nieskończonych re-renderów w WebView.
  - Usunięcie nadmiarowych zależności w selektorach `useMemo` w widokach Studio i sal.
- [x] **2.5.4 Eliminacja typów `any` w komponentach i handlerach:**
  - Doprecyzowanie typów zdarzeń i obiektów w `GlobalIntervalTimerController`, `GymViewModal`, `ExerciseStudioView` oraz `store.ts`.
- [x] **2.5.5 Weryfikacja końcowa:**
  - `npm run verify` (`typecheck` + `lint` + `test`) kończy się wynikiem: **0 błędów i 0 ostrzeżeń (czysty linter)**.
  - Wykonanie `npm run build` potwierdzające integralność plików i eksportu statycznego `out/` dla Android Studio.

### Faza 3: Dekompozycja Algorytmów Generatora i Balans Treningowy
Cel: Rozbicie monolitycznego pliku `store.ts` (1330 linii) na czystą domenę `src/domain/generator/` z zachowaniem atomowości zadań (Token Budget First), wprowadzenie algorytmu dywersyfikacji partii mięśniowych z kaskadowym fallbackiem w dół oraz obsługa stacji oddechowych, par i rerolli.

#### Faza 3.1: Ekstrakcja Reguł Domenowych i Doboru Stref (Change: `phase-3-1-generator-rules`, Branch: `refactor/generator-domain-rules`)
Cel: Wydzielenie czystych funkcji pomocniczych, weryfikacji sprzętu, filtrowania ćwiczeń i alokacji stref ze `store.ts` do warstwy domeny bez modyfikacji stanu aplikacji.
- [ ] **3.1.1 [src/domain/generator/types.ts]:** Definicja interfejsów domenowych parametrów losowania, kontekstu sali, stref i stacji.
- [ ] **3.1.2 [src/domain/generator/equipmentRules.ts]:** Ekstrakcja czystych funkcji weryfikacji sprzętu (`ensureEquipment`, `getEquipmentString`, `canExerciseBeShared`).
- [ ] **3.1.3 [src/tests/domain/equipmentRules.test.ts]:** Testy jednostkowe Vitest dla reguł sprzętowych sali i stacji.
- [ ] **3.1.4 [src/domain/generator/exerciseFilter.ts]:** Ekstrakcja `getValidExercisesForZone` jako czystej funkcji z Dependency Injection (wstrzykiwana baza ćwiczeń, obsługa reguły pojedynczej flagi `hasFlagAlready`).
- [ ] **3.1.5 [src/tests/domain/exerciseFilter.test.ts]:** Testy jednostkowe Vitest dla filtrowania stref, poziomów i ograniczeń.
- [ ] **3.1.6 [src/domain/generator/zoneSelector.ts]:** Ekstrakcja doboru stref i limitów pojemności (klatka RIG na pozycji 2, forcedZones, dynamiczne limity stref elastycznych `floorLimit`).
- [ ] **3.1.7 [src/tests/domain/zoneSelector.test.ts]:** Testy jednostkowe Vitest algorytmu przydziału i sortowania stref sali.
- [ ] **3.1.8 [src/domain/generator/index.ts]:** Publiczny barrel export oraz kompatybilny re-eksport w `src/app/lib/store.ts` dla zachowania ciągłości kodu UI.

#### Faza 3.2: Balans Mięśniowy, Kaskada i Strategie Losowania (Change: `phase-3-2-generator-strategies`, Branch: `feat/generator-balancing-strategies`)
Cel: Nowy algorytm wyboru ćwiczeń zapobiegający powtarzaniu tych samych partii mięśniowych, obsługa stacji oddechowych i par oraz czyste strategie losowania obwodu, treningu synchronicznego i rerolli.
- [ ] **3.2.1 [src/domain/generator/muscleBalancing.ts]:** Heurystyka selekcji zrównoważonej (`segment_id` i `glowne_partie`) preferująca naprzemienność grup mięśniowych (np. PULL po PUSH).
- [ ] **3.2.2 [src/domain/generator/cascadeFallback.ts]:** Kaskadowy fallback przy małej puli ćwiczeń: (1) bezpieczne obniżenie trudności o 1 poziom w dół (z poszanowaniem `isStrictDifficulty`), (2) dopuszczenie powtórzenia partii, (3) duplikat ćwiczenia w ostateczności.
- [ ] **3.2.3 [src/domain/generator/pairStationStrategy.ts]:** Logika doboru `exerciseB` dla stacji podwójnych (zgodność partii mięśniowej, tryb `W_Parze`, współdzielenie sprzętu).
- [ ] **3.2.4 [src/domain/generator/circuitStrategy.ts]:** Czysta strategia `generateCircuitStrategy` uwzględniająca stacje oddechowe co 3 stacje (`(idx + 1) % 3 === 0`), balans mięśniowy oraz wstrzykiwane źródło losowości (`randomFn`).
- [ ] **3.2.5 [src/domain/generator/synchronizedStrategy.ts]:** Czysta strategia `generateSynchronizedStrategy` z balansem segmentów dla treningu grupowego.
- [ ] **3.2.6 [src/domain/generator/rerollStrategy.ts]:** Ekstrakcja czystej logiki rerollu i zmiany strefy pojedynczej stacji z zachowaniem balansu i stacji oddechowych.
- [ ] **3.2.7 [src/tests/domain/generatorStrategies.test.ts]:** Testy Vitest sprawdzające naprzemienność partii, stacje oddechowe, stacje w parach, determinizm losowości oraz kaskadę fallbacków.

#### Faza 3.3: Integracja ze Store i Czyszczenie Monolitu (Change: `phase-3-3-store-integration`, Branch: `refactor/store-generator-integration`)
Cel: Podpięcie gotowych algorytmów domenowych do Zustand Store oraz odchudzenie monolitu.
- [ ] **3.3.1 [src/app/lib/store.ts]:** Zastąpienie wewnętrznych algorytmów losowania, rerolli i konfliktów importami z `src/domain/generator/`.
- [ ] **3.3.2 [src/components/StationCard.tsx]:** Przełączenie importu `getValidExercisesForZone` bezpośrednio na moduł domenowy.
- [ ] **3.3.3 [Weryfikacja jakości]:** Uruchomienie `npm run verify` (0 błędów, 0 ostrzeżeń) oraz builda produkcyjnego Next.js z eksportem `out/` pod Android Studio.

### Faza 4: Pierwszy Projekt SDD (Branch: `feat/todo-31-deduplication`)
Cel: Zastosowanie pełnego SDD do nowego feature'a.

- [ ] **4.1 Planowanie:** Architekt przygotowuje specyfikację do zadania "Deduplikacja po rdzeniu nazwy" z `todo.md`.
- [ ] **4.2 TDD:** Coder najpierw pisze testy do deduplikacji w Vitest.
- [ ] **4.3 Implementacja:** Coder pisze kod spełniający testy.
- [ ] **4.4 Wdrożenie:** Utworzenie PR, weryfikacja przez Firebase Preview, akceptacja PO.

---
*Dokument ten jest absolutnym punktem odniesienia (Single Source of Truth) dla wszystkich agentów AI modyfikujących to repozytorium.*
