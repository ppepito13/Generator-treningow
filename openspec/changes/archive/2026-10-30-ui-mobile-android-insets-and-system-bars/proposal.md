# Proposal: Obsługa Pasków Nawigacji 3-Przyciskowej Androida i Wymuszenie Jasnych Ikon Systemowych

## Why
Testy na emulatorach Android (Pixel 6 API 34 oraz nowszym API 37) wykazały, że:
1. W trybie jasnym systemu Android (domyślnym dla wielu urządzeń i emulatorów) ikony paska statusu (zegar, bateria, wifi) renderują się na czarno, stając się nieczytelne na ciemnym tle aplikacji.
2. Przy włączonej nawigacji 3-przyciskowej (trójkąt, kółko, kwadrat - 48dp) silnik WebView nie przekazuje wysokości przycisków do CSS `env(safe-area-inset-bottom)`, przez co pasek systemowy zasłania dolne menu aplikacji `BottomNav`.
3. Podczas zimnego startu aplikacji przed załadowaniem WebView okno renderuje czarne tło z powodu `android:background="@null"` w motywie.

## What Changes
- **Wymuszenie białych ikon paska statusu i nawigacji**: W `MainActivity.java` programowe wywołanie `WindowInsetsControllerCompat.setAppearanceLightStatusBars(false)` i `setAppearanceLightNavigationBars(false)` gwarantujące białe ikony niezależnie od motywu systemowego (Light/Dark).
- **Dynamiczny mostek marginesów systemowych (Safe Area Inset Bridge)**: Rejestracja `OnApplyWindowInsetsListener` w `MainActivity.java` i wstrzykiwanie rzeczywistych wymiarów paska nawigacji i status baru do zmiennych CSS `--safe-area-inset-bottom` i `--safe-area-inset-top`.
- **Obsługa 3-przyciskowej nawigacji w CSS i `BottomNav.tsx`**: Zastosowanie `max(env(safe-area-inset-bottom, 0px), var(--safe-area-inset-bottom, 0px))` w `BottomNav` oraz w klasie `.app-safe-bottom`.
- **Ciemne tło startowe okna Androida**: Zmiana `android:background` na kolor `#141d1f` w `styles.xml` eliminująca czarny ekran podczas ładowania.

## Capabilities

### Modified Capabilities
- `ui-layout`: Dodanie wymagań dotyczących obsługi systemowej nawigacji 3-przyciskowej Androida (48dp) oraz programowego wymuszania jasnych ikon paska stanu.

## Impact
- `android/app/src/main/java/com/pepitolabs/generator/MainActivity.java`
- `android/app/src/main/res/values/styles.xml`
- `src/app/globals.css`
- `src/components/BottomNav.tsx`

