# Propozycja Zmiany: Standaryzacja Układu i Marginesów Bezpiecznych UI (ui-layout-and-safe-areas)

## Why
W obecnym kodzie aplikacji 5 głównych widoków (Generator, Zestaw, Zegar, Narzędzia, Studio) posiada niespójne marginesy zewnętrzne, różniące się szerokości kontenerów (`max-w-*`) oraz odmienne podejście do marginesów systemowych Androida (`safe-area-inset-top`, `safe-area-inset-bottom` pod `BottomNav`). 
W widokach Zegara, Kalkulatorów i Studia zastosowano sztywny margines `pt-4`, co na urządzeniach mobilnych z notchem lub aparatem typu punch-hole powoduje nachodzenie paska systemowego Androida na nagłówki aplikacji. Z kolei w widoku Zestawu brak ograniczenia szerokości skutkuje nienaturalnym rozciąganiem kafli na całą szerokość monitora.
Konieczne jest ustandaryzowanie globalnych klas układu oraz ujednolicenie kontenerów zewnętrznych we wszystkich widokach bez naruszania ich logiki biznesowej.

## What Changes
1. **Globalne tokeny układu w CSS (`src/app/globals.css`):**
   - Wprowadzenie ujednoliconych klas narzędziowych dla bezpiecznych marginesów systemowych (`.app-safe-top`, `.app-safe-bottom`).
   - Wprowadzenie standardowych klas kontenerów (`.app-container-narrow` ~512px dla formularzy, `.app-container-wide` ~896px-1024px dla modułów analitycznych/bazy).
2. **Ujednolicenie kontenerów głównych widoków:**
   - [src/components/ConfigurationForm.tsx]: Zastosowanie ujednoliconych klas kontenera i marginesu górnego/dolnego.
   - [src/components/CircuitList.tsx]: Ograniczenie szerokości listy stacji (`max-w-4xl`) z zachowaniem pełnej szerokości tła sticky headera.
   - [src/components/TimerView.tsx]: Zastąpienie sztywnego `pt-4` bezpiecznym marginesem systemowym `app-safe-top`.
   - [src/components/CalculatorsView.tsx]: Zastąpienie sztywnego `pt-4` bezpiecznym marginesem systemowym `app-safe-top`.
   - [src/components/ExerciseStudioView.tsx]: Zastąpienie sztywnego `pt-4` bezpiecznym marginesem systemowym `app-safe-top`.
3. **Weryfikacja jakościowa:**
   - Wszystkie istniejące testy jednostkowe, integracyjne i testy renderowania UI (73 testy) muszą przechodzić na zielono.
   - Kompilacja produkcyjna `npm run build` musi wygenerować czysty statyczny eksport `out/`.

