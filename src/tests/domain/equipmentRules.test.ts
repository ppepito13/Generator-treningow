import { describe, it, expect } from 'vitest';
import { getEquipmentString, ensureEquipment, canExerciseBeShared } from '@/domain/generator/equipmentRules';
import type { Exercise, RoomConfig } from '@/app/lib/data';

const baseExercise = (overrides: Partial<Exercise> = {}): Exercise => ({
  id_cwiczenia: 'test-ex',
  nazwa: 'Test Exercise',
  wariant: '',
  segment_id: 1,
  segment_nazwa: 'Drążki i Drabinki',
  tryb_pracy: 'Solo',
  wymagania_sprzetowe: [],
  biomechanika: 'Ogólna',
  poziom: 3,
  glowne_partie: ['Plecy'],
  zaangazowane_miesnie: 'Plecy',
  tagi_specjalne: [],
  kategorie_treningu: ['all'],
  instrukcja: '',
  ...overrides,
});

const baseRoom = (inwentarz: Record<string, number> = {}): RoomConfig => ({
  id_sali: 'room-test',
  nazwa_sali: 'Test Room',
  tryb_treningu: 'obwodowy',
  maksymalna_pojemnosc: { osoby: 20, stacje: 10 },
  inwentarz,
  strefy: [],
  reguly_przeplywu_i_kolizji: {},
  zakazane_tryby_pracy: [],
});

describe('getEquipmentString', () => {
  it('returns empty string when no requirements', () => {
    const ex = baseExercise({ wymagania_sprzetowe: [] });
    expect(getEquipmentString(ex)).toBe('');
  });

  it('returns keys for a simple AND requirement', () => {
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(getEquipmentString(ex)).toContain('hantel');
  });

  it('returns all keys from OR alternatives', () => {
    const ex = baseExercise({ wymagania_sprzetowe: [[{ hantel: 1 }, { kettlebell: 1 }]] });
    const result = getEquipmentString(ex);
    expect(result).toContain('hantel');
    expect(result).toContain('kettlebell');
  });
});

describe('ensureEquipment', () => {
  it('returns true when exercise has no requirements', () => {
    const room = baseRoom({});
    const ex = baseExercise({ wymagania_sprzetowe: [] });
    expect(ensureEquipment(ex, room, 1)).toBe(true);
  });

  it('returns true when gym has enough equipment (solo)', () => {
    const room = baseRoom({ hantel: 2 });
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(ensureEquipment(ex, room, 1)).toBe(true);
  });

  it('returns false when gym lacks equipment (solo)', () => {
    const room = baseRoom({ hantel: 0 });
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(ensureEquipment(ex, room, 1)).toBe(false);
  });

  it('returns false when gym has equipment for 1 but needs for 2', () => {
    const room = baseRoom({ hantel: 1 });
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(ensureEquipment(ex, room, 2)).toBe(false);
  });

  it('returns true for OR rule when at least one alternative is satisfied', () => {
    const room = baseRoom({ kettlebell: 1 });
    const ex = baseExercise({ wymagania_sprzetowe: [[{ hantel: 1 }, { kettlebell: 1 }]] });
    expect(ensureEquipment(ex, room, 1)).toBe(true);
  });

  it('returns false for OR rule when no alternative is satisfied', () => {
    const room = baseRoom({});
    const ex = baseExercise({ wymagania_sprzetowe: [[{ hantel: 1 }, { kettlebell: 1 }]] });
    expect(ensureEquipment(ex, room, 1)).toBe(false);
  });
});

describe('canExerciseBeShared', () => {
  it('returns true when 2 people can share the exercise equipment', () => {
    const room = baseRoom({ hantel: 2 });
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(canExerciseBeShared(ex, room)).toBe(true);
  });

  it('returns false when only 1 unit of equipment is available for 2 people', () => {
    const room = baseRoom({ hantel: 1 });
    const ex = baseExercise({ wymagania_sprzetowe: [{ hantel: 1 }] });
    expect(canExerciseBeShared(ex, room)).toBe(false);
  });
});
