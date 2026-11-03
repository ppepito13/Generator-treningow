# Tasks

## 1. Komponent Wektorowy i Integracja UI

- [x] 1.1 [src/components/icons/GoogleIcon.tsx] Utworzyć komponent wektorowy SVG `GoogleIcon` z oficjalnymi 4 kolorami marki Google (#4285F4, #EA4335, #FBBC05, #34A853) i obsługą `className`. Zweryfikować kompilację (`npx tsc --noEmit`).
- [x] 1.2 [src/components/SettingsView.tsx] Zintegrować `GoogleIcon` w kafelku stanu niezalogowanego (zastępując tekst 'G') oraz na przycisku „Połącz z Kontem Google”. Zweryfikować brak błędów lintera (`npx next lint`).
- [x] 1.3 [src/tests/ui/SettingsView.test.tsx] Zaktualizować i rozszerzyć testy renderowania widoku Ustawień o weryfikację obecności `GoogleIcon` w stanie niezalogowanym. Zweryfikować testem (`npx vitest run src/tests/ui/SettingsView.test.tsx`).

## 2. Pełna Weryfikacja Jakościowa

- [x] 2.1 [npm run verify] Uruchomić pełną bramkę jakościową projektu (`npm run verify`: `tsc --noEmit`, `next lint`, 100% testów Vitest) oraz build statyczny (`npm run build`).

