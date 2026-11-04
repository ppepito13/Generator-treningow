# Technical Design: Silnik Cyklu Życia Synchronizacji w Tle

## Context
W zadaniach #40.1 i #40.2 powstały niskopoziomowe komponenty: klient Google Drive API (`googleDriveClient.ts`) oraz czysty silnik scalania danych (`mergeEngine.ts`). Brakuje warstwy orkiestracji łączącej zdarzenia magazynu stanu (Zustand Store) z siecią i chmurą. Ponadto dotychczasowy limit czasu oczekiwania na logowanie (35s) w `googleAuth.ts` wywoływał przedwczesne błędy przy logowaniu z 2FA.

## Goals / Non-Goals

**Goals:**
- Zwiększenie limitu czasu oczekiwania na logowanie Google do 60 sekund.
- Utworzenie `SyncCoordinator` – serwisu wykonującego pełny proces pobrania, scalenia LWW i wysłania pliku kopii.
- Wdrożenie automatycznej synchronizacji z opóźnieniem (Debounced Auto-Sync, 2.5s) po modyfikacji kolekcji autorskich.
- Obsługa nasłuchiwania powrotu połączenia z siecią (`window.addEventListener('online')`).
- Zabezpieczenie przed nieskończonymi pętlami auto-sync (`suppressAutoSync` / flaga `isSyncing`).
- Pełna odporność na błędy sieciowe i wygaśnięcie tokena bez naruszania bazy lokalnej (Offline-First).

**Non-Goals:**
- Modal wyboru `InitialSyncConflictDialog` (zarezerwowany dla Części 2: `sync-ui-settings`).
- Komponenty wizualne, przycisk „Synchronizuj teraz” i etykiety w `SettingsView` (Część 2).

## Decisions

### 1. Wydzielenie `SyncCoordinator` jako dedykowanego serwisu domenowo-sieciowego
* **Decyzja:** Umieszczenie koordynatora w `src/services/sync/syncCoordinator.ts` zamiast wklejania całej logiki pobierania i wysyłki do monolitycznego `store.ts`.
* **Uzasadnienie:** Utrzymanie czystej separacji odpowiedzialności (Separation of Concerns). Zustand Store przechowuje wyłącznie stan reaktywny (`syncStatus`, `lastSyncedAt`, `syncError`) oraz deleguje akcję `triggerSync` do koordynatora.
* **Alternatywy:** Osadzenie wywołań `fetch` i `findBackupFile` bezpośrednio w akcjach Zustand Store – odrzucone ze względu na rozrost store i utrudnione testowanie.

### 2. Flaga `isSyncing` i blokada zapętlenia auto-sync
* **Decyzja:** Koordynator zarządza wewnętrzną flagą `isSyncing`. Podczas wstrzykiwania scalonych danych do Zustand Store ustawiana jest flaga pomijająca wywołanie kolejnego debounce (`suppressAutoSync`).
* **Uzasadnienie:** Eliminuje pętlę śmierci (Infinite Sync Loop): zdalne pobranie -> zmiana w store -> kolejny trigger auto-sync.

### 3. Zwiększenie `AUTH_TIMEOUT_MS` do 60s
* **Decyzja:** Zmiana wartości stałej `AUTH_TIMEOUT_MS` w `src/services/auth/googleAuth.ts` z 35000 na 60000.
* **Uzasadnienie:** Użytkownicy przechodzący weryfikację dwuetapową (2FA) na telefonie oraz czytający ekran uprawnień Google Drive potrzebują bezpiecznego zapasu czasu. 60 sekund jest standardem w rozwiązaniach OAuth2 web popup.

## Risks / Trade-offs

* **[Risk]** Wygaśnięcie tokena dostępu `accessToken` w trakcie auto-sync.
  - **Mitigation:** Wyłapanie błędu 401 (`AUTH_EXPIRED`), ustawienie `syncStatus: 'error'` z komunikatem o konieczności odświeżenia sesji, bez wywoływania białego ekranu i bez usuwania danych lokalnych.
* **[Risk]** Wielokrotne edycje w krótkim czasie (np. szybkie pisanie w formularzu).
  - **Mitigation:** Debouncing o stałym czasie 2500 ms – timer jest resetowany przy każdym zdarzeniu edycji.
* **[Risk]** Urządzenie bez połączenia z Internetem (np. tryb samolotowy).
  - **Mitigation:** Sprawdzenie `navigator.onLine` przed rozpoczęciem zapytań sieciowych; natychmiastowe przejście do stanu `offline` i odroczenie do wystąpienia zdarzenia `window.addEventListener('online')`.

