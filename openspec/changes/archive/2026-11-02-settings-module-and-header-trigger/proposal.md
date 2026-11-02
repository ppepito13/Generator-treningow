# Proposal: Dedykowany Moduł Ustawień (#38) & Przycisk Zębatki na Ekranie Głównym

## Why
Aplikacja przygotowuje się do wdrożenia kluczowych funkcji personalizacji i synchronizacji: przełączania motywu jasnego/ciemnego (#15), integracji z Kontem Google (#39) oraz chmurowej synchronizacji bazy (#40). Obecnie brakuje dedykowanego, łatwo dostępnego miejsca w interfejsie na konfigurację tych opcji. 

Ukrywanie ustawień wewnątrz kalkulatorów (`Narzędzia`) lub dodawanie 6. zakładki do dolnej belki nawigacyjnej (`BottomNav`) naruszyłoby standardy ergonomii mobilnej. Konieczne jest stworzenie dedykowanego modułu `SettingsView` oraz intuicyjnego punktu wejścia na ekranie głównym (ikona koła zębatego w prawym górnym rogu nagłówka), działającego w oparciu o bezpośrednie, reaktywne zapisywanie zmian (bez zbędnych ekranów potwierdzeń i przycisków zapisu).

## What Changes
- **Przycisk zębatki (Settings Trigger) na Ekranie Głównym**: Dodanie przycisku w prawym górnym rogu sekcji nagłówka w `ConfigurationForm.tsx` (styl Glassmorphism, responsywny na Mobile i Desktop, z obsługą przejścia do zakładki `settings`).
- **Rozszerzenie routingu i stanu (`store.ts`)**: Rozszerzenie typu `TabType` o wartość `'settings'` oraz zapewnienie poprawnej synchronizacji w stanie aplikacji.
- **Dedykowany widok Ustawień (`SettingsView.tsx`)**:
  - Implementacja widoku w oparciu o komponent `ModuleHeader` (tytuł "Ustawienia", podtytuł "Personalizacja i synchronizacja" oraz przycisk powrotu do Generatora).
  - Sekcja **Wygląd i Motyw**: interfejs wyboru motywu aplikacji (Dark/Light) przygotowany pod pełną implementację w zadaniu #15.
  - Sekcja **Konto i Chmura**: karta statusu połączenia z kontem Google ("Brak połączenia - dane lokalne offline") przygotowana pod zadania #39 i #40.
  - Sekcja **O Aplikacji**: wersja (`v1.3.0`), nazwa, informacje o autorze i licencji.
- **Reaktywne zachowanie (Auto-save & Clean UX)**: Brak uciążliwych monitów o zapis lub anulowanie – przełączniki natychmiast aktualizują stan, a przycisk powrotu (oraz sprzętowy przycisk Back na Androidzie) natychmiast przywraca widok Generatora.
- **Integracja w `page.tsx`**: Renderowanie widoku `SettingsView` przy aktywnym `activeTab === 'settings'` oraz obsługa sprzętowego przycisku wstecz (Android Capacitor).

## Capabilities

### New Capabilities
- `settings-module`: Zapewnienie dedykowanego modułu konfiguracji aplikacji, dostępnego bezpośrednio z ekranu głównego, z obsługą nawigacji, sekcji personalizacji i natychmiastowego zapisywania preferencji.

### Modified Capabilities
*(Brak zmian w wymaganiach istniejących specyfikacji - `settings-module` rozszerza system o nową domenę ustawień).*

## Impact
- `src/app/lib/store.ts` (typ `TabType`)
- `src/components/ConfigurationForm.tsx` (przycisk zębatki w nagłówku)
- `src/components/SettingsView.tsx` (nowy komponent widoku ustawień)
- `src/app/page.tsx` (rejestracja widoku i obsługa sprzętowego przycisku wstecz)
- `src/tests/ui/SettingsView.test.tsx` (testy jednostkowe nawigacji i renderowania)

