# Proposal

## Why

Obecna implementacja sekcji Konta w Ustawieniach wykorzystuje tymczasowy, czarny znak litery "G" na białym tle, co odbiega od standardów wizualnych Google Identity oraz nie jest atrakcyjne wizualnie dla użytkownika. Zastąpienie go oficjalnym, 4-kolorowym wektorem SVG Google na karcie statusu oraz na przycisku logowania zapewni spójny, profesjonalny i zgodny z wytycznymi brandingowymi interfejs użytkownika.

## What Changes

- Utworzenie komponentu ikony wektorowej Google (`GoogleLogoIcon` lub `GoogleIcon`) ze standardowymi 4 kolorami marki Google (niebieski `#4285F4`, czerwony `#EA4335`, żółty `#FBBC05`, zielony `#34A853`).
- Zastąpienie czarnego tekstu `G` w kafelku stanu niezalogowanego w `SettingsView.tsx` nową, kolorową ikoną Google SVG.
- Umieszczenie wielokolorowego logo Google bezpośrednio na przycisku akcji „Połącz z Kontem Google” w `SettingsView.tsx`.
- Weryfikacja i rozszerzenie testów renderowania UI w `SettingsView.test.tsx`.

## Capabilities

### New Capabilities
<!-- Brak nowych capabilities - rozwijamy istniejącą specyfikację settings-module -->

### Modified Capabilities
- `settings-module`: Aktualizacja wymagań dotyczących prezentacji stanu niezalogowanego w sekcji Konta Google z uwzględnieniem oficjalnego logotypu wielokolorowego.

## Impact

- Kod UI: `src/components/SettingsView.tsx`, nowy komponent `src/components/icons/GoogleIcon.tsx`.
- Testy: `src/tests/ui/SettingsView.test.tsx`.
- Brak zmian w architekturze store, silniku generatora ani w Capacitor/Android.

