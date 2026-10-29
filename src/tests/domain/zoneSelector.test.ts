import { describe, it, expect } from 'vitest';
import { selectRoomZonesForCircuit } from '@/domain/generator/zoneSelector';
import type { Zone } from '@/app/lib/data';

const makeZone = (overrides: Partial<Zone> = {}): Zone => ({
  id: `z-${Math.random()}`,
  nazwa: 'Strefa',
  typ: 'elastyczny',
  kolejnosc_sortowania: 3,
  bazowa_pojemnosc_stacji: 5,
  ...overrides,
});

describe('selectRoomZonesForCircuit – forced zones', () => {
  it('always includes zones with blokada_zmiany_recznej=true', () => {
    const forced = makeZone({ id: 'forced', blokada_zmiany_recznej: true, typ: 'specjalna', kolejnosc_sortowania: 1 });
    const other = makeZone({ id: 'other', bazowa_pojemnosc_stacji: 5 });
    const result = selectRoomZonesForCircuit([forced, other], 3, false);
    expect(result.some(z => z.id === 'forced')).toBe(true);
  });
});

describe('selectRoomZonesForCircuit – RIG zone priority', () => {
  it('includes RIG zone (kolejnosc_sortowania=2) when stationCount > 1', () => {
    const rig = makeZone({ id: 'rig', typ: 'klatka_rig', kolejnosc_sortowania: 2, pojemnosc_stacji: 1 });
    const floor = makeZone({ id: 'floor', typ: 'elastyczny', bazowa_pojemnosc_stacji: 5 });
    const result = selectRoomZonesForCircuit([rig, floor], 3, false);
    expect(result.some(z => z.id === 'rig')).toBe(true);
  });

  it('does NOT include RIG zone when stationCount = 1', () => {
    const rig = makeZone({ id: 'rig', typ: 'klatka_rig', kolejnosc_sortowania: 2, pojemnosc_stacji: 1 });
    const floor = makeZone({ id: 'floor', typ: 'elastyczny', bazowa_pojemnosc_stacji: 5 });
    const result = selectRoomZonesForCircuit([rig, floor], 1, false);
    expect(result.some(z => z.id === 'rig')).toBe(false);
  });
});

describe('selectRoomZonesForCircuit – result count', () => {
  it('returns exactly stationCount zones (when enough capacity exists)', () => {
    const floor = makeZone({ id: 'floor', typ: 'elastyczny', bazowa_pojemnosc_stacji: 10 });
    const result = selectRoomZonesForCircuit([floor], 5, false);
    expect(result.length).toBe(5);
  });
});

describe('selectRoomZonesForCircuit – sorting', () => {
  it('sorts result by kolejnosc_sortowania ascending', () => {
    const rig = makeZone({ id: 'rig', typ: 'klatka_rig', kolejnosc_sortowania: 2, pojemnosc_stacji: 2 });
    const floor = makeZone({ id: 'floor', typ: 'elastyczny', kolejnosc_sortowania: 3, bazowa_pojemnosc_stacji: 10 });
    const result = selectRoomZonesForCircuit([floor, rig], 3, false);
    const orders = result.map(z => z.kolejnosc_sortowania ?? 99);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1]);
    }
  });
});
