# Proposal: Automatyczne Cofanie Uprawnień (Revoke) przy Braku Zgody na Dysk Google (#40.1-fix-revoke)

## 1. Dlaczego (Why)
Podczas autoryzacji Google OAuth 2.0 użytkownik może odznaczyć pole wyboru uprawnienia do Dysku Google (`drive.appdata`), zatwierdzając jedynie podstawowe uprawnienia profilowe (`openid`, `email`, `profile`). W takim wypadku Google zapisuje aplikację jako połączoną na Koncie Google użytkownika (`myaccount.google.com/connections`).
Nasza aplikacja słusznie odrzuca ten stan, ponieważ integracja z Google służy wyłącznie do tworzenia kopii zapasowej i synchronizacji danych (nie posiadamy własnego serwera kont). Powstaje jednak rozbieżność: w panelu Google aplikacja widnieje jako połączona, podczas gdy w samej aplikacji użytkownik widzi komunikat o braku połączenia.

## 2. Co zmieniamy (What)
Wprowadzamy procedurę natychmiastowego, automatycznego unieważnienia uprawnień (`auto-revoke`):
- W momencie gdy aplikacja wykryje brak wymaganego zakresu `https://www.googleapis.com/auth/drive.appdata` w otrzymanym `tokenResponse`, natychmiast używa otrzymanego `accessToken` do wywołania unieważnienia uprawnień w Google (`window.google.accounts.oauth2.revoke` oraz wywołanie endpointu unieważniania Google).
- Serwery Google natychmiast usuwają aplikację z listy powiązanych aplikacji na Koncie Google użytkownika.
- Aplikacja czyści lokalną sesję i prezentuje dotychczasowy komunikat wyjaśniający konieczność zaznaczenia pola wyboru Dysku Google.
- Stan jest w 100% spójny: brak autoryzacji w aplikacji odpowiada brakowi autoryzacji na Koncie Google.

