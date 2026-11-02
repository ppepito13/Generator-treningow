// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsView } from '@/components/SettingsView';
import { useAppStore } from '@/app/lib/store';

describe('Komponent UI: SettingsView', () => {
  beforeEach(() => {
    useAppStore.setState({ activeTab: 'settings' });
  });

  it('renderuje nagłówek oraz kluczowe sekcje modułu ustawień', () => {
    render(<SettingsView />);

    expect(screen.getByText('Ustawienia')).toBeInTheDocument();
    expect(screen.getByText('Wygląd i Motyw')).toBeInTheDocument();
    expect(screen.getByText('Konto i Kopia Zapasowa')).toBeInTheDocument();
    expect(screen.getByText('O Aplikacji')).toBeInTheDocument();
    expect(screen.getByText('Generator Sport\'s Way')).toBeInTheDocument();
    expect(screen.getByText('v1.3.0')).toBeInTheDocument();
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
