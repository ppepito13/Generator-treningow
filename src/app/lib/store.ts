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
  difficultyId: string;
  circuit: Station[];
  isGenerated: boolean;
  
  setParticipants: (val: number) => void;
  setDifficulty: (id: string) => void;
  generateCircuit: () => void;
  rerollExercise: (stationId: string, type: 'A' | 'B') => void;
  reset: () => void;
}

// Helper sprawdzający, czy sprzęt pozwala na wykonanie tego samego ćwiczenia przez 2 osoby
const canExerciseBeShared = (ex: Exercise): boolean => {
  const req = ex.wymagany_sprzet.toLowerCase();
  if (req.includes('brak') || req.includes('masa ciała') || req.includes('maty')) return true;
  
  // Lista sprzętów, których mamy tylko 1 sztukę (z sala.json)
  const singleItems = ['kółka gimnastyczne', 'poręcze dip (v-shape)', 'kamizelka obciążeniowa', 'drabinka pozioma'];
  const isLimited = singleItems.some(item => req.includes(item));
  
  // Jeśli sprzęt jest na liście limitowanej, sprawdzamy inwentarz
  if (isLimited) {
    const itemKey = Object.keys(ROOM_CONFIG.inwentarz).find(k => k.toLowerCase().includes(req)) || "";
    const count = (ROOM_CONFIG.inwentarz as any)[itemKey] || 0;
    return count >= 2;
  }

  return true;
};

