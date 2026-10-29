// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Timer } from 'lucide-react';

describe('Komponent UI: ModuleHeader', () => {
  it('renderuje tytuł, podtytuł oraz ikonę', () => {
    render(
      <ModuleHeader
        icon={Timer}
        title="Centrum Czasowe"
        subtitle="Stoper i minutnik"
      />
    );

    expect(screen.getByText('Centrum Czasowe')).toBeInTheDocument();
    expect(screen.getByText('Stoper i minutnik')).toBeInTheDocument();
  });

  it('renderuje opcjonalne akcje i dzieci', () => {
    render(
      <ModuleHeader
        icon={Timer}
        title="Centrum Czasowe"
        actions={<button>Wyczyść</button>}
      >
        <div>Pasek zakładek</div>
      </ModuleHeader>
    );

    expect(screen.getByText('Centrum Czasowe')).toBeInTheDocument();
    expect(screen.getByText('Wyczyść')).toBeInTheDocument();
    expect(screen.getByText('Pasek zakładek')).toBeInTheDocument();
  });
});

