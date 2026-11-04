// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExerciseStudioView } from '@/components/ExerciseStudioView';
import { SettingsView } from '@/components/SettingsView';
import { useAppStore } from '@/app/lib/store';

describe('UI: Filtrowanie Nagrobków (Tombstones) w Studio Ćwiczeń i Ustawieniach', () => {
  beforeEach(() => {
    useAppStore.setState({
      customExercises: [],
      customRooms: [],
      customEquipment: [],
      googleUser: null,
      authStatus: 'idle',
      authError: null,
    });
  });

  it('zeruje licznik w zakładce "Zapisane lokalnie" po usunięciu nadpisanego ćwiczenia (Tombstone)', () => {
    // 1. Użytkownik edytuje ćwiczenie wbudowane
    const modified = useAppStore.getState().addCustomExercise({
      id_cwiczenia: 'ex_014',
      nazwa: 'Podciąganie zmodyfikowane',
      poziom: 7,
    });
    expect(modified._sync?.version).toBe(1);

    // Renderujemy widok - licznik powinien pokazywać 1
    const { unmount } = render(<ExerciseStudioView />);
    expect(screen.getByText(/Zapisane lokalnie \(1\)/i)).toBeInTheDocument();
    unmount();

    // 2. Użytkownik usuwa tę modyfikację (przywracając fabryczny oryginał)
    useAppStore.getState().removeCustomExercise('ex_014');

    // Sprawdzamy stan store: wpis w pamięci trwałej ma flagę isDeleted = true (Tombstone)
    const rawCustom = useAppStore.getState().customExercises;
    expect(rawCustom).toHaveLength(1);
    expect(rawCustom[0]._sync?.isDeleted).toBe(true);

    // 3. Po ponownym wyrenderowaniu zakładka MUSI pokazywać (0), a nie (1)
    render(<ExerciseStudioView />);
    expect(screen.getByText(/Zapisane lokalnie \(0\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Zapisane lokalnie \(1\)/i)).not.toBeInTheDocument();
  });

  it('zeruje licznik własnych ćwiczeń w Ustawieniach w obecności nagrobka', () => {
    // Dodajemy ćwiczenie, a następnie natychmiast je usuwamy
    const ex = useAppStore.getState().addCustomExercise({ nazwa: 'Tymczasowe ćwiczenie' });
    useAppStore.getState().removeCustomExercise(ex.id_cwiczenia);

    // W pamięci trwałej jest tombstone
    expect(useAppStore.getState().customExercises[0]._sync?.isDeleted).toBe(true);

    // W Ustawieniach licznik bazy ćwiczeń powinien pokazywać czystą bazę 270 bez (+1 własnych)
    render(<SettingsView />);
    expect(screen.getByText('270 w bazie')).toBeInTheDocument();
    expect(screen.queryByText(/\+1 własnych/i)).not.toBeInTheDocument();
  });
});

