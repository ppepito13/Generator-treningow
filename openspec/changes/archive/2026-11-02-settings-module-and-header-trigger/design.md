# Design: Dedykowany Moduł Ustawień (#38) & Przycisk Zębatki

## Context
Aplikacja wykorzystuje Zustand (`store.ts`) do zarządzania stanem oraz model zakładek nawigacyjnych `activeTab: TabType`. Widoki główne (`generator`, `circuit`, `timer`, `calculators`, `studio`) są kontrolowane przez dolną belkę `BottomNav` i renderowane warunkowo w `page.tsx`. W `page.tsx` wdrożona jest obsługa sprzętowego przycisku wstecz dla urządzeń mobilnych (Capacitor App plugin).

## Goals / Non-Goals

**Goals:**
- Dodać dyskretny, estetyczny przycisk koła zębatego w prawym górnym rogu nagłówka w `ConfigurationForm.tsx`.
- Rozszerzyć `TabType` o `'settings'` bez przeładowywania dolnej belki `BottomNav` (BottomNav zachowuje dokładnie 5 zakładek).
- Zaimplementować komponent `SettingsView` w oparciu o reużywalny `ModuleHeader` z przyciskiem powrotu do Generatora.
- Przygotować czyste, reaktywne sekcje (Auto-save) dla Motywu (#15), Konta Google (#39, #40) oraz O Aplikacji.
- Zapewnić obsługę sprzętowego przycisku Back w Capacitor na Androidzie (automatyczny powrót z Ustawień do Generatora).

**Non-Goals:**
- Wdrożenie pełnego mechanizmu przełączania klas CSS motywu jasnego/ciemnego (to zakres zadania #15).
- Integracja z Google OAuth / Google Drive API (to zakres zadań #39 i #40).
- Wprowadzanie uciążliwych formularzy typu draft/zapisz/anuluj – preferowane jest natychmiastowe reaktywne zachowanie (Auto-save).

## Decisions

### 1. Pozycjonowanie przycisku zębatki w nagłówku
- **Wybór:** W `ConfigurationForm.tsx` sekcja nagłówka otrzymuje klasę `relative`, a przycisk zębatki jest pozycjonowany jako `absolute top-0 right-0`.
- **Uzasadnienie:**
  - W wersji desktopowej przycisk zakotwiczony jest do prawej krawędzi kontenera `app-container-narrow`, dzięki czemu nie „ucieka” na skraj szerokiego monitora.
  - W wersji mobilnej wycentrowany kafelek tytułu ma ~240px szerokości, co przy ekranie 360px pozostawia ~60px marginesu bocznego. Przycisk o wymiarach 40×40px mieści się idealnie bez kolizji z tytułem.
- **Alternatywa odrzucona:** Dodanie 6. ikony do dolnej belki `BottomNav` (odrzucone ze względu na naruszenie standardów ergonomii kciuka i touch targetów na ekranach 360px).

### 2. Architektura widoku `SettingsView` i brak pośrednich monitów o zapis
- **Wybór:** Reaktywny widok pełnoekranowy (Auto-save) z nagłówkiem `ModuleHeader` zawierającym przycisk powrotu.
- **Uzasadnienie:** Użytkownik w ustawieniach przełącza preferencje (np. motyw, logowanie). Tworzenie stanu roboczego (draft) i przycisków „Zapisz / Anuluj” komplikowałoby UX i wymagało ostrzeżeń przed wyjściem. Natychmiastowe działanie jest nowoczesnym standardem aplikacji mobilnych.
- **Alternatywa odrzucona:** Modal (okno dialogowe) – zbyt ciasny na telefonach przy przyszłym rozbudowaniu o status synchronizacji Google.

## Risks / Trade-offs

- [Kolizja z wcięciem aparatu (Notch/Camera hole)] → Zapewnione użycie klasy `app-safe-top` oraz integracja z istniejącym `Global Top Shield` w `layout.tsx`.
- [Zagubienie użytkownika po wejściu do Ustawień] → Zapewnienie dwóch dróg powrotu: bezpośredni przycisk „Wróć” w `ModuleHeader` oraz kliknięcie dowolnej zakładki w dolnej belce `BottomNav` lub sprzętowy przycisk Back na Androidzie.

