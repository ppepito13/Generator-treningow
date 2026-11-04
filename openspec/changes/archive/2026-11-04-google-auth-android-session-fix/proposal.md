# Proposal: Poprawka trwałości sesji Google na Androidzie i eliminacja samoczynnego wylogowania (#50)

## Why

Podczas testów na emulatorze Androida zdiagnozowano problem ponownego logowania po wcześniejszym cofnięciu uprawnień: po kliknięciu „Połącz z Kontem Google” konto było pomyślnie autoryzowane w Google Cloud, jednak aplikacja natychmiast wracała do stanu błędu o cofnięciu uprawnień.
Przyczyną były dwa błędy:
1. W środowisku natywnym Androida (`@capawesome/capacitor-google-sign-in`) tożsamość jest przekazywana w tokenie `idToken` (Google JWT), podczas gdy `accessToken` ma wartość `null`. Dotychczasowy kod pomijał zapis sesji przy braku `accessToken`, przez co pamięć sesji pozostawała pusta.
2. Hook `useEffect` w `SettingsView.tsx` reagował na każdą zmianę `googleUser`, uruchamiając procedurę walidacji w tym samym cyklu renderowania tuż po kliknięciu przycisku logowania. Wobec braku zapisanego tokenu procedura uznawała sesję za odwołaną i natychmiast czyściła profil użytkownika.

## What Changes

- W `src/services/auth/googleAuth.ts`: Zapisywanie `idToken`, `accessToken` oraz `serverAuthCode` w `saveAuthSession` dla przepływu natywnego Androida.
- W `src/services/auth/googleAuth.ts`: Rozszerzenie procedury `validateGoogleSession` o obsługę tokenów `idToken` (zapytanie do `tokeninfo?id_token=`). Zabezpieczenie przed traktowaniem standardowego 60-minutowego wygaśnięcia podpisu ID tokenu jako odwołania sesji offline na telefonie.
- W `src/components/SettingsView.tsx`: Ograniczenie uruchamiania cichej weryfikacji sesji w tle wyłącznie do jednorazowego wejścia do widoku Ustawień (na montowanie komponentu: `[]`), eliminując niepożądaną rewalidację natychmiast po ręcznym kliknięciu logowania.
- Pokrycie scenariuszy testami jednostkowymi w `src/tests/store-auth.test.ts`.

## Capabilities

### Modified Capabilities
- `user-auth`: Wprowadzenie obsługi tokenów tożsamości `idToken` w środowisku natywnym Androida oraz zabezpieczenie przed natychmiastową rewalidacją sesji po udanym logowaniu.

## Impact

- `src/services/auth/googleAuth.ts`
- `src/components/SettingsView.tsx`
- `src/tests/store-auth.test.ts`
