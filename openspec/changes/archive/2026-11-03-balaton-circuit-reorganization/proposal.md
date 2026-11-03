# Proposal

## Why
Dotychczasowy dobór stref w obwodzie Sali Balaton opierał się na losowej pętli z twardym sortowaniem numerycznym i zahardkodowanym warunkiem w kodzie TypeScript. Powodowało to wypychanie Wolnej Podłogi z obwodu (~22% treningów bez podłogi), spychanie jej wyłącznie na szary koniec obwodu (stacja 7 lub 8) oraz niemożność ułożenia logicznego, fizycznego przepływu ćwiczących na sali. Ponadto myląca nazwa `blokada_zmiany_recznej` wprowadzała w błąd, a limit 8 stacji w konfiguracji sali uniemożliwiał wygenerowanie 9 stacji przy pełnym wyposażeniu sali.

## What Changes
- **Matryca Slotów Obwodu (Circuit Slot Mapping) dla Balatonu:** Zastąpienie losowej pętli dobierania stref deterministyczną matrycą kolejności:
  - 1: `Strefa_Modul_0` (Ściana Startowa i Tarcze, `wymuszona_w_obwodzie: true`)
  - 2: `Strefa_Modul_1` (RIG - Drążki wysokie, `wymuszona_w_obwodzie: true`)
  - 3: `Strefa_Wolna_Przestrzen` (Wolna Podłoga #1, `wymuszona_w_obwodzie: true` – naturalny Breather)
  - 4: `Strefa_Drabinki` (Drabinki ścienne – aktywowane przy $\ge 6$ stacjach, pozycjonowane przestrzennie na 4. pozycji)
  - 5: `Strefa_Modul_2` (RIG - Środek, `wymuszona_w_obwodzie: true`)
  - 6: `Strefa_Modul_3` (RIG - drabinki, `wymuszona_w_obwodzie: true` – Breather)
  - 7: `Strefa_Kolka` (Kółka Gimnastyczne – jeśli dostępne; jeśli brak kółek ➔ `Strefa_Sciana`)
  - 8: `Strefa_Sciana` (Ściana – jeśli były kółka; jeśli brak kółek ➔ `Strefa_Wolna_Przestrzen` #2)
  - 9: `Strefa_Wolna_Przestrzen` (Wolna Podłoga – jeśli były kółka ➔ Podłoga #2; jeśli brak kółek ➔ Podłoga #3)
- **Dynamiczny fallback przy braku kółek:** Wykrywanie braku kółek w inwentarzu sali (`kolko_gimnastyczne === 0`) lub braku pasujących ćwiczeń dla zadanego poziomu trudności i automatyczne podstawienie Ściany na pozycję 7 oraz podwójnej podłogi na pozycjach 8 i 9.
- **Aktualizacja parametrów Sali Balaton w `sala.json`:**
  - Podniesienie limitu do `stacje: 9`, `osoby: 18` (zasada 2 os./stację).
  - Podniesienie `bazowa_pojemnosc_stacji` dla Wolnej Podłogi do `6`.
  - Ustandaryzowanie parametru `wymuszona_w_obwodzie: true` (zastąpienie zdeprecjonowanego `blokada_zmiany_recznej`).
- **Refaktoryzacja silnika doboru stref:** Usunięcie zahardkodowanego warunku `kolejnosc_sortowania === 2` z `zoneSelector.ts` z zachowaniem elastycznego działania dla sal ogólnych/customowych.

## Capabilities

### New Capabilities
(brak)

### Modified Capabilities
- `circuit-engine`: Wdrożenie deterministycznej matrycy slotów obwodu (Circuit Slot Mapping) dla Sali Balaton, gwarantującej Wolną Podłogę na stacji 3, Drabinki na stacji 4 przy $\ge 6$ stacjach oraz wielokrotną podłogę na końcu przy braku kółek.
- `data-storage`: Aktualizacja konfiguracji stref i limitów Sali Balaton w `sala.json` (pojemność 9 stacji i 18 osób, pojemność podłogi 6, ustandaryzowanie flagi `wymuszona_w_obwodzie`).

## Impact
- **Pliki konfiguracyjne bazy:** `src/app/lib/data/sala.json`.
- **Typy i modele:** `src/app/lib/data.ts` (definicja typu `Zone`).
- **Silnik generatora:** `src/domain/generator/zoneSelector.ts`, `src/domain/generator/circuitStrategy.ts`.
- **Testy:** `src/tests/domain/zoneSelector.test.ts`, `src/tests/data-integrity.test.ts`, `src/tests/domain/generatorStrategies.test.ts`.

