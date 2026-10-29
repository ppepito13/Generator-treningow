# Design: Komponenty Nagłówków i Siatki Responsywne

## 1. Komponent `ModuleHeader` (`src/components/ui/ModuleHeader.tsx`)
```tsx
interface ModuleHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconColorClass?: string; // np. "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
  actions?: React.ReactNode;
  children?: React.ReactNode; // np. SubTabs lub dodatkowa belka
}
```
Komponent renderuje:
- Zewnętrzny `.glass-card p-6 rounded-[2rem] border border-white/10 space-y-4`.
- Flexbox nagłówka z ikoną w kafelku, tytułem (`text-xl font-black uppercase tracking-tight text-white`) i podtytułem (`text-xs text-white/50`).
- Opcjonalne akcje nagłówka (po prawej stronie).
- Opcjonalny kontener podrzędny (pasek zakładek lub filtry).

## 2. Siatka Dwukolumnowa i DnD w CircuitList
- W `CircuitList.tsx`:
  - Zamiana `verticalListSortingStrategy` na `rectSortingStrategy`.
  - Zamiana kontenera `space-y-6` na:
    ```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {circuit.map(...)}
    </div>
    ```
- Dzięki `rectSortingStrategy` przeciąganie stacji działa stabilnie w siatkach 2D.

## 3. Siatka Trzykolumnowa w Studio Ćwiczeń
- W `ExerciseStudioView.tsx`:
  - Zamiana kontenera listy ćwiczeń `space-y-4` na:
    ```tsx
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredExercises.map(...)}
    </div>
    ```
  - Zwiększenie szerokości kontenera z `max-w-4xl` na `max-w-6xl` (`app-container-wide` z nadpisaniem lub rozszerzeniem).
