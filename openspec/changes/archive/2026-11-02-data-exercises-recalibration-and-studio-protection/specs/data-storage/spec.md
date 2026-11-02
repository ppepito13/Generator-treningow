# Spec Delta: data-storage

## ADDED Requirements

### Requirement: Nienaruszalność Metadanych przy Edycji Ćwiczeń
System SHALL zachowywać pełną integralność danych ćwiczenia (w tym wymagania sprzętowe `wymagania_sprzetowe`, biomechanikę `biomechanika`, zaangażowane mięśnie `zaangazowane_miesnie`, tagi specjalne `tagi_specjalne` oraz kategorie `kategorie_treningu`) podczas edycji i nadpisywania ćwiczeń wbudowanych oraz własnych w module Studio Ćwiczeń.

#### Scenario: Edycja ćwiczenia wbudowanego zachowuje wymagany sprzęt
- **WHEN** użytkownik edytuje w Studio ćwiczenie wbudowane posiadające zdefiniowany sprzęt (np. drążek) i zapisuje formularz
- **THEN** zapisane ćwiczenie w `customExercises` zachowuje oryginalne `wymagania_sprzetowe` oraz biomechanikę, a generator poprawnie uwzględnia sprzęt przy doborze stacji

#### Scenario: Tworzenie nowego ćwiczenia własnego z domyślnymi wartościami
- **WHEN** użytkownik tworzy w Studio zupełnie nowe ćwiczenie bez podania opcjonalnych parametrów
- **THEN** system przypisuje bezpieczne wartości domyślne bez wywoływania błędów w generatorze

