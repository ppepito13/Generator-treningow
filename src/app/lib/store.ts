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
  rerollExercise: (stationId: string, type: 'A' | 'B') => void;
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
  
  const singleItems = ['kółka gimnastyczne', 'poręcze dip (v-shape)', 'kamizelka obciążeniowa', 'drabinka pozioma'];
  const isLimited = singleItems.some(item => req.includes(item));
  
  if (isLimited) {
    const itemKey = Object.keys(ROOM_CONFIG.inwentarz).find(k => req.includes(k.toLowerCase())) || "";
    const count = (ROOM_CONFIG.inwentarz as any)[itemKey] || 0;
    return count >= 2;
  }

  return true;
};

const getValidExercisesForZone = (
  zone: Zone, 
  diff: DifficultyLevel, 
  isAnyPairInCircuit: boolean, 
  usedIds: Set<string>,
  isPairMode: boolean
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
    !usedIds.has(ex.id_cwiczenia)
  );

  // Jeśli tryb Solo (N <= 7), wykluczamy ćwiczenia partnerskie
  if (!isPairMode) {
    pool = pool.filter(ex => ex.segment_nazwa !== 'PARTNER' && ex.tryb_pracy !== 'W_Parze');
  }

  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      const req = getEquipmentString(ex);
      const forbiddenTerms = ['drążek', 'drążki', 'drabink', 'kółka gimnastyczne', 'bosu', 'pull', 'nunczako'];
      const hasForbidden = forbiddenTerms.some(term => 
        req.includes(term) || 
        ex.segment_nazwa.toLowerCase().includes(term)
      );
      
      const isWallExercise = ex.nazwa.toLowerCase().includes('ścian') || 
                             ex.instrukcja.toLowerCase().includes('ścian') ||
                             ex.nazwa.toLowerCase().includes('tarcze');

      if (hasForbidden) return false;
      // Wyjątek dla rzutów o ścianę/tarcze mimo blokady Dynamiki
      if ((ex.segment_nazwa === 'DYNAMIKA' || ex.kategorie_treningu.includes('Moc')) && !isWallExercise) return false;
      return true;
    });
  }

  if (zone.id === 'Strefa_Modul_2') {
    pool = pool.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
  }

  // Sztywne filtry sprzętowe dla stref technicznych
  const strictZones = ['Strefa_Modul_1', 'Strefa_Modul_2', 'Strefa_Modul_3', 'Strefa_Kolka', 'Strefa_Drabinki', 'Strefa_Sciana'];
  if (strictZones.includes(zone.id) && zone.przypisany_sprzet && zone.przypisany_sprzet.length > 0) {
    pool = pool.filter(ex => {
      const req = getEquipmentString(ex);
      return zone.przypisany_sprzet?.some(item => req.includes(item.toLowerCase()));
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
        const minStations = Math.ceil(newParticipants / 2);
        const maxStations = Math.min(newParticipants, 7);
        const currentStations = get().stationCount;
        
        set({ 
          participants: newParticipants,
          stationCount: Math.min(Math.max(currentStations, minStations), maxStations)
        });
      },

      setStationCount: (val) => set({ stationCount: val }),
      setDifficulty: (id) => set({ difficultyId: id }),

      generateCircuit: () => {
        const { participants, difficultyId, stationCount } = get();
        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const numPairs = participants - stationCount;

        const availableZones = [...ROOM_CONFIG.strefy];
        const selectedZones: Zone[] = [];

        const mod0 = availableZones.find(z => z.id === 'Strefa_Modul_0');
        const mod1 = availableZones.find(z => z.id === 'Strefa_Modul_1');
        if (mod0) selectedZones.push(mod0);
        if (mod1 && stationCount > 1) selectedZones.push(mod1);

        const restZones = availableZones.filter(z => z.id !== 'Strefa_Modul_0' && z.id !== 'Strefa_Modul_1');
        let freeSpaceCapacity = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 3;
        
        while (selectedZones.length < stationCount && (restZones.length > 0 || freeSpaceCapacity > 0)) {
          const randomIndex = Math.floor(Math.random() * restZones.length);
          const zone = restZones[randomIndex];

          if (zone && zone.id !== 'Strefa_Wolna_Przestrzen') {
            selectedZones.push(zone);
            restZones.splice(randomIndex, 1);
            if (zone.id === 'Strefa_Drabinki' || zone.id === 'Strefa_Sciana') freeSpaceCapacity -= 1;
          } else if (freeSpaceCapacity > 0) {
            const freeSpace = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen');
            if (freeSpace) selectedZones.push(freeSpace);
            freeSpaceCapacity -= 1;
          } else break;
        }

        const generated: Station[] = [];
        const usedIds = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          const isThisStationPair = idx < numPairs;
          const pool = getValidExercisesForZone(zone, diff, isThisStationPair, usedIds, isPairMode);
          
          let preferred = pool;
          if (zone.id === 'Strefa_Sciana' || zone.id === 'Strefa_Modul_0') {
            preferred = pool.filter(ex => ex.nazwa.toLowerCase().includes('ścian') || ex.instrukcja.toLowerCase().includes('ścian') || ex.nazwa.toLowerCase().includes('tarcze'));
          } else if (zone.id === 'Strefa_Wolna_Przestrzen') {
            preferred = pool.filter(ex => {
              const req = getEquipmentString(ex);
              return !req.includes('drążek') && !req.includes('drabink');
            });
          }

          const finalPool = preferred.length > 0 ? preferred : pool;
          const exA = finalPool[Math.floor(Math.random() * finalPool.length)] || pool[0];
          
          if (!exA) return;
          usedIds.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isThisStationPair) {
            if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
              exB = exA;
            } else {
              const potentialB = ALL_EXERCISES.filter(ex => 
                ex.id_cwiczenia !== exA.id_cwiczenia &&
                ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
                (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
              );
              exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
            }
          }

          generated.push({ 
            id: `station-${idx}`, 
            zone, 
            exerciseA: exA, 
            exerciseB: exB, 
            isPair: isThisStationPair 
          });
        });

        set({ circuit: generated, isGenerated: true });
      },

      rerollExercise: (stationId, type) => {
        const { circuit, difficultyId, participants } = get();
        const station = circuit.find(s => s.id === stationId);
        if (!station) return;

        const diff = getDifficultyById(difficultyId);
        const usedIds = new Set(circuit.flatMap(s => [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean)));
        const isPairMode = participants > 7;

        if (type === 'A') {
          const pool = getValidExercisesForZone(station.zone, diff, station.isPair, usedIds, isPairMode);
          const newExA = pool[Math.floor(Math.random() * pool.length)];
          if (newExA) {
            let newExB = undefined;
            if (station.isPair) {
              if (newExA.tryb_pracy === 'W_Parze' || canExerciseBeShared(newExA)) {
                newExB = newExA;
              } else {
                const potentialB = ALL_EXERCISES.filter(ex => 
                  ex.id_cwiczenia !== newExA.id_cwiczenia &&
                  ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                  ex.glowne_partie.some(p => newExA.glowne_partie.includes(p)) &&
                  (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
                );
                newExB = potentialB[Math.floor(Math.random() * potentialB.length)] || newExA;
              }
            }
            set({
              circuit: circuit.map(s => s.id === stationId ? { ...s, exerciseA: newExA, exerciseB: newExB } : s)
            });
          }
        } else if (type === 'B' && station.exerciseB) {
          const potentialB = ALL_EXERCISES.filter(ex => 
            ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
            !usedIds.has(ex.id_cwiczenia) &&
            ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
            ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
            (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
          );
          const newExB = potentialB[Math.floor(Math.random() * potentialB.length)];
          if (newExB) {
            set({
              circuit: circuit.map(s => s.id === stationId ? { ...s, exerciseB: newExB } : s)
            });
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
