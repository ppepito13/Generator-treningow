// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from '@/components/BottomNav';
import { useAppStore } from '@/app/lib/store';

describe('Komponent UI: BottomNav', () => {
  beforeEach(() => {
    useAppStore.setState({ activeTab: 'generator', circuit: [] });
  });

  it('renderuje wszystkie etykiety zakładek nawigacji', () => {
    render(<BottomNav />);

    expect(screen.getByText('Generator')).toBeInTheDocument();
    expect(screen.getByText('Zestaw')).toBeInTheDocument();
    expect(screen.getByText('Zegar')).toBeInTheDocument();
    expect(screen.getByText('Narzędzia')).toBeInTheDocument();
    expect(screen.getByText('Studio')).toBeInTheDocument();
  });

  it('przełącza aktywną zakładkę w Zustand store po kliknięciu', () => {
    render(<BottomNav />);

    const timerBtn = screen.getByText('Zegar');
    fireEvent.click(timerBtn);

    expect(useAppStore.getState().activeTab).toBe('timer');

    const studioBtn = screen.getByText('Studio');
    fireEvent.click(studioBtn);

    expect(useAppStore.getState().activeTab).toBe('studio');
  });
});

