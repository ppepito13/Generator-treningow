import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Exercise, 
  Station, 
  ALL_EXERCISES, 
  ROOM_CONFIG, 
  getDifficultyById, 
  DifficultyLevel,
  Zone
} from './data';

interface AppState {
  participants: number;
  difficultyId: string;
  circuit: Station[];
  isGenerated: boolean;
  
  setParticipants: (val: number) => void;
  setDifficulty: (id: string) => void;
  generateCircuit: () => void;
  updateExercise: (stationId: string, type: 'A' | 'B', newExercise: Exercise) => void;
  reset: () => void;
}

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
        
        // 1. Matematyka Stacji
        const numStations = participants <= 7 ? participants : Math.min(Math.ceil(participants / 2), 7);
        const isPairMode = participants > 7;

        // 2. Filtrowanie ćwiczeń wg poziomu
        const validExercises = ALL_EXERCISES.filter(ex => 
          ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom
        );

        // 3. Przygotowanie stref (Routing)
        const availableZones = [...ROOM_CONFIG.strefy];
        const selectedZones: Zone[] = [];

        // Reguła: Stacja 1 -> Modul_0, Stacja 2 -> Modul_1
        const mod0 = availableZones.find(z => z.id === 'Strefa_Modul_0');
        const mod1 = availableZones.find(z => z.id === 'Strefa_Modul_1');
        
        if (mod0) selectedZones.push(mod0);
        if (mod1 && numStations > 1) selectedZones.push(mod1);

        // Reszta stref elastycznie
        const restZones = availableZones.filter(z => z.id !== 'Strefa_Modul_0' && z.id !== 'Strefa_Modul_1');
        while (selectedZones.length < numStations && restZones.length > 0) {
          const randomIndex = Math.floor(Math.random() * restZones.length);
          selectedZones.push(restZones.splice(randomIndex, 1)[0]);
        }

        // 4. Dobieranie ćwiczeń (Constraint Solver)
        const generated: Station[] = [];
        const usedExercises = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          // Filtruj pod strefę
          let zoneExercises = validExercises.filter(ex => !usedExercises.has(ex.id_cwiczenia));

          // Ograniczenia Modul_0
          if (zone.id === 'Strefa_Modul_0') {
            zoneExercises = zoneExercises.filter(ex => 
              ex.segment_nazwa !== 'DYNAMIKA' && 
              !ex.kategorie_treningu.includes('Moc')
            );
          }

          // Ograniczenia Modul_2 (brak pełnego obrotu)
          if (zone.id === 'Strefa_Modul_2') {
            zoneExercises = zoneExercises.filter(ex => !ex.tagi_specjalne.includes('Pełen Obrót'));
          }

          // Fallbacks: Core (zwis) i Handstand
          const isCage = zone.typ === 'klatka_rig' || zone.id === 'Strefa_Drabinki';
          const isWall = zone.id === 'Strefa_Sciana' || zone.id === 'Strefa_Drabinki';

          // Preferuj ćwiczenia pasujące do strefy
          let preferred = zoneExercises;
          if (zone.typ === 'klatka_rig') {
            preferred = zoneExercises.filter(ex => ex.segment_nazwa === 'PULL' || ex.segment_nazwa === 'CORE');
          } else if (zone.id === 'Strefa_Sciana') {
            preferred = zoneExercises.filter(ex => ex.nazwa.toLowerCase().includes('rękach') || ex.nazwa.toLowerCase().includes('ścianie'));
          }

          const finalPool = preferred.length > 0 ? preferred : zoneExercises;
          const exA = finalPool[Math.floor(Math.random() * finalPool.length)] || zoneExercises[0];
          
          if (!exA) return;
          usedExercises.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isPairMode) {
            // Reguła A/B Wyjątki: W_Parze lub drabinka pozioma
            if (exA.tryb_pracy === 'W_Parze' || exA.wymagany_sprzet.includes('drabinka pozioma')) {
              exB = exA;
            } else {
              // Szukaj Ex B: Ta sama partia, Bodyweight/Maty
              const potentialB = validExercises.filter(ex => 
                ex.id_cwiczenia !== exA.id_cwiczenia &&
                ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
                (ex.wymagany_sprzet.toLowerCase().includes('brak') || ex.wymagany_sprzet.toLowerCase().includes('maty'))
              );
              exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
            }
          }

          generated.push({
            id: `station-${idx}`,
            zone,
            exerciseA: exA,
            exerciseB: exB,
            isPair: isPairMode
          });
        });

        // Kolizja Głębokości: Kolka vs Modul_3
        const kolkaStation = generated.find(s => s.zone.id === 'Strefa_Kolka');
        const m3Station = generated.find(s => s.zone.id === 'Strefa_Modul_3');
        if (kolkaStation && m3Station) {
          if (kolkaStation.exerciseA.tagi_specjalne.includes('Wymaga Głębi') && 
              m3Station.exerciseA.tagi_specjalne.includes('Wymaga Głębi')) {
            // Przelosuj Modul 3 (prostsze niż kółka)
            const backup = validExercises.filter(ex => !usedExercises.has(ex.id_cwiczenia) && !ex.tagi_specjalne.includes('Wymaga Głębi'));
            if (backup.length > 0) m3Station.exerciseA = backup[0];
          }
        }

        set({ circuit: generated, isGenerated: true });
      },

      updateExercise: (stationId, type, newExercise) => {
        set((state) => ({
          circuit: state.circuit.map((s) => {
            if (s.id === stationId) {
              return type === 'A' 
                ? { ...s, exerciseA: newExercise }
                : { ...s, exerciseB: newExercise };
            }
            return s;
          })
        }));
      },

      reset: () => set({ isGenerated: false, circuit: [] })
    }),
    {
      name: 'kinetic-circuits-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
