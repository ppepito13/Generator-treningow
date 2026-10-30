# Tasks: ui-mobile-safe-areas-and-android-edge

## 1. Konfiguracja Natywna Androida (Edge-to-Edge)

- [x] 1.1 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Wdrożenie WindowCompat.setDecorFitsSystemWindows(getWindow(), false) w metodzie onCreate i weryfikacja kompilacji
- [x] 1.2 [android/app/src/main/res/values/styles.xml] Konfiguracja przezroczystych pasków statusBarColor i navigationBarColor oraz jasnych ikon w stylu AppTheme.NoActionBar

## 2. Style Globalne i Bezpieczne Strefy Mobilne

- [x] 2.1 [src/app/globals.css] Dodanie reguły .scrollbar-none ukrywającej suwaki przewijania na silnikach WebKit i Firefox
- [x] 2.2 [src/app/globals.css] Dodanie reguł overscroll-behavior-y: none, -webkit-tap-highlight-color: transparent oraz minimalnego rozmiaru fontu 16px dla pól tekstowych na ekranach mobilnych
- [x] 2.3 [src/app/layout.tsx] Wdrożenie komponentu Global Top Shield z efektem backdrop-blur i maską gradientową chroniącego górny pasek statusu
- [x] 2.4 [src/components/ConfigurationForm.tsx] Usunięcie zduplikowanej lokalnej nakładki top-blur z formularza generatora

## 3. Przebudowa Dolnego Paska Nawigacji (BottomNav)

- [x] 3.1 [src/components/BottomNav.tsx] Przebudowa kontenera na pełną szerokość w-full z rozciągnięciem tła i rozmycia na obszar safe-area-inset-bottom
- [x] 3.2 [src/components/BottomNav.tsx] Implementacja reaktywnego ukrywania paska przy użyciu window.visualViewport po wysunięciu wirtualnej klawiatury

## 4. Weryfikacja Jakościowa Bramki

- [x] 4.1 [src/app/layout.tsx] Weryfikacja spójności typów i testów jednostkowych poleceniem npm run verify
- [x] 4.2 [src/app/layout.tsx] Weryfikacja poprawności statycznego eksportu Next.js poleceniem npm run build
