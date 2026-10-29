# Instrukcje i Zasady dla Agentów AI (AGENTS.md)

Dokument ten definiuje **bezwzględne reguły pracy dla wszystkich agentów AI** operujących w tym repozytorium (niezależnie od modelu, czatu czy używanego konta).

---

## 🛑 ŻELAZNA ZASADA PROCESU: Zero Kodu Bez OpenSpec & Obowiązkowe `openspec-explore`

W tym repozytorium **ŻADEN agent AI nie ma prawa napisać ani zmienić ani jednej linijki kodu produkcyjnego** (nawet 1-linijkowej poprawki typu hotfix czy drobnicy) bez przejścia pełnego cyklu SDD (Spec-Driven Development):

1. **Obowiązkowy etap wstępny: `openspec-explore` (Deep Thinking & Pre-flight Check):**
   - Zanim powstanie propozycja zmiany (`/opsx-propose`) i jakiekolwiek pliki specyfikacji, agent **MUSI** przeprowadzić dogłębną eksplorację w trybie `openspec-explore`.
   - **Cele eksploracji:**
     * **Audyt bazy i kodu:** Przeszukanie repozytorium pod kątem istniejących mechanizmów, by **wykluczyć jakąkolwiek duplikację** (np. reguł filtrowania, losowania, inwentarza).
     * **Analiza konfliktów i pułapek:** Wykrycie sprzecznych warunków, "pętli śmierci" (np. fallbacków zapętlających się w nieskończoność lub wykluczających 100% puli) oraz wąskich gardeł sprzętowych.
     * **Wykrycie braków i przypadków brzegowych (edge cases):** Zadanie użytkownikowi kluczowych pytań architektonicznych i domenowych przed podjęciem decyzji implementacyjnych.
   - **Warunek przejścia:** Dopiero po jednoznacznej akceptacji ustaleń z eksploracji przez Użytkownika wolno przejść do etapu `/opsx-propose`.

2. **Czysta zmiana OpenSpec (`/opsx-propose`):**
   - Utworzenie zmiany ze ściśle atomowymi mikro-zadaniami (1 zadanie = 1 plik / 1 funkcja / 1 test z jawną ścieżką).

3. **Izolowana implementacja (`/opsx-apply`):**
   - Kodowanie wyłącznie zadań z `tasks.md`, realizacja krok po kroku, natychmiastowe oznaczanie `[x]` i lokalna weryfikacja.

4. **Domknięcie cyklu, bramka jakości i Pull Request:**
   - Weryfikacja `npm run verify` (**0 błędów TypeScript, 0 błędów ESLint, 100% testów Vitest zielonych**) oraz `npm run build`.
   - Aktualizacja `todo.md` oraz `CHANGELOG.md` w sekcji `[Unreleased]`.
   - Archiwizacja `/opsx-archive` -> aktualizacja głównych specyfikacji -> commit na dedykowanej gałęzi -> push gałęzi do `origin`.
   - **Obowiązkowy bezpośredni link do Pull Requesta:** Agent **MUSI** w wiadomości końcowej podać bezpośredni, klikalny link Markdown:
     `👉 [Kliknij tutaj, aby utworzyć Pull Request na GitHubie](https://github.com/ppepito13/Generator-treningow/pull/new/<nazwa-gałęzi>)`
     pozwalający użytkownikowi zweryfikować zdalne CI GitHub Actions i scalić PR jednym kliknięciem.
   - Po potwierdzeniu zmergowania przez użytkownika: wykonanie `git pull origin main` i usunięcie gałęzi lokalnej.

---

## ⚡ GŁÓWNA ZASADA: Ekonomia Tokenów i Atomowe Mikro-Zadania (Token Budget First)

Użytkownik regularnie przełącza silniki/konta lub wznawia pracę po czyszczeniu kontekstu. Aby uniknąć przepalania limitów tokenów na ponowne analizowanie repozytorium i niepotrzebne czytanie dziesiątek plików, **każdy agent musi bezwzględnie stosować poniższe reguły**:

