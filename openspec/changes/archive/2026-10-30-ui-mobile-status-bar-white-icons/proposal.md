# Proposal: Trwałe Wymuszenie Białych Ikon Paska Statusu w Androidzie

## Why
Testy na emulatorach API 34 oraz API 37 wykazały, że mimo wcześniejszego wywołania `controller.setAppearanceLightStatusBars(false)` w `onCreate`, ikony paska statusu (zegar, bateria, zasięg) pozostają czarne. Wynika to z faktu, że:
1. Bazowy motyw `AppTheme` w `styles.xml` dziedziczył po `Theme.AppCompat.Light.DarkActionBar` (motyw jasny), a styl startowy `AppTheme.NoActionBarLaunch` nie posiadał deklaracji `postSplashScreenTheme`, przez co po zniknięciu ekranu powitalnego Android resetował ikony status baru na czarne.
2. Po zainicjowaniu silnika WebView i zmianie focusu okna (`onWindowFocusChanged`), kontroler systemu Android re-aplikował domyślny motyw jasny emulatora.

## What Changes
- **Trwała kontrola ikon w cyklu życia Aktywności (`MainActivity.java`)**: Re-aplikacja `setAppearanceLightStatusBars(false)` oraz flag `FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS` nie tylko w `onCreate`, lecz także w `onResume()`, `onWindowFocusChanged(boolean)` oraz w `OnApplyWindowInsetsListener`.
- **Korekta motywów w `styles.xml`**:
  - Zamiana bazowego motywu `AppTheme` z jasnego (`Light`) na `Theme.AppCompat.DayNight.NoActionBar`.
  - Dodanie `<item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>` do `AppTheme.NoActionBarLaunch`, gwarantujące płynne przejście po splashscreenie na motyw z ciemnymi stylami.

## Capabilities

### Modified Capabilities
- `ui-layout`: Wymóg trwałego zachowania białych ikon paska statusu po zakończeniu animacji splash screen i zmianie focusu okna.

## Impact
- `android/app/src/main/java/com/pepitolabs/generator/MainActivity.java`
- `android/app/src/main/res/values/styles.xml`
