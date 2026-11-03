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

export const normalizeExerciseKey = (name: string): string => {
  if (!name) return '';
  const plMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
  };
  let result = name.split('').map(char => plMap[char] || char).join('');
  result = result
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return result || `cwiczenie_${Date.now()}`;
};

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

  const generatedId = input.id_cwiczenia
    ? input.id_cwiczenia.trim()
    : normalizeExerciseKey(input.nazwa);

  const baseBuiltIn = (exercises as Exercise[]).find(e => e.id_cwiczenia === generatedId);

  // Zabezpieczenie wymagań sprzętowych: preferuj podane w input, w przeciwnym razie zachowaj z bazy wbudowanej
  const finalEquipment = (input.wymagania_sprzetowe && input.wymagania_sprzetowe.length > 0)
    ? input.wymagania_sprzetowe
    : (baseBuiltIn?.wymagania_sprzetowe ?? []);

  // Zabezpieczenie biomechaniki
  const finalBiomechanika = (input.biomechanika && input.biomechanika !== "Ogólna")
    ? input.biomechanika
    : (baseBuiltIn?.biomechanika ?? input.biomechanika ?? "Ogólna");

  // Zabezpieczenie zaangażowanych mięśni
  const finalMiesnie = (input.zaangazowane_miesnie && input.zaangazowane_miesnie !== "Brak szczegółowych danych")
    ? input.zaangazowane_miesnie
    : (baseBuiltIn?.zaangazowane_miesnie ?? input.zaangazowane_miesnie ?? "Brak szczegółowych danych");

  // Zabezpieczenie tagów specjalnych
  const finalTagi = (input.tagi_specjalne && input.tagi_specjalne.length > 0 && JSON.stringify(input.tagi_specjalne) !== JSON.stringify(["Własne"]))
    ? input.tagi_specjalne
    : (baseBuiltIn?.tagi_specjalne ?? input.tagi_specjalne ?? ["Własne"]);

  // Zabezpieczenie kategorii treningu
  const finalKategorie = (input.kategorie_treningu && input.kategorie_treningu.length > 0 && JSON.stringify(input.kategorie_treningu) !== JSON.stringify(["all", "Kalistenika", "FBW", "Cross"]))
    ? input.kategorie_treningu
    : (baseBuiltIn?.kategorie_treningu ?? input.kategorie_treningu ?? ["all", "Kalistenika", "FBW", "Cross"]);

  const finalPartie = (input.glowne_partie && input.glowne_partie.length > 0)
    ? input.glowne_partie
    : (baseBuiltIn?.glowne_partie ?? ["Wszystkie / Uniwersalne"]);

  const finalSegmentId = input.segment_id ?? baseBuiltIn?.segment_id ?? 99;
  const finalSegmentNazwa = input.segment_nazwa ?? baseBuiltIn?.segment_nazwa ?? "NIEWYBRANY / OGÓLNE";

  return {
    id_cwiczenia: generatedId,
    nazwa: input.nazwa.trim(),
    wariant: input.wariant?.trim() ?? baseBuiltIn?.wariant ?? "",
    segment_id: finalSegmentId,
    segment_nazwa: finalSegmentNazwa,
    tryb_pracy: input.tryb_pracy ?? baseBuiltIn?.tryb_pracy ?? "Solo",
    poziom: input.poziom ?? baseBuiltIn?.poziom ?? 0,
    glowne_partie: finalPartie,
    zaangazowane_miesnie: finalMiesnie,
    tagi_specjalne: finalTagi,
    kategorie_treningu: finalKategorie,
    instrukcja: input.instrukcja?.trim() || baseBuiltIn?.instrukcja || "Brak opisu (dodano w trybie szybkim)",
    wymagania_sprzetowe: finalEquipment,
    biomechanika: finalBiomechanika,
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
  wymuszona_w_obwodzie?: boolean;
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
  reguly_przeplywu_i_kolizji?: Record<string, string>;
  zakazane_tryby_pracy?: Array<"Solo" | "W_Parze">;
  isCustom?: boolean;
  isOverridden?: boolean;
}

