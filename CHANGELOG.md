# Changelog

Wszystkie istotne zmiany i wydania aplikacji będą dokumentowane w tym pliku.
Struktura oparta jest o standard [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Dodano
- **Obowiązkowa Bramka Weryfikacji Manualnej dla Agentów AI (#54)**: Wprowadzono formalny Krok 4 w procesie Spec-Driven Development w `AGENTS.md` oraz dedykowaną regułę `.agents/rules/manual-testing-gate.md`. Każdy agent AI ma bezwzględny zakaz samowolnej archiwizacji OpenSpec, commita, pusha i tworzenia Pull Requesta bez wcześniejszego dostarczenia deweloperowi gotowej instrukcji testów manualnych krok po kroku (komendy terminala, adresy URL, checklista responsywności Web i specyfiki mobilnej Android/Capacitor) oraz uzyskania jednoznacznej akceptacji człowieka.

### Naprawiono
- **Produkcyjny Fallback Google Client ID dla Wersji Webowej (#55)**: Naprawiono błąd „Brak skonfigurowanego identyfikatora Google Client ID” występujący w wersji webowej hostowanej na Firebase oraz na urządzeniach mobilnych (Safari iOS). Wprowadzono bezpieczny produkcyjny fallback w funkcji `getGoogleClientId()` oraz publiczny plik `.env.production` (z odblokowaniem w `.gitignore`), gwarantujący obecność publicznego Client ID w generowanym statycznym bundle (`out/`) niezależnie od lokalnych plików środowiskowych dewelopera.
- **Ochrona przed Blokowaniem Okien Logowania przez Safari iOS (#55)**: Dodano asynchroniczne wstępne ładowanie (preload) biblioteki Google Identity Services (`loadGoogleScript()`) na etapie montowania widoku Ustawień (`SettingsView`), dzięki czemu kliknięcie w przycisk logowania Google zachowuje bezpośredni kontekst gestu użytkownika i nie jest blokowane jako niechciany popup na urządzeniach iPhone/iPad.

### Zmieniono
- **Usunięcie Automatycznego Deployu Firebase z GitHub Actions (#55)**: Całkowicie usunięto plik workflow `.github/workflows/firebase-hosting-merge.yml`, eliminując ryzyko automatycznego nadpisywania hostingu produkcyjnego wersją budowaną w odizolowanym środowisku CI bez poświadczeń. Zgodnie z procedurą operacyjną projektu (`instrukcja-firebase.md`), wdrożenia na Firebase Hosting są w pełni kontrolowane i realizowane manualnie przez administratora z lokalnego środowiska deweloperskiego.

## [1.4.0] - 2026-11-05
### Dodano
- **Kosz Usuniętych Ćwiczeń (Trash / Recycle Bin) z 7-Dniową Retencją w Studio Ćwiczeń (#52)**: Wdrożenie 4. zakładki filtrów bazy „Usunięte (X)” w Studio Ćwiczeń z dynamicznym licznikiem usuniętych ćwiczeń i deterministyczną retencją 7 dni (`TRASH_RETENTION_MS`). Dodano dedykowane karty usuniętych pozycji w tonacji ostrzegawczej z odliczaniem pozostałych dni retencji, przycisk natychmiastowego przywrócenia („Przywróć”), trwałe usuwanie z zabezpieczeniem flagą `isPurged: true` chroniącą przed odtworzeniem zombie recordów podczas synchronizacji chmurowej, akcję masowego opróżniania kosza z modalem potwierdzenia (`AlertDialog`) oraz natychmiastową akcję „Cofnij” (`ToastAction`) w dymku powiadomienia po usunięciu ćwiczenia.
- **Przywracanie Danych z Chmury (Restore from Cloud) i Reset Sesji Synchronizacji (#40.4)**: Wdrożenie funkcji `restoreFromCloudBackup()` oraz przycisku z dedykowanym modalem potwierdzenia (`RestoreCloudBackupDialog`) w module Ustawień, umożliwiających ręczne zastąpienie stanu lokalnego backupem z Dysku Google z wyczyszczeniem lokalnych nagrobków (Tombstones). Zabezpieczenie przed samowolnym cichym uploadem nagrobków do chmury po zalogowaniu na urządzeniu z nagrobkami (wymuszenie dialogu początkowego przy obecności jakichkolwiek rekordów i istniejącym backupie zdalnym) oraz resetowanie pola `lastSyncedAt: null` przy odłączaniu konta Google (`disconnectGoogleAccount`).
- **Interfejs Synchronizacji w Ustawieniach i Modal Konfliktów InitialSyncConflictDialog (#40.3b)**: Wdrożenie reaktywnego panelu statusu synchronizacji w czasie rzeczywistym w module Ustawień (wskaźniki: Zsynchronizowano, Synchronizowanie..., Wstrzymana / Offline, Błąd synchronizacji), formatowania czasu ostatniej kopii zapasowej (`formatLastSyncedAt`), przycisku ręcznego wywołania „Synchronizuj teraz” z animacją rotacji oraz modalu wyboru strategii przy pierwszym logowaniu na urządzeniu z istniejącymi danymi (`InitialSyncConflictDialog`, Wariant B: domyślne scalenie Last-Write-Wins, zastąpienie danymi z chmury lub nadpisanie chmury danymi z urządzenia).
- **Silnik Cyklu Życia Synchronizacji w Tle (SyncCoordinator) (#40.3a)**: Wdrożenie orkiestratora synchronizacji danych z Dyskiem Google (`src/services/sync/syncCoordinator.ts`) realizującego pełny cykl pobrania backupu, deterministycznego scalenia LWW oraz aktualizacji pliku w chmurze. Zaimplementowano automatyczną synchronizację z opóźnieniem (Debounced Auto-Sync, 2.5s) po modyfikacji kolekcji autorskich w Zustand Store, ochronę przed pętlami zwrotnymi (`suppressAutoSync` oraz flaga `isSyncing`), globalne nasłuchiwanie powrotu łączności sieciowej (`online`) oraz dedykowany zestaw testów jednostkowych.
- **Silnik Synchronizacji, Wersjonowanie i Obsługa Tombstones (#40.2)**: Wdrożenie czystego silnika synchronizacji danych użytkownika (`src/domain/sync/`) opartego na architekturze Last-Write-Wins (LWW) z obsługą nagrobków (Tombstones) zapobiegających powracaniu usuniętych rekordów (Zombie Records). Wprowadzono metadane synchronizacji `_sync` (`updatedAt`, `version`, `isDeleted`) do autorskich ćwiczeń, sal, sprzętu oraz presetów interwałowych zegara, miękkie usuwanie w Zustand Store (`markSyncDeleted`) z automatycznym filtrowaniem obiektów oznaczonych jako usunięte w widokach i generatorze treningów, inteligentne porównywanie tożsamości treści biznesowych (`canonicalize`, `areContentsEqual`) pomijające sztuczne konflikty oraz pełny pakiet testów jednostkowych i integracyjnych pokrywających wszystkie scenariusze kolizji, wygranych zdalnych/lokalnych i przywracania danych.
- **Klient Google Drive i Zakres Uprawnień appDataFolder (#40.1)**: Rozszerzono autoryzację OAuth o zakres `https://www.googleapis.com/auth/drive.appdata` na platformie Web oraz Android (Capacitor), umożliwiający bezserwerowy dostęp do prywatnego folderu danych aplikacji. Zaimplementowano dedykowany moduł klienta REST API Google Drive v3 (`src/services/cloud/googleDriveClient.ts`) z funkcjami wyszukiwania (`findBackupFile`), pobierania (`downloadBackupFile`) i atomowego zapisu/aktualizacji (`uploadBackupFile`) pojedynczego pliku kopii zapasowej JSON.
- **Cicha Weryfikacja Sesji Google i Detekcja Cofnięcia Uprawnień w Tle (#50)**: Wdrożono mechanizm Background Silent Revalidation weryfikujący aktywność sesji Google w tle przy wejściu do modułu Ustawień oraz trwałego zapisu sesji w pamięci urządzenia. W przypadku cofnięcia uprawnień aplikacji z poziomu konta Google lub usunięcia profilu z telefonu (odpowiedź 400/401 API Google), aplikacja automatycznie czyści profil, powraca do trybu niezalogowanego i prezentuje dedykowany komunikat ostrzegawczy w języku polskim z zachowaniem nienaruszonej lokalnej bazy danych (Offline-First).
- **Natywne Logowanie Google na Androidzie (#47)**: Zintegrowano oficjalny plugin `@capawesome/capacitor-google-sign-in` dla platformy Capacitor na Androidzie (`Capacitor.isNativePlatform()`), wykorzystujący natywny interfejs Google Play Services / Credential Manager z zachowaniem architektury hybrydowej (webowy GIS na desktopie/przeglądarce).
- **Dopracowanie Wizualne i Oficjalny Branding Google (#46)**: Dodano dedykowany komponent wektorowy SVG `GoogleIcon` z oficjalną 4-kolorową paletą marki Google (niebieski, czerwony, żółty, zielony) w kafelku stanu konta oraz bezpośrednio na przycisku akcji „Połącz z Kontem Google” w module Ustawień, a także skonfigurowano oficjalne logo aplikacji (512x512 px) w konsoli Google Cloud dla ekranu zgody OAuth.
- **Integracja i Połączenie z Kontem Google (#39)**: Wdrożenie modułu uwierzytelniania Google Identity Services / OAuth 2.0 z minimalnym zakresem uprawnień tożsamości (`openid`, `email`, `profile`), reaktywnej karty konta w Ustawieniach z prezentacją profilu użytkownika (awatar, imię, email, status sesji) oraz modalu potwierdzenia odpięcia konta (`DisconnectAccountDialog`) z wymuszonym zatwierdzeniem ręcznym i ostrzeżeniem o wstrzymaniu synchronizacji chmurowej przy zachowaniu pełnej bazy danych lokalnych na urządzeniu.
- **Deterministyczna Matryca Slotów Obwodu w Sali Balaton (#45)**: Wdrożenie deterministycznego doboru stref (`Circuit Slot Mapping`) w module generatora obwodowego dla Sali Balaton. Gwarantuje stałą obecność Wolnej Podłogi na stacji 3, automatyczne włączanie Drabinek ściennych na pozycji 4 przy co najmniej 6 stacjach, oraz płynny fallback przy braku kółek gimnastycznych (Ściana na pozycji 7, podwójna i potrójna Wolna Podłoga na pozycjach 8 i 9 bez ich wzajemnego grupowania).
- **Oficjalna Witryna Projektu w Ustawieniach (#43)**: Dodano bezpieczny odnośnik do https://sportsway.eu/ w sekcji O Aplikacji (atrybuty target="_blank" i rel="noopener noreferrer", ikona ExternalLink) otwierający zewnętrzną przeglądarkę systemową na Androidzie i nową kartę w przeglądarce.
- **Centralne Zarządzanie Metadanymi Aplikacji**: Utworzono moduł `src/config/appInfo.ts` zapewniający bezpieczne wstrzykiwanie numeru wersji z `app-version.json` z defensywnym fallbackiem na wypadek środowisk bez statycznego pliku.
- **Dedykowany Moduł Ustawień i Przycisk Zębatki (#38)**: Wdrożenie modułu Ustawień (`SettingsView`) w oparciu o ustandaryzowany nagłówek `ModuleHeader`, zintegrowanego z nowym punktem wejścia w prawym górnym rogu ekranu głównego (lekka, animowana zębatka bez tła). Przygotowano logiczne sekcje Personalizacji pod motyw jasny/ciemny (#15), Konta i Chmury pod integrację z Google (#39, #40) oraz O Aplikacji (wersja v1.3.0, status bazy ćwiczeń i sal). Wdrożono czysty, reaktywny model (Auto-save) oraz obsługę powrotu do Generatora (w tym za pomocą sprzętowego przycisku Back na Androidzie).
- **Mobilny Edge-to-Edge i Globalna Ochrona Notch**: Wdrożenie natywnej obsługi Edge-to-Edge na Androidzie (`WindowCompat.setDecorFitsSystemWindows`) z przezroczystymi paskami systemowymi i jasnymi ikonami, globalnej nakładki `Global Top Shield` w `layout.tsx` chroniącej treść przed fizycznym wycięciem aparatu (notch / camera hole) we wszystkich widokach, oraz reaktywnego chowania paska `BottomNav` po wysunięciu wirtualnej klawiatury (`window.visualViewport`).
- **Kompaktowy Zegar Interwałowy (Color Dot Picker)**: Wdrożenie 2-wierszowych nagłówków bloków (pełna szerokość nazwy + bezpośrednio dostępne przyciski akcji) oraz kompaktowego próbnika barwnego (Color Dot Picker w okienku Popover) eliminującego poziome rozpychanie ekranu.
- **Dwukierunkowy Balans Sąsiedztwa i Deduplikacja Nazw (Base Name)**: Wdrożenie wielopoziomowej kaskady doboru ćwiczeń eliminującej powtórzenia tego samego wzorca ruchowego na sąsiadujących stacjach (w tym na styku pętli obwodu stacja ostatnia - pierwsza oraz przy automatycznym re-rollu) oraz zapobieganie występowaniu wielu wariantów tego samego ćwiczenia w jednym treningu (usedBaseNames) z zachowaniem pełnej swobody manualnej trenera.
- **Ujednolicone Nagłówki i Siatki Responsywne (ModuleHeader)**: Wdrożenie ustandaryzowanego komponentu nagłówka modułów (ModuleHeader) w widokach Zegara, Kalkulatorów i Studia oraz responsywnych siatek 2/3-kolumnowych w Zestawie (rectSortingStrategy w DnD) i Studio Ćwiczeń, optymalizujących wykorzystanie przestrzeni na większych ekranach.
- **Studio Zarządzania Bazą**: Moduły podglądu, wyszukiwania, edycji oraz eksportu bazy ćwiczeń, sprzętu, sal i konfiguracji poziomów trudności.
- **Zegar Treningowy**: Zaawansowany moduł czasomierza z obsługą treningu interwałowego, stopera i minutnika.
- **Kalkulatory Treningowe**: Kalkulator standardowy oraz moduły obliczeniowe BMI/RFM i zapotrzebowania kalorycznego BMR/TDEE.
- **Infrastruktura Testowa i Jakość**: Wdrożenie frameworka Vitest z testami jednostkowymi i integracyjnymi, pre-commit hook Husky oraz pełną bramką `npm run verify`.
- **Integralność Danych i Testy UI**: Automatyczna walidacja spójności bazy JSON ćwiczeń/sal oraz testy renderowania komponentów interfejsu w środowisku jsdom.

### Zmieniono
- **Zwiększenie Limitu Czasu Logowania Google do 60s (#40.3a)**: Wydłużenie stałej `AUTH_TIMEOUT_MS` w `src/services/auth/googleAuth.ts` z 35s do 60s, eliminujące przedwczesne błędy przekroczenia limitu czasu podczas autoryzacji dwuetapowej (2FA) i zaznaczania uprawnień dostępu do Dysku Google.
- **Optymalizacja CI/CD i Eliminacja Podglądów Firebase na PR (#51)**: Usunięto zbędny workflow `.github/workflows/firebase-hosting-pull-request.yml`, eliminując fałszywe błędy sprawdzania Pull Requestów oraz oszczędzając darmowe minuty GitHub Actions. Wprowadzono ustandaryzowany krok `actions/setup-node@v4` (Node.js 20 z cache npm) w docelowym procesie wdrożenia produkcyjnego po scaleniu gałęzi `main` (`.github/workflows/firebase-hosting-merge.yml`).
- **Trwałość Sesji Google na Androidzie (#50)**: Naprawiono błąd samoczynnego wylogowywania i ponownego wyświetlania komunikatu o cofnięciu uprawnień tuż po poprawnym połączeniu konta na platformie Android. Wprowadzono utrwalanie tokenu tożsamości `idToken` zwracanego przez Credential Manager, weryfikację przez `tokeninfo?id_token=` oraz ograniczenie wywoływania walidacji do jednorazowego wejścia do Ustawień (na montowanie komponentu).
- **Zabezpieczenie przed Powielaniem Prefiksu Błędów Autoryzacji (#50)**: Rozszerzono `src/services/auth/authErrors.ts` o zabezpieczenie przed powielaniem prefiksu `Błąd logowania Google:` dla komunikatów, które zostały już przetłumaczone lub zlokalizowane.
- **Spolszczenie i Przyjazne Komunikaty Błędów Autoryzacji Google (#49)**: Wprowadzono scentralizowany moduł translacji i obsługi błędów autoryzacji Google (`src/services/auth/authErrors.ts`). Zastąpiono surowe techniczne wyjątki Androida i webowego GIS zlokalizowanymi instrukcjami w języku polskim dla scenariuszy anulowania logowania przez użytkownika, braku konta w telefonie / weryfikacji w chmurze, braku sieci oraz problemów z konfiguracją usług Google Play.
- **Limity Pojemności Sali Balaton oraz Parametr `wymuszona_w_obwodzie` (#45)**: Zwiększono maksymalną liczbę stacji do 9 i osób do 18 w konfiguracji Sali Balaton, zaktualizowano stan inwentarza kółek gimnastycznych (`kolko_gimnastyczne: 0`), podniesiono bazową pojemność Wolnej Podłogi do 6 (zapewniającą bezpieczny margines sprzętowy dla 3 jednoczesnych stacji podłogowych), oraz ujednolicono nazewnictwo flagi z mylącego `blokada_zmiany_recznej` na czytelne `wymuszona_w_obwodzie` w typie `Zone` i bazie sal.
- **Reaktywny Wskaźnik Bazy Ćwiczeń (#42)**: Zastąpiono statyczny licznik ćwiczeń dynamicznym zliczaniem ze store (270 ćwiczeń bazy fabrycznej oraz wyszczególnienie modyfikacji i ćwiczeń autorskich użytkownika, np. „270 w bazie (+X własnych)”).
- **Rebranding Tytułu na Ekranie Głównym**: Zmiana nagłówka aplikacji na „Generator Sport's Way” w 2-wierszowym kafelku z cyjanową poświatą, optymalizująca szerokość na wąskich ekranach smartfonów i eliminująca kolizję z przyciskiem zębatki.
- **Rekalibracja Poziomów Trudności i Nazw Ćwiczeń (#41)**: Zaktualizowano poziomy trudności dla 34 ćwiczeń w bazie produkcyjnej (głównie segment PULL: klasyczne podciąganie nachwyt ➔ 7, podchwyt ➔ 6, podciągania z obciążeniem / izometryczne ➔ 8, warianty asystowane gumą i australijskie ➔ 3-5) oraz wprowadzono 5 spolszczonych nazw (m.in. TRX Jednorącz, Wiosłowanie sztangą w opadzie jednorącz, Dotknięcia ramion w Pike HS).
- **Kolejność Modułów RIG w Sali Balaton**: Zamiana kolejności modułów RIG (Środek i drabinki) wraz z właściwym przypisaniem zakazanych kategorii sprzętu.
- **Przewijalny Nagłówek Obwodu (`CircuitList`)**: Ujednolicenie nagłówka "Twój Obwód" z estetyką pozostałych modułów oraz umożliwienie jego naturalnego przewijania z listą stacji treningowych pod ochroną `Global Top Shield`.
- **Pełnowymiarowy Pasek Nawigacji (`BottomNav`)**: Rozciągnięcie tła i efektu rozmycia na 100% szerokości ekranu oraz w obszar `safe-area-inset-bottom`.
- **Standaryzacja Układu i Marginesów Bezpiecznych**: Wprowadzono globalne klasy dla marginesów systemowych Androida (.app-safe-top, .app-safe-bottom) oraz ujednolicono szerokości kontenerów (.app-container-narrow, .app-container-wide) we wszystkich 5 modułach, eliminując ucinanie nagłówków pod notchem oraz optymalizując wyświetlanie na tabletach i desktopie.
- **Architektura Generatora**: Rozbicie monolitycznego pliku store na czystą architekturę domenową (`src/domain/generator/`) z heurystyką balansu mięśniowego (naprzemienność PUSH/PULL) i kaskadowym doborem trudności.
- **Bezpieczeństwo Danych (Zustand Persist v1)**: Wprowadzenie migracji stanu i selektywnego zapisu (`partialize`), chroniącego przed utratą danych użytkownika i białym ekranem.
- **Fonty Offline dla Androida**: Zastąpienie zewnętrznego CDN Google Fonts wbudowanym mechanizmem `next/font/google` dla 100% działania offline w aplikacji mobilnej Capacitor.

### Zmieniono
- **Obsługa Granularnych Uprawnień Dysku Google (#40.1)**: Wdrożono spójny z oficjalnymi wytycznymi Google model obsługi uprawnień granularnych (Google Granular Permissions). Gdy użytkownik pominie opcjonalne uprawnienie do Dysku Google podczas logowania, profil trenera jest poprawnie zachowywany z flagą `hasDriveScope: false`, a w module Ustawień prezentowany jest profil z bursztynową plakietką „Wymaga uprawnień”, ostrzeżeniem o wstrzymaniu synchronizacji w chmurze oraz dedykowanym przyciskiem „Nadaj uprawnienie do Dysku Google” (wywołującym prośbę o zgodę bez rozłączania konta).

### Naprawiono
- **Filtrowanie Nagrobków (Tombstones) w Licznikach Studia i Ustawień (#40.2)**: Naprawiono błąd zliczania usuniętych obiektów (nagrobków) w licznikach zakładek Studia Ćwiczeń („Zapisane lokalnie”), Studia Sal, Studia Sprzętu oraz w sekcji „O Aplikacji” w Ustawieniach. Po usunięciu nadpisania ćwiczenia wbudowanego lub usunięciu elementu własnego liczniki i filtry natychmiast poprawnie prezentują stan aktywnych danych bez uwzględniania obiektów oznaczonych flagą `_sync.isDeleted`.
- **Wymuszenie i Walidacja Uprawnień (Auto-Revoke) przy Braku Zgody na Dysk Google (#40.1)**: Naprawiono rozbieżność stanów, w której odznaczenie Dysku Google w oknie autoryzacji pozostawiało aplikację jako powiązaną w panelu Konta Google (`myaccount.google.com/connections`). Zaimplementowano funkcję `revokeGoogleToken(token)` uruchamianą natychmiast przy wykryciu braku zakresu `drive.appdata`, unieważniającą token w Google (GIS `revoke` oraz HTTP POST `oauth2.googleapis.com/revoke`) i trwale usuwającą powiązanie z konta użytkownika przy odrzuceniu sesji.
- **Wymuszenie i Walidacja Zgody na Uprawnienie Dysku Google (#40.1)**: Naprawiono lukę pozwalającą na pozorne połączenie konta Google bez przyznania uprawnienia dostępu do Dysku Google (Granular Permissions w Google Identity Services). Wprowadzono parametr `prompt: 'consent'`, bezwzględną weryfikację przyznanego zakresu (`tokenResponse.scope` oraz `hasGrantedAllScopes`) w callbacku logowania, natychmiastowe odrzucenie i wyczyszczenie sesji oraz dedykowany komunikat w języku polskim informujący trenera o konieczności zaznaczenia pola wyboru Dysku Google.
- **Ochrona przed Zawieszeniem Interfejsu przy Logowaniu Google (#47)**: Wyeliminowano nieskończone blokowanie przycisku („Łączenie z Google...”) przy odrzuceniu okna logowania, błędach sieciowych lub braku konfiguracji URI. Wprowadzono twardy 35-sekundowy timeout autoryzacji oraz reaktywną detekcję powrotu do aplikacji (`visibilitychange` / `window.focus` z czasem karencji 3.5s) automatycznie resetującą stan błędu bez uszkadzania danych użytkownika.
- **Błędna Liczba Ćwiczeń w Ustawieniach (#42)**: Wyeliminowano dezinformujący, zahardkodowany napis „40 ćwiczeń kalibrowanych” w module Ustawień.
- **Integralność Danych przy Edycji Ćwiczeń w Studio (#41)**: Naprawiono błąd w AddExerciseDialog oraz createDefaultExercise, który przy edycji ćwiczenia wbudowanego powodował wyzerowanie wymagań sprzętowych (wymagania_sprzetowe), biomechaniki i zaangażowanych mięśni. Wprowadzono samonaprawiający mechanizm dziedziczenia metadanych z bazy wbudowanej.
- **Natywne Paski Systemowe Androida (Status Bar & Navigation Bar)**: Wymuszenie trwale jasnych (białych) ikon paska stanu (zegar, bateria, wifi) na ciemnym tle aplikacji niezależnie od motywu urządzenia i wersji Androida (API 34 oraz API 37) poprzez przypisanie `postSplashScreenTheme` do `@style/AppTheme.NoActionBar`, ustawienie bazowego motywu na ciemny `Theme.AppCompat.NoActionBar`, programowe wymuszenie `AppCompatDelegate.MODE_NIGHT_YES` oraz re-aplikację `WindowInsetsControllerCompat` w pełnym cyklu życia aktywności (`onCreate`, `onResume`, `onWindowFocusChanged`).
- **Poziome Przepełnienie i Błędy Responsywności Mobilnej**:
  - Wyeliminowano poziome rozpychanie strony w Zegarze i ucinanie zakładek dolnego menu ("Stu" zamiast "Studio") na ekranach smartfonów 360px-412px.
  - Wyeliminowano wylewanie się długich tekstów z przycisków przekierowań w kalkulatorach (BMR, RFM, BMI) poprzez elastyczne zawijanie `whitespace-normal`, dopasowanie wysokości `h-auto` i skrócenie etykiet.
  - Naprawiono obcinanie tekstu "os." w selektorze sal Generatora (`SelectTrigger` z elastyczną wysokością i `tracking-wider`).
  - Dodano globalną klasę `.scrollbar-none` eliminującą nakładanie się 12px suwaków Androida na ikony podmenu.
  - Dodano `overscroll-behavior-y: none;`, wyłączenie tap highlight (`-webkit-tap-highlight-color: transparent`) oraz zabezpieczenie pól formularza przed wymuszonym zoomem na iOS (16px).
- **Dług Technologiczny**: Usunięcie zdeprecjonowanych bibliotek, odmaskowanie kompilacji Next.js oraz usunięcie 100% ostrzeżeń i błędów ESLint.

## [1.3.0] - 2026-04-30
### Dodano
- **Hub Nawigacyjny (Bottom Nav)**: Całkowicie nowa struktura nawigacji oparta na dolnym pasku (Bottom Navigation) w stylu glassmorphism. Pozwala na natychmiastowe przełączanie między Generatorem, wygenerowanym Zestawem oraz przyszłymi modułami (Zegar, Kalkulatory).
- **Trwałość Treningu (Zustand Persist)**: Wprowadzono system automatycznego zapamiętywania wygenerowanego treningu w pamięci lokalnej urządzenia. Trening nie znika po odświeżeniu strony, zamknięciu przeglądarki czy ubiciu aplikacji przez system.
- **Szybkie dodawanie ćwiczeń**: Nowa funkcja w menu "re-roll" pozwalająca na ręczne wpisanie nazwy własnego ćwiczenia "na szybko" do aktualnego obwodu bez konieczności dodawania go do stałej bazy danych.
- **Potwierdzenie Zakończenia**: Nowy przycisk "Zakończ" (X) w widoku zestawu z systemowym potwierdzeniem, chroniący przed przypadkowym usunięciem treningu.

### Zmieniono
- **Architektura Tabs**: Rozdzielono widok Generatora od widoku Zestawu, co pozwala na powrót do edycji parametrów bez utraty wygenerowanych już ćwiczeń.
- **Ikona Re-roll**: Odświeżono ikonę losowania ćwiczenia na bardziej czytelną i intuicyjną.

### Naprawiono
- **Stan Nawigacji**: Rozwiązano problem z przyciskiem "Wstecz", który w poprzedniej wersji mógł nieoczekiwanie minimalizować aplikację.

## [1.2.0] - 2026-04-27
### Dodano
- **Rebranding**: Przebudowano identyfikację wizualną na ekranie głównym. Nowa nazwa: "Generator Treningów SW" wraz z nowym tagline "Elastyczne plany grupowe".
- **Sala "Ustawienia własne"**: Nowy moduł pozwalający na ręczny wybór sprzętu, typu treningu oraz liczby stacji niezależnie od predefiniowanych sal.
- **Ręczny wybór ćwiczeń**: Możliwość manualnej podmiany wylosowanego ćwiczenia poprzez wybór z pełnej, kategoryzowanej bazy danych.
- **Edge-to-Edge Status Bar**: Implementacja "szklanego" (frosted glass) paska statusu chroniącego systemowe ikony (zegar, bateria) na nowoczesnych urządzeniach z Androidem 16.

### Zmieniono
- **UX Mobile**: Całkowita rezygnacja z zagnieżdżonych menu typu dropdown na rzecz natywnych, responsywnych okien dialogowych (Action Sheets) wyśrodkowanych na ekranie.
- **Zarządzanie Stacjami**: Wprowadzono system Drag & Drop umożliwiający intuicyjną zmianę kolejności stacji w obwodzie.
- **Header "Twój Obwód"**: Odświeżono nagłówek listy treningowej – usunięto zbędne teksty ("Wstecz") i ikony na rzecz czystego, minimalistycznego interfejsu.
- **Optymalizacja Typografii**: Dostosowano rozmiary czcionek i interlinie dla nagłówków, zapewniając ich czytelność na małych ekranach bez zawijania w nieestetyczny sposób.

### Naprawiono
- **Sticky Header Bug**: Naprawiono błąd CSS uniemożliwiający "przyklejanie" się nagłówka na mobilnych przeglądarkach Webview.
- **Layout Clipping**: Rozwiązano problem ucinania przycisków funkcyjnych (np. "Gotowe") w oknach dialogowych na urządzeniach o niskiej rozdzielczości.
- **Safe Area Insets**: Poprawiono kalkulację bezpiecznych marginesów (paddingów) dla telefonów z wcięciem (notch) i aparatami typu punch-hole.

## [1.1.0] - 2026-04-02
### Dodano
- **Modularna Nawigacja**: System stosu widoków (Stack) z pełną obsługą sprzętowego przycisku wstecz na Androidzie.
- **Obsługa Konfliktów**: Nowy system alertów przy braku sprzętu z opcjami ratunkowymi (poluzowanie trudności, duplikaty, redukcja stacji).
- **Silnik Hybrydowy CNF**: Przejście bazy ćwiczeń na format JSON wspierający złożoną logikę sprzętową AND/OR.
- **Suwak Uczestników**: Czytelny, graficzny komponent Slider do wyboru liczby osób ćwiczących.
- **Safe Area Support**: Adaptacyjny padding dla urządzeń mobilnych (w tym Xiaomi, iPhone z notchem).
- **Identyfikacja Wizualna**: Wdrożono nową ikonę systemową aplikacji oraz banner promocyjny do wizytówki Sklepu Play, dostosowując je do palety kolorystycznej marki Trenera.

### Zmieniono
- **Logika FBW (Astoria)**: Uniezależnienie liczby stacji od liczby osób oraz ścisła blokada niedostępnego sprzętu.
- **UX**: Automatyczne przewijanie na górę strony po wygenerowaniu treningu.
- **UI**: Optymalizacja okna błędu pod wyświetlacze mobilne (brak ucinania tekstu).
- **Naming**: Zamiana etykiet na "Ćwiczenie 1", "Ćwiczenie 2" itd. dla lepszej przejrzystości.
- **Baza danych**: Aktualizacja parametrów sprzętowych i mnożników dla wybranych ćwiczeń.
- **Wersjonowanie**: Aktualizacja metadanych projektu (`package.json`: `"version": "1.1.0"`).

### Naprawiono
- **Platform Check**: Usunięcie błędów konsoli `runtime.lastError` przy udostępnianiu w przeglądarce.
- **Branding**: Zamiana domyślnego faviconu Firebase na oficjalne logo aplikacji.
- **Visuals**: Poprawa widoczności obramowania przycisków w oknie konfliktu.

## [1.0.1] - 2026-03-24
### Dodano
- Ustawienie spójnej i oficjalnej nazwy aplikacji "Generator Treningów SW" w warstwie Capacitor (konfiguracja ogólna) oraz warstwie natywnej Androida (`strings.xml`).
- Wygenerowano i wdrożono pełny, natywny zestaw najnowszego brandingu i ikon w doskonałej rozdzielczości (za pomocą wtyczki `@capacitor/assets`).
- Dodano systemowy i ustandaryzowany skrypt `update-version.ps1` dla dewelopera do 1-klikowego synchronizowania i przepychania wersji produkcyjnych pakietów (automatyzujący Webowe SemVer JSON oraz `versionCode` systemu Java dla AndroidStudio/Google Play).

### Zmieniono
- Zrefaktoryzowano system natywnego dzielenia się schematem (Podsumowania). Stare webowe wywołanie JavaScript `navigator.share` całkowicie ustąpiło miejsca płynnej, systemowej wtyczce z API mobilnego: `@capacitor/share`. Zniweluje to błędy zawieszania ekranu w natywnym interfejsie Androida.

## [1.0.0] - 2026-03-22
### Dodano
- Oficjalna pierwsza zamknięta publikacja Sali "Balaton" (Alpha w Google Play Console).
- Integracja i odpalenie generatora obwodowego jako pełnoprawnego, zoptymalizowanego archiwum App Bundle (.aab).
- Gotowy fundament pod wersję WebView.
