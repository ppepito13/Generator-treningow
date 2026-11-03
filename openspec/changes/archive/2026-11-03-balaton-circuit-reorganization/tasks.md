# Tasks

## 1. Aktualizacja typów i bazy danych JSON

- [x] 1.1 [src/app/lib/data.ts] Zaktualizować interfejs `Zone` o opcjonalne pole `wymuszona_w_obwodzie?: boolean;` z zachowaniem `blokada_zmiany_recznej?: boolean;` dla wstecznej kompatybilności i zweryfikować kompilację TypeScript (`npx tsc --noEmit`).
- [x] 1.2 [src/app/lib/data/sala.json] Zaktualizować konfigurację Sali Balaton: ustawić `stacje: 9`, `osoby: 18`, podnieść `bazowa_pojemnosc_stacji` dla Wolnej Podłogi do `6`, zamienić `blokada_zmiany_recznej` na `wymuszona_w_obwodzie: true` w 5 strefach bazowych oraz zaktualizować `kolejnosc_sortowania` (1..8). Zweryfikować testem integralności (`npx vitest run src/tests/data-integrity.test.ts`).

## 2. Implementacja silnika doboru stref (Circuit Slot Mapping)

- [x] 2.1 [src/domain/generator/zoneSelector.ts] Zaimplementować deterministyczną matrycę slotów dla Sali Balaton: usunąć legacy hardcode `kolejnosc_sortowania === 2`, zaimplementować dobór stref (1..9) z Wolną Podłogą na pozycji 3, pozycjonowaniem Drabinek na pozycji 4 przy $\ge 6$ stacjach, detekcją dostępności Kółek oraz fallbackiem na podwójną/potrójną podłogę na końcu przy braku kółek. Zweryfikować brak błędów kompilacji (`npx tsc --noEmit`).
- [x] 2.2 [src/domain/generator/circuitStrategy.ts] Zintegrować wywołanie selektora stref z parametrami dostępności ćwiczeń i inwentarza, zapewniając spójność z mechanizmem Breatherów i balansem segmentów. Zweryfikować linterem (`npx next lint`).

## 3. Testy jednostkowe i weryfikacja bramki jakościowej

- [x] 3.1 [src/tests/domain/zoneSelector.test.ts] Zaktualizować i rozszerzyć zestaw testów jednostkowych selektora stref: zweryfikować generowanie obwodów dla 5, 6, 7, 8 i 9 stacji, wariant z dostępnymi kółkami oraz wariant fallbacku przy braku kółek (dwie/trzy podłogi na końcu). Zweryfikować wykonaniem testu (`npx vitest run src/tests/domain/zoneSelector.test.ts`).
- [x] 3.2 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: TypeScript, ESLint, 100% testów Vitest) oraz zweryfikować build statyczny (`npm run build`).

