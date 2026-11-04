# Tasks: Klient Google Drive i zakres uprawnień appDataFolder (#40.1)

## 1. Uprawnienia OAuth i Sesja

- [x] 1.1 [src/types/auth.ts] Rozszerzyć typ `AuthSession` o pole `accessToken?: string` oraz typy pomocnicze dla operacji chmurowych na Dysku Google.
- [x] 1.2 [src/services/auth/googleAuth.ts] Rozszerzyć stałą `DEFAULT_SCOPES` o `https://www.googleapis.com/auth/drive.appdata` oraz przekazać ten zakres do inicjalizacji pluginu natywnego Androida (`scopes`).
- [x] 1.3 [src/services/auth/googleAuth.ts] Zaimplementować i wyeksportować funkcję pomocniczą `getValidAccessToken()`, umożliwiającą bezpieczne pobranie aktualnego tokenu dostępowego dla klienta Google Drive.

## 2. Klient REST API Google Drive v3

- [x] 2.1 [src/services/cloud/googleDriveClient.ts] Utworzyć plik serwisu oraz zaimplementować funkcję `findBackupFile(accessToken, fileName)` wyszukującą plik w przestrzeni `appDataFolder`.
- [x] 2.2 [src/services/cloud/googleDriveClient.ts] Zaimplementować funkcję `downloadBackupFile<T>(accessToken, fileId)` pobierającą i parsującą plik JSON z `appDataFolder`.
- [x] 2.3 [src/services/cloud/googleDriveClient.ts] Zaimplementować funkcję `uploadBackupFile(accessToken, content, existingFileId?)` obsługującą tworzenie nowego pliku (multipart) lub aktualizację istniejącego (PATCH).

## 3. Testy Jednostkowe i Bramka Jakości

- [x] 3.1 [src/tests/google-drive-client.test.ts] Utworzyć testy jednostkowe pokrywające wyszukiwanie, pobieranie, tworzenie, aktualizację oraz obsługę błędów HTTP (401, 403, błąd sieci) z mockowaniem `fetch`.
- [x] 3.2 [npm run verify] Uruchomić pełną lokalną bramkę jakości (TypeScript, ESLint, Vitest) i zweryfikować 100% zielonych testów przed finalizacją zmiany.

