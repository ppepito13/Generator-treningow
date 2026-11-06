# Proposal: Obowiązkowa Bramka Weryfikacji Manualnej dla Agentów AI (#54)

## Why

Dotychczasowy proces SDD w repozytorium zakładał natychmiastowe przejście od implementacji (`/opsx-apply`) i zaliczenia bramki automatycznej (`npm run verify`) bezpośrednio do archiwizacji (`/opsx-archive`), commita, pusha i generowania linku do Pull Requesta. Prowadziło to do powtarzających się sytuacji, w których subtelne defekty wizualne (np. przyciski wystające poza kafelek na małym ekranie telefonu), ograniczenia przeglądarek mobilnych (np. blokady okien popup w Safari na iOS) lub specyficzne zachowania Androida były wykrywane przez użytkownika dopiero po scaleniu lub po wypchnięciu gotowej zmiany do zdalnego repozytorium.

Niniejsza zmiana formalizuje nienegocjowalny etap **Bramki Weryfikacji Manualnej (Human-in-the-Loop Test Gate)**, zobowiązujący każdego agenta AI do przygotowania czytelnej instrukcji testów manualnych krok po kroku i powstrzymania się przed archiwizacją aż do uzyskania jednoznacznej akceptacji dewelopera.

## What Changes

- **Nowy krok w cyklu SDD w `AGENTS.md` (Krok 4):**
  - **Bezwzględny zakaz samowolnej archiwizacji:** Zakaz wywoływania `/opsx-archive`, tworzenia commitów na gałęzi i pushowania kodu przed otrzymaniem wyraźnego potwierdzenia od użytkownika (np. „działa”, „przetestowane”).
  - **Obowiązek generowania instrukcji testów manualnych:** Każdy agent kończący `/opsx-apply` ma obowiązek przedstawić użytkownikowi gotowe komendy uruchomienia (np. `npm run dev`, `npx serve out -p 9002`, `npx cap sync android`) oraz precyzyjne kroki przeklikania w zależności od charakteru zadania (Web/UI, Android/Capacitor, logika domenowa).
  - **Pętla poprawek:** W przypadku zgłoszenia uwag przez użytkownika podczas testów manualnych, agent kontynuuje poprawki w ramach tej samej otwartej zmiany OpenSpec bez przedwczesnego zamykania cyklu.
- **Dedykowany plik reguł agenta w `.agents/rules/manual-testing-gate.md`:**
  - Utworzenie zwięzłej, bezpośredniej reguły OpenSpec dla agentów AI, gwarantującej respektowanie bramki manualnej niezależnie od silnika i kontekstu.

## Capabilities

### New Capabilities
Brak. Zmiana dotyczy reguł procesu deweloperskiego i instrukcji agentów AI (`skip_specs: true`).

### Modified Capabilities
Brak. Zachowanie i wymagania samej aplikacji użytkownika końcowego pozostają nienaruszone.

## Impact

- **Dokumentacja procesu:** Modyfikacja pliku [`AGENTS.md`](file:///c:/Users/lewan/Dev/Generator-treningow/AGENTS.md).
- **Reguły OpenSpec:** Dodanie nowego pliku [`.agents/rules/manual-testing-gate.md`](file:///c:/Users/lewan/Dev/Generator-treningow/.agents/rules/manual-testing-gate.md).
- **Kod produkcyjny:** Brak wpływu na `src/`, zależności npm oraz statyczny build aplikacji.

