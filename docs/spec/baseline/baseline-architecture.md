# BASELINE SPECIFICATION: Architektura i Stan Zastany Systemu

**Wersja:** 1.0 (Stan Zastany – Produkcja v1.3.0)  
**Data:** 2026-10-02  
**Status:** REFERENCE (Nienaruszalna baza odniesienia dla regresji)  

---

## 1. Przegląd i Kontekst Działania Aplikacji

Aplikacja **Generator Treningów SW (Kinetic Circuits)** działa jako:
1. **Aplikacja Webowa:** Statyczna aplikacja SPA serwowana z Firebase Hosting (`firebase.json`, folder `out/`).
2. **Aplikacja Mobilna Android:** Hybrydowa aplikacja opakowana przez Capacitor 8 (`com.pepitolabs.generator`), dystrybuowana w Google Play Store.

### Zasada działania (Offline-First):
* Aplikacja **nie wykonuje żadnych zapytań do zewnętrznego serwera ani bazy danych** podczas normalnego użytkowania.
* Wszystkie dane operacyjne (baza ćwiczeń, inwentarz sal, poziomy trudności) są kompilowane do statycznego bundle'a.
* Wszelkie modyfikacje dokonywane przez użytkownika (dodane ćwiczenia, sale, presety timera, profil kalkulatorów) są zapisywane w `localStorage` przeglądarki / WebView pod kluczem:
  ```typescript
  'kinetic-circuits-storage'
  ```

---

## 2. Model Danych i Pliki Bazowe (`src/app/lib/data/`)

Aplikacja opiera się na 6 wbudowanych plikach JSON:

| Plik | Rola i Kluczowe Pola |
| :--- | :--- |
| `lista_cwiczen.json` | Katalog ponad 300 ćwiczeń: `id_cwiczenia`, `nazwa`, `poziom` (1-10), `segment_id`, `tryb_pracy` ("Solo" \| "W_Parze"), `wymagania_sprzetowe` (struktura CNF), `glowne_partie`, `kategorie_treningu`. |
| `sala.json` | Konfiguracja sal treningowych: Balaton (obwód ze strefami) i Astoria (FBW synchroniczny). Zawiera `strefy` i `inwentarz`. |
| `poziomy_trudnosci.json` | Definicje poziomów zaawansowania (widełki `min_poziom` - `max_poziom`). |
| `segmenty.json` | Podział anatomiczny / biomechaniczny stacji. |
| `lista_sprzetu.json` | Słownik dozwolonego sprzętu treningowego. |
| `kategorie_treningow.json` | Kategoryzacja stylów treningowych (`Kalistenika`, `FBW`, `Cross`, itp.). |

### Format Wymagań Sprzętowych (Logika CNF):
Ćwiczenia definiują wymagania sprzętowe jako tablicę klauzul alternatywnych (OR) lub koniunkcji (AND):
```typescript
export type SingleRequirement = Record<string, number>;
export type EquipmentRequirement = SingleRequirement | SingleRequirement[];
```
Mnożnik określa liczbę sztuk sprzętu na osobę (`needed = participants * multiplier`).

---

## 3. Strategie Generowania Treningów (`src/app/lib/store.ts`)

W kodzie zaimplementowane są dwa odrębne algorytmy generowania obwodów:

### A. Strategia Obwodowa (`generateCircuitStrategy` – np. Sala Balaton)
1. **Liczba uczestników i stacji:**
   * Liczba stacji nie może przekraczać liczby uczestników (`stationCount <= participants`).
   * Jeśli `participants > stationCount`, system tworzy stacje podwójne (`isPair: true`).
2. **Dobór stref:**
   * Wybór stref bazuje na pojemności stacji (`pojemnosc_stacji`) oraz strefie elastycznej (`zaleznosci_pojemnosci_od`).
   * Wykluczenia: ćwiczenia drążkowe mogą trafiać wyłącznie do strefy `klatka_rig`.
3. **Mechanizm Breather (Odpoczynek):**
   * Co 3. stacja (`(idx + 1) % 3 === 0`) ma obniżony poziom trudności o 1-2 poziomy (jeśli wyłączony jest tryb rygorystyczny `!isStrictDifficulty`).
4. **Rozwiązywanie konfliktów:**
   * Gdy w danej strefie brakuje ćwiczenia spełniającego kryteria, uruchamiany jest dialog konfliktu (`GenerationConflictDialog`), umożliwiający poluzowanie poziomu (`loosenDifficultyFlag`) lub powtórzenie ćwiczenia (`ignoreUsedFlag`).

### B. Strategia Synchroniczna (`generateSynchronizedStrategy` – np. Sala Astoria)
1. **Niezależność stacji od uczestników:**
   * Wszyscy uczestnicy wykonują to samo ćwiczenie w tym samym czasie.
   * Liczba stacji może być generowana niezależnie od liczby trenujących.
2. **Ścisła weryfikacja sprzętowa (`ensureEquipment`):**
   * Sprawdzanie czy sala posiada wystarczający inwentarz dla wszystkich uczestników:
     $\text{inwentarz}[sprzet] \ge participants \times multiplier$.

### C. Sala Niestandardowa (Custom Room)
* Użytkownik wybiera tryb: obwodowy lub synchroniczny.
* Inwentarz jest wirtualny lub definiowany przez zaznaczenie checkboxów w `EquipmentSelectionDialog`.

---

## 4. Moduły Peryferyjne Aplikacji

1. **Zegar Treningowy (`TimerView.tsx`):**
   * Trzy tryby: Stoper, Minutnik, Zegar Interwałowy (Tabata, EMOM, Custom).
   * Posiada pływający widok miniaturowy (`FloatingTimerWidget`) oraz pełnoekranowy widok siłowni (`GymViewModal`).
   * Wykorzystuje syntezę mowy Web Speech API (`useTimerAudioTTS.ts`) do odliczania czasu.
2. **Kalkulatory (`CalculatorsView.tsx`):**
   * BMI, RFM, BMR (Mifflin-St Jeor), TDEE z poziomem aktywności PAL.
   * Współdzielony profil użytkownika (`userProfile`) w stanie aplikacji.
3. **Studio Ćwiczeń, Sal i Sprzętu:**
   * Lokalne operacje CRUD z możliwością eksportu i importu plików JSON na urządzeniu.

---

## 5. Zobowiązanie Wstecznej Kompatybilności (Zero-Regression Guarantee)

Każda zmiana w ramach SDD musi zagwarantować, że:
1. Struktura obiektu w `localStorage` nie zostanie uszkodzona (brak białego ekranu po aktualizacji aplikacji).
2. Format eksportu i importu bazy ćwiczeń/sal/sprzętu pozostaje kompatybilny.
3. Istniejące sale i ćwiczenia wbudowane w kod nie tracą swoich unikalnych identyfikatorów (`id_cwiczenia`).
