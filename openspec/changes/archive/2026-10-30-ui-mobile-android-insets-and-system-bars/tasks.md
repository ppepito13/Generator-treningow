# Tasks: ui-mobile-android-insets-and-system-bars

## 1. Integracja Natywna Androida (Java i Style)

- [x] 1.1 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Wdrożenie WindowInsetsControllerCompat dla wymuszenia białych ikon paska statusu i nawigacji
- [x] 1.2 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Wdrożenie OnApplyWindowInsetsListener wstrzykującego zmienne CSS --safe-area-inset-top i --safe-area-inset-bottom do WebView
- [x] 1.3 [android/app/src/main/res/values/styles.xml] Ustawienie tła okna startowego android:windowBackground i android:background na kolor #141d1f

## 2. Integracja Webowa (CSS i Komponenty)

- [x] 2.1 [src/app/globals.css] Aktualizacja klas .app-safe-top i .app-safe-bottom o wsparcie zmiennych --safe-area-inset-top i --safe-area-inset-bottom
- [x] 2.2 [src/components/BottomNav.tsx] Aktualizacja paddingBottom o wsparcie zmiennej --safe-area-inset-bottom

## 3. Weryfikacja Jakościowa i Synchronizacja

- [x] 3.1 [src/components/BottomNav.tsx] Weryfikacja jakościowa npm run verify (TypeScript, ESLint, testy)
- [x] 3.2 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Synchronizacja zasobów mobilnych poleceniem npm run cap:sync
