# Spec Delta

## ADDED Requirements

### Requirement: Brak przepełnienia poziomego i przewijane paski filtrów w Studio (Zero Horizontal Overflow in Studio Filters)
Kontenery przycisków wyboru źródeł w widokach Studio (Studio Ćwiczeń, Studio Sal oraz Studio Sprzętu) MUST posiadać ograniczenie szerokości do kafelka nadrzędnego (`max-w-full`), poziome przewijanie dotykowe (`overflow-x-auto scrollbar-none`) oraz zabezpieczenie przycisków przed zniekształceniem (`shrink-0 whitespace-nowrap`), gwarantując brak poziomego przepełnienia kafelka i ekranu na urządzeniach mobilnych o szerokości od 320px wzwyż.

#### Scenario: Przeglądanie filtrów w Studio Ćwiczeń na telefonie o szerokości 360px
- **GIVEN** użytkownik otwiera Studio Ćwiczeń na telefonie o szerokości viewportu 360px
- **WHEN** pasek filtrów źródeł renderuje cztery zakładki („Wszystkie”, „Wbudowane”, „Zapisane lokalnie”, „Usunięte”)
- **THEN** cały pasek filtrów mieści się ściśle w obrysie kafelka `.glass-card` bez wystawania poza ekran
- **AND** użytkownik może płynnie przewijać pasek palcem w poziomie, aby uzyskać dostęp do wszystkich zakładek.

#### Scenario: Spójne przewijanie pasków filtrów w Studio Sal i Studio Sprzętu
- **GIVEN** użytkownik przegląda podwidok Sal (`RoomStudioSubView`) lub Sprzętu (`EquipmentStudioSubView`) na wąskim ekranie mobilnym
- **WHEN** widok jest renderowany
- **THEN** kontener przycisków źródeł posiada poziomy suwak dotykowy (`overflow-x-auto scrollbar-none`), a etykiety przycisków zachowują pełną czytelność bez łamania wierszy (`shrink-0 whitespace-nowrap`).

