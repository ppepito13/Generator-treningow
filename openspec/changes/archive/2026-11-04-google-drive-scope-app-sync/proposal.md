# Proposal: Uspójnienie Stanu Autoryzacji i Obsługa Częściowych Uprawnień Dysku Google (#40.1-granular-scope)

## Why
W modelu Google Identity Services (OAuth 2.0 Granular Permissions) użytkownik ma możliwość zalogowania się i przekazania danych tożsamości (`openid`, `email`, `profile`), jednocześnie odznaczając opcjonalne pole wyboru dostępu do Dysku Google (`drive.appdata`). W takim przypadku Konto Google rejestruje aplikację jako połączoną z kontem użytkownika.
Odrzucanie całego procesu i prezentowanie w aplikacji stanu „Niezalogowany” wywoływało dezinformującą sprzeczność: na Koncie Google aplikacja widniała jako połączona, podczas gdy w aplikacji brak było profilu użytkownika. Ponadto bezpośrednie unieważnianie tożsamości z poziomu przeglądarki napotyka ograniczenia CORS na publicznych endpointach Google.

## What Changes
Uspójniamy stan aplikacji ze stanem Konta Google zgodnie z oficjalnym wzorcem Granular Consent:
1. W strukturze profilu użytkownika (`GoogleUserProfile`) wprowadzamy flagę `hasDriveScope: boolean`, rejestrującą fakt przyznania uprawnienia do Dysku Google.
2. W procesie logowania (`googleAuth.ts`), w przypadku braku zakresu `drive.appdata`, profil użytkownika jest pomyślnie zapisywany w stanie aplikacji z `hasDriveScope: false`, a sesja jest zachowywana.
3. W widoku Ustawień (`SettingsView.tsx`):
   - Użytkownik widzi swój profil (imię, email, awatar), co jest w 100% spójne z panelem Konta Google.
   - Gdy `hasDriveScope === false`, plakietka stanu zmienia się na bursztynową: `Wymaga uprawnień`, a pod profilem pojawia się czytelny komunikat o wstrzymaniu kopii zapasowej oraz przycisk akcji **„Nadaj uprawnienie do Dysku Google”** (wywołujący ponowną prośbę o zgodę).
   - Trener ma również do dyspozycji przycisk **„Odłącz konto Google”**, który czyści sesję w aplikacji i rozłącza konto.
   - Gdy `hasDriveScope === true`, profil prezentuje zieloną plakietkę `Połączono`.

