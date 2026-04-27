
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Exercise,
  Station,
  ALL_EXERCISES,
  ALL_ROOMS,
  RoomConfig,
  getDifficultyById,
  Zone,
  DifficultyLevel
} from './data';

export const MAX_DIFFICULTY_LOOSENING = 1;

export interface GenerationConflictState {
  type: 'generate' | 'reroll';
  requestedStations: number;
  availableStations: number;
  canLoosenDifficulty: boolean;
  contextData?: any;
}

export type ViewType = 'HOME' | 'CIRCUIT' | 'BMI' | 'TIMER' | 'SETTINGS';

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

  circuit: Station[];
  isGenerated: boolean;
  activeView: ViewType;
  navigationStack: ViewType[];
  generationConflict: GenerationConflictState | null;

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
  changeStationZone: (stationId: string, newZoneId: string, loosen?: boolean, ignoreUsed?: boolean) => void;
  reorderCircuit: (oldIndex: number, newIndex: number) => void;
  reset: () => void;
}

const getEquipmentString = (ex: Pick<Exercise, "wymagania_sprzetowe">): string => {
  if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) return '';
  const items = new Set<string>();
  ex.wymagania_sprzetowe.forEach(rule => {
    if (Array.isArray(rule)) {
      rule.forEach(alt => Object.keys(alt).forEach(k => items.add(k)));
    } else {
      Object.keys(rule).forEach(k => items.add(k));
    }
  });
  return Array.from(items).join(', ').toLowerCase();
};

const canExerciseBeShared = (ex: Exercise, currentRoom: RoomConfig): boolean => {
  return ensureEquipment(ex, currentRoom, 2);
};

const ensureEquipment = (ex: Exercise, currentRoom: RoomConfig, participants: number): boolean => {
  if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) return true;

  const checkSingle = (req: Record<string, number>) => {
    return Object.entries(req).every(([itemKey, qtyPerPerson]) => {
      // Dzięki zrównaniu słownictwa (m.in migrateDB.js) możemy szukać exact-match klucza.
      const gymHas = currentRoom.inwentarz[itemKey] || 0;
      const needed = participants * qtyPerPerson;
      return gymHas >= needed;
    });
  };

  // Silnik Hybrydowy: Główna tablica to zasady AND. Wewnątrz (Array) to zasady OR.
  return ex.wymagania_sprzetowe.every(rule => {
    if (Array.isArray(rule)) {
      return rule.some(alt => checkSingle(alt));
    } else {
      return checkSingle(rule);
    }
  });
};

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
  participantsCount: number = 1
): Exercise[] => {
  let pool = ALL_EXERCISES.filter(ex =>
    ex.poziom >= diffRange.min && ex.poziom <= diffRange.max &&
    (ignoreUsed ? true : !usedIds.has(ex.id_cwiczenia))
  );

  if (category !== 'all') {
    pool = pool.filter(ex => 
      ex.kategorie_treningu?.some(cat => cat.toLowerCase() === category.toLowerCase())
    );
  }

  if (segmentId !== undefined) {
    pool = pool.filter(ex => ex.segment_id === segmentId);
  }

  if (!isThisStationPair) {
    pool = pool.filter(ex => ex.segment_id !== 8 && ex.tryb_pracy !== 'W_Parze');
  }

  // Filtr reguł sali: zakazane tryby pracy (np. Astoria nie dopuszcza ćwiczeń W_Parze)
  if (currentRoom.zakazane_tryby_pracy && currentRoom.zakazane_tryby_pracy.length > 0) {
    pool = pool.filter(ex => !currentRoom.zakazane_tryby_pracy!.includes(ex.tryb_pracy));
  }

  if (hasFlagAlready) {
    pool = pool.filter(ex => !ex.nazwa.toLowerCase().includes('flaga'));
  }

  const zoneEquip = zone.przypisany_sprzet || [];

  if (zone.zakazane_kategorie_sprzetu && zone.zakazane_kategorie_sprzetu.length > 0) {
    pool = pool.filter(ex => {
      const eq = getEquipmentString(ex).toLowerCase();
      return !zone.zakazane_kategorie_sprzetu!.some(term => eq.includes(term.toLowerCase()));
    });
  }

  if (zone.ograniczenia && zone.ograniczenia.length > 0) {
    if (zone.ograniczenia.includes("odrzuc_segment_dynamika")) pool = pool.filter(ex => ex.segment_id !== 6);
    if (zone.ograniczenia.includes("odrzuc_kategorie_moc")) pool = pool.filter(ex => !ex.kategorie_treningu.includes('Moc'));
    if (zone.ograniczenia.includes("zakaz_drazkow_i_drabinek")) pool = pool.filter(ex => ex.segment_id !== 1);
    if (zone.ograniczenia.includes("zakaz_obrotu_drazek_wysoki")) {
      pool = pool.filter(ex => {
        const isRot = ex.tagi_specjalne?.includes('Pełen Obrót');
        const eqStr = getEquipmentString(ex).toLowerCase();
        // Ban rotation ONLY if it requires a high bar ('drazek')
        if (isRot && eqStr.includes('drazek')) {
          return false;
        }
        return true;
      });
    }
  }

  if (zone.typ === 'elastyczny') {
    pool = pool.filter(ex => !ex.kategorie_treningu.includes('Wyciąg'));
  }

  if (zone.typ !== 'klatka_rig') {
    pool = pool.filter(ex => !(ex.segment_id === 1 && getEquipmentString(ex).includes('drazek')));
  }

  if (zoneEquip.length > 0) {
    pool = pool.filter(ex => {
      const equip = getEquipmentString(ex).toLowerCase();
      const name = ex.nazwa.toLowerCase();
      return zoneEquip.some(item => equip.includes(item.toLowerCase()) || name.includes(item.toLowerCase()));
    });
  }

  // OSTATECZNA tarcza ochronna – weryfikacja fizycznego sprzętu na Sali.
  // Dla obwodu participantsCount = 1 (stacja solo) lub 2 (para), dla GRP = cała grupa.
  pool = pool.filter(ex => ensureEquipment(ex, currentRoom, participantsCount));

  // FALLBACK jeśli wyczyściliśmy ćwiczenia z użytych: zezwalamy na potworzenia!
  if (pool.length === 0 && !ignoreUsed) {
    return getValidExercisesForZone(zone, diffRange, new Set(), isThisStationPair, currentRoom, segmentId, true, hasFlagAlready);
  }

  return pool;
};

