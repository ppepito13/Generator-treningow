import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Exercise, Station, MOCK_EXERCISES, MOCK_ROOM_CONFIG } from './data';

interface AppState {
  participants: number;
  difficulty: string;
  circuit: Station[];
  isGenerated: boolean;
  
  setParticipants: (val: number) => void;
  setDifficulty: (val: string) => void;
  generateCircuit: () => void;
  updateExercise: (stationId: string, type: 'A' | 'B', newExercise: Exercise) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participants: 6,
      difficulty: "Średniozaawansowany",
      circuit: [],
      isGenerated: false,

      setParticipants: (val) => set({ participants: Math.min(Math.max(val, 1), 14) }),
      setDifficulty: (val) => set({ difficulty: val }),

      generateCircuit: () => {
        const { participants } = get();
        // Simple mock generation logic
        const numStations = 6;
        const generated: Station[] = MOCK_ROOM_CONFIG.zones.map((zone, idx) => {
          const exercises = [...MOCK_EXERCISES];
          const exA = exercises[Math.floor(Math.random() * exercises.length)];
          let exB: Exercise | undefined = undefined;
          
          if (participants > 6) {
             const remaining = exercises.filter(e => e.name !== exA.name);
             exB = remaining[Math.floor(Math.random() * remaining.length)];
          }

          return {
            id: `station-${idx}`,
            zone,
            exerciseA: exA,
            exerciseB: exB
          };
        });

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