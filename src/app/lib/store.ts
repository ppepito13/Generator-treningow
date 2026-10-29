
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Exercise,
  Station,
  ALL_EXERCISES,
  ALL_ROOMS,
  ALL_EQUIPMENT,
  RoomConfig,
  EquipmentItem,
  getDifficultyById,
  Zone,
  createDefaultExercise,
  createDefaultRoom,
  createDefaultEquipment,
  formatEquipmentName
} from './data';
import { IntervalPreset, TimerAudioSettings } from '@/types/timer';
import { FlattenedQueueItem } from '@/components/GymViewModal';
import { UserProfileData } from '@/types/calculators';
import {
  ensureEquipment,
  getEquipmentString,
  canExerciseBeShared,
  getValidExercisesForZone as _getValidExercisesForZone,
  generateCircuitStrategy,
  generateSynchronizedStrategy,
  rerollExerciseStrategy,
  MAX_DIFFICULTY_LOOSENING,
} from '@/domain/generator';

export interface GenerationConflictContextData {
  action?: 'reroll' | 'changeZone';
  stationId?: string;
  paramType?: 'A' | 'B';
  segmentId?: number;
  newZoneId?: string;
  [key: string]: unknown;
}

export interface GenerationConflictState {
  type: 'generate' | 'reroll';
  requestedStations: number;
  availableStations: number;
  canLoosenDifficulty: boolean;
  partialStations?: Station[];
  contextData?: GenerationConflictContextData;
}

export type ViewType = 'HOME' | 'CIRCUIT' | 'BMI' | 'TIMER' | 'SETTINGS';
export type TabType = 'generator' | 'circuit' | 'timer' | 'calculators' | 'studio';

interface AppState {
  selectedRoomId: string;
  participants: number;
  stationCount: number;
  difficultyId: string;
  isStrictDifficulty: boolean;
  
  // Stan dla Sali Niestandardowej
  customRoomMode: 'obwodowy' | 'synchroniczny';
  customRoomCategory: string;
  customRoomEquipment: string[];

  // Zarządzanie Własną Bazą Ćwiczeń
  customExercises: Exercise[];
  getAllExercises: () => Exercise[];
  addCustomExercise: (input: Partial<Exercise> & { nazwa: string }) => Exercise;
  removeCustomExercise: (id: string) => void;
  clearAllCustomExercises: () => void;
  exportCustomExercises: () => string;
  importCustomExercises: (importedData: unknown) => { success: boolean; count: number; error?: string };

  // Zarządzanie Własną i Modyfikowaną Bazą Sal
  customRooms: RoomConfig[];
  getAllRooms: () => RoomConfig[];
  addCustomRoom: (input: Partial<RoomConfig> & { nazwa_sali: string }) => RoomConfig;
  removeCustomRoom: (id: string) => void;
  clearAllCustomRooms: () => void;
  exportCustomRooms: () => string;
  importCustomRooms: (importedData: unknown) => { success: boolean; count: number; error?: string };

  // Zarządzanie Własną i Modyfikowaną Bazą Sprzętu
  customEquipment: EquipmentItem[];
  getAllEquipmentItems: () => EquipmentItem[];
  addCustomEquipment: (input: { id?: string; nazwa: string; opis?: string; isOverridden?: boolean }) => EquipmentItem;
  removeCustomEquipment: (id: string) => void;
  clearAllCustomEquipment: () => void;
  exportCustomEquipment: () => string;
  importCustomEquipment: (importedData: unknown) => { success: boolean; count: number; error?: string };

  // Zarządzanie Presety Zegara i Audio
  customIntervalPresets: IntervalPreset[];
  timerAudioSettings: TimerAudioSettings;
  addCustomIntervalPreset: (preset: IntervalPreset) => void;
  removeCustomIntervalPreset: (id: string) => void;
  updateTimerAudioSettings: (settings: Partial<TimerAudioSettings>) => void;

