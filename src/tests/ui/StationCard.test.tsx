// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StationCard } from '@/components/StationCard';
import type { Station, Zone } from '@/app/lib/data';

describe('Komponent UI: StationCard', () => {
  const mockZone: Zone = {
    id: 'strefa_1',
    nazwa: 'Strefa Drążków',
    typ: 'klatka_rig',
    kolejnosc_sortowania: 1,
    bazowa_pojemnosc_stacji: 2,
  };

  const singleStation: Station = {
    id: 'station-1',
    zone: mockZone,
    isPair: false,
    exerciseA: {
      id_cwiczenia: 'ex_test_1',
      nazwa: 'Pompki klasyczne',
      wariant: 'Klasyczny',
      segment_id: 2,
      segment_nazwa: 'PUSH',
      tryb_pracy: 'Solo',
      poziom: 3,
      glowne_partie: ['Klatka piersiowa'],
      zaangazowane_miesnie: 'klatka, triceps',
      tagi_specjalne: [],
      kategorie_treningu: ['Kalistenika'],
      instrukcja: 'Instrukcja wykonania pompek',
      biomechanika: 'Bilateralny',
    },
  };

  const pairStation: Station = {
    id: 'station-2',
    zone: mockZone,
    isPair: true,
    exerciseA: singleStation.exerciseA,
    exerciseB: {
      id_cwiczenia: 'ex_test_2',
      nazwa: 'Dipy na poręczach',
      wariant: 'Klasyczny',
      segment_id: 2,
      segment_nazwa: 'PUSH',
      tryb_pracy: 'W_Parze',
      poziom: 4,
      glowne_partie: ['Triceps'],
      zaangazowane_miesnie: 'triceps, barki',
      tagi_specjalne: [],
      kategorie_treningu: ['Kalistenika'],
      instrukcja: 'Instrukcja wykonania dipów',
      biomechanika: 'Bilateralny',
    },
  };

  it('renderuje pojedynczą stację z nazwą ćwiczenia oraz strefą', () => {
    render(<StationCard station={singleStation} />);

    expect(screen.getByText('Strefa Drążków')).toBeInTheDocument();
    expect(screen.getByText('Pompki klasyczne')).toBeInTheDocument();
    expect(screen.getByText('Ćwiczenie')).toBeInTheDocument();
  });

  it('renderuje stację w parze z oboma ćwiczeniami (Uczestnik A i Uczestnik B)', () => {
    render(<StationCard station={pairStation} />);

    expect(screen.getByText('Strefa Drążków')).toBeInTheDocument();
    expect(screen.getByText('Uczestnik A')).toBeInTheDocument();
    expect(screen.getByText('Pompki klasyczne')).toBeInTheDocument();
    expect(screen.getByText('Uczestnik B')).toBeInTheDocument();
    expect(screen.getByText('Dipy na poręczach')).toBeInTheDocument();
  });
});
