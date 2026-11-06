# Tasks

## 1. Aktualizacja nadrzędnych instrukcji dla agentów AI

- [x] 1.1 [AGENTS.md] Dodać pełnoprawny krok `4. 🛑 Obowiązkowa Bramka Weryfikacji Manualnej (Human-in-the-Loop Test Gate)` do sekcji Żelaznej Zasady Procesu z twardym zakazem samowolnej archiwizacji przed akceptacją człowieka oraz standaryzacją instrukcji testów krok po kroku.
- [x] 1.2 [AGENTS.md] Zaktualizować opis kroku `5. Domknięcie cyklu` w sekcji Żelaznej Zasady Procesu, wskazując, że archiwizacja `/opsx-archive`, commit i PR mogą nastąpić wyłącznie po pomyślnym zakończeniu etapu 4.

## 2. Utworzenie reguły OpenSpec dla agentów

- [x] 2.1 [.agents/rules/manual-testing-gate.md] Utworzyć plik reguły OpenSpec definiujący imperatywne wytyczne dla agentów AI w zakresie formatu instrukcji testów manualnych (komendy, linki, checklista) oraz zatrzymania procesu w `/opsx-apply`.

## 3. Weryfikacja spójności repozytorium

- [x] 3.1 [npm run verify] Uruchomić pełną bramkę jakości (`tsc --noEmit`, `next lint`, `vitest run`) w celu potwierdzenia 0 błędów i 100% zdanych testów w repozytorium.

