# Design: Mobilny Edge-to-Edge i Architektura Bezpiecznych Stref

## Context
Zobacz `proposal.md` pod kątem motywacji i analizy problemu. Obecny kod posiada częściowe zabezpieczenia `app-safe-top`, lecz brak natywnego Edge-to-Edge na Androidzie odcina dolny pasek gestów czarną ramką, a brak globalnej nakładki blur powoduje kolizję przewijanej treści z fizycznym wycięciem aparatu.

## Goals / Non-Goals

**Goals:**
- Aktywacja natywnego Edge-to-Edge w kodzie Java i zasobach Androida (`MainActivity.java`, `styles.xml`).
- Stworzenie globalnej nakładki `Global Top Shield` w `layout.tsx`, chroniącej obszar paska statusu i notcha we wszystkich 5 widokach.
- Zapewnienie pełnej szerokości `w-full` dolnego paska nawigacyjnego z zachowaniem `backdrop-blur` do dolnej krawędzi ekranu (`pb-[env(safe-area-inset-bottom)]`).
- Reaktywne ukrywanie `BottomNav` przy aktywacji klawiatury ekranowej przy użyciu `window.visualViewport`.
- Wzbogacenie `globals.css` o reguły mobilne: `.scrollbar-none`, blokadę pull-to-refresh (`overscroll-behavior-y: none`), usunięcie tap highlight oraz zabezpieczenie pól input przed auto-zoomem na iOS (16px).

**Non-Goals:**
- Przebudowa wewnętrznych wierszy kroków w Zegarze i elastyczność przycisków w kalkulatorach (zadanie to stanowi zakres Zmiany 2: `ui-mobile-timer-and-circuit-refinement`).

## Decisions

### 1. `WindowCompat.setDecorFitsSystemWindows` i przezroczyste style Androida
- **Wybór:** W `MainActivity.java` wywołujemy `WindowCompat.setDecorFitsSystemWindows(getWindow(), false)`, a w `styles.xml` ustawiamy `statusBarColor` i `navigationBarColor` na `@android:color/transparent` z `windowLightStatusBar=false` i `windowLightNavigationBar=false`.
- **Alternatywa:** Pozostawienie domyślnego systemu okien Androida i sztywnych kolorów. Odrzucono, ponieważ generowało to odcięty czarny pasek pod gestami Androida.

### 2. Detekcja klawiatury przez `window.visualViewport` zamiast `@capacitor/keyboard`
- **Wybór:** Wykorzystanie standardowego API `window.visualViewport` z nasłuchem na zdarzenie `resize`.
- **Dlaczego:** Działa w 100% spójnie w przeglądarce mobilnej, Android WebView oraz iOS Safari bez konieczności instalowania zewnętrznych wtyczek Capacitora i modyfikacji kodu natywnego.
- **Alternatywa:** `@capacitor/keyboard` – wymagałoby dodatkowej zależności npm i synchronizacji z Gradle, nie działałoby w czystym webie.

### 3. Global Top Shield w `src/app/layout.tsx`
- **Wybór:** Zdefiniowanie stałego elementu `fixed top-0 left-0 right-0` z `backdrop-blur-md`, gradientem tła i maską alpha w `layout.tsx`, a usunięcie zduplikowanego fragmentu z `ConfigurationForm.tsx`.
- **Dlaczego:** Chroni wszystkie 5 zakładek (Generator, Zestaw, Zegar, Narzędzia, Studio) przed kolizją z obiektywem aparatu w jednym centralnym miejscu.

## Risks / Trade-offs

- [Brak wsparcia `visualViewport` w bardzo starych silnikach WebView] → Dodanie zabezpieczenia `typeof window !== 'undefined' && window.visualViewport`; w razie braku API pasek zachowuje się jak dotychczas bez wywoływania błędów wykonania.
- [Duplikacja nakładek blur po dodaniu do layoutu] → Konieczność bezwzględnego usunięcia lokalnej nakładki z `ConfigurationForm.tsx`.

