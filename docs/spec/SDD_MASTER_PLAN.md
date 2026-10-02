# Spec-Driven Development (SDD) – Master Plan & Playbook

**Wersja:** 4.0 (Actionable & Zero-Regression)  
**Data:** 2026-10-02  
**Kontekst:** Przejście z kodu wygenerowanego (vibe-coding) do pełnoprawnego, stabilnego środowiska Inżynierii Oprogramowania z wykorzystaniem agentów AI.
**Status:** Aktywne (Single Source of Truth)

---

## 🏗 Architektura Pracy (Workflow)

Przyjmujemy nowoczesny **GitHub Flow** zoptymalizowany pod pracę 1 Developer + Agenci AI:
1. **`main` to produkcja:** Zmiany na gałęzi `main` automatycznie publikują się na produkcję (Firebase Hosting).
2. **Feature Branches:** Każda nowa funkcja, naprawa lub faza z tego planu powstaje na osobnej gałęzi (np. `feat/setup-vitest`).
3. **Pull Requests (PR):** Po zakończeniu zadania tworzymy PR.
4. **Automatyzacja CI (Quality Gates):** Otwarcie PR uruchamia GitHub Actions: sprawdza TS, linter i odpala testy Vitest.
5. **Firebase Preview Channels:** Jeśli CI przejdzie pomyślnie, Firebase automatycznie wygeneruje tymczasowy link (Preview URL). Product Owner wchodzi, klika, upewnia się, że działa, i akceptuje PR.
6. **Rollback:** Git pamięta wszystko. Usunięcie jakiegokolwiek kodu jest w 100% odwracalne poleceniem `git revert` lub powrotem do starego commitu.

---

## 🗺 Fazy Wdrożenia (Playbook)

Poniższe kroki muszą być wykonywane **sekwencyjnie**. Agent realizujący zadanie musi zatrzymać się po każdej pod-fazie i poprosić o akceptację.

### Faza 1: Fundamenty, Czystość i Tooling (Branch: `chore/setup-tooling`)
Cel: Przygotowanie siatki bezpieczeństwa. Zatrzymanie złego kodu przed opuszczeniem komputera.

- [ ] **1.1 Bezpieczne usunięcie martwego kodu (Genkit):** 
  - Usunięcie zależności `@genkit-ai/google-genai`, `genkit` z `package.json`.
  - Usunięcie martwych skryptów NPM (`genkit:dev`).
  - *Zabezpieczenie: Zmiana robiona na branchu, odwracalna w 1 sekundę.*
- [ ] **1.2 Konfiguracja Lintera (ESLint):**
  - Utworzenie jawnego pliku `eslint.config.mjs` lub `.eslintrc.json`.
  - Uruchomienie `npm run lint` i zmapowanie ewentualnych ostrzeżeń.
- [ ] **1.3 Instalacja środowiska Testowego (Vitest):**
  - Komenda: `npm i -D vitest @vitejs/plugin-react jsdom`
  - Utworzenie `vitest.config.ts` (z obsługą aliasów Next.js `@/*`).
  - Stworzenie pierwszego, prostego testu sprawdzającego środowisko (`src/tests/sanity.test.ts`).
- [ ] **1.4 Lokalne blokady (Husky & Lint-staged):**
  - Komenda: `npx husky init` oraz `npm i -D lint-staged`
  - Konfiguracja hooka pre-commit: musi pomyślnie przejść `tsc --noEmit` oraz testy.
- [ ] **1.5 CI/CD & Firebase Preview (GitHub Actions):**
  - Wygenerowanie workflow przez `firebase init hosting:github` (wymaga interakcji usera).
  - Skonfigurowanie pliku YAML, aby przed deployem uruchamiał Quality Gates.

### Faza 2: Dług Technologiczny i Ochrona Danych (Branch: `fix/tech-debt-and-data`)
Cel: Aplikacja musi kompilować się bez maskowania błędów, a dane użytkowników muszą być bezpieczne.

- [ ] **2.1 Naprawa błędów TypeScript:**
  - `EquipmentStudioSubView.tsx`: Dodanie brakujących pól (np. `opis`) do typów.
  - `calendar.tsx`: Aktualizacja API pod nowe wymogi `react-day-picker`.
- [ ] **2.2 Odmaskowanie błędów kompilacji:**
  - W `next.config.ts` usunięcie flag: `ignoreBuildErrors: true` i `ignoreDuringBuilds: true`.
  - Upewnienie się, że `npm run build` przechodzi na czysto.
- [ ] **2.3 Zustand Persist Migration (Zabezpieczenie localStorage):**
  - Modyfikacja pliku `store.ts` (konfiguracja `persist`):
    - Dodanie numeru `version: 1`.
    - Dodanie funkcji `migrate` do obsługi starych schematów bez niszczenia bazy.
    - Opcjonalnie: Dodanie do interfejsu aplikacji paska z ostrzeżeniem "Wkrótce duża aktualizacja – wyeksportuj swoje dane z ustawień".

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