const generateCircuitStrategy = (
  currentRoom: RoomConfig,
  mainDiff: DifficultyLevel,
  participants: number,
  stationCount: number,
  isStrictDifficulty: boolean,
  loosenDifficultyFlag: boolean = false,
  ignoreUsedFlag: boolean = false,
  category: string = 'all'
): Station[] => {
  const numDoubleStations = participants - stationCount;
  const isPairMode = participants > stationCount;
  const allZones = currentRoom.strefy;
  const selectedZones: Zone[] = [];

  const forcedZones = allZones.filter(z => z.blokada_zmiany_recznej);
  forcedZones.forEach(z => selectedZones.push(z));

  const rigZone = allZones.find(z => z.kolejnosc_sortowania === 2);
  if (rigZone && stationCount > 1) selectedZones.push(rigZone);

  while (selectedZones.length < stationCount) {
    const currentCounts = selectedZones.reduce((acc, z) => {
      acc[z.id] = (acc[z.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let floorLimit = allZones.find(z => z.typ === 'elastyczny')?.bazowa_pojemnosc_stacji || 5;

    const elastycznaStrefa = allZones.find(z => z.typ === 'elastyczny');
    if (elastycznaStrefa && elastycznaStrefa.zaleznosci_pojemnosci_od) {
      elastycznaStrefa.zaleznosci_pojemnosci_od.forEach(zalezna => {
        if (Object.keys(currentCounts).includes(zalezna)) floorLimit -= 1;
      });
    }

    const candidates: Zone[] = [];
    allZones.forEach(z => {
      if (forcedZones.some(fz => fz.id === z.id) || (rigZone && z.id === rigZone.id)) return;
      const current = currentCounts[z.id] || 0;

      let cap = z.pojemnosc_stacji || 1;
      if (z.typ === 'elastyczny') cap = floorLimit;
      else if (isPairMode && z.typ === 'klatka_rig') cap = 1;

      if (current < cap) candidates.push(z);
    });

    if (candidates.length === 0) break;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    selectedZones.push(chosen);
  }

  selectedZones.sort((a, b) => (a.kolejnosc_sortowania || 99) - (b.kolejnosc_sortowania || 99));

  const generated: Station[] = [];
  const usedIds = new Set<string>();
  let hasFlagAlready = false;

  selectedZones.forEach((zone, idx) => {
    const isThisStationPair = idx < numDoubleStations;
    let currentRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };

    if (!isStrictDifficulty && (idx + 1) % 3 === 0) {
      currentRange = { min: Math.max(1, mainDiff.min_poziom - 2), max: Math.max(1, mainDiff.min_poziom - 1) };
    }

    if (loosenDifficultyFlag) {
      currentRange = { 
        min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), 
        max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) 
      };
    }

    const pCountForThisStation = isThisStationPair ? 2 : 1;
    let pool = getValidExercisesForZone(zone, currentRange, usedIds, isThisStationPair, currentRoom, undefined, ignoreUsedFlag, hasFlagAlready, category, pCountForThisStation);
    if (pool.length === 0) {
      pool = getValidExercisesForZone(zone, { min: mainDiff.min_poziom, max: mainDiff.max_poziom }, usedIds, isThisStationPair, currentRoom, undefined, ignoreUsedFlag, hasFlagAlready, category, pCountForThisStation);
    }
    if (pool.length === 0) return;

    const exA = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(exA.id_cwiczenia);
    if (exA.nazwa.toLowerCase().includes('flaga')) hasFlagAlready = true;

    let exB: Exercise | undefined = undefined;
    if (isThisStationPair) {
      if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA, currentRoom)) {
        exB = exA;
      } else {
        const potentialB = ALL_EXERCISES.filter(ex =>
          ex.id_cwiczenia !== exA.id_cwiczenia &&
          !usedIds.has(ex.id_cwiczenia) &&
          ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
          ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
          ensureEquipment(ex, currentRoom, 1) &&
          ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
        );
        exB = potentialB[Math.floor(Math.random() * potentialB.length)] || exA;
        if (exB && exB.id_cwiczenia !== exA.id_cwiczenia) {
          usedIds.add(exB.id_cwiczenia);
          if (exB.nazwa.toLowerCase().includes('flaga')) hasFlagAlready = true;
        }
      }
    }

    generated.push({ id: `st-${idx}-${Date.now()}-${Math.random()}`, zone, exerciseA: exA, exerciseB: exB, isPair: isThisStationPair });
  });
  return generated;
};

