# Propozycja: Eliminacja przepełnienia poziomego pasków filtrów w module Studio (Wariant A - Slider)

## Why
W widoku Studio Ćwiczeń (`ExerciseStudioView`), po dodaniu 4. zakładki Kosza („Usunięte (X)”), łączna szerokość paska filtrów źródeł wynosi około 495px. Na ekranach smartfonów (szerokość 360–390px, z szerokością użytkową wewnątrz kafelka zaledwie 288–318px), brak mechanizmu przewijania poziomego w kontenerze powoduje wypychanie 4. przycisku („Usunięte”) poza prawą krawędź kafelka `glass-card` oraz poza ekran fizyczny telefonu. Podobny problem braku `overflow-x-auto` występuje w podwidokach Sal (`RoomStudioSubView`) i Sprzętu (`EquipmentStudioSubView`).

Wdrożenie poziomego suwaka / przewijania (`overflow-x-auto scrollbar-none` z `shrink-0 whitespace-nowrap`), analogicznie do działającego już paska zakładek w `ModuleHeader`, rozwiąże problem przepełnienia i ujednolici zachowanie interfejsu w całym module Studio bez łamania istniejących testów ani zwijania etykiet.

## What Changes
- Dodanie klas `max-w-full overflow-x-auto scrollbar-none` do kontenera przycisków filtrów źródeł w `ExerciseStudioView.tsx`, `RoomStudioSubView.tsx` oraz `EquipmentStudioSubView.tsx`.
- Dodanie `shrink-0 whitespace-nowrap` do wszystkich przycisków filtrów w tych kontenerach, zapobiegając zniekształceniom tekstu podczas przewijania.
- Zapewnienie, że cały pasek filtrów pozostaje ściśle wewnątrz obrysu kafelka `glass-card` na każdym ekranie mobilnym (320px–430px+) z płynnym przewijaniem dotykowym.

## Capabilities

### Modified Capabilities
- `ui-components`: Rozszerzenie wymagań komponentów interfejsu o gwarancję braku poziomego przepełnienia w paskach filtrów modułu Studio (Zero Horizontal Overflow in Studio Filter Bars).

## Impact
- **Pliki produkcyjne:**
  - `src/components/ExerciseStudioView.tsx`
  - `src/components/RoomStudioSubView.tsx`
  - `src/components/EquipmentStudioSubView.tsx`
- **Wpływ na testy:** Brak zmian w kontraktach testów jednostkowych – etykiety tekstowe pozostają w 100% niezmienione.
- **Wpływ na platformy:** Poprawa użyteczności i eliminacja overflow na platformie Web oraz w aplikacji Android / Capacitor.

