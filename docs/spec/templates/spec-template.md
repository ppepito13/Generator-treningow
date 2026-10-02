# SPECIFICATION: [Nazwa Funkcjonalności / ID Zadania]

**Status:** DRAFT | APPROVED | COMPLETED  
**Autor:** [Główny Architekt / User]  
**Data utworzenia:** YYYY-MM-DD  
**Moduł:** `generator` | `timer` | `calculators` | `studio` | `ui`  

---

## 1. Kontekst Biznesowy i Cel

* **Dlaczego to robimy?** Krótki opis problemu użytkownika lub potrzeby biznesowej.
* **Oczekiwany rezultat:** Co użytkownik aplikacji (na webie lub na telefonie) będzie mógł zrobić po wdrożeniu tej zmiany.
* **Wpływ na produkcję:** Czy zmiana dotyka istniejących treningów / sal / zapisanych danych w pamięci urządzenia?

---

## 2. Wymagania Funkcjonalne i Kryteria Akceptacji (Gherkin / Scenariusze)

### Wymaganie 1: [Tytuł Wymagania]
* **Opis:** Dokładne zachowanie systemu.
* **Kryterium Akceptacji 1:**
  * **Mając (Given):** ...
  * **Kiedy (When):** ...
  * **Wtedy (Then):** ...

### Wymaganie 2: [Tytuł Wymagania]
* **Opis:** ...
* **Kryterium Akceptacji 2:** ...

---

## 3. Przypadki Brzegowe i Ograniczenia (Edge Cases)

1. **Brak danych wejściowych:** Co się dzieje, gdy lista/pole jest puste?
2. **Ekstremalne wartości:** (np. 1 uczestnik na 20 stacji, brak sprzętu na sali, brak pasujących ćwiczeń).
3. **Konflikt z istniejącymi regułami:** (np. stacja w parach vs ćwiczenie solo).
4. **Brak połączenia / Tryb samolotowy:** Potwierdzenie braku wywołań sieciowych.

---

## 4. Kontrakty Danych (Single Source of Truth – Zod Schemas)

> [!IMPORTANT]
> Wszystkie struktury danych wymieniane w tym module **muszą** posiadać formalny schemat Zod.

```typescript
import { z } from 'zod';

// Przykład:
export const FeatureInputSchema = z.object({
  id: z.string().min(1),
  // ...
});

export type FeatureInput = z.infer<typeof FeatureInputSchema>;
```

---

## 5. Wpływ na Pamięć Lokalną (`localStorage`) i Migracje

* Czy zmiana dodaje nowe pola do istniejących struktur w `kinetic-circuits-storage`?
* **Strategia kompatybilności wstecznej:** Jak zachowa się aplikacja u użytkownika, który ma w pamięci stan ze starszej wersji (np. v1.2.0)?
* Czy wymagana jest funkcja normalizująca / migrująca stan zastany?

---

## 6. Wymagania Dotyczące Interfejsu i Doświadczenia Mobilnego (Mobile UX)

* **Dotyk i Ergonomia:** Dialogi / Action Sheets zamiast natywnych selectów, minimalny rozmiar pól klikalnych 44x44px.
* **Obsługa Przycisków Natywnych:** Zachowanie systemowego przycisku "Wstecz" (Android Back Button).
* **Safe Areas:** Respektowanie wcięć ekranu (Notch / Belki systemowe Androida i iOS).
