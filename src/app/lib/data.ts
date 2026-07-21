import exercises from './data/lista_cwiczen.json';
import equipment from './data/lista_sprzetu.json';
import levels from './data/poziomy_trudnosci.json';
import segments from './data/segmenty.json';
import sala from './data/sala.json';
import categories from './data/kategorie_treningow.json';

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
  isCustom?: boolean;
  isOverridden?: boolean;
}

export const createDefaultExercise = (input: {
  id_cwiczenia?: string;
  nazwa: string;
  wariant?: string;
  segment_id?: number;
  segment_nazwa?: string;
  tryb_pracy?: "Solo" | "W_Parze";
  poziom?: number;
  glowne_partie?: string[];
  zaangazowane_miesnie?: string | string[];
  tagi_specjalne?: string[];
  kategorie_treningu?: string[];
  instrukcja?: string;
  wymagania_sprzetowe?: EquipmentRequirement[];
  biomechanika?: string;
  isOverridden?: boolean;
}): Exercise => {
  const isBuiltInId = input.id_cwiczenia && !input.id_cwiczenia.startsWith('custom-');
  const isOverridden = input.isOverridden ?? (isBuiltInId ? true : false);

  return {
    id_cwiczenia: input.id_cwiczenia || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nazwa: input.nazwa.trim(),
    wariant: input.wariant?.trim() ?? "",
    segment_id: input.segment_id ?? 99,
    segment_nazwa: input.segment_nazwa ?? "NIEWYBRANY / OGÓLNE",
    tryb_pracy: input.tryb_pracy ?? "Solo",
    poziom: input.poziom ?? 0, // 0 = poziom uniwersalny (pasuje do każdego poziomu 1-10)
    glowne_partie: input.glowne_partie && input.glowne_partie.length > 0 ? input.glowne_partie : ["Wszystkie / Uniwersalne"],
    zaangazowane_miesnie: input.zaangazowane_miesnie ?? "Brak szczegółowych danych",
    tagi_specjalne: input.tagi_specjalne ?? ["Własne"],
    kategorie_treningu: input.kategorie_treningu && input.kategorie_treningu.length > 0 ? input.kategorie_treningu : ["all", "Kalistenika", "FBW", "Cross"],
    instrukcja: input.instrukcja?.trim() || "Brak opisu (dodano w trybie szybkim)",
    wymagania_sprzetowe: input.wymagania_sprzetowe ?? [],
    biomechanika: input.biomechanika ?? "Ogólna",
    isCustom: true,
    isOverridden: isOverridden,
  };
};

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
  przypisany_sprzet?: string[];
  uwagi?: string;
}

export interface RoomConfig {
  id_sali: string;
  nazwa_sali: string;
  tryb_treningu: "obwodowy" | "synchroniczny";
  maksymalna_pojemnosc: {
    osoby: number;
    stacje: number;
  };
  inwentarz: Record<string, number>;
  strefy: Zone[];
  reguly_przeplywu_i_kolizji: Record<string, string>;
  zakazane_tryby_pracy?: Array<"Solo" | "W_Parze">;
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
export const KATEGORIE_TRENINGOW = categories as { id: string; nazwa: string }[];

export const getDifficultyById = (id: string) => 
  DIFFICULTY_LEVELS.find(l => l.id === id) || DIFFICULTY_LEVELS[1];
