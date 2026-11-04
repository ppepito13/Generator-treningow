# Proposal: Spolszczenie i przyjazne komunikaty błędów autoryzacji Google (#49)

## Why

Obecnie w przypadku problemów z autoryzacją Google na platformie Android (np. brak konta na urządzeniu, niepowiązana konfiguracja Google Cloud, anulowanie operacji przez użytkownika lub brak usług Google Play) aplikacja wyświetla surowe, techniczne wyjątki w języku angielskim pochodzące bezpośrednio z wtyczki `@capawesome/capacitor-google-sign-in` (np. `No Google account is available on this device.`, `The user canceled the sign-in flow.`).

Wyświetlanie niezrozumiałych komunikatów technicznych dezinformuje użytkownika i obniża jakość doświadczenia (UX). Celem tej zmiany jest wprowadzenie scentralizowanego mapowania błędów autoryzacji na jednoznaczne, pomocne i estetyczne komunikaty w języku polskim, z precyzyjną informacją o przyczynie i krokach zaradczych.

## What Changes

- Utworzenie modułu `src/services/auth/authErrors.ts` zawierającego funkcję mapującą techniczne wyjątki Android Credential Manager oraz webowego GIS na czytelne komunikaty po polsku.
- Obsługa scenariusza anulowania logowania przez użytkownika: wyświetlenie dedykowanego, łagodnego komunikatu w języku polskim (*„Logowanie zostało anulowane.”*) zamiast technicznego wyjątku.
- Obsługa błędu braku konta lub braku powiązania w Google Cloud: prezentacja jasnej instrukcji (*„Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.”*).
- Zintegrowanie mapowania błędów w serwisie `src/services/auth/googleAuth.ts` oraz w komponencie `src/components/SettingsView.tsx`.
- Dodanie zestawu testów jednostkowych weryfikujących poprawność mapowania wszystkich znanych typów błędów w `src/tests/auth-errors.test.ts`.

## Capabilities

### Modified Capabilities
- `user-auth`: Wprowadzenie wymagania prezentacji przyjaznych, zlokalizowanych komunikatów błędów autoryzacji w języku polskim dla wszystkich znanych scenariuszy niepowodzenia i anulowania.

## Impact

- `src/services/auth/authErrors.ts` (nowy plik mapowania błędów).
- `src/services/auth/googleAuth.ts` (wykorzystanie mapera w przepływie natywnym i webowym).
- `src/components/SettingsView.tsx` (obsługa sformatowanych komunikatów).
- `src/tests/auth-errors.test.ts` (nowy plik testów jednostkowych).

