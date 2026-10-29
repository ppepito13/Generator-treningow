import type { Zone } from '@/app/lib/data';

/**
 * Selects and sorts the zones to be used in a circuit training session.
 * Pure function – mirrors the zone-selection algorithm from `generateCircuitStrategy`.
 *
 * Priority:
 * 1. Forced zones (blokada_zmiany_recznej = true) – always included first.
 * 2. RIG cage zone (kolejnosc_sortowania === 2) – included when stationCount > 1.
 * 3. Remaining capacity is filled from other zones respecting their capacity limits.
 * 4. Final list is sorted ascending by `kolejnosc_sortowania`.
 */
export const selectRoomZonesForCircuit = (
  allZones: Zone[],
  stationCount: number,
  isPairMode: boolean
): Zone[] => {
  const selectedZones: Zone[] = [];

  const forcedZones = allZones.filter(z => z.blokada_zmiany_recznej);
  forcedZones.forEach(z => selectedZones.push(z));

  const rigZone = allZones.find(z => z.kolejnosc_sortowania === 2);
  if (rigZone && stationCount > 1) selectedZones.push(rigZone);

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
      if (forcedZones.some(fz => fz.id === z.id) || (rigZone && z.id === rigZone.id)) return;
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
};
