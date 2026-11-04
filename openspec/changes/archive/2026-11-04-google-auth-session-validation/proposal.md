# Proposal: Cicha weryfikacja sesji Google i detekcja cofnięcia uprawnień w tle (#50)

## Why

Obecnie aplikacja zapamiętuje dane zalogowanego profilu Google (`googleUser`) w pamięci lokalnej urządzenia (`localStorage`), co pozwala na działanie w trybie Offline-First. Jednak po restarcie aplikacja nie przeprowadza aktywnej weryfikacji żywotności sesji – jeśli użytkownik cofnął uprawnienia aplikacji zewnętrznie na koncie Google (`myaccount.google.com`) lub usunął konto z telefonu, aplikacja nadal wyświetla fałszywy status „Połączono”. Stwarza to iluzję bezpieczeństwa i wysokie ryzyko desynchronizacji danych.

Rozwiązaniem jest wdrożenie mechanizmu cichej weryfikacji tożsamości w tle (Background Silent Revalidation) przy wejściu do modułu Ustawień oraz przy starcie aplikacji (o ile urządzenie ma połączenie z Internetem), automatycznie wykrywającego unieważnienie dostępu i informującego o konieczności ponownego połączenia bez naruszania trybu Offline-First.

## What Changes

- Implementacja procedury walidacji sesji w tle (`validateGoogleSession`) w serwisie `src/services/auth/googleAuth.ts`, weryfikującej ważność poświadczeń Google za pomocą lekkiego zapytania kontrolnego `tokeninfo` lub natywnego mechanizmu poświadczeń.
- Obsługa stanu wycofania uprawnień (Revocation / 401 Unauthorized / NoCredential): automatyczne wyczyszczenie zapamiętanego profilu `googleUser`, przestawienie statusu na `idle` i wyświetlenie czytelnego komunikatu ostrzegawczego w języku polskim: *„Dostęp do Konta Google wygasł lub został cofnięty na Twoim koncie. Zaloguj się ponownie, aby wznowić zabezpieczanie danych.”*.
- Obsługa trybu Offline-First: przy braku połączenia sieciowego (`!navigator.onLine`) aplikacja nie resetuje sesji ani nie usuwa danych, lecz prezentuje stan *„Lokalnie (Offline)”*.
- Wdrożenie cichego sprawdzania sesji w `src/components/SettingsView.tsx` oraz podpięcie pod cykl życia aplikacji.
- Pokrycie scenariuszy walidacji sesji testami jednostkowymi w `src/tests/store-auth.test.ts`.

## Capabilities

### Modified Capabilities
- `user-auth`: Wprowadzenie wymagania cichej weryfikacji sesji tożsamości w tle oraz automatycznego wykrywania wycofania dostępu i ochrony przed desynchronizacją.

## Impact

- `src/services/auth/googleAuth.ts`: funkcja `validateGoogleSession` i obsługa unieważnienia tokenu.
- `src/app/lib/store.ts`: obsługa stanu walidacji i czyszczenia sesji w przypadku cofnięcia uprawnień.
- `src/components/SettingsView.tsx`: cicha weryfikacja przy wejściu na widok oraz czytelna prezentacja statusu.
- `src/tests/store-auth.test.ts`: testy automatyczne weryfikacji i detekcji wycofania uprawnień.

