// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from '@/components/SettingsView';
import { useAppStore } from '@/app/lib/store';
import { APP_VERSION, APP_WEBSITE_URL, APP_WEBSITE_DISPLAY } from '@/config/appInfo';
import { createDefaultExercise, Exercise } from '@/app/lib/data';
import * as syncCoordinator from '@/services/sync/syncCoordinator';

vi.mock('@/services/sync/syncCoordinator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/services/sync/syncCoordinator')>();
  return {
    ...actual,
    performSync: vi.fn().mockResolvedValue({ success: true }),
    checkInitialSyncConflict: vi.fn().mockResolvedValue({ hasConflict: false }),
    resolveInitialSync: vi.fn().mockResolvedValue({ success: true }),
  };
});

describe('Komponent UI: SettingsView', () => {
  beforeEach(() => {
    useAppStore.setState({ 
      activeTab: 'settings',
      customExercises: [],
      googleUser: null,
      authStatus: 'idle',
      authError: null,
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

  it('wyświetla stan niezalogowanego konta Google z przyciskiem do połączenia oraz wielokolorowym logo Google', () => {
    const { container } = render(<SettingsView />);

    expect(screen.getByText('Niezalogowany')).toBeInTheDocument();
    const connectBtn = screen.getByRole('button', { name: /połącz z kontem google/i });
    expect(connectBtn).toBeInTheDocument();

    // Weryfikacja obecności 4-kolorowego logo Google (SVG z oficjalnymi kolorami na kafelku i przycisku)
    const bluePaths = container.querySelectorAll('path[fill="#4285F4"]');
    const greenPaths = container.querySelectorAll('path[fill="#34A853"]');
    const yellowPaths = container.querySelectorAll('path[fill="#FBBC05"]');
    const redPaths = container.querySelectorAll('path[fill="#EA4335"]');

    expect(bluePaths.length).toBeGreaterThanOrEqual(2);
    expect(greenPaths.length).toBeGreaterThanOrEqual(2);
    expect(yellowPaths.length).toBeGreaterThanOrEqual(2);
    expect(redPaths.length).toBeGreaterThanOrEqual(2);
  });

  it('wyświetla dane zalogowanego użytkownika Google oraz przycisk odłączenia', () => {
    useAppStore.setState({
      googleUser: {
        id: 'usr_1',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
        picture: 'https://lh3.googleusercontent.com/avatar.jpg',
      },
    });

    render(<SettingsView />);

    expect(screen.getByText('Jan Trener')).toBeInTheDocument();
    expect(screen.getByText('trener@sportsway.eu')).toBeInTheDocument();
    expect(screen.getByText('Połączono')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /odłącz konto google/i })).toBeInTheDocument();
  });

  it('otwiera modal potwierdzenia po kliknięciu Odłącz konto Google', () => {
    useAppStore.setState({
      googleUser: {
        id: 'usr_1',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
      },
    });

    render(<SettingsView />);

    const disconnectBtn = screen.getByRole('button', { name: /odłącz konto google/i });
    fireEvent.click(disconnectBtn);

    expect(screen.getByText('Odłączanie Konta Google')).toBeInTheDocument();
    expect(screen.getByText(/Wstrzymanie synchronizacji:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /potwierdzam, odłącz konto/i })).toBeInTheDocument();
  });

  it('wyświetla status Wymaga uprawnień, ostrzeżenie o wstrzymaniu kopii oraz przycisk nadania uprawnień przy hasDriveScope === false (#40.1-granular-scope)', () => {
    useAppStore.setState({
      googleUser: {
        id: 'usr_partial',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
        hasDriveScope: false,
      },
    });

    render(<SettingsView />);

    expect(screen.getByText('Jan Trener')).toBeInTheDocument();
    expect(screen.getByText('trener@sportsway.eu')).toBeInTheDocument();
    expect(screen.getByText('Wymaga uprawnień')).toBeInTheDocument();
    expect(screen.getByText('Kopia zapasowa wstrzymana')).toBeInTheDocument();
    expect(screen.getByText(/Nie przyznano dostępu do Dysku Google/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nadaj uprawnienie do dysku google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /odłącz konto google/i })).toBeInTheDocument();
  });

  it('wyświetla wskaźnik Zsynchronizowano, czas ostatniej kopii i aktywny przycisk ręcznej synchronizacji (#40.3b)', async () => {
    const fixedTimestamp = new Date(2026, 10, 4, 15, 30, 0).getTime();
    useAppStore.setState({
      googleUser: {
        id: 'usr_full',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
        hasDriveScope: true,
      },
      syncStatus: 'idle',
      lastSyncedAt: fixedTimestamp,
      syncError: null,
    });

    render(<SettingsView />);

    expect(screen.getByText('Stan synchronizacji:')).toBeInTheDocument();
    expect(screen.getByText('Zsynchronizowano')).toBeInTheDocument();
    expect(screen.getByText('Ostatnia kopia w chmurze:')).toBeInTheDocument();
    const syncNowBtn = screen.getByRole('button', { name: /synchronizuj teraz/i });
    expect(syncNowBtn).toBeInTheDocument();
    expect(syncNowBtn).not.toBeDisabled();

    fireEvent.click(syncNowBtn);

    await waitFor(() => {
      expect(syncCoordinator.performSync).toHaveBeenCalledWith({ force: true });
    });
  });

  it('blokuje przycisk synchronizacji i prezentuje spinner podczas trwającej synchronizacji (#40.3b)', () => {
    useAppStore.setState({
      googleUser: {
        id: 'usr_full',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
        hasDriveScope: true,
      },
      syncStatus: 'syncing',
      lastSyncedAt: null,
      syncError: null,
    });

    render(<SettingsView />);

    expect(screen.getAllByText('Synchronizowanie...').length).toBeGreaterThanOrEqual(1);
    const syncBtn = screen.getByRole('button', { name: /synchronizowanie.../i });
    expect(syncBtn).toBeDisabled();
  });

  it('prezentuje komunikat błędu synchronizacji z opisem (#40.3b)', () => {
    useAppStore.setState({
      googleUser: {
        id: 'usr_full',
        name: 'Jan Trener',
        email: 'trener@sportsway.eu',
        hasDriveScope: true,
      },
      syncStatus: 'error',
      lastSyncedAt: null,
      syncError: 'Błąd połączenia z serwerem Google Drive (503).',
    });

    render(<SettingsView />);

    expect(screen.getByText('Błąd synchronizacji')).toBeInTheDocument();
    expect(screen.getByText('Błąd połączenia z serwerem Google Drive (503).')).toBeInTheDocument();
  });
});
