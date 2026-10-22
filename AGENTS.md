# Instrukcje i Zasady dla Agentów AI (AGENTS.md)

Dokument ten definiuje **bezwzględne reguły pracy dla wszystkich agentów AI** operujących w tym repozytorium (niezależnie od modelu, czatu czy używanego konta).

---

## ⚡ GŁÓWNA ZASADA: Ekonomia Tokenów i Atomowe Mikro-Zadania (Token Budget First)

Użytkownik regularnie przełącza silniki/konta lub wznawia pracę po czyszczeniu kontekstu. Aby uniknąć przepalania limitów tokenów na ponowne analizowanie repozytorium i niepotrzebne czytanie dziesiątek plików, **każdy agent musi bezwzględnie stosować poniższe reguły**:

### 1. Maksymalne szatkowanie zadań (Micro-Tasks)
- **Zakaz tworzenia wielkich, zbiorczych zadań** (np. *"Wyczyść importy we wszystkich plikach"*, *"Przepisz cały store"*).
- Każde zadanie w `tasks.md` musi być **atomową jednostką pracy**, którą model może wykonać w **1–2 krokach/edycjach**.
- **1 zadanie = 1 konkretny plik / 1 wyizolowana funkcja / 1 test**.
- Każde zadanie w `tasks.md` **MUDI zawierać jawną ścieżkę do pliku** w formacie:
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

## 🛠 Standardy Techniczne Projektu
1. **Bramka Jakości:** Kod musi przechodzić `npm run verify` (`tsc --noEmit`, `next lint`, `vitest run`) z wynikiem **0 błędów i 0 ostrzeżeń**.
2. **Kompatybilność z Android / Capacitor:** Aplikacja jest eksportowana statycznie do Android Studio (`out/`). Zakaz wprowadzania zewnętrznych CDN dla fontów i skryptów; fonty muszą działać w trybie 100% offline (`next/font/google`).
3. **Język:**
   - Specyfikacje, opisy zadań, komunikaty commitów i dialogi: **język polski (`pl`)**.
   - Kod, nazwy zmiennych, typy TypeScript i komentarze w kodzie: **język angielski (`en`)**.
