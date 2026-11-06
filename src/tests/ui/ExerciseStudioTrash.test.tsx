// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ExerciseStudioView } from '@/components/ExerciseStudioView';
import { useAppStore } from '@/app/lib/store';

describe('UI: Kosz Usuniętych Ćwiczeń w Studio Ćwiczeń (#52)', () => {
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

  it('wyświetla 4. zakładkę Usunięte (X) z dynamicznym licznikiem i odróżnia ją od zapisanych lokalnie', () => {
    // 1. Początkowo brak pozycji
    const { unmount } = render(<ExerciseStudioView />);
    expect(screen.getByText(/Usunięte \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Zapisane lokalnie \(0\)/i)).toBeInTheDocument();
    unmount();

    // 2. Dodajemy ćwiczenie i je usuwamy
    const ex = useAppStore.getState().addCustomExercise({ nazwa: 'Ćwiczenie do Kosza' });
    useAppStore.getState().removeCustomExercise(ex.id_cwiczenia);

    render(<ExerciseStudioView />);
    expect(screen.getByText(/Usunięte \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Zapisane lokalnie \(0\)/i)).toBeInTheDocument();
  });

  it('po wybraniu zakładki Usunięte renderuje baner informacyjny oraz kartę z przyciskiem Przywróć', () => {
    const ex = useAppStore.getState().addCustomExercise({ nazwa: 'Wyciskanie z hantlami' });
    useAppStore.getState().removeCustomExercise(ex.id_cwiczenia);

    render(<ExerciseStudioView />);

    // Klikamy w 4. zakładkę Usunięte
    const deletedTab = screen.getByText(/Usunięte \(1\)/i);
    act(() => {
      fireEvent.click(deletedTab);
    });

    // Baner informacyjny i przycisk opróżnienia kosza są widoczne
    expect(screen.getByText(/Kosz usuniętych ćwiczeń/i)).toBeInTheDocument();
    expect(screen.getByText(/Opróżnij kosz/i)).toBeInTheDocument();

    // Karta ćwiczenia w koszu
    expect(screen.getByText('Wyciskanie z hantlami')).toBeInTheDocument();
    expect(screen.getByText('W koszu')).toBeInTheDocument();
    expect(screen.getByText(/Pozostało: \d+ dni|Wygasa dzisiaj/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Przywróć/i })).toBeInTheDocument();
  });

  it('po kliknięciu Przywróć przywraca ćwiczenie do bazy aktywnej i zeruje licznik kosza', () => {
    const ex = useAppStore.getState().addCustomExercise({ nazwa: 'Pompki Diamentowe' });
    useAppStore.getState().removeCustomExercise(ex.id_cwiczenia);

    render(<ExerciseStudioView />);

    // Przechodzimy do Usuniętych
    act(() => {
      fireEvent.click(screen.getByText(/Usunięte \(1\)/i));
    });

    // Klikamy Przywróć
    const restoreBtn = screen.getByRole('button', { name: /Przywróć/i });
    act(() => {
      fireEvent.click(restoreBtn);
    });

    // Sprawdzamy stan store
    const restored = useAppStore.getState().customExercises.find(e => e.id_cwiczenia === ex.id_cwiczenia);
    expect(restored?._sync?.isDeleted).toBe(false);

    // Na ekranie pojawia się stan pusty kosza i licznik Usunięte (0)
    expect(screen.getByText(/Kosz jest pusty/i)).toBeInTheDocument();
    expect(screen.getByText(/Usunięte \(0\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Zapisane lokalnie \(1\)/i)).toBeInTheDocument();
  });

  it('wyświetla stan pusty kosza gdy brak usuniętych ćwiczeń', () => {
    render(<ExerciseStudioView />);

    act(() => {
      fireEvent.click(screen.getByText(/Usunięte \(0\)/i));
    });

    expect(screen.getByText(/Kosz jest pusty/i)).toBeInTheDocument();
    expect(screen.getByText(/Nie ma obecnie żadnych usuniętych ćwiczeń/i)).toBeInTheDocument();
  });

  it('kontener paska filtrów źródeł posiada klasy responsywnego poziomego suwaka (#53)', () => {
    render(<ExerciseStudioView />);
    const deletedBtn = screen.getByText(/Usunięte \(0\)/i).closest('button');
    expect(deletedBtn).toBeInTheDocument();
    expect(deletedBtn).toHaveClass('shrink-0');
    expect(deletedBtn).toHaveClass('whitespace-nowrap');

    const filterContainer = deletedBtn?.parentElement;
    expect(filterContainer).toBeInTheDocument();
    expect(filterContainer).toHaveClass('max-w-full');
    expect(filterContainer).toHaveClass('overflow-x-auto');
    expect(filterContainer).toHaveClass('scrollbar-none');
  });
});

