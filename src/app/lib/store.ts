
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Exercise, 
  Station, 
  ALL_EXERCISES, 
  ROOM_CONFIG, 
  getDifficultyById, 
  Zone,
  DifficultyLevel
} from './data';

interface AppState {
  participants: number;
  stationCount: number;
  difficultyId: string;
  isStrictDifficulty: boolean;
  circuit: Station[];
  isGenerated: boolean;
  
  setParticipants: (val: number) => void;
  setStationCount: (val: number) => void;
  setDifficulty: (id: string) => void;
  setStrictDifficulty: (val: boolean) => void;
  generateCircuit: () => void;
  rerollExercise: (stationId: string, type: 'A' | 'B', segmentId?: number) => void;
  changeStationZone: (stationId: string, newZoneId: string) => void;
  reset: () => void;
}

const getEquipmentString = (ex: Exercise): string => {
  if (Array.isArray(ex.wymagany_sprzet)) {
    return ex.wymagany_sprzet.join(', ').toLowerCase();
  }
  return String(ex.wymagany_sprzet || "").toLowerCase();
};

const canExerciseBeShared = (ex: Exercise): boolean => {
  const req = getEquipmentString(ex);
  if (req.includes('brak') || req.includes('masa ciała') || req.includes('maty')) return true;
  
  const itemKey = Object.keys(ROOM_CONFIG.inwentarz).find(k => req.includes(k.toLowerCase()));
  if (itemKey) {
    const count = (ROOM_CONFIG.inwentarz as any)[itemKey] || 0;
    return count >= 2;
  }

  return true;
};

const zoneOrder = [
  'Strefa_Modul_0',
  'Strefa_Modul_1',
  'Strefa_Modul_2',
  'Strefa_Modul_3',
  'Strefa_Kolka',
  'Strefa_Sciana',
  'Strefa_Drabinki',
  'Strefa_Wolna_Przestrzen'
];

