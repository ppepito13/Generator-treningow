import type { Exercise, RoomConfig } from '@/app/lib/data';

/**
 * Returns a lowercase comma-separated string of all equipment keys
 * required by the exercise (flattens OR-arrays).
 */
export const getEquipmentString = (ex: Pick<Exercise, 'wymagania_sprzetowe'>): string => {
  if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) return '';
  const items = new Set<string>();
  ex.wymagania_sprzetowe.forEach(rule => {
    if (Array.isArray(rule)) {
      rule.forEach(alt => Object.keys(alt).forEach(k => items.add(k)));
    } else {
      Object.keys(rule).forEach(k => items.add(k));
    }
  });
  return Array.from(items).join(', ').toLowerCase();
};

/**
 * Returns true if the gym inventory satisfies all equipment requirements
 * for `participants` people performing the exercise simultaneously.
 * Rules are AND at the outer level; inner arrays are OR alternatives.
 */
export const ensureEquipment = (ex: Exercise, currentRoom: RoomConfig, participants: number): boolean => {
  if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) return true;

  const checkSingle = (req: Record<string, number>) => {
    return Object.entries(req).every(([itemKey, qtyPerPerson]) => {
      const gymHas = currentRoom.inwentarz[itemKey] || 0;
      const needed = participants * qtyPerPerson;
      return gymHas >= needed;
    });
  };

  // Hybrid engine: outer array = AND rules; inner arrays = OR alternatives.
  return ex.wymagania_sprzetowe.every(rule => {
    if (Array.isArray(rule)) {
      return rule.some(alt => checkSingle(alt));
    } else {
      return checkSingle(rule);
    }
  });
};

/**
 * Returns true if the exercise can be performed by 2 participants
 * sharing the same station (equipment check for 2 people).
 */
export const canExerciseBeShared = (ex: Exercise, currentRoom: RoomConfig): boolean => {
  return ensureEquipment(ex, currentRoom, 2);
};
