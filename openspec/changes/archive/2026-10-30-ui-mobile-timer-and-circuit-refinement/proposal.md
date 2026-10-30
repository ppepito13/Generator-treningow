# Proposal: Eliminacja Przepełnień Poziomych, Kompaktowy Zegar i Responsywne Przyciski

## Why
Testy manualne na smartfonach o szerokości ekranu 360px-412px wykazały krytyczne defekty układu:
1. Wiersz pojedynczego kroku w Zegarze (`IntervalTimerSubView`) wymusza minimalną szerokość ~480px z powodu szerokiego selektora kolorów w jednym rzędzie flex, co rozpycha całe okno aplikacji i przesuwa dolną belkę nawigacyjną poza prawą krawędź ekranu (ucinając nazwę "Studio" do "Stu").
2. Przyciski przekierowań w modułach kalkulatorów (`BmrCalculatorSubView`, `RfmCalculatorSubView`, `BmiCalculatorSubView`) posiadają sztywną klasę `whitespace-nowrap` i stałą wysokość `h-11`, co powoduje wylewanie się długiego tekstu (np. "Przejdź do kalkulatora TDEE...") poza obrys karty i ekran w obu kierunkach.
3. Przypięty pasek nagłówka w widoku Zestawu (`CircuitList`) koliduje z fizycznym wycięciem aparatu i odbiega od standardu nagłówków pozostałych modułów.
4. Podtytuł sali w rozwijanej liście Generatora (`ConfigurationForm`) łamie skrót "os." do osobnej linii na węższych ekranach.

## What Changes
- **Kompaktowy wiersz kroku timera (Interval Timer)**: Zastąpienie szerokiego selektora `<select>` kompaktowym przyciskiem/próbnikiem barwnym (Color Dot Picker / mini-selektor) oraz zabezpieczenie układu przed przekraczaniem szerokości 360px.
- **Dwu-wierszowy nagłówek bloku timera**: Przebudowa nagłówka każdego bloku na 2 czytelne poziomy (Wiersz 1: Badge typu bloku + pełna szerokość pola edycji nazwy; Wiersz 2: Strzałki góra/dół, duplikuj, usuń), eliminująca ściskanie i ucinanie nazw.
- **Elastyczne przyciski kalkulatorów**: Skrócenie etykiet przycisków przekierowań oraz wdrożenie elastycznej wysokości i zawijania tekstu (`whitespace-normal`, `h-auto py-2.5 px-3 text-center leading-tight`).
- **Przewijalny nagłówek w widoku Zestawu (`CircuitList`)**: Ujednolicenie nagłówka "Twój Obwód" ze strukturą `ModuleHeader` i umożliwienie naturalnego przewijania z listą ćwiczeń.
- **Korekta `SelectTrigger` sali w Generatorze**: Zastosowanie elastycznej wysokości `min-h-[3.5rem] h-auto py-2` oraz `tracking-wider`, eliminujące sztuczne łamanie słowa "os.".

## Capabilities

### Modified Capabilities
- `ui-components`: Wprowadzenie wymagań dotyczących braku poziomego przepełnienia (horizontal overflow) na ekranach 360px+, elastycznego zawijania etykiet przycisków wieloliniowych oraz kompaktowych selektorów kroków czasowych.

## Impact
- `src/components/IntervalTimerSubView.tsx` (kroki timera, nagłówki bloków)
- `src/components/CircuitList.tsx` (nagłówek obwodu)
- `src/components/ConfigurationForm.tsx` (trigger selektora sali)
- `src/components/calculators/BmrCalculatorSubView.tsx` (przycisk TDEE)
- `src/components/calculators/RfmCalculatorSubView.tsx` (przycisk BMI)
- `src/components/calculators/BmiCalculatorSubView.tsx` (przycisk RFM)

