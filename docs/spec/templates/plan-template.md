# ARCHITECTURAL PLAN: [Nazwa Funkcjonalności / ID Zadania]

**Referencja Specyfikacji:** `spec.md`  
**Status:** DRAFT | APPROVED  
**Data:** YYYY-MM-DD  

---

## 1. Architektura i Rozbicie na Moduły (File Breakdown)

> [!NOTE]
> Zasada dekompozycji: Żaden nowo tworzony plik nie powinien przekraczać 300 linii kodu. Logika biznesowa nie może trafiać bezpośrednio do komponentów UI ani bezpośrednio do `store.ts`.

### Nowe Pliki:
* `src/domain/[moduł]/[nazwa].ts` – Czysta logika biznesowa (Pure TypeScript functions).
* `src/domain/[moduł]/__tests__/[nazwa].test.ts` – Testy jednostkowe w Vitest.
* `src/domain/[moduł]/types.ts` – Schematy Zod i wywnioskowane typy.

### Pliki Modyfikowane:
* `src/...` – Opis konkretnych zmian i funkcji integrujących.

---

## 2. Strategia Testów (Test-First / Vitest)

Przed napisaniem właściwego kodu muszą powstać testy odzwierciedlające kryteria akceptacji z `spec.md`:

| ID Testu | Scenariusz Testowy | Oczekiwany Wynik | Plik Testowy |
| :--- | :--- | :--- | :--- |
| **TC-01** | Standardowe dane wejściowe | Poprawne przetworzenie i wynik zgodny ze specyfikacją | `...test.ts` |
| **TC-02** | Przypadek brzegowy: pusta pula danych | Zgłoszenie czytelnego błędu / bezpieczny fallback | `...test.ts` |
| **TC-03** | Walidacja kontraktu Zod | Odrzucenie niepoprawnego formatu wejściowego | `...test.ts` |

---

## 3. Plan Integracji ze Stanem i UI

1. **Warstwa Domenowa:** Implementacja i zatwierdzenie czystych funkcji na zielonych testach.
2. **Warstwa Adaptera / Store:** Podpięcie nowej logiki do Zustand jako cienkiej fasady (Zustand zarządza jedynie przechowywaniem wyniku w pamięci).
3. **Warstwa UI:** Wyświetlenie zmian w komponentach z zachowaniem zasad dostępności i ergonomii mobilnej.

---

## 4. Analiza Ryzyka i Wycofanie Zmian (Rollback Strategy)

* **Co może pójść nie tak:** Potencjalne regresje lub konflikty z istniejącymi danymi.
* **Plan awaryjny (Fallback):** W razie problemów przywrócenie stanu pierwotnego poprzez Git / zachowanie kompatybilności wstecznej bez utraty danych w `localStorage`.
