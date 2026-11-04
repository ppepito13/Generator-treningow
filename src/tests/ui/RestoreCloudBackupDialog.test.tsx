// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RestoreCloudBackupDialog } from '@/components/RestoreCloudBackupDialog';

describe('RestoreCloudBackupDialog (#40.4)', () => {
  it('renders correctly when open with title, warning and action buttons', () => {
    render(
      <RestoreCloudBackupDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByText('Przywracanie kopii z Dysku Google')).toBeInTheDocument();
    expect(screen.getByText(/Wszelkie modyfikacje oraz usunięte ćwiczenia na tym telefonie zostaną wycofane/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Przywróć dane z chmury' })).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <RestoreCloudBackupDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: 'Przywróć dane z chmury' });
    fireEvent.click(confirmBtn);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange(false) when cancel button is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <RestoreCloudBackupDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Anuluj' });
    fireEvent.click(cancelBtn);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('disables buttons and shows spinner when isRestoring is true', () => {
    render(
      <RestoreCloudBackupDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        isRestoring={true}
      />
    );

    expect(screen.getByRole('button', { name: /Przywracanie.../i })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Anuluj' })).toBeDisabled();
  });
});

