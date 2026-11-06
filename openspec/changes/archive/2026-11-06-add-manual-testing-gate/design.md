# Design: Obowiązkowa Bramka Weryfikacji Manualnej dla Agentów AI (#54)

## Context

Plik [`AGENTS.md`](file:///c:/Users/lewan/Dev/Generator-treningow/AGENTS.md) jest najwyższym autorytetem w repozytorium definiującym reguły pracy dla wszystkich modeli AI (wstrzykiwany jako systemowa reguła `<RULE>` do promptów). Obecna 4-etapowa sekwencja SDD nie posiadała jawnego punktu stopu pomiędzy implementacją (`/opsx-apply`) a archiwizacją (`/opsx-archive`) i utworzeniem PR, co uniemożliwiało użytkownikowi weryfikację zmian wizualnych i zachowania aplikacji przed wypchnięciem kodu do GitHuba.

## Goals / Non-Goals

**Goals:**
- Formalne dodanie kroku **`4. Obowiązkowa Bramka Weryfikacji Manualnej (Human-in-the-Loop Test Gate)`** w sekcji Żelaznej Zasady Procesu w [`AGENTS.md`](file:///c:/Users/lewan/Dev/Generator-treningow/AGENTS.md).
- Zdefiniowanie bezwzględnego zakazu samowolnej archiwizacji, commita i pusha przed jednoznaczną akceptacją człowieka.
- Standaryzacja zawartości instrukcji testów manualnych: gotowe polecenia uruchomieniowe w blokach kodu, adresy, precyzyjne kroki przeklikania z podziałem na Web, Android/Capacitor oraz logikę domenową.
- Utworzenie pliku reguły OpenSpec [`.agents/rules/manual-testing-gate.md`](file:///c:/Users/lewan/Dev/Generator-treningow/.agents/rules/manual-testing-gate.md).

**Non-Goals:**
- Modyfikacja kodu produkcyjnego aplikacji (`src/`).
- Zastępowanie automatycznych testów jednostkowych i lintera — bramka manualna jest etapem uzupełniającym po zaliczeniu `npm run verify`.

## Decisions

### Decyzja 1: Umiejscowienie bramki manualnej jako kroku 4 w `AGENTS.md`
- **Wybór:** Wprowadzenie dedykowanego, pełnoprawnego kroku `4. 🛑 Obowiązkowa Bramka Weryfikacji Manualnej` tuż po `3. Izolowana implementacja (/opsx-apply)` i przesunięcie `5. Domknięcie cyklu, archiwizacja OpenSpec, Pull Request i pełne sprzątanie`.
- **Alternatywa odrzucona:** Pozostawienie decyzji o testach jako podpunktu 3b lub nieformalnego zalecenia w kroku zamykającym. (Odrzucono: osobny numerowany krok jednoznacznie podkreśla rangę i samodzielność etapu akceptacji przez człowieka).

### Decyzja 2: Podwójne zabezpieczenie (AGENTS.md + .agents/rules/)
- **Wybór:** Wpisanie reguły zarówno do głównego `AGENTS.md`, jak i do dedykowanego pliku reguł OpenSpec `.agents/rules/manual-testing-gate.md`.
- **Uzasadnienie:** `AGENTS.md` jest ładowany globalnie przez reguły systemowe środowiska, a `.agents/rules/` jest natywnie interpretowany przez CLI OpenSpec w workflow `/opsx-apply`.

### Decyzja 3: Standaryzacja formatu instrukcji testów
Każda instrukcja kończąca implementację musi zawierać:
1. Blok kodu z poleceniem uruchomienia (np. `npm run dev`, `npx serve out -p 9002` lub `npx cap sync android`).
2. Bezpośredni link / adres do otwarcia (np. `http://localhost:9002`).
3. Punktowaną checklistę kluczowych akcji i widoków do sprawdzenia.
4. Jawne zatrzymanie wypowiedzi i oczekiwanie na potwierdzenie użytkownika.

## Risks / Trade-offs

- **[Ryzyko: Agent zapomina o bramce i przechodzi do archiwizacji]** → *Mitigacja:* Sformułowanie reguły w trybie imperatywnym z nagłówkiem ostrzegawczym `🛑 BEZWZGLĘDNY ZAKAZ SAMOWOLNEJ ARCHIWIZACJI` oraz wymogiem jawnego warunku przejścia (akceptacja człowieka).
- **[Ryzyko: Zbyt długa lub nieadekwatna instrukcja przy drobnych poprawkach]** → *Mitigacja:* Użytkownik zachowuje pełne prawo do wydania polecenia pominięcia instrukcji („pomiń testy manualne”) lub jej zignorowania.

