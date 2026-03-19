
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
  circuit: Station[];
  isGenerated: boolean;
  
  setParticipants: (val: number) => void;
  setStationCount: (val: number) => void;
  setDifficulty: (id: string) => void;
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
  diff: DifficultyLevel, 
  usedIds: Set<string>,
  isPairMode: boolean,
  segmentId?: number,
  ignoreUsed: boolean = false
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
    (ignoreUsed ? true : !usedIds.has(ex.id_cwiczenia))
  );

  if (segmentId !== undefined) {
    pool = pool.filter(ex => ex.segment_id === segmentId);
  }

  if (!isPairMode) {
    pool = pool.filter(ex => ex.segment_id !== 8 && ex.tryb_pracy !== 'W_Parze');
  }

  const zoneEquip = zone.przypisany_sprzet || [];

  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      const name = ex.nazwa.toLowerCase();
      
      const forbiddenTerms = ['drążek', 'drążki', 'drabink', 'kółka gimnastyczne', 'bosu', 'piłka gimnastyczna', 'piłki gimnastyczne', 'nunczako'];
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

      generateCircuit: () => {
        const { participants, difficultyId, stationCount } = get();
        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const numDoubleStations = participants - stationCount;

        const allZones = ROOM_CONFIG.strefy;
        const selectedZones: Zone[] = [];

        // 1. MODUŁ 0 I MODUŁ 1 SĄ ZAWSZE
        const mod0 = allZones.find(z => z.id === 'Strefa_Modul_0');
        if (mod0) selectedZones.push(mod0);

        const mod1 = allZones.find(z => z.id === 'Strefa_Modul_1');
        if (mod1 && stationCount > 1) selectedZones.push(mod1);

        // 2. Dolosuj resztę stref uwzględniając ich pojemność
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
            // Moduł 0 i 1 już mamy po jednej sztuce
            if (z.id === 'Strefa_Modul_0' || z.id === 'Strefa_Modul_1') return;

            const current = currentCounts[z.id] || 0;
            const cap = z.id === 'Strefa_Wolna_Przestrzen' ? floorLimit : (z.pojemnosc_stacji || 1);

            if (current < cap) {
              candidates.push(z);
            }
          });

          if (candidates.length === 0) break;
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          selectedZones.push(chosen);
        }

        // 3. Sortowanie zgodnie z flow sali Balaton
        selectedZones.sort((a, b) => zoneOrder.indexOf(a.id) - zoneOrder.indexOf(b.id));

        // 4. Przypisywanie ćwiczeń
        const generated: Station[] = [];
        const usedIds = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          const isThisStationPair = idx < numDoubleStations;
          const pool = getValidExercisesForZone(zone, diff, usedIds, isPairMode);
          
          if (pool.length === 0) {
            const backupPool = getValidExercisesForZone(zone, diff, new Set(), isPairMode);
            if (backupPool.length > 0) {
              const exA = backupPool[Math.floor(Math.random() * backupPool.length)];
              generated.push({ id: `st-${idx}-${Date.now()}-${Math.random()}`, zone, exerciseA: exA, isPair: isThisStationPair });
            }
            return;
          }

          const exA = pool[Math.floor(Math.random() * pool.length)];
          usedIds.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isThisStationPair) {
            if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
              exB = exA;
            } else {
              const potentialB = ALL_EXERCISES.filter(ex => 
                ex.id_cwiczenia !== exA.id_cwiczenia &&
                !usedIds.has(ex.id_cwiczenia) &&
                ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
                (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
              );
              exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
              if (exB && exB.id_cwiczenia !== exA.id_cwiczenia) usedIds.add(exB.id_cwiczenia);
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
        const { circuit, difficultyId, participants } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;
        const station = circuit[stationIndex];

        const diff = getDifficultyById(difficultyId);
        const usedIds = new Set(circuit.flatMap(s => [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean)));
        const isPairMode = participants > 7;

        if (type === 'A') {
          const pool = getValidExercisesForZone(station.zone, diff, usedIds, isPairMode, segmentId);
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
                ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                ex.glowne_partie.some(p => newExA.glowne_partie.includes(p)) &&
                (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
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
            ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
            ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
            (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
          );
          
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
        const { circuit, difficultyId, participants } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;

        const newZone = ROOM_CONFIG.strefy.find(z => z.id === newZoneId);
        if (!newZone) return;

        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const usedExerciseIds = new Set(circuit.flatMap(s => s.id !== stationId ? [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean) : []));

        const pool = getValidExercisesForZone(newZone, diff, usedExerciseIds, isPairMode);
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
              ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
              ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
              (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
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
