# Design: Spolszczenie i przyjazne komunikaty błędów autoryzacji Google (#49)

## Context

Podczas testów logowania natywnego na Androidzie wykryto, że błędy zwracane przez wtyczkę `@capawesome/capacitor-google-sign-in` (oraz webowy GIS) trafiają bezpośrednio do stanu aplikacji (`authError`) w postaci surowych ciągów w języku angielskim. Patrz `proposal.md` po szczegółowe uzasadnienie.

## Goals / Non-Goals

**Goals:**
- Centralizacja tłumaczenia i interpretacji błędów autoryzacji w czystym module pomocniczym `src/services/auth/authErrors.ts`.
- Pokrycie wszystkich typowych błędów platformy Android (`NO_CREDENTIAL_AVAILABLE`, `SIGN_IN_CANCELED`, `PROVIDER_CONFIGURATION_ERROR`) oraz środowiska Web (`popup_closed_by_user`, `access_denied`, `origin_mismatch`, błędy sieciowe, timeout).
- Wyświetlanie jasnych, pomocnych i zlokalizowanych komunikatów w języku polskim w module Ustawień (`SettingsView`).
- 100% pokrycia testami jednostkowymi reguł translacji w `src/tests/auth-errors.test.ts`.

**Non-Goals:**
- Modyfikacja architektury przepływu tokenów, sesji Zustand czy zakresu uprawnień OAuth (`openid`, `email`, `profile`).
- Zmiana stylistyki komponentu banera błędu poza treścią prezentowanego tekstu.

## Decisions

### Decyzja 1: Dedykowany moduł `authErrors.ts` zamiast logiki wewnątrz komponentu UI
- **Uzasadnienie:** Separacja logiki biznesowej od warstwy prezentacji UI. Umożliwia łatwe testowanie reguł mapowania w izolacji od DOM i Zustand Store.
- **Alternatywa odrzucona:** Parsowanie błędów bezpośrednio w bloku `catch` w `SettingsView.tsx` (utrudnia ponowne użycie i testowanie).

### Decyzja 2: Dwuwarstwowe rozpoznawanie błędów (kod + treść komunikatu)
- **Uzasadnienie:** Różne wersje Androida i wtyczki mogą zwracać kod błędu w polu `code` (np. `SIGN_IN_CANCELED`), komunikat w `message` (np. `The user canceled the sign-in flow.`), lub bezpośrednio jako string. Funkcja `formatAuthError` weryfikuje kody oraz słowa kluczowe w treści wiadomości (case-insensitive).
- **Alternatywa odrzucona:** Sztywne dopasowanie 1:1 całego ciągu znaków (zbyt podatne na drobne zmiany wersji biblioteki).

### Tabela Mapowania Błędów:
| Typ / Wzorzec błędu | Wykrywany kod / fragment | Zwracany komunikat w aplikacji (PL) |
| :--- | :--- | :--- |
| **Brak konta / brak SHA-1 w chmurze** | `NO_CREDENTIAL_AVAILABLE` / `No Google account is available` | *„Nie znaleziono konta Google na urządzeniu lub trwa weryfikacja aplikacji w Google Cloud. Upewnij się, że w Ustawieniach telefonu dodano konto Google.”* |
| **Anulowanie przez użytkownika** | `SIGN_IN_CANCELED` / `canceled the sign-in` / `popup_closed_by_user` | *„Logowanie zostało anulowane.”* |
| **Błąd usług Google Play** | `PROVIDER_CONFIGURATION_ERROR` / `Google Play services` | *„Usługi Google Play na tym urządzeniu są nieaktualne lub niedostępne. Zaktualizuj usługi Google Play w Sklepie Play.”* |
| **Błąd źródła (Origin mismatch)** | `origin_mismatch` | *„Adres źródłowy aplikacji nie jest zarejestrowany w Google Cloud Console (origin_mismatch).”* |
| **Błąd sieciowy / offline** | `Failed to fetch` / `NetworkError` / `network` | *„Brak połączenia z Internetem. Sprawdź sieć i spróbuj ponownie.”* |
| **Limit czasu (Timeout)** | `timeout` / `limit czasu` | *„Upłynął limit czasu oczekiwania na logowanie Google. Spróbuj ponownie.”* |
| **Przerwanie / utrata fokusu** | `Logowanie zostało przerwane` | *„Logowanie zostało przerwane przed ukończeniem autoryzacji.”* |

## Risks / Trade-offs

- **[Risk]** Nowe, nieznane błędy z przyszłych wydań systemu Android mogą nie pasować do żadnego wzorca.
  - **Mitigation:** Bezpieczny fallback zwracający *„Wystąpił nieoczekiwany problem z autoryzacją Google: {oczyszczona treść}”*, zapobiegający wyświetleniu pustego paska.

