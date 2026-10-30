# Spec Delta: ui-layout

## ADDED Requirements

### Requirement: Obsługa systemowej nawigacji 3-przyciskowej w Androidzie
Dolny pasek nawigacyjny `BottomNav` oraz dolne marginesy treści MUST dynamicznie uwzględniać wysokość systemowego paska nawigacji 3-przyciskowej Androida (48dp), unosząc ikony nawigacyjne ponad przyciski sprzętowe/wirtualne systemu.

#### Scenario: Uruchomienie aplikacji w trybie nawigacji 3-przyciskowej
- **WHEN** aplikacja działa na urządzeniu Android z włączoną 3-przyciskową belką nawigacyjną (wstecz, home, ostatnie)
- **THEN** pasek `BottomNav` unosi swoje przyciski o wysokość paska systemowego, a jego tło rozmycia wypełnia przestrzeń pod przyciskami bez zasłaniania etykiet.

### Requirement: Programowe wymuszenie jasnych ikon paska statusu
Aktywność natywna Androida MUST wymusić jasne (białe) ikony zegara, baterii i łączności w kontrolerze okna (`WindowInsetsControllerCompat`), zapobiegając renderowaniu czarnych ikon przy włączonym motywie jasnym w systemie Android.

#### Scenario: Uruchomienie na telefonie z systemowym trybem jasnym
- **WHEN** telefon lub emulator posiada włączony systemowy motyw jasny (Light Mode)
- **THEN** pasek statusu w aplikacji wyświetla biały zegar i białe ikony systemowe czytelne na ciemnym tle aplikacji.

