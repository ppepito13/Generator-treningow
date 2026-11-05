# Design: Kosz Usuniętych Ćwiczeń i Retencja Nagrobków

## Context
Aplikacja wykorzystuje model synchronizacji oparty o nagrobki (Tombstones: `_sync: { updatedAt, version, isDeleted }`). Podczas usuwania ćwiczenia powstaje nagrobek z aktualnym znacznikiem czasu, który Auto-Sync po 2,5 s przesyła na Dysk Google. Do tej pory użytkownik nie miał możliwości podejrzenia usuniętych ćwiczeń ani łatwego ich przywrócenia, a ręczne przywracanie z chmury pobierało plik, w którym ćwiczenie było już oznaczone jako usunięte. Zobacz `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Udostępnienie w Studio Ćwiczeń dedykowanej 4. zakładki „Usunięte (X)” z dynamicznym licznikiem elementów w koszu.
- Ograniczenie widoczności elementów w koszu do 7 dni od momentu usunięcia (`updatedAt`).
- Bezpieczne akcje: przywracanie ćwiczenia (`restoreCustomExercise`), trwałe usuwanie (`permanentlyDeleteCustomExercise`) oraz opróżnienie kosza (`emptyTrash`).
- Błyskawiczne cofnięcie w dymku Toast po kliknięciu usuwania (przycisk `ToastAction` „Cofnij”).
- Pełna odporność na zombie records przy trwałym usuwaniu z kosza.

**Non-Goals:**
- Tworzenie kosza dla sal, sprzętu czy presetów zegara (w tej zmianie kosz dedykowany jest dla ćwiczeń).
- Dodawanie serwerowego harmonogramu usuwania (retencja 7 dni wyliczana jest w 100% lokalnie i deterministycznie w oparciu o `Date.now() - updatedAt`).

## Decisions

### Decyzja 1: Zabezpieczenie przed Zombie Records za pomocą flagi `isPurged: true`
- **Kontekst:** W systemie ze zsynchronizowanym plikiem w Google Drive całkowite usunięcie obiektu z lokalnej tablicy `customExercises` spowodowałoby, że zdalna kopia (lub drugie urządzenie) podczas kolejnego scalenia LWW uznałaby go za brakujący element i dodała z powrotem.
- **Wybór:** Wprowadzenie opcjonalnego pola `isPurged?: boolean` w metadanych `_sync`.
- **Działanie:** Po kliknięciu „Usuń trwale” lub „Opróżnij kosz”, rekord otrzymuje `_sync.isPurged = true`. Dzięki temu natychmiast znika z widoku Kosza, a w synchronizacji LWW chroni przed odtworzeniem ćwiczenia jako zombie.
- **Alternatywy:** Całkowite `filter(e => e.id !== id)` – odrzucone ze względu na ryzyko ożywienia ćwiczenia po synchronizacji z chmurą.

### Decyzja 2: Matematyczna retencja 7 dni na podstawie `updatedAt`
- **Kontekst:** W momencie wywołania `removeCustomExercise` funkcja `markSyncDeleted` ustawia `updatedAt = Date.now()`.
- **Wybór:** Retencja obliczana jako:
  ```ts
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const isTrashItem = exercise._sync?.isDeleted === true &&
    !exercise._sync?.isPurged &&
    (Date.now() - (exercise._sync?.updatedAt || 0)) <= SEVEN_DAYS_MS;
  ```
- **Działanie:** Ćwiczenia starsze niż 7 dni automatycznie przestają być renderowane w koszu bez potrzeby uruchamiania procesów w tle.

### Decyzja 3: Czwarta zakładka w filtrach Studio Ćwiczeń (`filterMode = 'deleted'`)
- **Kontekst:** W Studio Ćwiczeń istnieje pasek wyboru bazy: `Wszystkie | Wbudowane | Zapisane lokalnie`.
- **Wybór:** Dodanie 4. opcji: `Usunięte (X)`.
- **Działanie:** Gdy wybrana jest zakładka `Usunięte`, siatka prezentuje karty z kosza w tonacji ostrzegawczej (obramowanie bursztynowe/czerwone), z etykietami czasu i przyciskami „Przywróć” oraz „Usuń trwale”.

## Risks / Trade-offs

- **[Ryzyko] Zmiana daty systemowej na urządzeniu użytkownika:**
  - *Mitygacja:* Zabezpieczenie `remainingMs = Math.max(0, SEVEN_DAYS_MS - elapsedMs)` zapobiega ujemnym wartościom liczników, a ćwiczenia o nienaturalnych znacznikach są bezpiecznie traktowane jako wygasłe.
- **[Ryzyko] Przypadkowe opróżnienie kosza:**
  - *Mitygacja:* Przycisk „Opróżnij kosz” chroniony jest modalem potwierdzenia (`AlertDialog` Radix UI).

