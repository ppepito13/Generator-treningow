# Design: Klient Google Drive i zakres uprawnień appDataFolder (#40.1)

## Context
Aplikacja ma działać w architekturze Offline-First, wykorzystując prywatny folder aplikacji na Dysku Google (`appDataFolder`) jako bezserwerowe medium synchronizacji danych użytkownika. W Google Cloud Console dla powiązanego projektu włączono już Google Drive API (APIs & Services -> Enable Google Drive API). W ramach Fazy 40.1 przygotowujemy fundament komunikacji: rozszerzenie uprawnień OAuth o `https://www.googleapis.com/auth/drive.appdata` oraz implementację klienta REST API Google Drive v3 (`src/services/cloud/googleDriveClient.ts`). Rozmiar danych kopii to zaledwie kilkadziesiąt kB, co pozwala na błyskawiczny transfer (ułamek sekundy) i częste odpytywanie w tle.

## Goals / Non-Goals

**Goals:**
- Rozszerzenie żądanych zakresów OAuth w `src/services/auth/googleAuth.ts` o `https://www.googleapis.com/auth/drive.appdata` dla Web i natywnego Androida.
- Zapewnienie, że sesja uwierzytelnienia zachowuje i udostępnia `accessToken` wymagany do zapytań HTTP do API Dysku Google.
- Implementacja dedykowanego serwisu `src/services/cloud/googleDriveClient.ts` z metodami:
  - `findBackupFile(accessToken, fileName)`: sprawdzenie czy w `appDataFolder` istnieje plik.
  - `downloadBackupFile<T>(accessToken, fileId)`: pobranie i sparsowanie danych JSON.
  - `uploadBackupFile(accessToken, content, existingFileId?)`: utworzenie nowego pliku (multipart) lub aktualizacja istniejącego (PATCH / uploadType=media).
- Odporność na błędy: czytelne mapowanie kodów błędów HTTP (401 wygaśnięcie tokena, 403 brak uprawnień / niewłączone API, 404 brak pliku, błędy sieci).
- 100% pokrycia testami jednostkowymi z mockowanym `fetch`.

**Non-Goals:**
- Implementacja logiki scalania obiektów i rozwiązywania konfliktów LWW (Faza 40.2).
- Modyfikacja komponentów UI i dialogów synchronizacji (Faza 40.3).

## Decisions
- **Decyzja 1: Nazwa pliku kopii zapasowej**:
  * Wybrano stałą nazwę `sportsway_sync_backup.json` w `appDataFolder`. Dzięki temu klient wyszukuje dokładnie ten plik i nie tworzy duplikatów.
- **Decyzja 2: Czyste zapytania REST przez `fetch` bez ciężkich SDK**:
  * Zamiast instalować wielomegabajtową bibliotekę `@googleapis/drive` (niedostępną natywnie w przeglądarce i powiększającą bundle), używamy bezpośrednich, lekkich zapytań `fetch` do standardowego REST API Google Drive v3.
- **Decyzja 3: Zapis Multipart przy tworzeniu i Direct Media przy aktualizacji**:
  * Przy tworzeniu nowego pliku (`POST`) wysyłamy multipart/related z metadanymi (nazwa, `parents: ['appDataFolder']`) i zawartością JSON.
  * Przy aktualizacji istniejącego pliku (`PATCH`) wysyłamy bezpośrednio zawartość (`uploadType=media`), co oszczędza transfer i upraszcza nagłówki.

## Risks / Trade-offs
- **[Niewłączone Google Drive API w Google Cloud Console]** → Klient w przypadku błędu 403 z kodem `accessNotConfigured` zgłasza dedykowany wyjątek informujący o konieczności włączenia Google Drive API w konsoli.
- **[Wygaśnięcie accessToken po 60 minutach]** → Klient zwraca błąd 401 z kodem `AUTH_EXPIRED`, co pozwoli silnikowi w Fazie 40.2/40.3 na automatyczne ponowienie autoryzacji.

