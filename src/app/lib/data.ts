import exercises from './data/lista_cwiczen.json';
import equipment from './data/lista_sprzetu.json';
import levels from './data/poziomy_trudnosci.json';
import segments from './data/segmenty.json';
import sala from './data/sala.json';

export type SingleRequirement = Record<string, number>;
export type EquipmentRequirement = SingleRequirement | SingleRequirement[];

export interface Exercise {
  id_cwiczenia: string;
  nazwa: string;
  wariant: string;
  segment_id: number;
  segment_nazwa: string;
  tryb_pracy: "Solo" | "W_Parze";
  wymagania_sprzetowe?: EquipmentRequirement[];
  biomechanika: string;
  poziom: number;
  glowne_partie: string[];
  zaangazowane_miesnie: string | string[];
  tagi_specjalne: string[];
  kategorie_treningu: string[];
  instrukcja: string;
}

export interface DifficultyLevel {
  id: string;
  nazwa_grupy: string;
  min_poziom: number;
  max_poziom: number;
  charakterystyka_biomechaniczna: string;
  przyklady_z_bazy: string;
  logika_algorytmu: string;
}

export interface Zone {
  id: string;
  nazwa: string;
  typ: string;
  kolejnosc_sortowania?: number;
  blokada_zmiany_recznej?: boolean;
  zakazane_kategorie_sprzetu?: string[];
  pojemnosc_stacji?: number;
  bazowa_pojemnosc_stacji?: number;
  zaleznosci_pojemnosci_od?: string[];
  ograniczenia?: string[];
  akceptuje_pelen_obrot?: boolean;
  przypisany_sprzet?: string[];
  uwagi?: string;
}

export interface RoomConfig {
  id_sali: string;
  nazwa_sali: string;
  tryb_treningu: "obwodowy" | "fbw_synchroniczny";
  maksymalna_pojemnosc: {
    osoby: number;
    stacje: number;
  };
  inwentarz: Record<string, number>;
  strefy: Zone[];
  reguly_przeplywu_i_kolizji: Record<string, string>;
}

export interface Station {
  id: string;
  zone: Zone;
  exerciseA: Exercise;
  exerciseB?: Exercise;
  isPair: boolean;
}

export const ALL_EXERCISES = exercises as Exercise[];
export const ALL_EQUIPMENT = equipment as string[];
export const DIFFICULTY_LEVELS = levels as DifficultyLevel[];
export const SEGMENTS = segments as { id: number; nazwa: string }[];
export const ALL_ROOMS = sala.sale as RoomConfig[];

export const getDifficultyById = (id: string) => 
  DIFFICULTY_LEVELS.find(l => l.id === id) || DIFFICULTY_LEVELS[1];
