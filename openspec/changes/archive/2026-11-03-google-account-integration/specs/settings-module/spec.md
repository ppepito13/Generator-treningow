# Spec Delta

## ADDED Requirements

### Requirement: Interfejs Integracji z Kontem Google w Ustawieniach
Sekcja Konta w widoku Ustawień MUST dynamicznie reagować na stan sesji Google użytkownika, prezentując odpowiedni interfejs logowania lub kartę połączonego profilu.

#### Scenario: Prezentacja stanu niezalogowanego
- **WHEN** użytkownik nie połączył konta Google z aplikacją
- **THEN** sekcja Konta wyświetla stan „Niezalogowany” oraz aktywny przycisk „Połącz z Kontem Google”

#### Scenario: Prezentacja połączonego profilu Google
- **WHEN** użytkownik pomyślnie połączył konto Google
- **THEN** sekcja Konta wyświetla awatar, nazwę użytkownika, adres e-mail oraz zielony indykator statusu „Połączono z Google”
- **AND** udostępnia przycisk „Odłącz konto Google”

### Requirement: Modal Ostrzegawczy przy Odpinaniu Konta
Próba odłączenia konta Google przez użytkownika MUST wywoływać modal potwierdzenia z wymaganym ręcznym zatwierdzeniem oraz czytelnym komunikatem ostrzegawczym.

#### Scenario: Wywołanie okna ostrzegawczego
- **WHEN** zalogowany użytkownik kliknie przycisk „Odłącz konto Google”
- **THEN** aplikacja wyświetla modal dialogowy z ostrzeżeniem informującym, że odłączenie wstrzyma synchronizację w chmurze i nie usunie danych lokalnych z urządzenia
- **AND** wymaga kliknięcia przycisku zatwierdzenia, aby sfinalizować odłączenie

#### Scenario: Anulowanie odpięcia konta
- **WHEN** użytkownik w oknie dialogowym kliknie „Anuluj” lub kliknie poza obszar okna
- **THEN** okno zamyka się, a konto Google pozostaje nadal połączone z aplikacją

