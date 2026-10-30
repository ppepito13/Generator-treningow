# Design: Trwała Kontrola Wyglądu Pasków Systemowych

## Context
Zobacz `proposal.md`. Po wyjściu ze splashscreena biblioteka AndroidX SplashScreen przełącza motyw okna. Brak `postSplashScreenTheme` oraz bazowanie `AppTheme` na `Theme.AppCompat.Light` powodowało re-aplikację czarnych ikon.

## Goals / Non-Goals

**Goals:**
- Skonfigurowanie `postSplashScreenTheme` w `AppTheme.NoActionBarLaunch`.
- Zmiana `AppTheme` na motyw ciemny (`Theme.AppCompat.DayNight.NoActionBar`).
- Centralna metoda `applySystemBarStyles()` wywoływana w `onCreate`, `onResume`, `onWindowFocusChanged` oraz `OnApplyWindowInsetsListener` w `MainActivity.java`.

**Non-Goals:**
- Modyfikacja kodu JavaScript/TypeScript.

## Decisions

### 1. `applySystemBarStyles()` w kluczowych punktach cyklu życia
- **Wybór:** Zdefiniowanie metody pomocniczej i jej wywołanie w `onCreate`, `onResume`, `onWindowFocusChanged(hasFocus == true)` oraz w listenerze insets.
- **Dlaczego:** Android resetuje flagi pasków przy zmianie focusu lub zmianie motywu okna po animacji splash. Zapewnia to natychmiastowe przywrócenie białych ikon.

### 2. `postSplashScreenTheme` w `styles.xml`
- **Wybór:** Wskazanie `postSplashScreenTheme` na `@style/AppTheme.NoActionBar`.
- **Dlaczego:** Oficjalny mechanizm biblioteki `androidx.core.splashscreen` do przejścia na właściwy motyw bez korzystania z domyślnego motywu jasnego aplikacji.
