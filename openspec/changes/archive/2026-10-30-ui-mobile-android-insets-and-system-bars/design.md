# Design: Obsługa Marginesów Nawigacji 3-Przyciskowej i Kontroler Pasków

## Context
Zobacz `proposal.md`. W trybie jasnym Androida statyczne flagi motywu XML są ignorowane przez `WindowInsetsController`, a silnik WebView w Androidzie API <= 34 nie udostępnia wysokości paska 3 przycisków w CSS `env(safe-area-inset-bottom)`.

## Goals / Non-Goals

**Goals:**
- Programowe wymuszenie jasnych ikon w `MainActivity.java` za pomocą `WindowInsetsControllerCompat`.
- Wstrzykiwanie rzeczywistych wysokości pasków systemowych w dp do zmiennych CSS `--safe-area-inset-top` i `--safe-area-inset-bottom` z poziomu `OnApplyWindowInsetsListener`.
- Odczyt zmiennych CSS w `globals.css` oraz `BottomNav.tsx`.
- Ustawienie spójnego tła `#141d1f` w stylach okna startowego Androida.

**Non-Goals:**
- Zmiana struktury komponentów generatora czy timera.

## Decisions

### 1. Mostek WindowInsets do zmiennych CSS w WebView
- **Wybór:** Rejestracja listenera `OnApplyWindowInsetsListener` na `DecorView`, obliczenie wysokości w dp (`insets / density`) i wywołanie `getBridge().getWebView().evaluateJavascript` z ustawieniem zmiennych CSS `--safe-area-inset-bottom` i `--safe-area-inset-top`.
- **Dlaczego:** Pozwala to na precyzyjne obsłużenie zarówno 48dp (3 przyciski), 24dp (gesty), jak i niestandardowych pasków producentów (np. Samsung OneUI) bez instalowania zewnętrznych bibliotek npm.

### 2. Programowy `WindowInsetsControllerCompat`
- **Wybór:** Wywołanie `controller.setAppearanceLightStatusBars(false)` i `controller.setAppearanceLightNavigationBars(false)` w Java.
- **Dlaczego:** To jedyny 100% pewny sposób w Androidzie 11–15+ na wymuszenie białych ikon, niezależnie od motywu telefonu.

## Risks / Trade-offs

- [Opóźnienie wstrzyknięcia zmiennej CSS podczas startu] → Zastosowanie `post()` na wątku głównym WebView oraz `max(env(), var())` w CSS jako płynny fallback.

