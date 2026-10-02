# TASK LIST: [Nazwa Funkcjonalności / ID Zadania]

**Referencje:** `spec.md`, `plan.md`  
**Status Zadań:** 0% ukończono  

---

## Faza 1: Kontrakty i Testy (TDD - Test Driven Development)

- [ ] **T1.1 [Zod & Typy]:** Utworzenie schematów Zod i typów TypeScript w dedykowanym module domenowym.
  * *Wskaźnik zaliczenia:* Schematy eksportują poprawne typy, kompilacja przechodzi bez błędów.
- [ ] **T1.2 [Szkielet Testów]:** Utworzenie pliku testowego Vitest z przypadkami TC-01, TC-02, TC-03.
  * *Wskaźnik zaliczenia:* Testy uruchamiają się i failują z oczekiwanego powodu (Red phase).

---

## Faza 2: Implementacja Czystej Logiki Domenowej

- [ ] **T2.1 [Logika Bazowa]:** Implementacja funkcji biznesowej w czystym TypeScript bez zależności UI.
  * *Wskaźnik zaliczenia:* Wszystkie testy jednostkowe przechodzą na zielono (`vitest run`).
- [ ] **T2.2 [Obsługa Przypadków Brzegowych]:** Implementacja zabezpieczeń przed pustymi danymi i błędnymi wejściami.
  * *Wskaźnik zaliczenia:* Testy przypadków brzegowych przechodzą na zielono.

---

## Faza 3: Integracja z Aplikacją (Store & UI)

- [ ] **T3.1 [Adapter Store]:** Podpięcie funkcji domenowej do odpowiedniego wycinka stanu Zustand (jako delegacja do domeny).
  * *Wskaźnik zaliczenia:* Stan aplikacji aktualizuje się poprawnie, brak mutacji bezpośrednich.
- [ ] **T3.2 [Interfejs UI]:** Aktualizacja komponentów React, obsługa stanów ładowania i błędów.
  * *Wskaźnik zaliczenia:* Komponent renderuje się poprawnie w trybie mobilnym i desktopowym.

---

## Faza 4: Weryfikacja Jakościowa (Quality Gate)

- [ ] **T4.1 [Static Analysis]:** Uruchomienie `npm run typecheck` oraz `npm run lint`.
  * *Wskaźnik zaliczenia:* 0 błędów i 0 ostrzeżeń blokujących.
- [ ] **T4.2 [Full Test Suite]:** Uruchomienie pełnego zestawu testów `npm run test`.
  * *Wskaźnik zaliczenia:* 100% testów przechodzi pomyślnie.
- [ ] **T4.3 [Audit]:** Zlecenie subagentowi Audytorowi weryfikacji zgodności ze `spec.md`.
  * *Wskaźnik zaliczenia:* Raport audytora bez uwag krytycznych.