export const createDefaultRoom = (input: {
  id_sali?: string;
  nazwa_sali: string;
  tryb_treningu?: "obwodowy" | "synchroniczny";
  maksymalna_pojemnosc?: { osoby: number; stacje: number };
  inwentarz?: Record<string, number>;
  strefy?: Zone[];
  reguly_przeplywu_i_kolizji?: Record<string, string>;
  zakazane_tryby_pracy?: Array<"Solo" | "W_Parze">;
  isOverridden?: boolean;
}): RoomConfig => {
  const isBuiltInId = input.id_sali && !input.id_sali.startsWith('custom-room-');
  const isOverridden = input.isOverridden ?? (isBuiltInId ? true : false);

  return {
    id_sali: input.id_sali || `custom-room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    nazwa_sali: input.nazwa_sali.trim(),
    tryb_treningu: input.tryb_treningu ?? "obwodowy",
    maksymalna_pojemnosc: input.maksymalna_pojemnosc ?? { osoby: 20, stacje: 10 },
    inwentarz: input.inwentarz ?? {},
    strefy: input.strefy && input.strefy.length > 0 ? input.strefy : [
      {
        id: `strefa_${Date.now()}_1`,
        nazwa: "Główna Przestrzeń Treningowa",
        kolejnosc_sortowania: 1,
        typ: "elastyczny",
        bazowa_pojemnosc_stacji: input.maksymalna_pojemnosc?.stacje ?? 10,
      }
    ],
    reguly_przeplywu_i_kolizji: input.reguly_przeplywu_i_kolizji ?? {},
    zakazane_tryby_pracy: input.zakazane_tryby_pracy ?? [],
    isCustom: true,
    isOverridden: isOverridden,
  };
};

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

export interface EquipmentItem {
  id: string;
  nazwa: string;
  opis?: string;
  isCustom?: boolean;
  isOverridden?: boolean;
}

export const normalizeEquipmentKey = (name: string): string => {
  if (!name) return '';
  const plMap: Record<string, string> = {
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'a', 'Ć': 'c', 'Ę': 'e', 'Ł': 'l', 'Ń': 'n', 'Ó': 'o', 'Ś': 's', 'Ź': 'z', 'Ż': 'z',
  };
  let result = name.split('').map(char => plMap[char] || char).join('');
  result = result
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return result || `sprzet_${Date.now()}`;
};

export const createDefaultEquipment = (input: {
  id?: string;
  nazwa: string;
  opis?: string;
  isOverridden?: boolean;
}): EquipmentItem => {
  const generatedId = input.id ? input.id.trim() : normalizeEquipmentKey(input.nazwa);
  const isBuiltIn = ALL_EQUIPMENT.includes(generatedId);
  const isOverridden = input.isOverridden ?? (isBuiltIn ? true : false);

  return {
    id: generatedId,
    nazwa: input.nazwa.trim(),
    opis: input.opis?.trim() || "",
    isCustom: true,
    isOverridden: isOverridden,
  };
};

export const formatEquipmentName = (key: string): string => {
  if (!key) return '';
  const dictionary: Record<string, string> = {
    ab_wheel: "AB Wheel (Kółko)",
    bloczek_joga: "Bloczek do jogi",
    box_plyometryczny_miekki_ciezki: "Box miękki / ciężki",
    box_posladki: "Box do pośladków",
    brama_rig: "Brama / RIG",
    drabinka_pionowa: "Drabinka pionowa",
    drabinka_pozioma: "Drabinka pozioma",
    drazek: "Drążek",
    gryf_olimpijski: "Gryf olimpijski",
    guma_oporowa_dluga: "Guma oporowa długa",
    guma_oporowa_mini: "Guma oporowa mini",
    hantel: "Hantel / Hantle",
    kamizelka_obciazeniowa: "Kamizelka obciążeniowa",
    kettlebell: "Kettlebell",
    kij_drewniany: "Kij drewniany",
    klin: "Klin mobilizacyjny",
    kolko_gimnastyczne: "Kółka gimnastyczne",
    kulki_drazek: "Kulki na drążek",
    mata: "Mata do ćwiczeń",
    materac: "Materac ochronny",
    nunczako: "Nunczako / Uchwyty",
    obciazenia_kostki: "Obciążniki na kostki",
    paraletka: "Paraletki",
    pilka_bosu: "Piłka Bosu",
    pilka_gimnastyczna: "Piłka gimnastyczna",
    pilka_lekarska: "Piłka lekarska",
    pilka_materialowa: "Piłka materiałowa",
    pilka_tenisowa: "Piłka tenisowa",
    porecz_dip: "Poręcze do dipów",
    ramiona_asekuracyjne: "Ramiona asekuracyjne",
    recznik: "Ręcznik",
    roller: "Roller / Wałek",
    sciana_handstand: "Ściana do Handstandu",
    skakanka: "Skakanka",
    skrzynia_drewniana: "Skrzynia drewniana",
    stepper: "Stepper",
    sztanga_5kg: "Sztanga 5kg",
    talerz: "Talerz / Obciążenie",
    trx: "Taśmy TRX",
    uchwyt_sztangi_rig: "Uchwyt sztangi RIG",
    worek_obciazeniowy: "Worek obciążeniowy",
  };

  if (dictionary[key]) return dictionary[key];
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const getDifficultyById = (id: string) => 
  DIFFICULTY_LEVELS.find(l => l.id === id) || DIFFICULTY_LEVELS[1];
