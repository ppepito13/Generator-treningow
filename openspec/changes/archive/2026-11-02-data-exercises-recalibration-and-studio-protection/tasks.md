# Tasks: data-exercises-recalibration-and-studio-protection

## 1. Zabezpieczenie Danych i Formularza Studio

- [x] 1.1 [src/app/lib/data.ts] Zabezpieczenie funkcji createDefaultExercise przed nadpisywaniem przekazanych metadanych (wymagania_sprzetowe, biomechanika, zaangazowane_miesnie, tagi_specjalne, kategorie_treningu)
- [x] 1.2 [src/components/AddExerciseDialog.tsx] Rozszerzenie payloadu zapisu o przekazywanie metadanych z initialExercise podczas edycji i nadpisywania ćwiczenia
- [x] 1.3 [src/tests/store-integration.test.ts] Dodanie testu jednostkowego weryfikującego zachowanie wymagań sprzętowych i biomechaniki przy modyfikacji ćwiczenia wbudowanego

## 2. Rekalibracja Poziomów i Korekta Nazw Ćwiczeń

- [x] 2.1 [src/app/lib/data/lista_cwiczen.json] Aktualizacja poziomów trudności dla 34 ćwiczeń (zgodnie z ustaleniami: podciąganie nachwyt 7, podchwyt 6) oraz korekta 5 nazw ćwiczeń z zachowaniem wymagań sprzętowych

## 3. Weryfikacja Jakościowa i Synchronizacja

- [x] 3.1 [src/tests/data-integrity.test.ts] Weryfikacja integralności bazy danych i uruchomienie pełnej bramki npm run verify
- [x] 3.2 [android/app/src/main/assets/public] Zbudowanie aplikacji i synchronizacja zasobów Androida poleceniem npm run cap:sync
