# Spec Delta

## MODIFIED Requirements

### Requirement: Interfejs Integracji z Kontem Google w Ustawieniach
Sekcja Konta w widoku Ustawień MUST dynamicznie reagować na stan sesji Google użytkownika, prezentując odpowiedni interfejs logowania lub kartę połączonego profilu.

#### Scenario: Prezentacja stanu niezalogowanego
- **WHEN** użytkownik nie połączył konta Google z aplikacją
- **THEN** sekcja Konta wyświetla stan „Niezalogowany” z oficjalną, wielokolorową ikoną Google
- **AND** udostępnia aktywny przycisk „Połącz z Kontem Google” zawierający wielokolorową ikonę Google

#### Scenario: Prezentacja połączonego profilu Google
- **WHEN** użytkownik pomyślnie połączył konto Google
- **THEN** sekcja Konta wyświetla awatar, nazwę użytkownika, adres e-mail oraz zielony indykator statusu „Połączono z Google”
- **AND** udostępnia przycisk „Odłącz konto Google”

