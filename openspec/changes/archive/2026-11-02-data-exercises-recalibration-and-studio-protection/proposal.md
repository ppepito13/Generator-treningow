# Proposal: Rekalibracja Poziomów Ćwiczeń i Zabezpieczenie Danych w Studio (#41)

## Why
Baza ćwiczeń aplikacji wymagała zaktualizowania poziomów trudności (ze szczególnym uwzględnieniem segmentu PULL i przesunięcia siłowych podciągnięć do wyższych grup 6-8) oraz ujednolicenia spolszczonych nazw ćwiczeń na podstawie ustaleń z użytkownikiem (#41). 
Jednocześnie audyt kodu ujawnił krytyczną lukę w formularzu edycji ćwiczeń (`AddExerciseDialog.tsx` i `createDefaultExercise`): edycja ćwiczenia wbudowanego powodowała bezpowrotne wykasowanie wymagań sprzętowych (`wymagania_sprzetowe`), biomechaniki oraz szczegółowej listy mięśni, co w konsekwencji psuło dobór stacji i sprzętu w generatorze obwodów.

## What Changes
- **Rekalibracja Poziomów Trudności (`lista_cwiczen.json`)**: Aktualizacja poziomów dla 34 ćwiczeń (głównie segment PULL: klasyczne podciąganie nachwyt ➔ 7, podchwyt ➔ 6, podciągania z obciążeniem / izometryczne ➔ 8, australijskie nachwyt ➔ 5, podchwyt ➔ 3, asystowane gumą ➔ 4, pompki na kolanach ➔ 2).
- **Spolszczenie i Korekta Nazw (`lista_cwiczen.json`)**: Aktualizacja 5 nazw ćwiczeń (TRX Jednorącz, Wiosłowanie sztangą w opadzie jednorącz, Dotknięcia ramion w Pike HS, Dotknięcia barków w podporze nogami o piłkę, Dotknięcia barków w podporze przodem).
- **Zabezpieczenie Danych w Studio (`AddExerciseDialog.tsx`)**: Zachowywanie istniejących wymagań sprzętowych, biomechaniki, zaangażowanych mięśni, tagów specjalnych i kategorii treningu podczas edycji istniejącego ćwiczenia (`initialExercise`).
- **Nienaruszalność Metadanych w `createDefaultExercise` (`src/app/lib/data.ts`)**: Przypisywanie domyślnych pustych wartości wyłącznie w sytuacji, gdy pole nie zostało przekazane w `input`.

## Capabilities

### Modified Capabilities
- `data-storage`: Wymóg zachowania pełnej integralności danych ćwiczenia (wymagania sprzętowe, biomechanika, mięśnie, tagi) przy modyfikowaniu i nadpisywaniu ćwiczeń wbudowanych oraz dodawaniu ćwiczeń własnych w module Studio Ćwiczeń.

## Impact
- `src/app/lib/data/lista_cwiczen.json`: Baza produkcyjna ćwiczeń
- `src/app/lib/data.ts`: Funkcja `createDefaultExercise`
- `src/components/AddExerciseDialog.tsx`: Komponent dialogu edycji ćwiczenia
- `src/tests/data-integrity.test.ts` oraz testy jednostkowe store/studio

