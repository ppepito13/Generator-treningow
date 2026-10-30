# Tasks: ui-mobile-timer-and-circuit-refinement

## 1. Refaktoryzacja Modułu Zegara (Interval Timer)

- [x] 1.1 [src/components/IntervalTimerSubView.tsx] Przebudowa nagłówka bloku timera na układ 2-wierszowy (wiersz 1: badge i pole nazwy, wiersz 2: ikony akcji góra/dół/duplikuj/usuń)
- [x] 1.2 [src/components/IntervalTimerSubView.tsx] Zastąpienie szerokiego selektora koloru kroku kompaktowym próbnikiem barwnym (Color Dot Picker) eliminującym rozpychanie wiersza
- [x] 1.3 [src/components/IntervalTimerSubView.tsx] Zabezpieczenie kontenerów kroków i bloków klasami flex-wrap oraz overflow-hidden gwarantującymi brak przewijania poziomego na 360px

## 2. Elastyczne Przyciski Przekierowań w Kalkulatorach

- [x] 2.1 [src/components/calculators/BmrCalculatorSubView.tsx] Skrócenie etykiety przycisku do TDEE oraz wdrożenie elastycznego zawijania whitespace-normal i h-auto
- [x] 2.2 [src/components/calculators/RfmCalculatorSubView.tsx] Skrócenie etykiety przycisku do BMI oraz wdrożenie elastycznego zawijania whitespace-normal i h-auto
- [x] 2.3 [src/components/calculators/BmiCalculatorSubView.tsx] Skrócenie etykiety przycisku do RFM oraz wdrożenie elastycznego zawijania whitespace-normal i h-auto

## 3. Dostosowanie Nagłówka Obwodu i Selektora Sal

- [x] 3.1 [src/components/CircuitList.tsx] Usunięcie sztywnego sticky z paska nagłówka i ujednolicenie marginesów z Global Top Shield
- [x] 3.2 [src/components/ConfigurationForm.tsx] Zmiana stylów SelectTrigger sali na min-h-[3.5rem] h-auto py-2 oraz tracking-wider zapobiegające łamaniu skrótu "os."

## 4. Weryfikacja Jakościowa Bramki

- [x] 4.1 [src/components/IntervalTimerSubView.tsx] Weryfikacja typów TypeScript i testów jednostkowych poleceniem npm run verify
- [x] 4.2 [src/components/IntervalTimerSubView.tsx] Weryfikacja poprawności statycznego eksportu Next.js poleceniem npm run build

