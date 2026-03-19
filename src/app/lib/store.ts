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
    // Jeśli mamy przynajmniej 2 sztuki sprzętu, para może robić to samo
    return count >= 2;
  }

  return true;
};

const getValidExercisesForZone = (
  zone: Zone, 
  diff: DifficultyLevel, 
  usedIds: Set<string>,
  isPairMode: boolean,
  segmentId?: number
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
    !usedIds.has(ex.id_cwiczenia)
  );

  if (segmentId !== undefined) {
    pool = pool.filter(ex => ex.segment_id === segmentId);
  }

  if (!isPairMode) {
    pool = pool.filter(ex => ex.segment_id !== 8 && ex.tryb_pracy !== 'W_Parze');
  }

  // Specyficzne filtry dla stref
  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      const forbidden = ['drążek', 'drążki', 'drabink', 'kółka gimnastyczne', 'bosu', 'piłka gimnastyczna', 'piłki gimnastyczne', 'pull', 'nunczako'];
      const hasForbidden = forbidden.some(term => equip.includes(term) || ex.segment_nazwa.toLowerCase().includes(term));
      if (hasForbidden) return false;

      // Odrzucamy PULL dla Modułu 0
      if (ex.segment_nazwa === 'PULL') return false;

      return true;
    });
  }

  if (zone.id === 'Strefa_Modul_2') {
    pool = pool.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
  }

  if (zone.przypisany_sprzet && zone.przypisany_sprzet.length > 0) {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex);
      return zone.przypisany_sprzet?.some(item => equip.includes(item.toLowerCase()));
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
        // Domyślnie sugerujemy maksymalną liczbę stacji dla komfortu
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

        // 1. Zawsze Moduł 0 (Ściana Startowa)
        const mod0 = allZones.find(z => z.id === 'Strefa_Modul_0');
        if (mod0) selectedZones.push(mod0);

        // 2. Losuj resztę stref do osiągnięcia stationCount
        while (selectedZones.length < stationCount) {
          const pickedIds = selectedZones.map(z => z.id);
          const hasDrabinki = pickedIds.includes('Strefa_Drabinki');
          const hasSciana = pickedIds.includes('Strefa_Sciana');
          
          // Reguła kolizji: Drabinki/Ściana zabierają miejsce na podłodze
          let floorCapacity = allZones.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 3;
          if (hasDrabinki) floorCapacity -= 1;
          if (hasSciana) floorCapacity -= 1;

          const currentFloorCount = selectedZones.filter(z => z.id === 'Strefa_Wolna_Przestrzen').length;

          // Budujemy listę dostępnych kandydatów
          const candidates: Zone[] = [];
          
          // Stałe urządzenia, których jeszcze nie ma
          allZones.forEach(z => {
            if (z.id !== 'Strefa_Modul_0' && z.id !== 'Strefa_Wolna_Przestrzen' && !pickedIds.includes(z.id)) {
              candidates.push(z);
            }
          });

          // Podłoga (jeśli limit pozwala)
          if (currentFloorCount < floorCapacity) {
            const floorZone = allZones.find(z => z.id === 'Strefa_Wolna_Przestrzen');
            if (floorZone) candidates.push(floorZone);
          }

          if (candidates.length === 0) break;

          // Losowy wybór kandydata
          const chosen = candidates[Math.floor(Math.random() * candidates.length)];
          selectedZones.push(chosen);
        }

        // 3. Sortowanie zgodnie z ruchem wskazówek zegara (Flow sali)
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
        selectedZones.sort((a, b) => zoneOrder.indexOf(a.id) - zoneOrder.indexOf(b.id));

        // 4. Przypisywanie ćwiczeń
        const generated: Station[] = [];
        const usedIds = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          // Pierwsze stacje (zgodnie z różnicą N-S) są podwójne
          const isThisStationPair = idx < numDoubleStations;
          const pool = getValidExercisesForZone(zone, diff, usedIds, isPairMode);
          
          if (pool.length === 0) return;

          const exA = pool[Math.floor(Math.random() * pool.length)];
          usedIds.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isThisStationPair) {
            // Próba współdzielenia ćwiczenia (jeśli sprzęt pozwala lub jest to praca z partnerem)
            if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
              exB = exA;
            } else {
              // Brak sprzętu dla dwojga - szukamy Ćwiczenia B na tę samą partię mięśniową (bodyweight)
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
            id: `station-${idx}-${Date.now()}-${Math.random()}`, 
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

      reset: () => set({ isGenerated: false, circuit: [] })
    }),
    {
      name: 'kinetic-circuits-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);