### 1. Maksymalne szatkowanie zadań (Micro-Tasks)
- **Zakaz tworzenia wielkich, zbiorczych zadań** (np. *"Wyczyść importy we wszystkich plikach"*, *"Przepisz cały store"*).
- Każde zadanie w `tasks.md` musi być **atomową jednostką pracy**, którą model może wykonać w **1–2 krokach/edycjach**.
- **1 zadanie = 1 konkretny plik / 1 wyizolowana funkcja / 1 test**.
- Każde zadanie w `tasks.md` **MUSI zawierać jawną ścieżkę do pliku** w formacie:
  `- [ ] X.Y [ścieżka/do/pliku.ts] Konkretny, zwięzły opis co należy zmienić`

### 2. Izolacja kontekstu i zakaz nadmiarowego skanowania
- **Podczas `/opsx-apply` NIE czytaj całego projektu**, nie listuj wszystkich katalogów ani nie analizuj architektury od zera.
- Twój jedyny punkt startowy to:
  1. `openspec instructions apply --change "<name>" --json` lub plik `tasks.md`.
  2. Sprawdzenie pierwszego niezrealizowanego zadania `[ ]`.
  3. Otwarcie **wyłącznie pliku wskazanego w tym zadaniu** i wprowadzenie zmiany.
- Nie czytaj innych plików, o ile nie są bezpośrednio importowane lub wymagane do spełnienia tego konkretnego zadania.

### 3. Natychmiastowy Checkpoint (Oznaczanie `[x]`)
- Zaraz po edycji pliku i sprawdzeniu, **natychmiast oznacz zadanie jako `[x]` w `tasks.md`**.
- Użytkownik musi mieć możliwość przerwania czatu w dowolnym momencie – kolejny agent po podłączeniu spojrzy na `tasks.md` i natychmiast podejmie kolejne zadanie bez powtarzania tego, co już zrobiono.

### 4. Szatkowanie dużych Faz na małe Zmiany OpenSpec (Changes)
- Jeśli faza w `SDD_MASTER_PLAN.md` jest duża (np. Faza 3: Dekompozycja store), **nie twórz jednej olbrzymiej zmiany**.
- Podziel ją na mikro-fazy / osobne changes (np. `phase-3-1-generator-types`, `phase-3-2-circuit-strategy`, `phase-3-3-sync-strategy`).
- Lepiej zrealizować 3 małe zmiany z 3-4 precyzyjnymi zadaniami każda, niż jedną z 15 zadaniami, która wyczerpie okno kontekstowe w połowie.

---

## 📝 Obowiązkowe Śledzenie w TODO i CHANGELOG
W tym projekcie niedopuszczalne jest gubienie kontekstu biznesowego. Każdy agent musi bezwzględnie przestrzegać poniższego schematu śledzenia:
1. **Rejestracja w `todo.md`:** Każda nowa funkcja, poprawka lub usprawnienie musi mieć swoje numerowane zadanie na liście otwartych zadań w `todo.md`.
2. **Aktualizacja przed archiwizacją:** Zanim zmiana zostanie zarchiwizowana (`/opsx-archive`) i zacomitowana:
   - Zadanie w `todo.md` musi zostać oznaczone jako `[x]` (w sekcji `## ✅ Zakończone` ➔ `### [Unreleased]`).
   - Do pliku `CHANGELOG.md` w sekcji `## [Unreleased]` należy dodać zwięzły, zrozumiały dla użytkownika opis biznesowy w odpowiedniej kategorii (`### Dodano`, `### Zmieniono` lub `### Naprawiono`) zgodnie ze standardem *Keep a Changelog*.

---

## 🛠 Standardy Techniczne Projektu
1. **Bramka Jakości:** Kod musi przechodzić `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) z wynikiem **0 błędów i 0 ostrzeżeń**.
2. **Kompatybilność z Android / Capacitor:** Aplikacja jest eksportowana statycznie do Android Studio (`out/`). Zakaz wprowadzania zewnętrznych CDN dla fontów i skryptów; fonty muszą działać w trybie 100% offline (`next/font/google`).
3. **Język:**
   - Specyfikacje, opisy zadań, komunikaty commitów i dialogi: **język polski (`pl`)**.
   - Kod, nazwy zmiennych, typy TypeScript i komentarze w kodzie: **język angielski (`en`)**.