const getValidExercisesForZone = (
  zone: Zone, 
  diff: DifficultyLevel, 
  isPairMode: boolean, 
  usedIds: Set<string>
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex => 
    ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
    !usedIds.has(ex.id_cwiczenia)
  );

  // Reguła Solo: Jeśli N <= 7, usuwamy wszystko co partnerskie
  if (!isPairMode) {
    pool = pool.filter(ex => ex.segment_nazwa !== 'PARTNER' && ex.tryb_pracy !== 'W_Parze');
  }

  // Ograniczenia Modul_0 (Ściana Startowa) - BRAK DRĄŻKÓW I DRABINEK
  if (zone.id === 'Strefa_Modul_0') {
    pool = pool.filter(ex => {
      const forbiddenTerms = ['drążek', 'drążki', 'drabink', 'kółka gimnastyczne', 'bosu', 'pull', 'nunczako'];
      const hasForbidden = forbiddenTerms.some(term => 
        ex.wymagany_sprzet.toLowerCase().includes(term) || 
        ex.segment_nazwa.toLowerCase().includes(term)
      );
      
      // Wyjątek: Akceptujemy rzuty o ścianę nawet jeśli są dynamiczne
      const isWallExercise = ex.nazwa.toLowerCase().includes('ścian') || 
                             ex.instrukcja.toLowerCase().includes('ścian') ||
                             ex.nazwa.toLowerCase().includes('tarcze');

      if (hasForbidden) return false;
      if ((ex.segment_nazwa === 'DYNAMIKA' || ex.kategorie_treningu.includes('Moc')) && !isWallExercise) return false;
      
      return true;
    });
  }

  // Ograniczenia Modul_2 (Brak pełnego obrotu)
  if (zone.id === 'Strefa_Modul_2') {
    pool = pool.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
  }

  // Filtr sprzętowy dla stref stałych (Klatka, Kółka, Drabinki)
  const strictZones = ['Strefa_Modul_1', 'Strefa_Modul_2', 'Strefa_Modul_3', 'Strefa_Kolka', 'Strefa_Drabinki', 'Strefa_Sciana'];
  if (strictZones.includes(zone.id) && zone.przypisany_sprzet && zone.przypisany_sprzet.length > 0) {
    pool = pool.filter(ex => 
      zone.przypisany_sprzet?.some(item => 
        ex.wymagany_sprzet.toLowerCase().includes(item.toLowerCase())
      )
    );
  }

  return pool;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participants: 6,
      difficultyId: 'baza_silowa_standard',
      circuit: [],
      isGenerated: false,

      setParticipants: (val) => set({ participants: Math.min(Math.max(val, 1), 14) }),
      setDifficulty: (id) => set({ difficultyId: id }),

      generateCircuit: () => {
        const { participants, difficultyId } = get();
        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const numStations = isPairMode ? Math.min(Math.ceil(participants / 2), 7) : participants;

        const availableZones = [...ROOM_CONFIG.strefy];
        const selectedZones: Zone[] = [];

        // Routing Stacja 1 i 2 (Standard Balaton)
        const mod0 = availableZones.find(z => z.id === 'Strefa_Modul_0');
        const mod1 = availableZones.find(z => z.id === 'Strefa_Modul_1');
        if (mod0) selectedZones.push(mod0);
        if (mod1 && numStations > 1) selectedZones.push(mod1);

        const restZones = availableZones.filter(z => z.id !== 'Strefa_Modul_0' && z.id !== 'Strefa_Modul_1');
        let freeSpaceCapacity = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 3;
        
        while (selectedZones.length < numStations && (restZones.length > 0 || freeSpaceCapacity > 0)) {
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
          const pool = getValidExercisesForZone(zone, diff, isPairMode, usedIds);
          
          let preferred = pool;
          if (zone.id === 'Strefa_Sciana' || zone.id === 'Strefa_Modul_0') {
            preferred = pool.filter(ex => ex.nazwa.toLowerCase().includes('ścian') || ex.instrukcja.toLowerCase().includes('ścian') || ex.nazwa.toLowerCase().includes('tarcze'));
          } else if (zone.id === 'Strefa_Wolna_Przestrzen') {
            preferred = pool.filter(ex => !ex.wymagany_sprzet.toLowerCase().includes('drążek') && !ex.wymagany_sprzet.toLowerCase().includes('drabink'));
          }

          const finalPool = preferred.length > 0 ? preferred : pool;
          const exA = finalPool[Math.floor(Math.random() * finalPool.length)] || pool[0];
          
          if (!exA) return;
          usedIds.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isPairMode) {
            // Reguła: Jeśli można robić to samo (sprzęt pozwala) lub ćwiczenie jest partnerskie -> ExB = ExA
            if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA)) {
              exB = exA;
            } else {
              // Brak sprzętu dla dwojga -> dobierz inne na tę samą partię bezsprzętowe
              const potentialB = ALL_EXERCISES.filter(ex => 
                ex.id_cwiczenia !== exA.id_cwiczenia &&
                ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
                (ex.wymagany_sprzet.toLowerCase().includes('brak') || ex.wymagany_sprzet.toLowerCase().includes('maty'))
              );
              exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
            }
          }

          generated.push({ id: `station-${idx}`, zone, exerciseA: exA, exerciseB: exB, isPair: isPairMode });
        });

        set({ circuit: generated, isGenerated: true });
      },

      rerollExercise: (stationId, type) => {
        const { circuit, difficultyId, participants } = get();
        const station = circuit.find(s => s.id === stationId);
        if (!station) return;

        const diff = getDifficultyById(difficultyId);
        const isPairMode = participants > 7;
        const usedIds = new Set(circuit.flatMap(s => [s.exerciseA.id_cwiczenia, s.exerciseB?.id_cwiczenia].filter(Boolean)));

        if (type === 'A') {
          const pool = getValidExercisesForZone(station.zone, diff, isPairMode, usedIds);
          const newExA = pool[Math.floor(Math.random() * pool.length)];
          if (newExA) {
            // Przy zmianie A, zaktualizuj też B zgodnie z nową logiką dostępności
            let newExB = undefined;
            if (isPairMode) {
              if (newExA.tryb_pracy === 'W_Parze' || canExerciseBeShared(newExA)) {
                newExB = newExA;
              } else {
                const potentialB = ALL_EXERCISES.filter(ex => 
                  ex.id_cwiczenia !== newExA.id_cwiczenia &&
                  ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom &&
                  ex.glowne_partie.some(p => newExA.glowne_partie.includes(p)) &&
                  (ex.wymagany_sprzet.toLowerCase().includes('brak') || ex.wymagany_sprzet.toLowerCase().includes('maty'))
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
            (ex.wymagany_sprzet.toLowerCase().includes('brak') || ex.wymagany_sprzet.toLowerCase().includes('maty'))
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
