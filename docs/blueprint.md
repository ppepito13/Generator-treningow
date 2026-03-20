# **Nazwa Aplikacji**: Generator Treningów (Kinetic Circuits)

## Główne Funkcje:

- **Panel Konfiguracji Treningu**: Interfejs użytkownika pozwalający na definiowanie parametrów takich jak liczba uczestników (1-14) czy pożądany poziom trudności za pomocą suwaków i rozwijanych list.
- **Generowanie Treningu (Przycisk)**: Moduł aktywujący wyświetlanie wylosowanego obwodu treningowego, wypełniający ekran odpowiednimi danymi dla ćwiczących.
- **Dynamiczna Tablica**: Prezentuje zbiór przewijanych kart stacji treningowych wygenerowanych na osobnej podstronie.
- **Interaktywne Karty Stacji**: Każda karta zawiera kompleksowe dane o ćwiczeniu, wyodrębnioną strefę ciała, wymagany sprzęt oraz wsparcie dla łączenia dwóch uczestników (A/B) pracujących na jednej stacji w tym samym czasie.
- **Odświeżenie/Losowanie Opcjonalne (Re-roll)**: Zintegrowana ikona 'Zmień' na pod-ćwiczeniach, służąca jako docelowy obszar pod ewentualne wpięcie wtyczki sztucznej inteligencji dopasowującej ćwiczenia.
- **Trwała Pamięć Lokalna (State Persistence)**: Wykorzystanie biblioteki `zustand` do efektywnego zarządzania danymi na poziomie całego systemu, połączone z zapisywaniem w `localStorage` (lub IndexedDB), dzięki czemu trening nie znika zaraz po zamknięciu okna aplikacji!

## Wskazówki Stylistyczne (Design System):

- **Główny błękit Cyan**: `#33CCFF`. Kolor przycisków, głównych wezwań do akcji, symbolizujący nowoczesność i energię.
- **Głębokie tło**: `#141D1F`. Ołowiany odcień bazowy w nowoczesnym stylu 'dark mode', poprawiający czytelność jasnych czcionek (kontrast).
- **Dodatkowy turkus (Aqua)**: `#5FE6C9`. Drugi akcent kolorystyczny, nadający charakteru subtelnym wyodrębnieniom czy etykietom.
- **Typografia Font**: `Inter` (bezszeryfowy), świetna widoczność zarówno na małych urządzeniach mobilnych jak i przy wielkich nagłówkach w planach treningowych.
- **Glassmorfizm i Przezroczystości**: Kontenery używają półprzezroczystych teł z delikatnymi efektami rozmycia (blur), dzięki czemu nie mamy poczucia płaskiego ekranu, lecz nowoczesnej hybrydy nakładających się warstw 3D.
- **Minimalistyczne Ikony Wektorowe**: Czysty styl, np. zapętlone strzałki dla przycisku Re-roll.
- **Lekkie Animacje**: System stara się wprowadzać m.in. animacje przejść, najechań czy przesuwania kart, zamiast gwałtownego renderowania wszystkiego naraz.