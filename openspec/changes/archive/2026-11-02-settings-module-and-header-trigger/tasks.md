# Tasks: settings-module-and-header-trigger

## 1. Faza 1: Rozszerzenie stanu i przycisk zębatki na Ekranie Głównym (Preview Triggera)

- [x] 1.1 [src/app/lib/store.ts] Rozszerzenie unii `TabType` o wartość `'settings'` oraz uwzględnienie jej w `partializeStoreState`
- [x] 1.2 [src/components/ConfigurationForm.tsx] Dodanie przycisku z ikoną koła zębatego w prawym górnym rogu sekcji nagłówka z akcją `setActiveTab('settings')`
- [x] 1.3 [src/components/SettingsView.tsx] Utworzenie wstępnego komponentu `SettingsView` z komponentem `ModuleHeader` i przyciskiem powrotu do Generatora
- [x] 1.4 [src/app/page.tsx] Rejestracja widoku `SettingsView` w głównym szablonie `Home` oraz podpięcie powrotu w obsłudze przycisku sprzętowego Capacitor

## 2. Faza 2: Szablon kart konfiguracyjnych Ustawień i Weryfikacja

- [x] 2.1 [src/components/SettingsView.tsx] Implementacja sekcji Personalizacji (karta wyboru motywu Jasny/Ciemny przygotowana pod #15)
- [x] 2.2 [src/components/SettingsView.tsx] Implementacja sekcji Konta i Chmury (karta statusu Google przygotowana pod #39 i #40)
- [x] 2.3 [src/components/SettingsView.tsx] Implementacja sekcji O Aplikacji (wersja v1.3.0, status bazy ćwiczeń i sal)
- [x] 2.4 [src/tests/ui/SettingsView.test.tsx] Dodanie testów jednostkowych Vitest weryfikujących renderowanie `SettingsView` oraz poprawność powrotu do Generatora
- [x] 2.5 [src/app/page.tsx] Weryfikacja jakościowa całego projektu (`npm run verify` oraz `npm run cap:sync`)

