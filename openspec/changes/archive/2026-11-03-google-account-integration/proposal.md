# Proposal: Integracja z Kontem Google (#39)

## Why

Obecnie Generator Sport's Way funkcjonuje wyłącznie w izolowanym trybie lokalnym na jednym urządzeniu. Brak możliwości połączenia aplikacji z Kontem Google uniemożliwia identyfikację użytkownika oraz blokuje wdrożenie automatycznej kopii zapasowej i synchronizacji autorskich ćwiczeń, sal i sprzętu w chmurze (#40). Niniejsza zmiana wprowadza bezpieczną warstwę uwierzytelniania Google z minimalnym zakresem uprawnień (`openid`, `email`, `profile`), zarządzanie stanem sesji w store oraz interfejs w Ustawieniach z obligatoryjnym dialogiem potwierdzenia odpięcia konta.

## What Changes

- **Moduł Uwierzytelniania Google (`googleAuth.ts`)**: Wdrożenie czystego klienta autoryzacji Google (Google Identity Services / OAuth 2.0) wykorzystującego identyfikator klienta `NEXT_PUBLIC_GOOGLE_CLIENT_ID` z bezpiecznym fallbackiem w środowiskach testowych i deweloperskich.
- **Rozszerzenie Stanu Aplikacji (Zustand Store)**: Dodanie stanu sesji użytkownika (`user: GoogleUserProfile | null`, `authStatus: 'idle' | 'loading' | 'authenticated' | 'error'`, `loginWithGoogle()`, `disconnectGoogleAccount()`).
- **Sekcja Konta w Module Ustawień (`SettingsView`)**:
  - W stanie niezalogowanym: interaktywny przycisk „Połącz z Kontem Google” z obsługą stanu ładowania i błędów.
  - W stanie zalogowanym: karta profilu użytkownika (zdjęcie profilowe/awatar, imię, adres e-mail, zielony status „Połączono z Google”) oraz przycisk „Odłącz konto Google”.
- **Modal Potwierdzenia Odłączenia Konta (`DisconnectAccountDialog`)**: Wymagany przez zadanie #39 mechanizm ręcznego zatwierdzenia odpięcia konta z jednoznacznym ostrzeżeniem, że wstrzyma to synchronizację w chmurze, ale zachowa dane lokalne na urządzeniu.
- **Konfiguracja Środowiska**: Dodanie szablonu zmiennych środowiskowych `.env.local.example` oraz instrukcji konfiguracyjnej `GOOGLE_AUTH_SETUP.md`.

## Capabilities

### New Capabilities
- `user-auth`: Odpowiada za uwierzytelnianie użytkownika, zarządzanie tokenami i sesją tożsamości z zewnętrznymi dostawcami (Google OAuth) oraz bezpieczne wylogowywanie.

### Modified Capabilities
- `settings-module`: Rozszerzenie sekcji Konta w Ustawieniach o reaktywny widok połączonego profilu Google oraz modal bezpiecznego odłączania konta z wymaganym zatwierdzeniem ręcznym.

## Impact

- `src/types/auth.ts`: nowe typy profilu i sesji Google.
- `src/services/auth/googleAuth.ts`: serwis autoryzacji Google.
- `src/app/lib/store.ts`: rozszerzenie store o stan autoryzacji (z zachowaniem migracji stanu v1).
- `src/components/SettingsView.tsx`: przebudowa sekcji konta.
- `src/components/DisconnectAccountDialog.tsx`: nowy komponent okna dialogowego.
- Zależności: brak nowych ciężkich bibliotek – integracja oparta o lekki standard Google Identity Services (GIS).