const generateSynchronizedStrategy = (
  currentRoom: RoomConfig,
  mainDiff: DifficultyLevel,
  participants: number,
  stationCount: number,
  isStrictDifficulty: boolean,
  loosenDifficultyFlag: boolean = false,
  ignoreUsedFlag: boolean = false,
  category: string = 'all'
): Station[] => {
  const generated: Station[] = [];
  const usedIds = new Set<string>();
  const mainZone = currentRoom.strefy[0] || {
    id: 'FBW_Virtual', nazwa: 'Przestrzeń FBW', typ: 'elastyczny', pojemnosc_stacji: participants, bazowa_pojemnosc_stacji: participants
  };
  const currentRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
  let searchRange = currentRange;
  if (loosenDifficultyFlag) {
    searchRange = { 
       min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), 
       max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) 
    };
  }

  for (let idx = 0; idx < stationCount; idx++) {
    const pool = getValidExercisesForZone(
      mainZone, 
      searchRange, 
      usedIds, 
      false, 
      currentRoom, 
      undefined, 
      ignoreUsedFlag, 
      false, 
      category, 
      participants
    );

    if (pool.length === 0) {
      // Internal Fallback: Jeśli poluzowany (lub przesunięty) zakres nie znalazł nic, wróć do bazy
      const fallbackPool = getValidExercisesForZone(
        mainZone, 
        currentRange, 
        usedIds, 
        false, 
        currentRoom, 
        undefined, 
        ignoreUsedFlag, 
        false, 
        category, 
        participants
      );

      if (fallbackPool.length === 0) continue;
      
      const exA = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      usedIds.add(exA.id_cwiczenia);
      generated.push({
        id: `sync-${idx}-${Date.now()}-${Math.random()}`,
        zone: mainZone,
        exerciseA: exA,
        isPair: false
      });
      continue;
    }

    const exA = pool[Math.floor(Math.random() * pool.length)];
    usedIds.add(exA.id_cwiczenia);
    generated.push({
      id: `sync-${idx}-${Date.now()}-${Math.random()}`,
      zone: mainZone,
      exerciseA: exA,
      isPair: false
    });
  }
  return generated;
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

      circuit: [] as Station[],
      isGenerated: false,
      activeView: 'HOME',
      navigationStack: ['HOME'] as ViewType[],
      generationConflict: null as GenerationConflictState | null,

      // Helper do pobierania aktualnej konfiguracji sali (uwzględnia wirtualną salę Custom)
      getEffectiveRoomConfig: () => {
        const { selectedRoomId, customRoomMode, customRoomEquipment } = get();
        const currentRoom = ALL_ROOMS.find(r => r.id_sali === selectedRoomId) || ALL_ROOMS[0];

        if (selectedRoomId === 'custom') {
          return {
            ...currentRoom,
            tryb_treningu: customRoomMode,
            inwentarz: customRoomEquipment.reduce((acc, eq) => ({ ...acc, [eq]: 99 }), {})
          };
        }
        return currentRoom;
      },

      setGenerationConflict: (conflict) => set({ generationConflict: conflict }),

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
        const { participants, difficultyId, stationCount, isStrictDifficulty, selectedRoomId } = state;
        const mainDiff = getDifficultyById(difficultyId);
        const currentRoom = ALL_ROOMS.find(r => r.id_sali === selectedRoomId) || ALL_ROOMS[0];

        const executeGeneration = (loosen: boolean, ignore: boolean) => {
            const { customRoomCategory, selectedRoomId } = state;
            const room = get().getEffectiveRoomConfig();

            if (room.tryb_treningu === 'obwodowy') {
              return generateCircuitStrategy(room, mainDiff, participants, stationCount, isStrictDifficulty, loosen, ignore, selectedRoomId === 'custom' ? customRoomCategory : 'all');
            }
            return generateSynchronizedStrategy(room, mainDiff, participants, stationCount, isStrictDifficulty, loosen, ignore, selectedRoomId === 'custom' ? customRoomCategory : 'all');
        };

        if (action === 'cancel') {
          set({ generationConflict: null });
          return;
        }

        if (state.generationConflict?.type === 'reroll') {
           const { action: rerollAction, stationId, paramType, segmentId, newZoneId } = state.generationConflict.contextData;
           set({ generationConflict: null }); // clears state first

           if (action === 'loosen') {
             if (rerollAction === 'reroll') get().rerollExercise(stationId, paramType, segmentId, true, false);
             if (rerollAction === 'changeZone') get().changeStationZone(stationId, newZoneId, true, false);
           }
           if (action === 'duplicate') {
             if (rerollAction === 'reroll') get().rerollExercise(stationId, paramType, segmentId, false, true);
             if (rerollAction === 'changeZone') get().changeStationZone(stationId, newZoneId, false, true);
           }
           return;
        }

        // Logic for generate
        if (action === 'reduce') {
          // Zatwierdzamy obcięty (krótki) scenariusz z oryginalnymi ostrymi parametrami wejściowymi 
          const currentPartial = executeGeneration(false, false);
          set({ circuit: currentPartial, isGenerated: true, generationConflict: null });
        } 
        else if (action === 'loosen') {
          // Odpalamy tryb rozluźnienia parametrów trudności sprzętu
          const loosenedCircuit = executeGeneration(true, false);
          set({ circuit: loosenedCircuit, isGenerated: true, generationConflict: null });
        } 
        else if (action === 'duplicate') {
          // Środowisko dopuszcza duplikaty (klony stacji z używanymi ćwiczeniami)
          // Odpalamy z podwyższonym loose = false ORAZ ignoreUsed = true
          // Jeżeli strict było odznaczone i loosen podpowiadało mniejsze powtórzenia, to ignorujemy użyte. 
          const duplicateCircuit = executeGeneration(false, true);
          set({ circuit: duplicateCircuit, isGenerated: true, generationConflict: null });
          get().pushView('CIRCUIT');
        }
      },

      setSelectedRoom: (roomId) => {
        const newRoom = ALL_ROOMS.find(r => r.id_sali === roomId);
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
        const { participants, difficultyId, stationCount, isStrictDifficulty, selectedRoomId } = get();
        const mainDiff = getDifficultyById(difficultyId);

        const tryGenerate = (loosen: boolean, ignore: boolean) => {
            const { customRoomCategory } = get();
            const room = get().getEffectiveRoomConfig();

            if (room.tryb_treningu === 'obwodowy') {
              return generateCircuitStrategy(room, mainDiff, participants, stationCount, isStrictDifficulty, loosen, ignore, selectedRoomId === 'custom' ? customRoomCategory : 'all');
            }
            return generateSynchronizedStrategy(room, mainDiff, participants, stationCount, isStrictDifficulty, loosen, ignore, selectedRoomId === 'custom' ? customRoomCategory : 'all');
        };

        // --- AUTOMATYCZNY SYSTEM FALLBACKÓW ---
        // 1. Próba idealna (sztywne poziomy, brak duplikatów)
        let newCircuit = tryGenerate(false, false);

        // 2. Próba z poluzowaniem poziomu (jeśli Tryb Ścisły jest wyłączony)
        if (newCircuit.length < stationCount && !isStrictDifficulty) {
          const loosened = tryGenerate(true, false);
          if (loosened.length > newCircuit.length) {
            newCircuit = loosened;
          }
        }

        // --- KONIEC AUTO-NAPRAWY, JEŚLI NADAL BRAKUJE -> DIALOG KONFLIKTU ---
        if (newCircuit.length < stationCount) {
             const dryRunLoosen = tryGenerate(true, false);
             const canLoosenHelp = dryRunLoosen.length >= stationCount;
             
             set({
               generationConflict: {
                 type: 'generate',
                 requestedStations: stationCount,
                 availableStations: newCircuit.length,
                 canLoosenDifficulty: canLoosenHelp
               }
             });
             return;
        }

        set({ circuit: newCircuit, isGenerated: true, generationConflict: null });
        get().pushView('CIRCUIT');
      },

      rerollExercise: (stationId, type, segmentId, loosen = false, ignoreUsed = false) => {
        const { circuit, difficultyId, isStrictDifficulty } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;
        const station = circuit[stationIndex];

        const mainDiff = getDifficultyById(difficultyId);

        // Budujemy listę użytych ID wykluczając to, które właśnie zmieniamy
        const usedOnOtherStations = new Set<string>();
        circuit.forEach(s => {
          if (s.id !== stationId) {
            usedOnOtherStations.add(s.exerciseA.id_cwiczenia);
            if (s.exerciseB) usedOnOtherStations.add(s.exerciseB.id_cwiczenia);
          }
        });

        const currentAtStationIds = new Set<string>();
        currentAtStationIds.add(station.exerciseA.id_cwiczenia);
        if (station.exerciseB) currentAtStationIds.add(station.exerciseB.id_cwiczenia);

        // Initial attempt: exclude everything already used in the circuit
        const fullUsedIds = new Set([...usedOnOtherStations, ...currentAtStationIds]);

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
        
        let searchRange = { ...currentRange };
        if (loosen) {
          searchRange = { min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) };
        }

        if (type === 'A') {
          const currentRoom = get().getEffectiveRoomConfig();
          const category = get().selectedRoomId === 'custom' ? get().customRoomCategory : 'all';
          const pCount = station.isPair ? 2 : 1;
          let pool = getValidExercisesForZone(station.zone, searchRange, fullUsedIds, station.isPair, currentRoom, segmentId, ignoreUsed, hasFlagAlready, category, pCount);
          
          if (pool.length === 0) {
            // Drugie podejście: pozwalamy na duplikaty z innych stacji, ale wciąż wykluczamy obecne
            pool = getValidExercisesForZone(station.zone, searchRange, currentAtStationIds, station.isPair, currentRoom, segmentId, true, hasFlagAlready, category, pCount);
          }

          if (pool.length === 0) {
            searchRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
            if (loosen) {
              searchRange = { min: Math.max(1, mainDiff.min_poziom - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, mainDiff.max_poziom + MAX_DIFFICULTY_LOOSENING) };
            }
            pool = getValidExercisesForZone(station.zone, searchRange, currentAtStationIds, station.isPair, currentRoom, segmentId, true, hasFlagAlready);
          }

          if (pool.length === 0) {
             const dryLoosenRange = { min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) };
             const dryPool = getValidExercisesForZone(station.zone, dryLoosenRange, currentAtStationIds, station.isPair, currentRoom, segmentId, true, hasFlagAlready);
             set({
               generationConflict: {
                 type: 'reroll',
                 requestedStations: 1, availableStations: 0,
                 canLoosenDifficulty: dryPool.length > 0,
                 contextData: { action: 'reroll', stationId, paramType: type, segmentId }
               }
             });
             return;
          }
          const newExA = pool[Math.floor(Math.random() * pool.length)];

          let newExB = undefined;
          if (station.isPair) {
            const currentRoom = ALL_ROOMS.find(r => r.id_sali === get().selectedRoomId) || ALL_ROOMS[0];
            if (newExA.tryb_pracy === 'W_Parze' || canExerciseBeShared(newExA, currentRoom)) {
              newExB = newExA;
            } else {
              const potentialB = ALL_EXERCISES.filter(ex =>
                ex.id_cwiczenia !== newExA.id_cwiczenia &&
                !usedIds.has(ex.id_cwiczenia) &&
                ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
                ex.glowne_partie.some(p => newExA.glowne_partie.includes(p)) &&
                ensureEquipment(ex, currentRoom, 1) &&
                ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
              );
              newExB = potentialB[Math.floor(Math.random() * potentialB.length)] || newExA;
            }
          }

          const newCircuit = [...circuit];
          newCircuit[stationIndex] = { ...station, exerciseA: newExA, exerciseB: newExB };
          set({ circuit: newCircuit });
        } else if (type === 'B' && station.exerciseB) {
          const currentRoom = get().getEffectiveRoomConfig();
          const category = get().selectedRoomId === 'custom' ? get().customRoomCategory : 'all';

          let pool = ALL_EXERCISES.filter(ex =>
            ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
            !fullUsedIds.has(ex.id_cwiczenia) &&
            ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
            ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
            ensureEquipment(ex, currentRoom, 1) &&
            ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
          );

          if (pool.length === 0) {
            pool = ALL_EXERCISES.filter(ex =>
              ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
              !currentAtStationIds.has(ex.id_cwiczenia) &&
              ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
              ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
              ensureEquipment(ex, currentRoom, 1) &&
              ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
            );
          }

          if (category !== 'all') {
            pool = pool.filter(ex => 
              ex.kategorie_treningu?.some(cat => cat.toLowerCase() === category.toLowerCase())
            );
          }

          if (hasFlagAlready) {
            pool = pool.filter(ex => !ex.nazwa.toLowerCase().includes('flaga'));
          }

          const filteredPool = segmentId !== undefined ? pool.filter(ex => ex.segment_id === segmentId) : pool;
          if (filteredPool.length === 0) {
             const dryLoosenRange = { min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) };
             const dryPool = ALL_EXERCISES.filter(ex =>
                ex.id_cwiczenia !== station.exerciseA.id_cwiczenia &&
                !currentAtStationIds.has(ex.id_cwiczenia) &&
                ex.poziom >= dryLoosenRange.min && ex.poziom <= dryLoosenRange.max &&
                ex.glowne_partie.some(p => station.exerciseA.glowne_partie.includes(p)) &&
                ensureEquipment(ex, currentRoom, 1) &&
                ex.tryb_pracy !== 'W_Parze' && ex.segment_id !== 8
             );

             // Apply category search even in dryPool
             const dryFiltered = category !== 'all' 
                ? dryPool.filter(ex => ex.kategorie_treningu?.some(cat => cat.toLowerCase() === category.toLowerCase()))
                : dryPool;

             set({
               generationConflict: {
                 type: 'reroll',
                 requestedStations: 1, availableStations: 0,
                 canLoosenDifficulty: dryFiltered.length > 0,
                 contextData: { action: 'reroll', stationId, paramType: type, segmentId }
               }
             });
             return;
          }

          const newExB = filteredPool[Math.floor(Math.random() * filteredPool.length)];
          if (newExB) {
            const newCircuit = [...circuit];
            newCircuit[stationIndex] = { ...station, exerciseB: newExB };
            set({ circuit: newCircuit });
          }
        }
      },

      changeStationZone: (stationId, newZoneId, loosen = false, ignoreUsed = false) => {
        const { circuit, difficultyId, isStrictDifficulty } = get();
        const stationIndex = circuit.findIndex(s => s.id === stationId);
        if (stationIndex === -1) return;

        const currentRoom = get().getEffectiveRoomConfig();
        const newZone = currentRoom.strefy.find(z => z.id === newZoneId);
        if (!newZone) return;

        const mainDiff = getDifficultyById(difficultyId);
        const usedExerciseIds = new Set<string>();
        circuit.forEach(s => {
          if (s.id !== stationId) {
            usedExerciseIds.add(s.exerciseA.id_cwiczenia);
            if (s.exerciseB) usedExerciseIds.add(s.exerciseB.id_cwiczenia);
          }
        });

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

        let searchRange = { ...currentRange };
        if (loosen) {
          searchRange = { min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) };
        }

        const category = get().selectedRoomId === 'custom' ? get().customRoomCategory : 'all';
        const pCount = circuit[stationIndex].isPair ? 2 : 1;
        let pool = getValidExercisesForZone(newZone, searchRange, usedExerciseIds, circuit[stationIndex].isPair, currentRoom, undefined, ignoreUsed, hasFlagAlready, category, pCount);

        if (pool.length === 0) {
          searchRange = { min: mainDiff.min_poziom, max: mainDiff.max_poziom };
          if (loosen) {
            searchRange = { min: Math.max(1, mainDiff.min_poziom - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, mainDiff.max_poziom + MAX_DIFFICULTY_LOOSENING) };
          }
          pool = getValidExercisesForZone(newZone, searchRange, usedExerciseIds, circuit[stationIndex].isPair, currentRoom, undefined, ignoreUsed, hasFlagAlready);
        }

        if (pool.length === 0) {
           const dryLoosenRange = { min: Math.max(1, currentRange.min - MAX_DIFFICULTY_LOOSENING), max: Math.min(10, currentRange.max + MAX_DIFFICULTY_LOOSENING) };
           const dryPool = getValidExercisesForZone(newZone, dryLoosenRange, usedExerciseIds, circuit[stationIndex].isPair, currentRoom, undefined, ignoreUsed, hasFlagAlready);
           set({
             generationConflict: {
               type: 'reroll',
               requestedStations: 1, availableStations: 0,
               canLoosenDifficulty: dryPool.length > 0,
               contextData: { action: 'changeZone', stationId, newZoneId }
             }
           });
           return;
        }

        const exA = pool[Math.floor(Math.random() * pool.length)];
        let exB = undefined;

        if (circuit[stationIndex].isPair) {
          if (exA.tryb_pracy === 'W_Parze' || canExerciseBeShared(exA, currentRoom)) {
            exB = exA;
          } else {
            const potentialB = ALL_EXERCISES.filter(ex =>
              ex.id_cwiczenia !== exA.id_cwiczenia &&
              !usedExerciseIds.has(ex.id_cwiczenia) &&
              ex.poziom >= currentRange.min && ex.poziom <= currentRange.max &&
              ex.glowne_partie.some(p => exA.glowne_partie.includes(p)) &&
              ensureEquipment(ex, currentRoom, 1) &&
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

        // newCircuit.sort((a, b) => (a.zone.kolejnosc_sortowania || 99) - (b.zone.kolejnosc_sortowania || 99));
        set({ circuit: newCircuit });
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
      storage: createJSONStorage(() => localStorage),
    }
  )
);