  // Aktywne Wykonanie Zegara Interwałowego (Globalne)
  activeIntervalExecution: {
    preset: IntervalPreset;
    queue: FlattenedQueueItem[];
    currentIndex: number;
    remainingSec: number;
    isRunning: boolean;
    isFinished: boolean;
    isGymViewOpen: boolean;
    isGymViewMinimized: boolean;
  } | null;
  setActiveIntervalExecution: (exec: AppState['activeIntervalExecution']) => void;
  updateActiveIntervalExecution: (update: Partial<NonNullable<AppState['activeIntervalExecution']>>) => void;
  minimizeGymView: () => void;
  maximizeGymView: () => void;
  closeActiveIntervalExecution: () => void;

  // Współdzielony Profil Użytkownika dla Kalkulatorów (Narzędzia)
  sharedUserProfile: UserProfileData;
  updateSharedProfile: (profile: Partial<UserProfileData>) => void;
  clearSharedProfile: () => void;
  calculatorResults: Record<string, unknown>;
  setCalculatorResult: (calcKey: string, result: unknown) => void;

  circuit: Station[];
  isGenerated: boolean;
  activeView: ViewType;
  activeTab: TabType;
  navigationStack: ViewType[];
  generationConflict: GenerationConflictState | null;

  setActiveTab: (tab: TabType) => void;
  setGenerationConflict: (conflict: GenerationConflictState | null) => void;
  resolveConflict: (resolutionData: { action: 'loosen' | 'duplicate' | 'reduce' | 'cancel' }) => void;
  
  pushView: (view: ViewType) => void;
  popView: () => void;

  setSelectedRoom: (id: string) => void;
  setParticipants: (val: number) => void;
  setStationCount: (val: number) => void;
  setDifficulty: (id: string) => void;
  setStrictDifficulty: (val: boolean) => void;
  
  // Akcje dla Sali Niestandardowej
  setCustomRoomMode: (mode: 'obwodowy' | 'synchroniczny') => void;
  setCustomRoomCategory: (category: string) => void;
  toggleCustomEquipment: (id: string) => void;
  setAllCustomEquipment: (ids: string[]) => void;
  resetCustomRoom: () => void;

  generateCircuit: () => void;
  rerollExercise: (stationId: string, type: 'A' | 'B', segmentId?: number, loosen?: boolean, ignoreUsed?: boolean) => void;
  setStationExercise: (stationId: string, type: 'A' | 'B', exercise: Exercise) => void;
  reorderCircuit: (oldIndex: number, newIndex: number) => void;
  getEffectiveRoomConfig: () => RoomConfig;
  reset: () => void;
}


