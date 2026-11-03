// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from '@/components/SettingsView';
import { useAppStore } from '@/app/lib/store';
import { APP_VERSION, APP_WEBSITE_URL, APP_WEBSITE_DISPLAY } from '@/config/appInfo';
import { createDefaultExercise, Exercise } from '@/app/lib/data';

describe('Komponent UI: SettingsView', () => {
  beforeEach(() => {
    useAppStore.setState({ 
      activeTab: 'settings',
      customExercises: []
    });
  });

  it('renderuje nagłówek oraz kluczowe sekcje modułu ustawień', () => {
    render(<SettingsView />);

    expect(screen.getByText('Ustawienia')).toBeInTheDocument();
    expect(screen.getByText('Wygląd i Motyw')).toBeInTheDocument();
    expect(screen.getByText('Konto i Kopia Zapasowa')).toBeInTheDocument();
    expect(screen.getByText('O Aplikacji')).toBeInTheDocument();
    expect(screen.getByText('Generator Sport\'s Way')).toBeInTheDocument();
    expect(screen.getByText(APP_VERSION)).toBeInTheDocument();
  });

  it('renderuje bezpieczny odnośnik do oficjalnej strony internetowej', () => {
    render(<SettingsView />);

    const link = screen.getByRole('link', { name: new RegExp(APP_WEBSITE_DISPLAY, 'i') });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', APP_WEBSITE_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('wyświetla liczbę ćwiczeń w bazie fabrycznej gdy brak ćwiczeń autorskich', () => {
    useAppStore.setState({ customExercises: [] });
    render(<SettingsView />);

    expect(screen.getByText('270 w bazie')).toBeInTheDocument();
  });

  it('wyświetla wyszczególnienie ćwiczeń autorskich gdy użytkownik posiada zmodyfikowane/własne ćwiczenia', () => {
    const mockCustomExercise: Exercise = createDefaultExercise({
      id_cwiczenia: 'custom_mock_1',
      nazwa: 'Autorskie ćwiczenie testowe'
    });

    useAppStore.setState({ customExercises: [mockCustomExercise] });
    render(<SettingsView />);

    expect(screen.getByText('270 w bazie (+1 własnych)')).toBeInTheDocument();
  });

  it('przełącza aktywną zakładkę z powrotem na generator po kliknięciu przycisku Wróć', () => {
    render(<SettingsView />);

    const backBtn = screen.getByRole('button', { name: /wróć/i });
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);

    expect(useAppStore.getState().activeTab).toBe('generator');
  });

  it('umożliwia reaktywne przełączanie opcji motywu', () => {
    render(<SettingsView />);

    const lightThemeBtn = screen.getByText('Jasny');
    fireEvent.click(lightThemeBtn);

    const darkThemeBtn = screen.getByText('Ciemny');
    fireEvent.click(darkThemeBtn);

    expect(screen.getByText('Zalecany na salę')).toBeInTheDocument();
  });
});
