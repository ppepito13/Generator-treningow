import type { Zone } from '@/app/lib/data';

export interface ZoneSelectorOptions {
  isPairMode?: boolean;
  ringsAvailable?: boolean;
  roomId?: string;
  inventory?: Record<string, number>;
}

/**
 * Selects and slots the zones to be used in a circuit training session.
 * Pure function – mirrors the zone-selection algorithm from `generateCircuitStrategy`.
 *
 * For Sala Balaton:
 * Uses a deterministic Circuit Slot Mapping:
 * - 1..5 stations: Moduł 0, Moduł 1, Wolna Podłoga, Moduł 2, Moduł 3 (Drabinki excluded)
 * - 6 stations: Moduł 0, Moduł 1, Wolna Podłoga, Drabinki, Moduł 2, Moduł 3
 * - 7..9 stations with rings: + Kółka (pos 7), + Ściana (pos 8), + Wolna Podłoga (pos 9)
 * - 7..9 stations without rings: + Ściana (pos 7), + Wolna Podłoga (pos 8), + Wolna Podłoga (pos 9)
 *
 * For generic/custom rooms:
 * 1. Forced zones (wymuszona_w_obwodzie || blokada_zmiany_recznej) – always included first.
 * 2. Remaining capacity filled respecting capacity limits.
 * 3. Final list sorted ascending by `kolejnosc_sortowania`.
 */
export const selectRoomZonesForCircuit = (
  allZones: Zone[],
  stationCount: number,
  isPairModeOrOptions: boolean | ZoneSelectorOptions = false,
  extraOptions?: ZoneSelectorOptions
): Zone[] => {
  const options: ZoneSelectorOptions =
    typeof isPairModeOrOptions === 'boolean'
      ? { isPairMode: isPairModeOrOptions, ...extraOptions }
      : (isPairModeOrOptions || {});

  const isPairMode = options.isPairMode ?? false;

  const isBalaton =
    options.roomId === 'balaton' ||
    (allZones.some(z => z.id === 'Strefa_Modul_0') && allZones.some(z => z.id === 'Strefa_Wolna_Przestrzen'));

  if (isBalaton) {
    return selectBalatonZones(allZones, stationCount, options);
  }

  return selectGenericZones(allZones, stationCount, isPairMode);
};

function selectBalatonZones(
  allZones: Zone[],
  stationCount: number,
  options: ZoneSelectorOptions
): Zone[] {
  const m0 = allZones.find(z => z.id === 'Strefa_Modul_0');
  const m1 = allZones.find(z => z.id === 'Strefa_Modul_1');
  const floor = allZones.find(z => z.id === 'Strefa_Wolna_Przestrzen');
  const drab = allZones.find(z => z.id === 'Strefa_Drabinki');
  const m2 = allZones.find(z => z.id === 'Strefa_Modul_2');
  const m3 = allZones.find(z => z.id === 'Strefa_Modul_3');
  const rings = allZones.find(z => z.id === 'Strefa_Kolka');
  const wall = allZones.find(z => z.id === 'Strefa_Sciana');

  // Fallback if core zones are missing
  if (!m0 || !floor) {
    return selectGenericZones(allZones, stationCount, options.isPairMode ?? false);
  }

  let ringsAvailable = options.ringsAvailable;
  if (ringsAvailable === undefined) {
    if (options.inventory && (options.inventory['kolko_gimnastyczne'] || 0) <= 0) {
      ringsAvailable = false;
    } else {
      ringsAvailable = Boolean(rings);
    }
  }

  let sequence: (Zone | undefined)[];

  if (stationCount <= 5) {
    sequence = [m0, m1, floor, m2, m3];
  } else if (ringsAvailable && rings) {
    sequence = [m0, m1, floor, drab, m2, m3, rings, wall, floor];
  } else {
    sequence = [m0, m1, floor, drab, m2, m3, wall, floor, floor];
  }

  const result = sequence.filter((z): z is Zone => Boolean(z)).slice(0, stationCount);

  while (result.length < stationCount && floor) {
    result.push(floor);
  }

  return result;
}

function selectGenericZones(
  allZones: Zone[],
  stationCount: number,
  isPairMode: boolean
): Zone[] {
  const selectedZones: Zone[] = [];

  const forcedZones = allZones.filter(z => z.wymuszona_w_obwodzie || z.blokada_zmiany_recznej);
  forcedZones.forEach(z => {
    if (selectedZones.length < stationCount) {
      selectedZones.push(z);
    }
  });

  while (selectedZones.length < stationCount) {
    const currentCounts = selectedZones.reduce((acc, z) => {
      acc[z.id] = (acc[z.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let floorLimit = allZones.find(z => z.typ === 'elastyczny')?.bazowa_pojemnosc_stacji || 5;

    const elastycznaStrefa = allZones.find(z => z.typ === 'elastyczny');
    if (elastycznaStrefa && elastycznaStrefa.zaleznosci_pojemnosci_od) {
      elastycznaStrefa.zaleznosci_pojemnosci_od.forEach(zalezna => {
        if (Object.keys(currentCounts).includes(zalezna)) floorLimit -= 1;
      });
    }

    const candidates: Zone[] = [];
    allZones.forEach(z => {
      if (forcedZones.some(fz => fz.id === z.id)) return;
      const current = currentCounts[z.id] || 0;

      let cap = z.pojemnosc_stacji || 1;
      if (z.typ === 'elastyczny') cap = floorLimit;
      else if (isPairMode && z.typ === 'klatka_rig') cap = 1;

      if (current < cap) candidates.push(z);
    });

    if (candidates.length === 0) break;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    selectedZones.push(chosen);
  }

  selectedZones.sort((a, b) => (a.kolejnosc_sortowania || 99) - (b.kolejnosc_sortowania || 99));

  return selectedZones;
}
