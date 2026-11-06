# Design: Eliminacja przepełnienia poziomego pasków filtrów w Studio

## Context
W widoku `ExerciseStudioView.tsx` oraz podwidokach `RoomStudioSubView.tsx` i `EquipmentStudioSubView.tsx` paski wyboru źródeł (Wszystkie, Wbudowane, Zapisane lokalnie, Usunięte) są ułożone w kontenerze `flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 self-start sm:self-auto`.
Na ekranach telefonów o szerokości 360–390px, kafelek `glass-card` udostępnia wewnątrz jedynie 288–318px szerokości roboczej. Brak stylów przewijania w kontenerze powoduje rozpychanie kafelka do ~495px i ucinanie przycisku „Usunięte” poza ekranem.

## Goals / Non-Goals

**Goals:**
- Zapewnienie pełnej responsywności pasków filtrów we wszystkich 3 podwidokach Studia (`ExerciseStudioView`, `RoomStudioSubView`, `EquipmentStudioSubView`).
- Zastosowanie sprawdzonego w aplikacji wzorca suwaka poziomego (Wariant A): `max-w-full overflow-x-auto scrollbar-none` z zachowaniem jednolinijkowego, zwartego układu.
- Zabezpieczenie etykiet przycisków przed ściskaniem i łamaniem tekstu (`shrink-0 whitespace-nowrap`).
- Zachowanie 100% kompatybilności z istniejącymi testami jednostkowymi i UI.

**Non-Goals:**
- Implementacja pełnego mechanizmu Kosza (Trash) dla Sal i Sprzętu (zostanie zrealizowana jako osobny feature w osobnym zadaniu).
- Zmiana nazw ani skracanie etykiet tekstowych przycisków (zachowujemy obecne teksty, w tym `Zapisane lokalnie (X)`).

## Decisions

### 1. Wybór Wariantu A (poziomy suwak) zamiast siatki 2x2 (Wariant B)
- **Decyzja:** Zastosowanie `max-w-full overflow-x-auto scrollbar-none` na kontenerze oraz `shrink-0 whitespace-nowrap` na każdym dziecku `<button>`.
- **Uzasadnienie:** Użytkownik wskazał pełną spójność ze sliderem w nagłówku `ModuleHeader` (zakładki `Ćwiczenia`, `Sale`, `Poziomy trudności`) tuż powyżej. Nie powiększa wysokości nagłówka na małych ekranach.
- **Alternatywa odrzucona:** Siatka 2x2 na mobile – zajmowałaby dodatkowy wiersz w pionie i mogła wymusić zawijanie długiego tekstu `Zapisane lokalnie`.

### 2. Spójne objęcie wszystkich trzech podwidoków Studia
- **Decyzja:** Aktualizacja stylów kontenera filtrów dotyczy jednocześnie:
  1. `src/components/ExerciseStudioView.tsx`
  2. `src/components/RoomStudioSubView.tsx`
  3. `src/components/EquipmentStudioSubView.tsx`
- **Uzasadnienie:** Eliminuje ryzyko overflow w całym module Studio za jednym razem, przygotowując podwidoki Sal i Sprzętu na przyszły kosz.

## Risks / Trade-offs

- **[Ryzyko] Przycisk „Usunięte” schowany za krawędzią scrolla przy pierwszym wejściu na telefonie:**
  → *Mitygacja:* Pasek posiada zaokrąglone krawędzie i naturalne ucięcie trzeciego przycisku sygnalizujące możliwość przewinięcia w prawo. Dodatkowo w widoku ćwiczeń licznik aktywnych filtrów oraz stan pusty informują o zawartości.
- **[Ryzyko] Niezamierzone pojawienie się brzydkiego paska przewijania przeglądarki na Windows / Androidzie:**
  → *Mitygacja:* Klasa narzędziowa `scrollbar-none` (obecna w projekcie i zdefiniowana w CSS) ukrywa natywny scrollbar we wszystkich przeglądarkach (WebKit, Firefox, Chromium), zachowując pełne wsparcie dla gestów dotykowych i przewijania kółkiem myszy.

