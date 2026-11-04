# Proposal: Wymuszenie i Walidacja Zgody na Dostęp do Dysku Google (#40.1-fix)

## Why
W nowej polityce Google Granular Permissions uprawnienia wrażliwe (takie jak dostęp do Dysku Google `drive.appdata`) są prezentowane na ekranie zgody Google jako opcjonalne pole wyboru (checkbox). Użytkownik może pominąć to pole i kliknąć „Dalej”. Wówczas Google zwraca token zawierający wyłącznie uprawnienia do profilu. Połączenie konta w Generatorze służy wyłącznie synchronizacji danych, więc zalogowanie użytkownika bez uprawnień do Dysku wprowadza w błąd („Połączono”) i powoduje ciche awarie zapytań chmurowych (403 Forbidden).

## What Changes
- **Weryfikacja przyznanych zakresów (`hasGrantedAllScopes`)**: Po powrocie z okna logowania sprawdzamy, czy token faktycznie zawiera uprawnienie `https://www.googleapis.com/auth/drive.appdata`.
- **Odrzucenie niepełnej autoryzacji**: Jeśli użytkownik odznaczył lub pominął pole wyboru Dysku Google, proces logowania zostaje przerwany, profil lokalny nie zostaje połączony, a sesja zostaje wyczyszczona.
- **Komunikat w języku polskim**: W module `authErrors.ts` dodajemy zrozumiałe wyjaśnienie informujące, że uprawnienie do Dysku Google jest wymagane do synchronizacji i należy zaznaczyć odpowiednie pole wyboru.
- **Wymuszenie ponownego wyświetlenia pytania (`prompt: 'consent'`)**: Zapewnienie, że przy ponownej próbie logowania Google zawsze wyświetli checkbox, zamiast automatycznie powielać niepełną zgodę.
- **Testy jednostkowe**: Dodanie testów weryfikujących odrzucenie sesji bez uprawnień dyskowych oraz poprawne formatowanie komunikatu o błędzie.

## Capabilities

### Modified Capabilities
- `user-auth`: Uściślenie wymagań uwierzytelniania Google o weryfikację kompletności przyznanych uprawnień (odrzucenie logowania w przypadku braku zgody na `drive.appdata`).

## Impact
- **Pliki autoryzacji**: `src/services/auth/googleAuth.ts`, `src/services/auth/authErrors.ts`.
- **Testy**: `src/tests/auth-errors.test.ts`, `src/tests/store-auth.test.ts`.

