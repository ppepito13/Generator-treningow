# Proposal: Klient Google Drive i zakres uprawnień appDataFolder (#40.1)

## Why
Aby umożliwić bezserwerową, w 100% prywatną i darmową synchronizację danych użytkownika (własnych ćwiczeń, sal, sprzętu oraz presetów interwałowych) pomiędzy urządzeniami w architekturze Offline-First, aplikacja musi posiadać uprawnienia do prywatnego folderu danych aplikacji na Dysku Google użytkownika (`appDataFolder`) oraz klienta REST API Google Drive v3 do odczytu i zapisu pliku kopii zapasowej.

## What Changes
- **Rozszerzenie zakresu uprawnień OAuth**: Dodanie zakresu `https://www.googleapis.com/auth/drive.appdata` do konfiguracji logowania Google (`googleAuth.ts`) zarówno w bibliotece webowej GIS, jak i w pluginie `@capawesome/capacitor-google-sign-in` na platformie Android.
- **Obsługa Access Token dla Google Drive API**: Zagwarantowanie, że po autoryzacji sesja zachowuje ważny `accessToken` niezbędny do autoryzacji zapytań HTTP do API Dysku Google (nagłówek `Authorization: Bearer <accessToken>`).
- **Implementacja klienta Google Drive (`src/services/cloud/googleDriveClient.ts`)**:
  - `findBackupFile(accessToken)`: Wyszukiwanie istniejącego pliku kopii w przestrzeni `spaces=appDataFolder`.
  - `downloadBackupFile(accessToken, fileId)`: Pobieranie zawartości pliku JSON z chmury.
  - `uploadBackupFile(accessToken, content, existingFileId?)`: Tworzenie nowego pliku (multipart) lub aktualizacja istniejącego pliku (PATCH) w `appDataFolder`.
- **Testy jednostkowe**: Pokrycie serwisu `googleDriveClient.ts` oraz rozszerzonej konfiguracji sesji testami jednostkowymi z mockowaniem zapytań `fetch`.

## Capabilities

### Modified Capabilities
- `user-auth`: Rozszerzenie zakresu autoryzacji OAuth o `https://www.googleapis.com/auth/drive.appdata` oraz utrwalanie i udostępnianie tokenu `accessToken` dla operacji chmurowych.
- `data-storage`: Wprowadzenie zdolności komunikacji z ukrytą przestrzenią `appDataFolder` Google Drive jako medium trwałej kopii zapasowej.

## Impact
- **Pliki autoryzacji**: `src/services/auth/googleAuth.ts`, `src/types/auth.ts`.
- **Nowy serwis**: `src/services/cloud/googleDriveClient.ts`.
- **Testy**: Nowy plik testowy `src/tests/google-drive-client.test.ts` oraz aktualizacja `src/tests/store-auth.test.ts`.
- **Wpływ na UI**: Brak bezpośrednich zmian w komponentach interfejsu (Faza 40.1 to warstwa infrastruktury klienta chmurowego i autoryzacji pod kątem synchronizacji).

