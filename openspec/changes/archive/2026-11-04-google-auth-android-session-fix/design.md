# Design: Poprawka trwałości sesji Google na Androidzie i eliminacja samoczynnego wylogowania

## Architektura i Przepływ Tożsamości

Na platformie Android natywny menedżer logowania zwraca podpisany kryptograficznie token tożsamości `idToken` (Google JWT), natomiast parametr `accessToken` jest `null` (gdyż aplikacja nie korzysta z dedykowanego serwera backendowego wymieniającego kody autoryzacyjne). Poprawka obejmuje dwa kluczowe elementy:

1. **Zapis i walidacja `idToken` na Androidzie:**
   - W `signInWithGoogleNative`: utrwalenie w `saveAuthSession` wartości `idToken`, `accessToken` oraz `serverAuthCode`.
   - W `validateGoogleSession`: obsługa weryfikacji tokenu tożsamości poprzez zapytanie do `https://oauth2.googleapis.com/tokeninfo?id_token=${session.idToken}`.
   - W przypadku odpowiedzi o wygaśnięciu tokenu ID po 60 minutach w trybie mobilnym, aplikacja nie czyści profilu lokalnego użytkownika (profil w architekturze Offline-First pozostaje nienaruszony). Unieważnienie następuje wyłącznie w przypadku cofnięcia dostępu lub jawnego błędu tożsamości.

2. **Oddzielenie wejścia do Ustawień od akcji zalogowania w interfejsie (`SettingsView.tsx`):**
   - Hook `useEffect` w `SettingsView.tsx` zostaje zawężony do wywołania jednorazowego przy montowaniu widoku (`[]`).
   - Weryfikacja sesji w tle sprawdza stan konta wyłącznie dla sesji wczytanych z pamięci lokalnej przed wejściem użytkownika do modułu.
   - Pomyślne logowanie przez `handleGoogleSignIn` bezpośrednio aktualizuje stan konta bez wywoływania natychmiastowej, współbieżnej procedury czyszczącej.
