// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { useAppStore } from '@/app/lib/store';

describe('Komponent UI: ConfigurationForm (Smoke Test)', () => {
  beforeEach(() => {
    useAppStore.setState({
      selectedRoomId: 'balaton',
      participants: 6,
      stationCount: 6,
      difficultyId: 'baza_silowa_standard',
      circuit: [],
    });
  });

  it('renderuje formularz konfiguracji generatora bez błędów', () => {
    render(<ConfigurationForm />);

    expect(screen.getByText(/Wybierz Salę/i)).toBeInTheDocument();
    expect(screen.getByText(/Uczestnicy/i)).toBeInTheDocument();
    expect(screen.getByText(/Liczba Stacji/i)).toBeInTheDocument();
    expect(screen.getByText(/Poziom Grupy/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generuj Obwód/i })).toBeInTheDocument();
  });

  it('kliknięcie "Generuj Obwód" generuje stacje w Zustand store', () => {
    render(<ConfigurationForm />);

    const generateBtn = screen.getByRole('button', { name: /Generuj Obwód/i });
    fireEvent.click(generateBtn);

    const circuit = useAppStore.getState().circuit;
    expect(circuit.length).toBeGreaterThan(0);
  });
});
