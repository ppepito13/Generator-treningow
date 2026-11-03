# Design

## Context
Zobacz `proposal.md` w celu zapoznania się z motywacją biznesową. Aplikacja Generator Sport's Way to statyczna aplikacja Next.js 15 eksportowana do Androida (Capacitor), oparta na wzorcu Offline-First z pamięcią lokalną w Zustand (`localStorage`). Niniejszy projekt realizuje zadanie #39 z `todo.md`.

## Goals / Non-Goals

**Goals:**
- Implementacja modułu uwierzytelniania Google (OAuth 2.0 / Google Identity Services) z minimalnym zakresem tożsamości (`openid`, `email`, `profile`).
- Bezpieczne zarządzanie tożsamością użytkownika w Zustand Store (`googleUser`, `authStatus`).
- Reaktywny interfejs w sekcji „Konto i Kopia Zapasowa” w module Ustawień (`SettingsView`).
- Dedykowany modal ostrzegawczy z wymuszonym zatwierdzeniem ręcznym przy odłączaniu konta (`DisconnectAccountDialog`).
- Zapewnienie 100% zielonych testów jednostkowych i integralności z bramką `npm run verify` bez wymogu obecności sekretów w CI.

**Non-Goals:**
- Implementacja odczytu i zapisu plików w Google Drive AppData lub bazach danych (przedmiot zadania #40).
- Zmiany w logice generatora treningów, ćwiczeń czy sal.

## Decisions

### Decyzja 1: Klient Google Identity Services (GIS) z mechanizmem Token Client
- **Wybór:** Zastosowanie lekkiego adaptera ładującego skrypt `https://accounts.google.com/gsi/client` z obsługą `google.accounts.oauth2.initTokenClient`.
- **Uzasadnienie:** Rozwiązanie w 100% po stronie klienta, nie wymaga backendu serwerowego Node.js, działa bezproblemowo w statycznym eksporcie (`out/`) oraz aplikacji Capacitor.
- **Alternatywa odrzucona:** Firebase Auth SDK – odrzucona zgodnie z ustaleniami z użytkownikiem, aby nie wiązać aplikacji z centralną bazą i backendem pośredniczącym.

### Decyzja 2: Separacja Profilu od Tokenu w Pamięci Podręcznej
- **Wybór:** Dane profilu (`id`, `name`, `email`, `picture`) są utrwalane w `localStorage` w ramach `partializeStoreState`, natomiast krótkotrwały token dostępowy (`access_token`) jest przechowywany wyłącznie w pamięci RAM (`sessionStorage` / in-memory).
- **Uzasadnienie:** Zapewnia natychmiastowe wyświetlanie połączonego profilu po restarcie aplikacji bez ryzyka wycieku tokenów dostępowych z pamięci trwałej.

### Decyzja 3: Dialog potwierdzenia na bazie Radix UI AlertDialog
- **Wybór:** Wykorzystanie zainstalowanego w projekcie `@radix-ui/react-alert-dialog` do stworzenia `DisconnectAccountDialog`.
- **Uzasadnienie:** Spełnia wymóg biznesowy zadania #39 (ostrzeżenie przed odpięciem, ręczne zatwierdzenie), zapewniając pełną dostępność klawiaturową i spójny wygląd glass-card.

## Risks / Trade-offs

- **[Ryzyko: Brak skonfigurowanego `NEXT_PUBLIC_GOOGLE_CLIENT_ID` w środowisku CI]** → **Mitygacja:** Serwis autoryzacyjny `googleAuth.ts` implementuje defensywne sprawdzenie konfiguracji – przy braku klienta nie crashuje aplikacji, lecz zwraca czytelny status konfiguracji, a testy jednostkowe korzystają z mocka adaptera.
- **[Ryzyko: Blokada wyskakujących okienek (pop-up blocker) w przeglądarce]** → **Mitygacja:** Inicjalizacja żądania autoryzacji następuje wyłącznie w synchronicznym handlerze zdarzenia kliknięcia (`onClick`) użytkownika.

