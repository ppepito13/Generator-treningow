import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '@/app/lib/store';

describe('Zustand Store - Domain Generator Integration', () => {
  beforeEach(() => {
    // Reset store to known state
    useAppStore.getState().reset();
    useAppStore.setState({
      participants: 6,
      stationCount: 5,
      difficultyId: 'baza_silowa_standard',
      isStrictDifficulty: true,
      circuit: [],
      isGenerated: false,
      generationConflict: null,
    });
  });

  it('generates circuit workout using domain strategy', () => {
    const store = useAppStore.getState();
    store.generateCircuit();

    const state = useAppStore.getState();
    expect(state.isGenerated).toBe(true);
    expect(state.circuit).toHaveLength(5);
    // 6 participants on 5 stations -> station 0 is a pair
    expect(state.circuit[0].isPair).toBe(true);
    expect(state.circuit[1].isPair).toBe(false);
  });

  it('rerolls exercise on a station through rerollExerciseStrategy', () => {
    const store = useAppStore.getState();
    store.generateCircuit();

    const initialCircuit = useAppStore.getState().circuit;
    expect(initialCircuit.length).toBeGreaterThan(0);

    const stationToReroll = initialCircuit[1];

    store.rerollExercise(stationToReroll.id, 'A');

    const updatedCircuit = useAppStore.getState().circuit;
    const updatedStation = updatedCircuit.find(s => s.id === stationToReroll.id);
    expect(updatedStation).toBeDefined();
    // Exercise should be re-selected
    expect(updatedStation?.exerciseA).toBeDefined();
  });

  it('resolves conflict with action reduce by restoring partialStations and synchronizing stationCount', () => {
    const partialStationMock = {
      id: 'st-0-mock',
      zone: { id: 'z-elastic', nazwa: 'Strefa', typ: 'elastyczny' },
      exerciseA: {
        id_cwiczenia: 'ex-mock',
        nazwa: 'Mock Ex',
        wariant: '',
        segment_id: 1,
        segment_nazwa: 'PULL',
        tryb_pracy: 'Solo' as const,
        poziom: 2,
        biomechanika: 'pull',
        glowne_partie: ['Plecy'],
        zaangazowane_miesnie: 'biceps',
        tagi_specjalne: [],
        kategorie_treningu: ['Siła'],
        instrukcja: '',
      },
      isPair: false,
    };

    useAppStore.setState({
      stationCount: 8,
      generationConflict: {
        type: 'generate',
        requestedStations: 8,
        availableStations: 1,
        canLoosenDifficulty: false,
        partialStations: [partialStationMock],
      },
    });

    useAppStore.getState().resolveConflict({ action: 'reduce' });

    const state = useAppStore.getState();
    expect(state.generationConflict).toBeNull();
    expect(state.circuit).toHaveLength(1);
    expect(state.stationCount).toBe(1);
    expect(state.isGenerated).toBe(true);
  });

  it('clears conflict state when user cancels', () => {
    useAppStore.setState({
      generationConflict: {
        type: 'generate',
        requestedStations: 5,
        availableStations: 2,
        canLoosenDifficulty: true,
      },
    });

    useAppStore.getState().resolveConflict({ action: 'cancel' });

    const state = useAppStore.getState();
    expect(state.generationConflict).toBeNull();
  });
});
