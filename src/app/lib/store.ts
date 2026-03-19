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
  
  // Szukamy w inwentarzu sali
  const itemKey = Object.keys(ROOM_CONFIG.inwentarz).find(k => req.includes(k.toLowerCase()));
  if (itemKey) {
    const count = (ROOM_CONFIG.inwentarz as any)[itemKey] || 0;
    return count >= 2;
  }

  return true;
};

const getValidExercisesForZone = (
  zone: Zone, 
  diff: DifficultyLevel, 
  usedIds: Set<string>,
  isPairMode: boolean
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
    !usedIds.has(ex.id_cwiczenia)
  );

  // Filtr trybu Solo/Para
  if (!isPairMode) {
    pool = pool.filter(ex => ex.segment_nazwa !== 'PARTNER' && ex.tryb_pracy !== 'W_Parze');
  }

  const reqStr = (ex: Exercise) => getEquipmentString(ex);

  // Specyficzne ograniczenia dla Ściany Startowej (Moduł 0)
  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      // Wykluczamy sprzęt niebezpieczny w ciasnej strefie wejścia
      const forbiddenTerms = [
        'drążek', 
        'drążki', 
        'drabink', 
        'kółka gimnastyczne', 
        'bosu', 
        'piłka gimnastyczna', 
        'piłki gimnastyczne', 
        'pull', 
        'nunczako'
      ];
      const hasForbidden = forbiddenTerms.some(term => 
        reqStr(ex).includes(term) || 
        ex.segment_nazwa.toLowerCase().includes(term)
      );
      if (hasForbidden) return false;

      // Wyjątek dla ćwiczeń ściennych/tarczowych (np. Wall Ball) mimo blokady dynamiki
      const isWallOrTarget = ex.nazwa.toLowerCase().includes('ścian') || 
                             ex.instrukcja.toLowerCase().includes('ścian') ||
                             ex.nazwa.toLowerCase().includes('tarcze') ||
                             ex.instrukcja.toLowerCase().includes('tarcze');

      const isHighIntensity = ex.segment_nazwa === 'DYNAMIKA' || ex.kategorie_treningu.includes('Moc');
      if (isHighIntensity && !isWallOrTarget) return false;

      return true;
    });
  }

  // Zakaz pełnego obrotu na środkowym drążku
  if (zone.id === 'Strefa_Modul_2') {
    pool = pool.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
  }

  // Sztywne filtry sprzętowe dla stref technicznych
  if (zone.przypisany_sprzet && zone.przypisany_sprzet.length > 0) {
    pool = pool.filter(ex => {
      const equipment = reqStr(ex);
      return zone.przypisany_sprzet?.some(item => equipment.includes(item.toLowerCase()));
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
          stationCount: maxStations // Domyślnie sugerujemy max stacji dla komfortu
        });
      },

      setStationCount: (val) => set({ stationCount: val }),
      setDifficulty: (id) => set({ difficultyId: id }),

      generateCircuit: () => {
        const { participants, difficultyId, stationCount } = get();
        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const numDoubleStations = participants - stationCount;

        const availableZones = [...ROOM_CONFIG.strefy];
        const selectedZones: Zone[] = [];

        // Routing: Stacja 1 i 2 bazowo stałe
        const mod0 = availableZones.find(z => z.id === 'Strefa_Modul_0');
        const mod1 = availableZones.find(z => z.id === 'Strefa_Modul_1');
        if (mod0) selectedZones.push(mod0);
        if (mod1 && stationCount > 1) selectedZones.push(mod1);

        const restZones = availableZones.filter(z => z.id !== 'Strefa_Modul_0' && z.id !== 'Strefa_Modul_1');
        let freeSpaceCapacity = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 3;
        
        const poolToPickFrom = [...restZones];
        
        while (selectedZones.length < stationCount) {
          if (poolToPickFrom.length > 0) {
            const randomIndex = Math.floor(Math.random() * poolToPickFrom.length);
            const zone = poolToPickFrom[randomIndex];
            selectedZones.push(zone);
            poolToPickFrom.splice(randomIndex, 1);
            if (zone.id === 'Strefa_Drabinki' || zone.id === 'Strefa_Sciana') freeSpaceCapacity -= 1;
          } else if (freeSpaceCapacity > 0) {
            const freeSpace = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen');
            if (freeSpace) selectedZones.push(freeSpace);
            freeSpaceCapacity -= 1;
          } else break;
        }

        // LOGIKA FLOW: Sortowanie stref wg fizycznej kolejności na sali (Anti-clockwise)
        const zoneOrder = [
          'Strefa_Modul_0',
          'Strefa_Modul_1',
          'Strefa_Modul_2',
          'Strefa_Modul_3',
          'Strefa_Kolka',
          'Strefa_Drabinki',
          'Strefa_Sciana',
          'Strefa_Wolna_Przestrzen'
        ];
        selectedZones.sort((a, b) => zoneOrder.indexOf(a.id) - zoneOrder.indexOf(b.id));

        const generated: Station[] = [];
        const usedIds = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          const isThisStationPair = idx < numDoubleStations;
          const pool = getValidExercisesForZone(zone, diff, usedIds, isPairMode);
          
          if (pool.length === 0) return;

          const exA = pool[Math.floor(Math.random() * pool.length)];
          if (!exA) return;
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
              if (exB) usedIds.add(exB.id_cwiczenia);
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

      rerollExercise: (stationId, type) => {
        const { circuit, difficultyId, participants } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;
        const station = circuit[stationIndex];

        const diff = getDifficultyById(difficultyId);
        const usedIds = new Set(circuit.flatMap(s => [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean)));
        const isPairMode = participants > 7;

        if (type === 'A') {
          const pool = getValidExercisesForZone(station.zone, diff, usedIds, isPairMode);
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
          const potentialB = ALL_EXERCISES.filter(ex => 
            ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
            !usedIds.has(ex.id_cwiczenia) &&
            ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
            ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
            (getEquipmentString(ex).includes('brak') || getEquipmentString(ex).includes('maty'))
          );
          const newExB = potentialB[Math.floor(Math.random() * potentialB.length)];
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