export const getValidExercisesForZone = (
  zone: Zone,
  diffRange: { min: number, max: number },
  usedIds: Set<string>,
  isThisStationPair: boolean,
  currentRoom: RoomConfig,
  segmentId?: number,
  ignoreUsed: boolean = false,
  hasFlagAlready: boolean = false,
  category: string = 'all',
  participantsCount: number = 1,
  allExercisesSource?: Exercise[]
): Exercise[] => {
  // Delegate to pure domain function; inject exercise source from Zustand store when not provided.
  const source = allExercisesSource ?? (useAppStore.getState ? useAppStore.getState().getAllExercises() : ALL_EXERCISES);
  return _getValidExercisesForZone(zone, diffRange, usedIds, isThisStationPair, currentRoom, segmentId, ignoreUsed, hasFlagAlready, category, participantsCount, source);
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedRoomId: ALL_ROOMS[0].id_sali,
      participants: 8,
      stationCount: 7,
      difficultyId: 'baza_silowa_standard',
      isStrictDifficulty: true,
      customRoomMode: 'obwodowy',
      customRoomCategory: 'all',
      customRoomEquipment: [],

      customExercises: [] as Exercise[],

      getAllExercises: () => {
        const custom = get().customExercises || [];
        if (custom.length === 0) return ALL_EXERCISES;

        const customMap = new Map<string, Exercise>();
        const newCustom: Exercise[] = [];

        custom.forEach(ex => {
          if (ex.isOverridden || !ex.id_cwiczenia.startsWith('custom-')) {
            customMap.set(ex.id_cwiczenia, { ...ex, isOverridden: true, isCustom: true });
          } else {
            newCustom.push(ex);
          }
        });

        const baseList = ALL_EXERCISES.map(ex => customMap.get(ex.id_cwiczenia) || ex);
        return [...baseList, ...newCustom];
      },

      addCustomExercise: (input) => {
        const created = createDefaultExercise(input);
        const existing = get().customExercises || [];
        const filtered = existing.filter(ex => ex.id_cwiczenia !== created.id_cwiczenia);
        const updated = [...filtered, created];
        set({ customExercises: updated });
        return created;
      },

      removeCustomExercise: (id) => {
        const existing = get().customExercises || [];
        set({ customExercises: existing.filter(ex => ex.id_cwiczenia !== id) });
      },

      clearAllCustomExercises: () => {
        set({ customExercises: [] });
      },

      exportCustomExercises: () => {
        const custom = get().customExercises || [];
        return JSON.stringify(custom, null, 2);
      },

      importCustomExercises: (imported) => {
        try {
          let list: Exercise[] = [];
          if (typeof imported === 'string') {
            list = JSON.parse(imported);
          } else if (Array.isArray(imported)) {
            list = imported;
          }

          if (!Array.isArray(list)) {
            return { success: false, count: 0, error: 'Nieprawidłowy format pliku JSON (oczekiwano tablicy ćwiczeń).' };
          }

          const validEntries = list.filter(item => item && typeof item === 'object' && typeof item.nazwa === 'string');
          if (validEntries.length === 0) {
            return { success: false, count: 0, error: 'Plik nie zawiera poprawnych wpisów ćwiczeń.' };
          }

          const existingMap = new Map<string, Exercise>();
          (get().customExercises || []).forEach(ex => existingMap.set(ex.id_cwiczenia, ex));

          let importedCount = 0;
          validEntries.forEach(raw => {
            const exercise = createDefaultExercise(raw);
            existingMap.set(exercise.id_cwiczenia, exercise);
            importedCount++;
          });

          set({ customExercises: Array.from(existingMap.values()) });
          return { success: true, count: importedCount };
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Błąd odczytu pliku JSON.';
          return { success: false, count: 0, error: message };
        }
      },

      customRooms: [] as RoomConfig[],

      getAllRooms: () => {
        const custom = get().customRooms || [];
        if (custom.length === 0) return ALL_ROOMS;

        const customMap = new Map<string, RoomConfig>();
        const newCustom: RoomConfig[] = [];

        custom.forEach(r => {
          if (r.isOverridden || !r.id_sali.startsWith('custom-room-')) {
            customMap.set(r.id_sali, { ...r, isOverridden: true, isCustom: true });
          } else {
            newCustom.push(r);
          }
        });

        const baseList = ALL_ROOMS.map(r => customMap.get(r.id_sali) || r);
        return [...baseList, ...newCustom];
      },

      addCustomRoom: (input) => {
        const created = createDefaultRoom(input);
        if (created.id_sali === 'custom') return created;

        const existing = get().customRooms || [];
        const filtered = existing.filter(r => r.id_sali !== created.id_sali);
        const updated = [...filtered, created];
        set({ customRooms: updated });

        if (get().selectedRoomId === created.id_sali) {
          const currentP = get().participants;
          const currentS = get().stationCount;
          set({
            participants: Math.min(Math.max(currentP, 1), created.maksymalna_pojemnosc.osoby),
            stationCount: Math.min(Math.max(currentS, 1), created.maksymalna_pojemnosc.stacje)
          });
        }
        return created;
      },

      removeCustomRoom: (id) => {
        const existing = get().customRooms || [];
        set({ customRooms: existing.filter(r => r.id_sali !== id) });
        if (get().selectedRoomId === id) {
          const allRooms = get().getAllRooms();
          const room = allRooms.find(r => r.id_sali === id) || allRooms[0];
          set({
            participants: Math.min(get().participants, room.maksymalna_pojemnosc.osoby),
            stationCount: Math.min(get().stationCount, room.maksymalna_pojemnosc.stacje)
          });
        }
      },

      clearAllCustomRooms: () => {
        set({ customRooms: [] });
      },

      exportCustomRooms: () => {
        const rooms = get().customRooms || [];
        return JSON.stringify(rooms, null, 2);
      },

      importCustomRooms: (importedData) => {
        try {
          let rooms: unknown;
          if (typeof importedData === 'string') {
            rooms = JSON.parse(importedData);
          } else {
            rooms = importedData;
          }

          if (rooms && typeof rooms === 'object' && 'sale' in rooms) {
            const saleField = (rooms as { sale?: unknown }).sale;
            if (Array.isArray(saleField)) {
              rooms = saleField;
            }
          }

          if (!Array.isArray(rooms)) {
            return { success: false, count: 0, error: "Plik musi zawierać tablicę sal." };
          }

          const existingMap = new Map<string, RoomConfig>();
          (get().customRooms || []).forEach(r => existingMap.set(r.id_sali, r));

          let importedCount = 0;
          (rooms as Partial<RoomConfig>[]).forEach(raw => {
            if (raw.nazwa_sali && raw.id_sali !== 'custom') {
              const formatted = createDefaultRoom({ ...raw, nazwa_sali: raw.nazwa_sali });
              existingMap.set(formatted.id_sali, formatted);
              importedCount++;
            }
          });

          const updated = Array.from(existingMap.values());
          set({ customRooms: updated });
          return { success: true, count: importedCount };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Niepoprawny format pliku JSON.";
          return { success: false, count: 0, error: message };
        }
      },

      customEquipment: [] as EquipmentItem[],

      getAllEquipmentItems: () => {
        const custom = get().customEquipment || [];
        const customMap = new Map<string, EquipmentItem>();
        const newCustom: EquipmentItem[] = [];

        custom.forEach(eq => {
          if (eq.isOverridden || !ALL_EQUIPMENT.includes(eq.id)) {
            customMap.set(eq.id, { ...eq, isOverridden: true, isCustom: true });
          } else {
            newCustom.push(eq);
          }
        });

        const baseList = ALL_EQUIPMENT.map(key => {
          return customMap.get(key) || {
            id: key,
            nazwa: formatEquipmentName(key),
            isCustom: false,
          };
        });

        return [...baseList, ...newCustom];
      },

      addCustomEquipment: (input) => {
        const created = createDefaultEquipment(input);
        const existing = get().customEquipment || [];
        const filtered = existing.filter(e => e.id !== created.id);
        const updated = [...filtered, created];
        set({ customEquipment: updated });
        return created;
      },

      removeCustomEquipment: (id) => {
        const existing = get().customEquipment || [];
        set({ customEquipment: existing.filter(e => e.id !== id) });
      },

      clearAllCustomEquipment: () => {
        set({ customEquipment: [] });
      },

      exportCustomEquipment: () => {
        const custom = get().customEquipment || [];
        return JSON.stringify(custom, null, 2);
      },

      importCustomEquipment: (importedData) => {
        try {
          let items: unknown[];
          if (typeof importedData === 'string') {
            items = JSON.parse(importedData);
          } else {
            items = importedData as unknown[];
          }

          const parsed = items as unknown as Record<string, unknown>;
          if (parsed && typeof parsed === 'object' && 'sprzet' in parsed && Array.isArray(parsed.sprzet)) {
            items = parsed.sprzet as unknown[];
          }

          if (!Array.isArray(items)) {
            return { success: false, count: 0, error: "Plik musi zawierać tablicę sprzętu." };
          }

          const existingMap = new Map<string, EquipmentItem>();
          (get().customEquipment || []).forEach(e => existingMap.set(e.id, e));

          let importedCount = 0;
          items.forEach((raw: unknown) => {
            if (typeof raw === 'string' && raw.trim()) {
              const formatted = createDefaultEquipment({ id: raw.trim(), nazwa: formatEquipmentName(raw.trim()) });
              existingMap.set(formatted.id, formatted);
              importedCount++;
            } else if (raw && typeof raw === 'object') {
              const itemObj = raw as { nazwa?: string; id?: string; opis?: string; isOverridden?: boolean };
              if (itemObj.nazwa || itemObj.id) {
                const formatted = createDefaultEquipment({
                  id: itemObj.id,
                  nazwa: itemObj.nazwa || formatEquipmentName(itemObj.id || ''),
                  opis: itemObj.opis,
                  isOverridden: itemObj.isOverridden
                });
                existingMap.set(formatted.id, formatted);
                importedCount++;
              }
            }
          });

          const updated = Array.from(existingMap.values());
          set({ customEquipment: updated });
          return { success: true, count: importedCount };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Niepoprawny format pliku JSON.";
          return { success: false, count: 0, error: message };
        }
      },

      customIntervalPresets: [] as IntervalPreset[],
      timerAudioSettings: {
        soundEnabled: true,
        ttsEnabled: true,
        ttsOption: 'stepName',
        ttsCountdownOption: 'both',
        volume: 0.9,
      } as TimerAudioSettings,

      addCustomIntervalPreset: (preset) => {
        const existing = get().customIntervalPresets || [];
        const filtered = existing.filter(p => p.id !== preset.id);
        set({ customIntervalPresets: [...filtered, preset] });
      },

      removeCustomIntervalPreset: (id) => {
        const existing = get().customIntervalPresets || [];
        set({ customIntervalPresets: existing.filter(p => p.id !== id) });
      },

      updateTimerAudioSettings: (settings) => {
        set({ timerAudioSettings: { ...get().timerAudioSettings, ...settings } });
      },

      activeIntervalExecution: null,
      setActiveIntervalExecution: (exec) => set({ activeIntervalExecution: exec }),
      updateActiveIntervalExecution: (update) => {
        const current = get().activeIntervalExecution;
        if (current) {
          set({ activeIntervalExecution: { ...current, ...update } });
        }
      },
      minimizeGymView: () => {
        const current = get().activeIntervalExecution;
        if (current) {
          set({ activeIntervalExecution: { ...current, isGymViewOpen: true, isGymViewMinimized: true } });
        }
      },
      maximizeGymView: () => {
        const current = get().activeIntervalExecution;
        if (current) {
          set({ activeIntervalExecution: { ...current, isGymViewOpen: true, isGymViewMinimized: false } });
        }
      },
      closeActiveIntervalExecution: () => set({ activeIntervalExecution: null }),

      sharedUserProfile: {
        gender: 'male',
        weight: null,
        height: null,
        age: null,
        waist: null,
        bodyFat: null,
        activityLevel: 1.55,
      } as UserProfileData,

      updateSharedProfile: (update) => {
        set({ sharedUserProfile: { ...get().sharedUserProfile, ...update } });
      },

      clearSharedProfile: () => {
        set({
          sharedUserProfile: {
            gender: 'male',
            weight: null,
            height: null,
            age: null,
            waist: null,
            bodyFat: null,
            activityLevel: 1.55,
          },
          calculatorResults: {},
        });
      },

      calculatorResults: {},
      setCalculatorResult: (calcKey, result) => {
        set({ calculatorResults: { ...get().calculatorResults, [calcKey]: result } });
      },

      circuit: [] as Station[],
      isGenerated: false,
      activeView: 'HOME',
      activeTab: 'generator' as TabType,
      navigationStack: ['HOME'] as ViewType[],
      generationConflict: null as GenerationConflictState | null,

      setActiveTab: (tab: TabType) => set({ activeTab: tab }),
      setGenerationConflict: (conflict) => set({ generationConflict: conflict }),

      // Helper do pobierania aktualnej konfiguracji sali (uwzględnia wirtualną salę Custom)
      getEffectiveRoomConfig: () => {
        const { selectedRoomId, customRoomMode, customRoomEquipment } = get();
        const allRooms = get().getAllRooms ? get().getAllRooms() : ALL_ROOMS;
        const currentRoom = allRooms.find(r => r.id_sali === selectedRoomId) || allRooms[0];

        if (selectedRoomId === 'custom') {
          return {
            ...currentRoom,
            tryb_treningu: customRoomMode,
            inwentarz: customRoomEquipment.reduce((acc, eq) => ({ ...acc, [eq]: 99 }), {})
          };
        }
        return currentRoom;
      },

      setCustomRoomMode: (mode) => {
        set({ customRoomMode: mode });
        // Po zmianie trybu musimy zweryfikować czy obecna liczba stacji mieści się w nowych limitach
        const room = get().getEffectiveRoomConfig();
        const maxStations = room.tryb_treningu === 'synchroniczny' 
          ? room.maksymalna_pojemnosc.stacje 
          : Math.min(get().participants, room.maksymalna_pojemnosc.stacje);
        
        if (get().stationCount > maxStations) {
          set({ stationCount: maxStations });
        }
      },
      setCustomRoomCategory: (category) => set({ customRoomCategory: category }),
      toggleCustomEquipment: (id) => {
        const current = get().customRoomEquipment;
        const next = current.includes(id) 
          ? current.filter(x => x !== id)
          : [...current, id];
        set({ customRoomEquipment: next });
      },
      setAllCustomEquipment: (ids) => set({ customRoomEquipment: ids }),
      resetCustomRoom: () => set({
        customRoomMode: 'obwodowy',
        customRoomCategory: 'all',
        customRoomEquipment: []
      }),

      pushView: (view) => {
        const stack = get().navigationStack;
        if (stack[stack.length - 1] === view) return;
        set({
          navigationStack: [...stack, view],
          activeView: view
        });
      },

      popView: () => {
        const stack = get().navigationStack;
        if (stack.length <= 1) return;
        
        const newStack = [...stack];
        newStack.pop();
        const prevView = newStack[newStack.length - 1];
        
        set({
          navigationStack: newStack,
          activeView: prevView,
          // Jeśli wracamy z widoku CIRCUIT do HOME, czyścimy isGenerated
          ...(prevView === 'HOME' && { isGenerated: false })
        });
      },
      resolveConflict: (resolutionData) => {
        const { action } = resolutionData;
        const state = get();
        const { participants, difficultyId, stationCount, isStrictDifficulty } = state;
        const mainDiff = getDifficultyById(difficultyId);

        const executeGeneration = (loosen: boolean, ignore: boolean) => {
          const { customRoomCategory, selectedRoomId } = state;
          const room = get().getEffectiveRoomConfig();
          const category = selectedRoomId === 'custom' ? customRoomCategory : 'all';
          const allExercisesSource = get().getAllExercises();

          if (room.tryb_treningu === 'obwodowy') {
            return generateCircuitStrategy({
              currentRoom: room,
              mainDiff,
              participants,
              stationCount,
              isStrictDifficulty,
              loosenDifficultyFlag: loosen,
              ignoreUsedFlag: ignore,
              category,
              allExercisesSource,
            });
          }
          return generateSynchronizedStrategy({
            currentRoom: room,
            mainDiff,
            participants,
            stationCount,
            isStrictDifficulty,
            loosenDifficultyFlag: loosen,
            ignoreUsedFlag: ignore,
            category,
            allExercisesSource,
          });
        };

        if (action === 'cancel') {
          set({ generationConflict: null });
          return;
        }

        if (state.generationConflict?.type === 'reroll') {
          const { action: rerollAction, stationId, paramType, segmentId } = state.generationConflict.contextData || {};
          set({ generationConflict: null });

          if (action === 'loosen') {
            if (rerollAction === 'reroll' && stationId && paramType && segmentId !== undefined) {
              get().rerollExercise(stationId, paramType, segmentId, true, false);
            }
          }
          if (action === 'duplicate') {
            if (rerollAction === 'reroll' && stationId && paramType && segmentId !== undefined) {
              get().rerollExercise(stationId, paramType, segmentId, false, true);
            }
          }
          return;
        }

        // Logic for generate conflict
        if (action === 'reduce') {
          const partial = state.generationConflict?.partialStations || [];
          const available = state.generationConflict?.availableStations ?? partial.length;
          set({
            circuit: partial,
            stationCount: available > 0 ? available : state.stationCount,
            isGenerated: partial.length > 0,
            generationConflict: null,
          });
          if (partial.length > 0) {
            get().setActiveTab('circuit');
          }
        } else if (action === 'loosen') {
          const result = executeGeneration(true, false);
          if (result.success) {
            set({ circuit: result.stations, isGenerated: true, generationConflict: null });
            get().setActiveTab('circuit');
          } else {
            set({ generationConflict: result.conflict });
          }
        } else if (action === 'duplicate') {
          const result = executeGeneration(false, true);
          if (result.success) {
            set({ circuit: result.stations, isGenerated: true, generationConflict: null });
            get().setActiveTab('circuit');
          } else {
            set({ generationConflict: result.conflict });
          }
        }
      },

      setSelectedRoom: (roomId) => {
        const allRooms = get().getAllRooms ? get().getAllRooms() : ALL_ROOMS;
        const newRoom = allRooms.find(r => r.id_sali === roomId);
        if (!newRoom) return;

        const currentParticipants = get().participants;
        const currentStations = get().stationCount;

        set({
          selectedRoomId: roomId,
          participants: Math.min(Math.max(currentParticipants, 1), newRoom.maksymalna_pojemnosc.osoby),
          stationCount: Math.min(Math.max(currentStations, 1), newRoom.maksymalna_pojemnosc.stacje),
          circuit: [],
          isGenerated: false
        });
      },

      setParticipants: (val) => {
        const room = get().getEffectiveRoomConfig();
        const newParticipants = Math.min(Math.max(val, 1), room.maksymalna_pojemnosc.osoby);
        const maxStations = room.tryb_treningu === 'synchroniczny' 
          ? room.maksymalna_pojemnosc.stacje 
          : Math.min(newParticipants, room.maksymalna_pojemnosc.stacje);
        const newStationCount = Math.min(get().stationCount, maxStations);

        set({ participants: newParticipants, stationCount: newStationCount });
      },

      setStationCount: (val) => {
        const room = get().getEffectiveRoomConfig();
        const maxStations = room.tryb_treningu === 'synchroniczny' 
          ? room.maksymalna_pojemnosc.stacje 
          : Math.min(get().participants, room.maksymalna_pojemnosc.stacje);
        set({ stationCount: Math.min(Math.max(val, 1), maxStations) });
      },
      setDifficulty: (id) => set({ difficultyId: id }),
      setStrictDifficulty: (val) => set({ isStrictDifficulty: val }),

      generateCircuit: () => {
        const { participants, difficultyId, stationCount, isStrictDifficulty, selectedRoomId, customRoomCategory } = get();
        const mainDiff = getDifficultyById(difficultyId);
        const room = get().getEffectiveRoomConfig();
        const category = selectedRoomId === 'custom' ? customRoomCategory : 'all';
        const allExercisesSource = get().getAllExercises();

        const result = room.tryb_treningu === 'obwodowy'
          ? generateCircuitStrategy({
              currentRoom: room,
              mainDiff,
              participants,
              stationCount,
              isStrictDifficulty,
              category,
              allExercisesSource,
            })
          : generateSynchronizedStrategy({
              currentRoom: room,
              mainDiff,
              participants,
              stationCount,
              isStrictDifficulty,
              category,
              allExercisesSource,
            });

        if (result.success) {
          set({ circuit: result.stations, isGenerated: true, generationConflict: null });
          get().setActiveTab('circuit');
        } else {
          set({ generationConflict: result.conflict });
        }
      },

      rerollExercise: (stationId, type, segmentId, loosen = false, ignoreUsed = false) => {
        const { circuit, difficultyId, isStrictDifficulty, selectedRoomId, customRoomCategory } = get();
        const mainDiff = getDifficultyById(difficultyId);
        const currentRoom = get().getEffectiveRoomConfig();
        const category = selectedRoomId === 'custom' ? customRoomCategory : 'all';
        const allExercisesSource = get().getAllExercises();

        const result = rerollExerciseStrategy({
          circuit,
          stationId,
          type,
          segmentId,
          loosen,
          ignoreUsed,
          currentRoom,
          difficultyId,
          mainDiff,
          isStrictDifficulty,
          category,
          allExercisesSource,
        });

        if (result.success) {
          set({ circuit: result.circuit, generationConflict: null });
        } else {
          set({ generationConflict: result.conflict });
        }
      },

      setStationExercise: (stationId: string, type: 'A' | 'B', exercise: Exercise) => {
        const { circuit } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;

        const station = circuit[stationIndex];
        const newCircuit = [...circuit];

        if (type === 'A') {
          // Jeśli stacja jest wspóldzielona (oba ćwiczenia te same), podmień oba
          const isShared = station.exerciseB && station.exerciseA.id_cwiczenia === station.exerciseB.id_cwiczenia;
          newCircuit[stationIndex] = { 
            ...station, 
            exerciseA: exercise,
            exerciseB: isShared ? exercise : station.exerciseB
          };
        } else {
          newCircuit[stationIndex] = { ...station, exerciseB: exercise };
        }

        set({ circuit: newCircuit });
      },

      reorderCircuit: (oldIndex, newIndex) => {
        const newCircuit = [...get().circuit];
        if (oldIndex < 0 || oldIndex >= newCircuit.length || newIndex < 0 || newIndex >= newCircuit.length) return;
        const [movedItem] = newCircuit.splice(oldIndex, 1);
        newCircuit.splice(newIndex, 0, movedItem);
        set({ circuit: newCircuit });
      },

      reset: () => set({ 
        isGenerated: false, 
        circuit: [], 
        activeView: 'HOME', 
        navigationStack: ['HOME'] 
      })
    }),
    {
      name: 'kinetic-circuits-storage',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => partializeStoreState(state),
      migrate: (persistedState, version) => migrateStoreState(persistedState, version),
    }
  )
);

export const partializeStoreState = (state: AppState) => ({
  customExercises: state.customExercises,
  customRooms: state.customRooms,
  customEquipment: state.customEquipment,
  customIntervalPresets: state.customIntervalPresets,
  timerAudioSettings: state.timerAudioSettings,
  sharedUserProfile: state.sharedUserProfile,
  calculatorResults: state.calculatorResults,
  selectedRoomId: state.selectedRoomId,
  participants: state.participants,
  stationCount: state.stationCount,
  difficultyId: state.difficultyId,
  isStrictDifficulty: state.isStrictDifficulty,
  customRoomMode: state.customRoomMode,
  customRoomCategory: state.customRoomCategory,
  customRoomEquipment: state.customRoomEquipment,
  activeTab: state.activeTab,
});

export const migrateStoreState = (persistedState: unknown, version: number) => {
  if (version === 0 || version === undefined) {
    const { circuit: _circuit, ...rest } = (persistedState as Record<string, unknown>) || {};
    return rest;
  }
  return persistedState;
};

// Re-export domain generator helpers for backward compatibility with existing imports.
export { ensureEquipment, getEquipmentString, canExerciseBeShared, MAX_DIFFICULTY_LOOSENING };
