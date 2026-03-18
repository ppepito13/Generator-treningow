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
        const isPairMode = participants > 7;
        const numStations = isPairMode ? Math.min(Math.ceil(participants / 2), 7) : participants;

        // 2. Filtrowanie bazowe ćwiczeń
        let validExercises = ALL_EXERCISES.filter(ex => 
          ex.poziom >= diff.min_poziom && ex.poziom <= diff.max_poziom
        );

        // REGULA: Jeśli Tryb Solo (N <= 7), odrzuć PARTNER i W_Parze
        if (!isPairMode) {
          validExercises = validExercises.filter(ex => 
            ex.segment_nazwa !== 'PARTNER' && 
            ex.tryb_pracy !== 'W_Parze'
          );
        }

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
        
        // Logika dekrementacji pojemności Wolnej Podłogi
        let freeSpaceCapacity = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 3;
        
        // Funkcja do wybierania stref uwzględniająca pojemność i reguły kolizji
        while (selectedZones.length < numStations && (restZones.length > 0 || freeSpaceCapacity > 0)) {
          const randomIndex = Math.floor(Math.random() * restZones.length);
          const zone = restZones[randomIndex];

          if (zone) {
            selectedZones.push(zone);
            restZones.splice(randomIndex, 1);
            
            // Reguła kolizji przestrzeni: Drabinki/Sciana zabierają miejsce na podłodze
            if (zone.id === 'Strefa_Drabinki' || zone.id === 'Strefa_Sciana') {
              freeSpaceCapacity -= 1;
            }
          } else if (freeSpaceCapacity > 0) {
            const freeSpace = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen');
            if (freeSpace) selectedZones.push(freeSpace);
            freeSpaceCapacity -= 1;
          } else {
            break;
          }
        }

        // 4. Dobieranie ćwiczeń (Constraint Solver)
        const generated: Station[] = [];
        const usedExercises = new Set<string>();

        selectedZones.forEach((zone, idx) => {
          let zoneExercises = validExercises.filter(ex => !usedExercises.has(ex.id_cwiczenia));

          // SZTYWNE KONSTRYKTY (Hard Constraints)
          
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

          // Sztywny filtr sprzętowy (np. Kółka, Drabinki)
          if (zone.przypisany_sprzet && zone.przypisany_sprzet.length > 0) {
            zoneExercises = zoneExercises.filter(ex => 
              zone.przypisany_sprzet?.some(item => ex.wymagany_sprzet.toLowerCase().includes(item.toLowerCase()))
            );
          }

          // Fallbacki i preferencje (Soft/Hard Constraints)
          let preferred = zoneExercises;
          
          if (zone.id === 'Strefa_Sciana') {
            // Ściana musi mieć ćwiczenia "przy ścianie", "w staniu na rękach" lub rzuty o ścianę
            preferred = zoneExercises.filter(ex => 
              ex.nazwa.toLowerCase().includes('ścian') || 
              ex.instrukcja.toLowerCase().includes('ścian') ||
              ex.nazwa.toLowerCase().includes('rękach')
            );
          } else if (zone.typ === 'klatka_rig') {
            // Klatka preferuje zwisy i podciągania
            preferred = zoneExercises.filter(ex => ex.segment_nazwa === 'PULL' || ex.segment_nazwa === 'CORE');
          } else if (zone.id === 'Strefa_Wolna_Przestrzen') {
            // Wolna podłoga nie powinna brać ćwiczeń wymagających stałego osprzętu (np. drążków)
            preferred = zoneExercises.filter(ex => 
              !ex.wymagany_sprzet.toLowerCase().includes('drążek') && 
              !ex.wymagany_sprzet.toLowerCase().includes('kółka') &&
              !ex.wymagany_sprzet.toLowerCase().includes('drabink')
            );
          }

          const finalPool = preferred.length > 0 ? preferred : zoneExercises;
          const exA = finalPool[Math.floor(Math.random() * finalPool.length)] || zoneExercises[0];
          
          if (!exA) return;
          usedExercises.add(exA.id_cwiczenia);

          let exB: Exercise | undefined = undefined;
          if (isPairMode) {
            if (exA.tryb_pracy === 'W_Parze' || exA.wymagany_sprzet.includes('drabinka pozioma')) {
              exB = exA;
            } else {
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
