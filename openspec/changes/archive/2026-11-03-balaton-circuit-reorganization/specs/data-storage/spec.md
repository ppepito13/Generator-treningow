# Spec Delta

## ADDED Requirements

### Requirement: Konfiguracja Stref i Limitów Sal Treningowych
Baza konfiguracji sal treningowych MUST udostępniać zaktualizowane limity pojemności dla Sali Balaton oraz ustandaryzowaną flagę wymuszenia obecności strefy w obwodzie treningowym.

#### Scenario: Parametry pojemności i stref Sali Balaton
- **WHEN** aplikacja wczytuje konfigurację Sali Balaton z `sala.json`
- **THEN** maksymalna pojemność wynosi 9 stacji i 18 osób
- **AND** strefa `Strefa_Wolna_Przestrzen` posiada bazową pojemność stacji równą 6

#### Scenario: Ustandaryzowana flaga wymuszenia strefy
- **WHEN** strefa treningowa ma brać obligatoryjny udział w podstawowym zestawie obwodu
- **THEN** pole strefy nosi nazwę `wymuszona_w_obwodzie: true`
- **AND** system zachowuje kompatybilność w przypadku odczytu starszych sal użytkownika posiadających atrybut `blokada_zmiany_recznej`

