# ui-components Specification Delta

## ADDED Requirements

### Requirement: Widok Usuniętych Ćwiczeń (Kosz) w Studio Ćwiczeń
Moduł Studio Ćwiczeń MUST udostępniać czwartą zakładkę filtrów „Usunięte (X)” prezentującą pozycje z 7-dniowego Kosza, dedykowane karty usuniętych ćwiczeń z licznikami pozostałego czasu, akcje przywracania i trwałego usuwania oraz szybkie cofanie w dymku Toast.

#### Scenario: Czwarta zakładka filtrów z dynamicznym licznikiem
- **WHEN** użytkownik przegląda Studio Ćwiczeń
- **THEN** pasek filtrów źródeł wyświetla cztery zakładki: „Wszystkie”, „Wbudowane”, „Zapisane lokalnie” oraz „Usunięte (X)”
- **AND** zakładka „Usunięte” prezentuje w nawiasie liczbę ćwiczeń kwalifikujących się do Kosza

#### Scenario: Prezentacja karty ćwiczenia w Koszu
- **WHEN** użytkownik wybierze zakładkę „Usunięte”
- **THEN** każda karta ćwiczenia wyświetla sformatowany czas usunięcia (np. „Dzisiaj, 18:30”), liczbę pozostałych dni retencji (np. „Pozostało: 6 dni” lub „Wygasa dzisiaj”) oraz przyciski „Przywróć” i „Usuń trwale”

#### Scenario: Przywrócenie ćwiczenia z poziomu widoku Kosza
- **WHEN** użytkownik kliknie zielony przycisk „Przywróć” przy usuniętym ćwiczeniu
- **THEN** system przywraca ćwiczenie do stanu aktywnego, zmniejsza licznik w zakładce „Usunięte” i wyświetla powiadomienie Toast o sukcesie

#### Scenario: Opróżnienie Kosza z modalem potwierdzenia
- **WHEN** użytkownik w widoku „Usunięte” kliknie przycisk „Opróżnij kosz” i potwierdzi operację w oknie dialogowym
- **THEN** wszystkie ćwiczenia z Kosza zostają trwale usunięte z widoku, a licznik w zakładce zostaje wyzerowany

#### Scenario: Pusty stan widoku Kosza
- **WHEN** w Koszu nie ma żadnych ćwiczeń kwalifikujących się do retencji
- **THEN** widok „Usunięte” prezentuje komunikat „Kosz jest pusty” wraz z informacją o 7-dniowym okresie przechowywania

#### Scenario: Natychmiastowa akcja Cofnij w Toaście po usunięciu
- **WHEN** użytkownik kliknie ikonę usuwania na aktywnym ćwiczeniu w Studio
- **THEN** system wyświetla dymek Toast informujący o przeniesieniu do Kosza wraz z aktywnym przyciskiem akcji „Cofnij”
- **AND** kliknięcie „Cofnij” natychmiast przywraca ćwiczenie bez konieczności przechodzenia do zakładki „Usunięte”

