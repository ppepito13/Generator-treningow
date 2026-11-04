# Design: Wymuszenie i Walidacja Zgody na Dostęp do Dysku Google (#40.1-fix)

## Context
Google Identity Services w ramach polityki Granular Permissions prezentuje uprawnienie `https://www.googleapis.com/auth/drive.appdata` jako pole wyboru, które użytkownik może odznaczyć. Zgodnie z zasadami platformy Google aplikacje trzecie nie mogą technicznie wymusić zablokowania lub ukrycia tego checkboxa w interfejsie Google. Jednakże aplikacja może i musi zweryfikować czy zakres został przyznany, i w razie jego braku natychmiast odrzucić autoryzację.

## Goals / Non-Goals

**Goals:**
- Sprawdzenie listy przyznanych uprawnień (`response.scope` oraz `hasGrantedAllScopes`) podczas logowania w `src/services/auth/googleAuth.ts`.
- Natychmiastowe odrzucenie sesji błędem `DRIVE_SCOPE_REQUIRED` i wyczyszczenie tokenów, jeśli brakuje uprawnienia `drive.appdata`.
- Dodanie dedykowanego zlokalizowanego komunikatu błędu w `src/services/auth/authErrors.ts`.
- Przekazanie parametru `{ prompt: 'consent' }` w `requestAccessToken`, aby Google przy ponownej próbie wyświetlało ekran zgody z checkboxem.
- Pokrycie testami jednostkowymi.

**Non-Goals:**
- Modyfikacja innych widoków aplikacji (Ustawienia już wyświetlają `authError`).

## Decisions
- **Decyzja 1: Weryfikacja `response.scope` w callbacku logowania**:
  * Obiekt odpowiedzi Google Identity Services zawiera pole `scope` (łańcuch znaków oddzielonych spacjami, np. `"openid email profile https://www.googleapis.com/auth/drive.appdata"`).
  * Sprawdzamy `response.scope.includes(GOOGLE_DRIVE_APPDATA_SCOPE)`.
  * Jeśli brak: `throw new Error('DRIVE_SCOPE_REQUIRED')`.
- **Decyzja 2: Dodanie `prompt: 'consent'`**:
  * Gdy użytkownik pominie uprawnienie, Google domyślnie mogłoby pominąć pytanie przy kolejnym kliknięciu. Parametr `prompt: 'consent'` gwarantuje, że użytkownik dostanie szansę zaznaczenia ptaszka.
- **Decyzja 3: Przyjazny komunikat w języku polskim**:
  * `authErrors.ts` formatuje ten błąd jako: *„Wymagane uprawnienie: Nie przyznano dostępu do Dysku Google. Bez tego aplikacja nie może synchronizować Twoich ćwiczeń i sal. Połącz konto ponownie i upewnij się, że zaznaczono pole wyboru przy Dysku Google.”*.

## Risks / Trade-offs
- **[Konieczność ponownego kliknięcia przez użytkownika]** → Pożądane zachowanie: użytkownik otrzymuje natychmiastową, jasną informację, dlaczego logowanie nie doszło do skutku i co musi zaznaczyć, zamiast cichej awarii synchronizacji w przyszłości.

