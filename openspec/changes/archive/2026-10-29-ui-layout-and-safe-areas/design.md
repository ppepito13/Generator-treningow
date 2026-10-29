# Design: Architektura Układu i Marginesów Bezpiecznych

## 1. Globalne Klasy CSS (`src/app/globals.css`)
W warstwie `@layer utilities` zdefiniujemy spójne klasy pomocnicze:
```css
/* Bezpieczny odstęp górny dla paska statusu i notcha */
.app-safe-top {
  padding-top: calc(max(env(safe-area-inset-top, 0px), 48px) + 16px);
}

/* Bezpieczny odstęp dolny dla dolnego paska nawigacji (BottomNav h-16 + safe inset) */
.app-safe-bottom {
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 80px);
}

/* Kontenery szerokości */
.app-container-narrow {
  width: 100%;
  max-width: 32rem; /* 512px (max-w-lg) */
  margin-left: auto;
  margin-right: auto;
}

.app-container-wide {
  width: 100%;
  max-width: 56rem; /* 896px (max-w-4xl) */
  margin-left: auto;
  margin-right: auto;
}
```

## 2. Refaktoryzacja Widoków

### ConfigurationForm (`src/components/ConfigurationForm.tsx`)
- Zastąpienie inline-styli kontenera klasami `.app-safe-top`, `.app-safe-bottom` oraz `.app-container-narrow`.
- Zachowanie pływającej maski górnej z płynnym rozmyciem tła.

### CircuitList (`src/components/CircuitList.tsx`)
- Dodanie kontenera wyśrodkowanego `.app-container-wide` dla listy stacji oraz podsumowania.
- Wypoziomowanie nagłówka `sticky top-0`: tło nagłówka ma `w-full`, a wewnętrzna zawartość z tytułem i przyciskami znajduje się wewnątrz `.app-container-wide`.
- Aplikacja klasy `.app-safe-bottom` na dolnej sekcji.

### TimerView, CalculatorsView, ExerciseStudioView
- Zamiana sztywnego `pt-4` na klasę `.app-safe-top`.
- Zamiana sztywnego `pb-28` na klasę `.app-safe-bottom`.
- Zapewnienie wyśrodkowania za pomocą `.app-container-wide`.

## 3. Integralność z Trybem Gym View
`GymViewModal` renderuje się jako stały portal/warstwa `fixed inset-0 z-[100]`. Ponieważ margines dolny `.app-safe-bottom` jest definiowany wewnątrz widoków zakładek, `GymViewModal` bez przeszkód pokrywa 100% ekranu.

