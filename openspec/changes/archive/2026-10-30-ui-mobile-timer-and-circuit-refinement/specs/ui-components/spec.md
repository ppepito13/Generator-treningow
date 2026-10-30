# Spec Delta: ui-components

## ADDED Requirements

### Requirement: Brak przepełnienia poziomego w konfiguratorze Zegara (Zero Horizontal Overflow)
Wszystkie wiersze kroków czasowych oraz nagłówki bloków w widoku Zegara interwałowego MUST mieścić się w całości w kontenerze o minimalnej szerokości 360px bez wywoływania poziomego paska przewijania dokumentu (`scrollWidth <= clientWidth`).

#### Scenario: Konfiguracja kroków na ekranie o szerokości 360px
- **WHEN** użytkownik konfiguruje pętle i pojedyncze kroki w module Zegara na ekranie smartfona o szerokości 360px
- **THEN** cały rząd kroku (czas, nazwa, próbnik koloru, usuwanie) mieści się w granicach karty, a dokument nie posiada poziomego suwaka przewijania.

### Requirement: Elastyczne zawijanie etykiet przycisków akcji
Przyciski akcji zawierające opisy lub przekierowania o długości powyżej 30 znaków MUST zezwalać na wielowierszowe zawijanie tekstu (`whitespace-normal`) i dynamicznie dopasowywać swoją wysokość (`h-auto`), zapobiegając wylewaniu się tekstu poza obrys przycisku i karty.

#### Scenario: Wyświetlanie przycisku nawigacyjnego w kalkulatorze BMR/RFM/BMI
- **WHEN** użytkownik widzi przycisk przekierowania do powiązanego kalkulatora na małym ekranie telefonu
- **THEN** cały tekst etykiety przycisku zawija się estetycznie wewnątrz przycisku, nie wylewając się poza kontener ani krawędź ekranu.

### Requirement: Spójne przewijanie nagłówków widoków
Główny nagłówek widoku Zestawu treningowego (`CircuitList`) MUST przewijać się naturalnie wraz z listą stacji treningowych, chroniąc przestrzeń pod fizycznym wycięciem aparatu i integrując się z globalną nakładką paska statusu.

#### Scenario: Przewijanie stacji obwodu
- **WHEN** użytkownik przewija widok wygenerowanego obwodu ku górze
- **THEN** nagłówek obwodu przesuwa się płynnie pod globalną nakładką paska statusu, a stacje treningowe zajmują pełną dostępną przestrzeń roboczą.

