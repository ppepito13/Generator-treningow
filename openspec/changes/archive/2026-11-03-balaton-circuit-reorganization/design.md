# Design

## Context
Zobacz `proposal.md` w celu zapoznania się z motywacją biznesową. Sala Balaton posiada specyficzny układ fizyczny, w którym strefy sprzętowe otaczają centralną Wolną Podłogę. Dotychczasowy losowy algorytm dobierania stref pomijał Wolną Podłogę lub spychał ją na sam koniec, a brak kółek gimnastycznych na sali powodował błędy generowania obwodu.

## Goals / Non-Goals

**Goals:**
- Zapewnienie deterministycznego układu stref dla Sali Balaton z Wolną Podłogą na stacji 3.
- Poprawne przestrzenne włączanie Drabinek ściennych na pozycji 4 przy $\ge 6$ stacjach.
- Płynny fallback przy braku kółek gimnastycznych (Ściana na pozycji 7, wielokrotna podłoga na pozycjach 8 i 9).
- Podniesienie limitów Balatonu do 9 stacji i 18 osób oraz bazowej pojemności podłogi do 6.
- Zastąpienie mylącej nazwy `blokada_zmiany_recznej` czytelnym atrybutem `wymuszona_w_obwodzie`.

**Non-Goals:**
- Modyfikacja logiki balansu segmentów (`muscleBalancing.ts`) ani kaskady trudności (`cascadeFallback.ts`).
- Zmiany w logice Sali Astoria (trening synchroniczny).

## Decisions

### Decyzja 1: Wdrożenie Matrycy Slotów Obwodu (Circuit Slot Mapping) w `zoneSelector.ts`
- **Wybór:** Zamiast losowego dobierania stref w pętli `while` i naiwnego sortowania po `kolejnosc_sortowania`, funkcja `selectRoomZonesForCircuit` dla Sali Balaton korzysta z deterministycznego pipeline'u slotów.
- **Uzasadnienie:** Gdy Wolna Podłoga występuje w obwodzie wielokrotnie (raz w środku na stacji 3 oraz na końcu jako wypełniacz stacji 8 i 9), tradycyjne sortowanie po `kolejnosc_sortowania: 3` zgrupowałoby wszystkie trzy stacje podłogi obok siebie (pozycje 3, 4, 5). Matryca slotów gwarantuje, że podłoga #1 zawsze znajdzie się na pozycji 3, a podłogi #2 i #3 na pozycjach 8 i 9.
- **Alternatywa odrzucona:** Tworzenie sztucznych, zduplikowanych stref w `sala.json` o różnych ID – wprowadziłoby to redundancję danych i chaos w konfiguratorze sal.

### Decyzja 2: Dynamiczna detekcja kółek gimnastycznych
- **Wybór:** Silnik sprawdza dostępność kółek: `(inwentarz['kolko_gimnastyczne'] || 0) > 0` oraz obecność co najmniej jednego ćwiczenia w bazie dla zadanego poziomu trudności.
- **Uzasadnienie:** Jeśli sala fizycznie nie posiada kółek lub baza nie ma ćwiczenia dla zadanego poziomu, stacja Kółek jest automatycznie zastępowana Ścianą, a stacje 8 i 9 wypełnia Wolna Podłoga. Zapobiega to wyzwalaniu zbędnych modali konfliktu sprzętowego.

### Decyzja 3: Aktualizacja nazwy parametru na `wymuszona_w_obwodzie`
- **Wybór:** W typie `Zone` i w pliku `sala.json` wprowadzamy pole `wymuszona_w_obwodzie: boolean`. W kodzie domenowym stosujemy fallback `zone.wymuszona_w_obwodzie ?? zone.blokada_zmiany_recznej ?? false`.
- **Uzasadnienie:** Ujednolica semantykę i chroni konfiguracje sal zapisane w pamięci lokalnej urządzeń.

## Risks / Trade-offs

- **[Ryzyko: Wyczerpanie sprzętu przy 3 stacjach na podłodze]** → **Mitygacja:** Podniesienie bazowej pojemności podłogi do 6 zapewnia limit 4 po uwzględnieniu zajęcia Drabinek i Ściany ($6 - 1 - 1 = 4 \ge 3$). Inwentarz Balatonu (20 kettlebelli, 10 hantli, 10 sztang, 6 mat) bez trudu obsługuje 3 stacje podłogowe, a `ensureEquipment` w kaskadzie na bieżąco pilnuje dostępności wolnych sztuk.
- **[Ryzyko: Bezpośrednie sąsiedztwo stacji 8 i 9 na podłodze]** → **Mitygacja:** Stacja 9 w obwodzie jest z definicji stacją regeneracji / Breatherem (`(8+1)%3 === 0`), wymuszając segment Core/Neuro/Mobility. Stacja 8 dobiera segment siłowy (np. Push/Legs), dzięki czemu dwie sąsiadujące stacje na podłodze wykonują zupełnie inne wzorce ruchowe i nie dublują ćwiczeń (`usedBaseNames`).

