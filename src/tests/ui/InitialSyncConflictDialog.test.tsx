// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InitialSyncConflictDialog } from '@/components/InitialSyncConflictDialog';
import type { InitialSyncConflictDetails } from '@/types/sync';

describe('InitialSyncConflictDialog (#40.3b)', () => {
  const mockConflictDetails: InitialSyncConflictDetails = {
    hasConflict: true,
    localCount: {
      exercises: 3,
      rooms: 1,
      equipment: 0,
      presets: 0,
      total: 4,
    },
    remoteCount: {
      exercises: 10,
      rooms: 2,
      equipment: 5,
      presets: 1,
      total: 18,
    },
    remoteModifiedTime: '2026-11-04T10:00:00Z',
  };

  it('renders correctly when open with details and default selection on merge', () => {
    render(
      <InitialSyncConflictDialog
        isOpen={true}
        onOpenChange={vi.fn()}
        conflictDetails={mockConflictDetails}
        onResolve={vi.fn()}
      />
    );

    expect(screen.getByText('Wykryto dane w chmurze i na urządzeniu')).toBeInTheDocument();
    expect(screen.getByText('Na tym urządzeniu')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('W chmurze Google Drive')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();

    const mergeOption = screen.getByRole('radio', { name: /Scal dane/i });
    expect(mergeOption).toHaveAttribute('aria-checked', 'true');

    expect(screen.getByText('Zalecane')).toBeInTheDocument();
  });

  it('allows selecting different conflict resolution options and submits selection', () => {
    const onResolve = vi.fn();
    render(
      <InitialSyncConflictDialog
        isOpen={true}
        onOpenChange={vi.fn()}
        conflictDetails={mockConflictDetails}
        onResolve={onResolve}
      />
    );

    const pullOption = screen.getByRole('radio', { name: /Użyj danych z chmury/i });
    fireEvent.click(pullOption);
    expect(pullOption).toHaveAttribute('aria-checked', 'true');

    const submitBtn = screen.getByRole('button', { name: 'Zatwierdź wybór' });
    fireEvent.click(submitBtn);

    expect(onResolve).toHaveBeenCalledWith('pull');
  });

  it('allows selecting push option and submits selection', () => {
    const onResolve = vi.fn();
    render(
      <InitialSyncConflictDialog
        isOpen={true}
        onOpenChange={vi.fn()}
        conflictDetails={mockConflictDetails}
        onResolve={onResolve}
      />
    );

    const pushOption = screen.getByRole('radio', { name: /Nadpisz chmurę danymi z tego urządzenia/i });
    fireEvent.click(pushOption);
    expect(pushOption).toHaveAttribute('aria-checked', 'true');

    const submitBtn = screen.getByRole('button', { name: 'Zatwierdź wybór' });
    fireEvent.click(submitBtn);

    expect(onResolve).toHaveBeenCalledWith('push');
  });

  it('calls onOpenChange(false) when cancel button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <InitialSyncConflictDialog
        isOpen={true}
        onOpenChange={onOpenChange}
        conflictDetails={mockConflictDetails}
        onResolve={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Anuluj' });
    fireEvent.click(cancelBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables buttons and shows loading state during resolution', () => {
    render(
      <InitialSyncConflictDialog
        isOpen={true}
        onOpenChange={vi.fn()}
        conflictDetails={mockConflictDetails}
        onResolve={vi.fn()}
        isResolving={true}
      />
    );

    expect(screen.getByRole('button', { name: /Zapisywanie.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeDisabled();
  });
});