export const getValidExercisesForZone = (
  zone: Zone, 
  diffRange: { min: number, max: number }, 
  usedIds: Set<string>,
  isThisStationPair: boolean,
  segmentId?: number,
  ignoreUsed: boolean = false,
  hasFlagAlready: boolean = false
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diffRange.min && ex.poziom <= diffRange.max &&
    (ignoreUsed ? true : !usedIds.has(ex.id_cwiczenia))
  );

  if (segmentId !== undefined) {
    pool = pool.filter(ex => ex.segment_id === segmentId);
  }

  if (!isThisStationPair) {
    pool = pool.filter(ex => ex.segment_id !== 8 && ex.tryb_pracy !== 'W_Parze');
  }

  if (hasFlagAlready) {
    pool = pool.filter(ex => !ex.nazwa.toLowerCase().includes('flaga'));
  }

  const zoneEquip = zone.przypisany_sprzet || [];

  if (zone.id === 'Strefa_Wolna_Przestrzen') {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      const forbidden = ['drążki', 'drabinki', 'kółka gimnastyczne', 'ściany'];
      return !forbidden.some(f => equip.includes(f));
    });
  }

  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      const name = ex.nazwa.toLowerCase();
      const forbiddenTerms = [
        'drążek', 'drążki', 'drabink', 'kółka gimnastyczne', 
        'bosu', 'piłka gimnastyczna', 'piłki gimnastyczne', 'nunczako'
      ];
      const hasForbidden = forbiddenTerms.some(term => equip.includes(term) || name.includes(term));
      if (hasForbidden) return false;
      if (ex.segment_id === 1 || ex.segment_id === 6) return false;
      return true;
    });
  }

  if (zone.id === 'Strefa_Modul_2') {
    pool = pool.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
  }

  if (zoneEquip.length > 0) {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      const name = ex.nazwa.toLowerCase();
      return zoneEquip.some(item => equip.includes(item.toLowerCase()) || name.includes(item.toLowerCase()));
    });
  }

  return pool;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participants: 8,
      stationCount: 7,
      difficultyId: 'baza_silowa_standard',
      isStrictDifficulty: false,
      circuit: [],
      isGenerated: false,

      setParticipants: (val) => {
        const newParticipants = Math.min(Math.max(val, 1), 14);
        const maxStations = Math.min(newParticipants, 7);
        set({ 
          participants: newParticipants,
          stationCount: maxStations
        });
      },

      setStationCount: (val) => set({ stationCount: val }),
      setDifficulty: (id) => set({ difficultyId: id }),
      setStrictDifficulty: (val) => set({ isStrictDifficulty: val }),

      generateCircuit: () => {
        const { participants, difficultyId, stationCount, isStrictDifficulty } = get();
        const mainDiff = getDifficultyById(difficultyId);
        const numDoubleStations = participants - stationCount;
        const isPairMode = participants > stationCount;

        const allZones = ROOM_CONFIG.strefy;
        const selectedZones: Zone[] = [];

        const mod0 = allZones.find(z => z.id === 'Strefa_Modul_0');
        if (mod0) selectedZones.push(mod0);

        const mod1 = allZones.find(z => z.id === 'Strefa_Modul_1');
        if (mod1 && stationCount > 1) selectedZones.push(mod1);

        while (selectedZones.length < stationCount) {
          const currentCounts = selectedZones.reduce((acc, z) => {
            acc[z.id] = (acc[z.id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const hasDrabinki = Object.keys(currentCounts).includes('Strefa_Drabinki');
          const hasSciana = Object.keys(currentCounts).includes('Strefa_Sciana');
          
          const floorBase = allZones.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 5;
          const floorLimit = floorBase - (hasDrabinki ? 1 : 0) - (hasSciana ? 1 : 0);

          const candidates: Zone[] = [];
          allZones.forEach(z => {
            if (z.id === 'Strefa_Modul_0' || z.id === 'Strefa_Modul_1') return;
            const current = currentCounts[z.id] || 0;
            
            let cap = z.pojemnosc_stacji || 1;
            if (z.id === 'Strefa_Wolna_Przestrzen') {
              cap = floorLimit;
            } else if (z.id === 'Strefa_Sciana') {
              cap = 2;
            } else if (isPairMode && (z.id.startsWith('Strefa_Modul') || z.id === 'Strefa_Drabinki' || z.id === 'Strefa_Kolka')) {
              cap = 1;
            }
            
            if (current < cap) candidates.push(z);
          });

          if (candidates.length === 0) break;
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          selectedZones.push(chosen);
        }

        selectedZones.sort((a, b) => zoneOrder.indexOf(a.id) - zoneOrder.indexOf(b.id));

        const generated: Station[] = [];
        const usedIds = new Set<string>();
        let hasFlagAlready = false;

        selectedZones.forEach((zone, idx) => {
          const isThisStationPair = idx < numDoubleStations;
          
          // Logika regresji poziomu
          let currentRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
          
          // Co 3. stacja (nr 3 i 6) jest lżejsza, jeśli nie jest włączony tryb ścisły
          const isBreatherStation = !isStrictDifficulty && (idx + 1) % 3 === 0;
          
          if (isBreatherStation) {
            // Regresja o 2 punkty w dół od minimum obecnego poziomu
            currentRange = {
              min: Math.max(1, mainDiff.min_poziom - 2),
              max: Math.max(1, mainDiff.min_poziom - 1)
            };
          }

          const pool = getValidExercisesForZone(zone, currentRange, usedIds, isThisStationPair, undefined, false, hasFlagAlready);
          
          if (pool.length === 0) {
            // Backup do głównego poziomu jeśli w regresji nic nie ma
            const backupPool = getValidExercisesForZone(zone, { min: mainDiff.min_poziom, max: mainDiff.max_poziom }, new Set(), isThisStationPair, undefined, true, hasFlagAlready);
            if (backupPool.length > 0) {
              const exA = backupPool[Math.floor(Math.random() * backupPool.length)];
              if (exA.nazwa.toLowerCase().includes('flaga')) hasFlagAlready = true;
              generated.push({ id: `st-${idx}-${Date.now()}-${Math.random()}`, zone, exerciseA: exA, isPair: isThisStationPair });
            }
            return;
          }

          const exA = pool[Math.floor(Math.random() * pool.length)];
          usedIds.add(exA.id_cwiczenia);
          if (exA.nazwa.toLowerCase().includes('flaga')) hasFlagAlready = true;

          let exB: Exercise | undefined = undefined;
          if (isThisStationPair) {
            if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
              exB = exA;
            } else {
              const potentialB = ALL_EXERCISES.filter(ex => 
                ex.id_cwiczenia !== exA.id_cwiczenia &&
                !usedIds.has(ex.id_cwiczenia) &&
                ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
                ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
                (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty')) &&
                ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
              );
              exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
              if (exB && exB.id_cwiczenia !== exA.id_cwiczenia) {
                usedIds.add(exB.id_cwiczenia);
                if (exB.nazwa.toLowerCase().includes('flaga')) hasFlagAlready = true;
              }
            }
          }

          generated.push({ 
            id: `st-${idx}-${Date.now()}-${Math.random()}`, 
            zone, 
            exerciseA: exA, 
            exerciseB: exB, 
            isPair: isThisStationPair 
          });
        });

        set({ circuit: generated, isGenerated: true });
      },

      rerollExercise: (stationId, type, segmentId) => {
        const { circuit, difficultyId, isStrictDifficulty } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;
        const station = circuit[stationIndex];

        const mainDiff = getDifficultyById(difficultyId);
        const usedIds = new Set(circuit.flatMap(s => [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean)));
        const hasFlagAlready = circuit.some(s => 
          s.id !== stationId && (s.exerciseA.nazwa.toLowerCase().includes('flaga') || s.exerciseB?.nazwa.toLowerCase().includes('flaga'))
        );

        // Zachowujemy intencję poziomu stacji (czy była regresyjna czy nie)
        const isCurrentlyBreather = !isStrictDifficulty && (stationIndex + 1) % 3 === 0;
        let currentRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
        if (isCurrentlyBreather) {
          currentRange = {
            min: Math.max(1, mainDiff.min_poziom - 2),
            max: Math.max(1, mainDiff.min_poziom - 1)
          };
        }

        if (type === 'A') {
          const pool = getValidExercisesForZone(station.zone, currentRange, usedIds, station.isPair, segmentId, false, hasFlagAlready);
          if (pool.length === 0) return;
          const newExA = pool[Math.floor(Math.random() * pool.length)];
          
          let newExB = undefined;
          if (station.isPair) {
            if (newExA.tryb_pracy === 'W_Parze' || canExerciseBeShared(newExA)) {
              newExB = newExA;
            } else {
              const potentialB = ALL_EXERCISES.filter(ex => 
                ex.id_cwiczenia !== newExA.id_cwiczenia &&
                !usedIds.has(ex.id_cwiczenia) &&
                ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
                ex.glowne_partie.some(p => newExA.glowne_partie.includes(p)) &&
                (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty')) &&
                ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
              );
              newExB = potentialB[Math.floor(Math.random() * potentialB.length)] || newExA;
            }
          }
          
          const newCircuit = [...circuit];
          newCircuit[stationIndex] = { ...station, exerciseA: newExA, exerciseB: newExB };
          set({ circuit: newCircuit });
        } else if (type === 'B' && station.exerciseB) {
          const pool = ALL_EXERCISES.filter(ex => 
            ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
            !usedIds.has(ex.id_cwiczenia) &&
            ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
            ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
            (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty')) &&
            ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
          );
          
          if (hasFlagAlready) {
            pool.filter(ex => !ex.nazwa.toLowerCase().includes('flaga'));
          }
          
          const filteredPool = segmentId !== undefined ? pool.filter(ex => ex.segment_id === segmentId) : pool;
          if (filteredPool.length === 0) return;

          const newExB = filteredPool[Math.floor(Math.random() * filteredPool.length)];
          if (newExB) {
            const newCircuit = [...circuit];
            newCircuit[stationIndex] = { ...station, exerciseB: newExB };
            set({ circuit: newCircuit });
          }
        }
      },

      changeStationZone: (stationId, newZoneId) => {
        const { circuit, difficultyId, isStrictDifficulty } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;

        const newZone = ROOM_CONFIG.strefy.find(z => z.id === newZoneId);
        if (!newZone) return;

        const mainDiff = getDifficultyById(difficultyId);
        const usedExerciseIds = new Set(circuit.flatMap(s => s.id !== stationId ? [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean) : []));
        const hasFlagAlready = circuit.some(s => 
          s.id !== stationId && (s.exerciseA.nazwa.toLowerCase().includes('flaga') || s.exerciseB?.nazwa.toLowerCase().includes('flaga'))
        );

        const isCurrentlyBreather = !isStrictDifficulty && (stationIndex + 1) % 3 === 0;
        let currentRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
        if (isCurrentlyBreather) {
          currentRange = {
            min: Math.max(1, mainDiff.min_poziom - 2),
            max: Math.max(1, mainDiff.min_poziom - 1)
          };
        }

        const pool = getValidExercisesForZone(newZone, currentRange, usedExerciseIds, circuit[stationIndex].isPair, undefined, false, hasFlagAlready);
        if (pool.length === 0) return;

        const exA = pool[Math.floor(Math.random() * pool.length)];
        let exB = undefined;
        
        if (circuit[stationIndex].isPair) {
          if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
            exB = exA;
          } else {
            const potentialB = ALL_EXERCISES.filter(ex => 
              ex.id_cwiczenia !== exA.id_cwiczenia &&
              !usedExerciseIds.has(ex.id_cwiczenia) &&
              ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
              ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
              (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty')) &&
              ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
            );
            exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
          }
        }

        const newCircuit = [...circuit];
        newCircuit[stationIndex] = {
          ...newCircuit[stationIndex],
          zone: newZone,
          exerciseA: exA,
          exerciseB: exB
        };

        newCircuit.sort((a, b) => zoneOrder.indexOf(a.zone.id) - zoneOrder.indexOf(b.zone.id));
        set({ circuit: newCircuit });
      },

      reset: () => set({ isGenerated: false, circuit: [] })
    }),
    {
      name: 'kinetic-circuits-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
