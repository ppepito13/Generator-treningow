# Design

## Context

Sekcja Konta w `SettingsView.tsx` wyświetlała tymczasowy, prosty czarny znak tekstowy `G` na białym tle. Użytkownik oczekuje oficjalnego, wielokolorowego logotypu Google SVG zgodnego z wytycznymi Google Identity (Screen 1) w kafelku statusu oraz na przycisku logowania. Ponadto zweryfikowano i potwierdzono wgranie ikony aplikacji (`assets/icon.png`, 512x512 px) w konsoli Google Cloud (Screen 2).

## Goals / Non-Goals

**Goals:**
- Dedykowany komponent wektorowy SVG `GoogleIcon` renderujący oficjalne 4 kolory marki Google (niebieski `#4285F4`, czerwony `#EA4335`, żółty `#FBBC05`, zielony `#34A853`).
- Zastosowanie `GoogleIcon` w kafelku stanu niezalogowanego w `SettingsView.tsx` na estetycznym tle dopasowanym do motywu.
- Zastosowanie `GoogleIcon` na przycisku „Połącz z Kontem Google” w `SettingsView.tsx` z zachowaniem stanu ładowania (spinner `Loader2`).
- Aktualizacja i uzupełnienie testów jednostkowych UI w `SettingsView.test.tsx`.

**Non-Goals:**
- Zmiany w logice autoryzacji Google Identity Services (`googleAuth.ts`).
- Zmiany w Zustand store ani w typach autoryzacji.
- Implementacja synchronizacji danych (#40).

## Decisions

1. **Komponent `GoogleIcon` jako czysty komponent SVG React (`src/components/icons/GoogleIcon.tsx`):**
   - *Uzasadnienie:* Umożliwia reużywalność, zachowuje skalowalność wektorową (CSS classes `h-X w-X`), brak zewnętrznych zależności sieciowych (100% offline, zgodnie ze standardem Capacitor/Android).
   - *Alternatywy:* Plik PNG lub zewnętrzny font - odrzucone z uwagi na jakość skalowania i wymóg offline.
2. **Kombinacja z przyciskiem akcji:**
   - Na przycisku „Połącz z Kontem Google” kolorowa ikonka Google zastępuje generyczną ikonę `LogIn`, dając jednoznaczny sygnał tożsamościowy zgodny ze standardem Sign in with Google.
   - W stanie ładowania przycisk nadal pokazuje animowany `Loader2`.

## Risks / Trade-offs

- [Risk] Czytelność wielokolorowego logo na ciemnym tle przycisku:
  - *Mitigation:* Na przycisku ikona Google ma naturalne, wyraziste kolory i kontrastuje z ciemnym tłem oraz jasnym tekstem. Na kafelku ikona umieszczona jest w eleganckim, zaokrąglonym białym tle (dokładnie jak na mockach Google).

