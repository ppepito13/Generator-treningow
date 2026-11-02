# Design: Rekalibracja Poziomów Ćwiczeń i Zabezpieczenie Danych w Studio

## Context
Zobacz `proposal.md`. Baza produkcyjna `lista_cwiczen.json` wymaga aktualizacji poziomów trudności i spolszczenia nazw. Jednocześnie formularz `AddExerciseDialog.tsx` i funkcja `createDefaultExercise` w `src/app/lib/data.ts` wymagały załatania luki usuwającej metadane sprzętowe podczas edycji.

## Goals / Non-Goals

**Goals:**
- Bezpieczny, bezstratny update 34 poziomów i 5 nazw w `src/app/lib/data/lista_cwiczen.json` z zachowaniem 100% poprawnych wymagań sprzętowych i biomechaniki.
- Uwzględnienie decyzji użytkownika: klasyczne podciąganie nachwyt ➔ poziom 7, klasyczne podciąganie podchwyt ➔ poziom 6.
- Zabezpieczenie `AddExerciseDialog.tsx`, aby przy edycji istniejącego ćwiczenia zachowywał wszystkie właściwości bazowe (`wymagania_sprzetowe`, `biomechanika`, `zaangazowane_miesnie`, `tagi_specjalne`, `kategorie_treningu`).
- Zabezpieczenie `createDefaultExercise`, aby respektował przekazany sprzęt, biomechanikę i tagi.
- Pełna weryfikacja automatyczna (`npm run verify`, testy integralności bazy).

**Non-Goals:**
- Modyfikacja struktury encji `Exercise` w TypeScript.
- Zmiana algorytmu losowania w `generatorStrategies.ts`.

## Decisions

### 1. Selektywny Merge Danych zamiast Nadpisywania Pliku
- **Wybór:** Modyfikacja w `lista_cwiczen.json` wyłącznie docelowych pól `poziom` i `nazwa`, z zachowaniem istniejących `wymagania_sprzetowe`, `biomechanika` i anatomii.
- **Dlaczego:** Plik `moje_cwiczenia_2026-10-05.json` zawierał puste tablice sprzętu przez usterkę formularza. Bezpośredni import popsułby bazę ćwiczeń.
- **Wartości kluczowe:**
  - `ex_014` Podciąganie klasyczne (Nachwyt): poziom 7
  - `ex_015` Podciąganie klasyczne (Podchwyt): poziom 6 (decyzja użytkownika: o 1 poziom niżej niż nachwyt)
  - `ex_035`: TRX Jednorącz (poziom 5)
  - `ex_043`: Wiosłowanie sztangą w opadzie jednorącz
  - `ex_060`: Dotknięcia ramion w Pike HS
  - `ex_083`: Dotknięcia barków w podporze nogami o piłkę
  - `ex_084`: Dotknięcia barków w podporze przodem

### 2. Zachowanie Metadanych w AddExerciseDialog i createDefaultExercise
- **Wybór:** 
  - W `AddExerciseDialog.tsx` przy wywołaniu `addCustomExercise` dołączamy do payloadu: `wymagania_sprzetowe: initialExercise?.wymagania_sprzetowe`, `biomechanika: initialExercise?.biomechanika`, `zaangazowane_miesnie: initialExercise?.zaangazowane_miesnie`, `tagi_specjalne: initialExercise?.tagi_specjalne`, `kategorie_treningu: initialExercise?.kategorie_treningu`.
  - W `createDefaultExercise` (`src/app/lib/data.ts`) pola te są bezpośrednio przepisywane z `input`, a wartości domyślne przypisywane są wyłącznie gdy dane pole jest `undefined`.

## Risks / Trade-offs

- [Zmniejszenie puli podciągań na niższych poziomach trudności (1-4)] ➔ W puli PULL dla poziomów 1-4 pozostaje 20 ćwiczeń (wiosłowania TRX/kółka, podciągania australijskie, asystowane gumą, negatywne i zwisy), co całkowicie zabezpiecza potrzeby generatora dla początkujących.

