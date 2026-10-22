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

- [ ] **2.5.1 Audyt i czyszczenie nieużywanych importów i zmiennych (Grupa A):**
  - Usunięcie martwych importów ikon (`lucide-react`) oraz nieużywanych definicji w komponentach Studio, Timer i StationCard.
  - Weryfikacja: Upewnienie się, że żaden import/kod związany z integracją natywną (np. `@capacitor/app`, obsługa przycisku Wstecz, storage Androida) nie został usunięty.
- [ ] **2.5.2 Typowanie zdarzeń i eliminacja `any` (Grupa B):**
  - Zamiana luźnych typów `any` w handlerach i modalach na precyzyjne typy TypeScript.
- [ ] **2.5.3 Bezpieczny przegląd `react-hooks/exhaustive-deps` (Grupa C - Zegar i Audio):**
  - Analiza zależności w `GlobalIntervalTimerController.tsx` oraz `GymViewModal.tsx` pod kątem działania timera w tle i odtwarzania dźwięków TTS w środowisku mobilnym (Android WebView).
  - Poprawa brakujących lub nadmiarowych zależności bez ryzyka nieskończonych re-renderów czy zrywania odliczania na telefonie.
- [ ] **2.5.4 Weryfikacja końcowa:**
  - `npm run verify` (typecheck + lint + test) musi zakończyć się wynikiem: 0 błędów, 0 ostrzeżeń.
  - Sprawdzenie `npx cap sync` i integralności statycznego exportu pod Android Studio.

### Faza 3: Dekompozycja Monolitu (Branch: `refactor/store-decomposition`)
Cel: Rozbicie pliku `store.ts` (1275 linii) w sposób bezpieczny. Wstrzymujemy się z testami UI, skupiamy się na logice.

- [ ] **3.1 Dependency Injection:**
  - Modyfikacja głównych algorytmów (`generateCircuitStrategy`, `generateSynchronizedStrategy`), aby przyjmowały listę ćwiczeń jako argument, a nie pobierały jej wprost z `useAppStore.getState()` (usunięcie cyklicznych zależności).
- [ ] **3.2 Ekstrakcja do warstwy domeny:**
  - Przeniesienie wyizolowanych generatorów do folderu `src/domain/generator/`.
- [ ] **3.3 Testy algorytmów (Business Logic Tests):**
  - Napisanie szczegółowych testów w Vitest dla wyciągniętych generatorów, sprawdzających skrajne przypadki losowania.

### Faza 4: Pierwszy Projekt SDD (Branch: `feat/todo-31-deduplication`)
Cel: Zastosowanie pełnego SDD do nowego feature'a.

- [ ] **4.1 Planowanie:** Architekt przygotowuje specyfikację do zadania "Deduplikacja po rdzeniu nazwy" z `todo.md`.
- [ ] **4.2 TDD:** Coder najpierw pisze testy do deduplikacji w Vitest.
- [ ] **4.3 Implementacja:** Coder pisze kod spełniający testy.
- [ ] **4.4 Wdrożenie:** Utworzenie PR, weryfikacja przez Firebase Preview, akceptacja PO.

---
*Dokument ten jest absolutnym punktem odniesienia (Single Source of Truth) dla wszystkich agentów AI modyfikujących to repozytorium.*
