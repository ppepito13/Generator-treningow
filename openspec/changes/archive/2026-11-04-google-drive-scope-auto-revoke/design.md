# Design: Automatyczne Cofanie Uprawnień (Auto-Revoke) przy Braku Zakresu Dysku Google

## 1. Kontekst Architektoniczny
W bibliotece Google Identity Services (OAuth 2.0 Web) w przypadku częściowej zgody (odznaczenia checkboxa przez użytkownika), Google zwraca ważny token dostępowy (`access_token`) dla zaakceptowanych zakresów tożsamości, a aplikacja zostaje zarejestrowana jako połączona w profilu Google użytkownika.
Aby zachować bezwzględną spójność 1:1 pomiędzy statusem w aplikacji a stanem Konta Google, aplikacja musi wykorzystać ten token do natychmiastowego wywołania operacji `revoke`.

## 2. Implementacja w `src/services/auth/googleAuth.ts`
1. **Funkcja pomocnicza `revokeGoogleToken(token: string): Promise<void>`:**
   - Wywołanie wbudowanej metody GIS: `window.google?.accounts?.oauth2?.revoke(token, done)`
   - Jako defensywny fallback wywołanie bezpośredniego żądania HTTP POST do publicznego endpointu unieważniania Google:
     `POST https://oauth2.googleapis.com/revoke?token={token}`
   - Bezpieczne przechwytywanie błędów sieciowych (operacja `revoke` jest 'fire-and-forget' lub oczekiwana krótko przed zakończeniem odrzucenia).
2. **Obsługa w `signInWithGoogleWeb`:**
   - Gdy `hasDriveScope === false`:
     - Uruchomienie `revokeGoogleToken(accessToken)`.
     - Wyczyszczenie sesji: `clearStoredAuthSession()`.
     - Odrzucenie: `settleReject(new Error('DRIVE_SCOPE_REQUIRED'))`.

## 3. Strategia Testów
- Test jednostkowy w `src/tests/store-auth.test.ts` weryfikujący, że przy braku uprawnienia `drive.appdata` wywoływana jest funkcja `revoke` z tokenem dostępu, sesja zostaje wyczyszczona, a logowanie odrzucone.

