# Design: Eliminacja Przepełnień Poziomych i Spójność Komponentów Mobilnych

## Context
Zobacz `proposal.md` pod kątem motywacji i analizy błędów. Zegar interwałowy oraz przyciski nawigacyjne w modułach kalkulatorów posiadają sztywne szerokości i brak zawijania tekstu, co uniemożliwia ich poprawne wyświetlanie na smartfonach o szerokościach poniżej 412px.

## Goals / Non-Goals

**Goals:**
- Zaprojektowanie kompaktowego wiersza kroku timera (czas, nazwa, próbnik koloru, kosz) mieszczącego się w szerokości 360px.
- Zaprojektowanie 2-wierszowego nagłówka bloku timera (Wiersz 1: typ i nazwa; Wiersz 2: akcje przestawiania i usuwania).
- Zapewnienie elastycznego zawijania tekstu i skrócenie etykiet przycisków przekierowań w kalkulatorach.
- Zmiana zachowania nagłówka w `CircuitList` na naturalne przewijanie z zawartością widoku.
- Likwidacja niepożądanego łamania wiersza w selektorze sal Generatora.

**Non-Goals:**
- Zmiana logiki odliczania timera, algorytmów losowania stacji czy formuł matematycznych BMR/RFM/BMI.

## Decisions

### 1. Kompaktowy selektor koloru kroku (Color Dot Picker)
- **Wybór:** Zastąpienie szerokiego pola `<select>` z długim opisem kompaktowym selektorem/próbnikiem barwnym (przycisk z kolorowym okręgiem i kompaktowym menu wyboru barwy).
- **Dlaczego:** Poprzedni `<select>` o szerokości ponad 200px w jednym rzędzie z inputem nazwy, czasu i przyciskiem kosza zmuszał rząd do szerokości ~480px, niszcząc układ strony na telefonach.

### 2. Dwu-wierszowa struktura nagłówka bloku timera
- **Wybór:** Wiersz górny: Badge (Pojedynczy / Pętla) + pełnowymiarowy Input nazwy bloku; Wiersz dolny: ikony akcji (przesunięcie w górę, w dół, duplikacja, usunięcie).
- **Dlaczego:** Pozwala użytkownikowi na natychmiastowy dostęp do wszystkich funkcji bloku jednym tapnięciem (brak ukrywania pod menu "trzy kropki"), gwarantując jednocześnie czytelność pełnej nazwy bloku.

### 3. Elastyczne przyciski kalkulatorów z krótszą etykietą
- **Wybór:** Zamiana `whitespace-nowrap h-11` na `whitespace-normal h-auto min-h-[2.75rem] py-2.5 px-3 text-center leading-tight` oraz skrócenie tekstu do postaci zwięzłej (np. `Przejdź do kalkulatora TDEE →`).
- **Dlaczego:** Likwiduje to overflow na węższych ekranach (360px) i sprawia, że przycisk zachowuje proporcje niezależnie od gęstości ekranu.

### 4. Przewijalny nagłówek Zestawu (`CircuitList`)
- **Wybór:** Usunięcie klasy `sticky top-0` z nagłówka `Twój Obwód`, pozwalając mu na naturalne przewijanie z listą stacji pod ochroną `Global Top Shield`.
- **Dlaczego:** Zwalnia cenny obszar pionowy podczas przeglądania treningu na sali i eliminuje kolizję ze strefą obiektywu aparatu.

## Risks / Trade-offs

- [Krótsze etykiety przycisków w kalkulatorach] → Podtytuł lub treść wewnątrz kalkulatora docelowego już dokładnie wyjaśnia pojęcie (np. TDEE), więc skrócona etykieta zachowuje pełną wartość informacyjną.

