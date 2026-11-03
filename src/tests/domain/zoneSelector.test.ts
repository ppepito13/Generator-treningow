import { describe, it, expect } from 'vitest';
import { selectRoomZonesForCircuit } from '@/domain/generator/zoneSelector';
import type { Zone } from '@/app/lib/data';
import salaData from '@/app/lib/data/sala.json';

const makeZone = (overrides: Partial<Zone> = {}): Zone => ({
  id: `z-${Math.random()}`,
  nazwa: 'Strefa',
  typ: 'elastyczny',
  kolejnosc_sortowania: 3,
  bazowa_pojemnosc_stacji: 5,
  ...overrides,
});

describe('selectRoomZonesForCircuit – generic rooms', () => {
  it('always includes zones with wymuszona_w_obwodzie=true', () => {
    const forced = makeZone({ id: 'forced', wymuszona_w_obwodzie: true, typ: 'specjalna', kolejnosc_sortowania: 1 });
    const other = makeZone({ id: 'other', bazowa_pojemnosc_stacji: 5 });
    const result = selectRoomZonesForCircuit([forced, other], 3, false);
    expect(result.some(z => z.id === 'forced')).toBe(true);
  });

  it('supports legacy blokada_zmiany_recznej=true as fallback', () => {
    const forced = makeZone({ id: 'forced-legacy', blokada_zmiany_recznej: true, typ: 'specjalna', kolejnosc_sortowania: 1 });
    const other = makeZone({ id: 'other', bazowa_pojemnosc_stacji: 5 });
    const result = selectRoomZonesForCircuit([forced, other], 3, false);
    expect(result.some(z => z.id === 'forced-legacy')).toBe(true);
  });

  it('returns exactly stationCount zones (when enough capacity exists)', () => {
    const floor = makeZone({ id: 'floor', typ: 'elastyczny', bazowa_pojemnosc_stacji: 10 });
    const result = selectRoomZonesForCircuit([floor], 5, false);
    expect(result.length).toBe(5);
  });

  it('sorts result by kolejnosc_sortowania ascending for generic rooms', () => {
    const zoneB = makeZone({ id: 'zone-b', typ: 'staly', kolejnosc_sortowania: 2, pojemnosc_stacji: 2 });
    const zoneA = makeZone({ id: 'zone-a', typ: 'elastyczny', kolejnosc_sortowania: 1, bazowa_pojemnosc_stacji: 10 });
    const result = selectRoomZonesForCircuit([zoneB, zoneA], 3, false);
    const orders = result.map(z => z.kolejnosc_sortowania ?? 99);
    for (let i = 1; i < orders.length; i++) {
      expect(orders[i]).toBeGreaterThanOrEqual(orders[i - 1]);
    }
  });
});

describe('selectRoomZonesForCircuit – Sala Balaton Slot Mapping', () => {
  const balatonZones = (salaData.sale.find(s => s.id_sali === 'balaton')?.strefy || []) as Zone[];

  it('generates correct sequence for sub-5 stations (reduced from end of core 5)', () => {
    const res1 = selectRoomZonesForCircuit(balatonZones, 1, false);
    expect(res1.map(z => z.id)).toEqual(['Strefa_Modul_0']);

    const res2 = selectRoomZonesForCircuit(balatonZones, 2, false);
    expect(res2.map(z => z.id)).toEqual(['Strefa_Modul_0', 'Strefa_Modul_1']);

    const res3 = selectRoomZonesForCircuit(balatonZones, 3, false);
    expect(res3.map(z => z.id)).toEqual(['Strefa_Modul_0', 'Strefa_Modul_1', 'Strefa_Wolna_Przestrzen']);

    const res4 = selectRoomZonesForCircuit(balatonZones, 4, false);
    expect(res4.map(z => z.id)).toEqual(['Strefa_Modul_0', 'Strefa_Modul_1', 'Strefa_Wolna_Przestrzen', 'Strefa_Modul_2']);
  });

  it('generates Core 5 stations excluding Drabinki with Wolna Podłoga at slot 3', () => {
    const result = selectRoomZonesForCircuit(balatonZones, 5, false);
    expect(result.map(z => z.id)).toEqual([
      'Strefa_Modul_0',
      'Strefa_Modul_1',
      'Strefa_Wolna_Przestrzen',
      'Strefa_Modul_2',
      'Strefa_Modul_3',
    ]);
    expect(result.some(z => z.id === 'Strefa_Drabinki')).toBe(false);
  });

  it('slots Drabinki at position 4 when stationCount is 6', () => {
    const result = selectRoomZonesForCircuit(balatonZones, 6, false);
    expect(result.map(z => z.id)).toEqual([
      'Strefa_Modul_0',
      'Strefa_Modul_1',
      'Strefa_Wolna_Przestrzen',
      'Strefa_Drabinki',
      'Strefa_Modul_2',
      'Strefa_Modul_3',
    ]);
  });

  describe('with rings available', () => {
    const opts = { ringsAvailable: true };

    it('adds Kółka at position 7 for 7 stations', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 7, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Kolka',
      ]);
    });

    it('adds Ściana at position 8 for 8 stations', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 8, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Kolka',
        'Strefa_Sciana',
      ]);
    });

    it('adds second Wolna Podłoga at position 9 for 9 stations without clumping', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 9, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Kolka',
        'Strefa_Sciana',
        'Strefa_Wolna_Przestrzen',
      ]);
      expect(result[2].id).toBe('Strefa_Wolna_Przestrzen');
      expect(result[8].id).toBe('Strefa_Wolna_Przestrzen');
    });
  });

  describe('without rings available (fallback mode)', () => {
    const opts = { ringsAvailable: false };

    it('slots Ściana at position 7 when rings are unavailable (7 stations)', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 7, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Sciana',
      ]);
      expect(result.some(z => z.id === 'Strefa_Kolka')).toBe(false);
    });

    it('slots Ściana at 7 and second Wolna Podłoga at 8 (8 stations)', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 8, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Sciana',
        'Strefa_Wolna_Przestrzen',
      ]);
    });

    it('slots Ściana at 7 and two Wolna Podłoga at 8 and 9 (9 stations)', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 9, opts);
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Sciana',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Wolna_Przestrzen',
      ]);
    });

    it('detects missing rings from inventory option automatically', () => {
      const result = selectRoomZonesForCircuit(balatonZones, 7, {
        inventory: { kolko_gimnastyczne: 0 },
      });
      expect(result.map(z => z.id)).toEqual([
        'Strefa_Modul_0',
        'Strefa_Modul_1',
        'Strefa_Wolna_Przestrzen',
        'Strefa_Drabinki',
        'Strefa_Modul_2',
        'Strefa_Modul_3',
        'Strefa_Sciana',
      ]);
    });
  });
});
