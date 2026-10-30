# Tasks: ui-mobile-status-bar-white-icons

## 1. Modyfikacja Stylów Natywnych Androida

- [x] 1.1 [android/app/src/main/res/values/styles.xml] Konfiguracja postSplashScreenTheme oraz zmiana bazowego AppTheme na Theme.AppCompat.NoActionBar

## 2. Cykl Życia i Kontrola Ikon w Java

- [x] 2.1 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Wdrożenie metody applySystemBarStyles i jej wywołanie w onCreate, onResume, onWindowFocusChanged i OnApplyWindowInsetsListener

## 3. Weryfikacja Jakościowa i Synchronizacja

- [x] 3.1 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Weryfikacja kompilacji i testów poleceniem npm run verify
- [x] 3.2 [android/app/src/main/java/com/pepitolabs/generator/MainActivity.java] Synchronizacja zasobów mobilnych poleceniem npm run cap:sync
