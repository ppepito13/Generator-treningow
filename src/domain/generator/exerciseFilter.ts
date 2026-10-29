import { ALL_EXERCISES } from '@/app/lib/data';
import type { Exercise, Zone, RoomConfig } from '@/app/lib/data';
import { getEquipmentString, ensureEquipment } from './equipmentRules';

/**
 * Returns exercises valid for a given zone, difficulty range, and room constraints.
 * Pure function – no Zustand store dependency.
 * Falls back to ALL_EXERCISES when `allExercisesSource` is not provided.
 */
export const getValidExercisesForZone = (
  zone: Zone,
  diffRange: { min: number; max: number },
  usedIds: Set<string>,
  isThisStationPair: boolean,
  currentRoom: RoomConfig,
  segmentId?: number,
  ignoreUsed: boolean = false,
  hasFlagAlready: boolean = false,
  category: string = 'all',
  participantsCount: number = 1,
  allExercisesSource?: Exercise[]
): Exercise[] => {
  const source = allExercisesSource ?? ALL_EXERCISES;

  let pool = source.filter(ex =>
    (ex.poziom === 0 || (ex.poziom >= diffRange.min && ex.poziom <= diffRange.max)) &&
    (ignoreUsed ? true : !usedIds.has(ex.id_cwiczenia))
  );

  if (category !== 'all') {
    pool = pool.filter(ex =>
      ex.kategorie_treningu?.some(cat => cat.toLowerCase() === 'all' || cat.toLowerCase() === category.toLowerCase())
    );
  }

  if (segmentId !== undefined) {
    pool = pool.filter(ex => ex.segment_id === segmentId);
  }

  if (!isThisStationPair) {
    pool = pool.filter(ex => ex.segment_id !== 8 && ex.tryb_pracy !== 'W_Parze');
  }

  // Room-level work-mode restrictions (e.g. Astoria bans pair exercises).
  if (currentRoom.zakazane_tryby_pracy && currentRoom.zakazane_tryby_pracy.length > 0) {
    pool = pool.filter(ex => !currentRoom.zakazane_tryby_pracy!.includes(ex.tryb_pracy));
  }

  if (hasFlagAlready) {
    pool = pool.filter(ex => !ex.nazwa.toLowerCase().includes('flaga'));
  }

  const zoneEquip = zone.przypisany_sprzet || [];

  if (zone.zakazane_kategorie_sprzetu && zone.zakazane_kategorie_sprzetu.length > 0) {
    pool = pool.filter(ex => {
      const eq = getEquipmentString(ex).toLowerCase();
      return !zone.zakazane_kategorie_sprzetu!.some(term => eq.includes(term.toLowerCase()));
    });
  }

  if (zone.ograniczenia && zone.ograniczenia.length > 0) {
    if (zone.ograniczenia.includes('odrzuc_segment_dynamika')) pool = pool.filter(ex => ex.segment_id !== 6);
    if (zone.ograniczenia.includes('odrzuc_kategorie_moc')) pool = pool.filter(ex => !ex.kategorie_treningu.includes('Moc'));
    if (zone.ograniczenia.includes('zakaz_drazkow_i_drabinek')) pool = pool.filter(ex => ex.segment_id !== 1);
    if (zone.ograniczenia.includes('zakaz_obrotu_drazek_wysoki')) {
      pool = pool.filter(ex => {
        const isRot = ex.tagi_specjalne?.includes('Pełen Obrót');
        const eqStr = getEquipmentString(ex).toLowerCase();
        if (isRot && eqStr.includes('drazek')) return false;
        return true;
      });
    }
  }

  if (zone.typ === 'elastyczny') {
    pool = pool.filter(ex => !ex.kategorie_treningu.includes('Wyciąg'));
  }

  if (zone.typ !== 'klatka_rig') {
    pool = pool.filter(ex => !(ex.segment_id === 1 && getEquipmentString(ex).includes('drazek')));
  }

  if (zoneEquip.length > 0) {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex).toLowerCase();
      const name = ex.nazwa.toLowerCase();
      return zoneEquip.some(item => equip.includes(item.toLowerCase()) || name.includes(item.toLowerCase()));
    });
  }

  // Final shield: physical inventory check.
  pool = pool.filter(ex => ensureEquipment(ex, currentRoom, participantsCount));

  // Fallback: if filtering removed all candidates due to usedIds, allow repeats.
  if (pool.length === 0 && !ignoreUsed) {
    return getValidExercisesForZone(zone, diffRange, new Set(), isThisStationPair, currentRoom, segmentId, true, hasFlagAlready, category, participantsCount, allExercisesSource);
  }

  return pool;
};
