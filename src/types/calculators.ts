"use client";

export type Gender = 'male' | 'female';

export interface UserProfileData {
  gender: Gender;
  weight: number | null; // kg
  height: number | null; // cm
  age: number | null; // lata
  waist: number | null; // cm
  bodyFat: number | null; // %
  activityLevel: number | null; // PAL (1.2 - 1.9)
}

export type CalculatorTabType = 'math' | 'bmi' | 'rfm' | 'bmr' | 'tdee';

// --- BMI ---
export type BmiCategory = 'niedowaga' | 'norma' | 'nadwaga' | 'otylosc_1' | 'otylosc_2' | 'otylosc_3';

export interface BmiResult {
  value: number;
  category: BmiCategory;
  categoryLabel: string;
  badgeBg: string;
  badgeText: string;
  comment: string;
}

// --- RFM ---
export type RfmCategory = 'sportowa_bardzo_niska' | 'sportowa' | 'zdrowa' | 'lekko_podwyzszona' | 'podwyzszona';

export interface RfmResult {
  value: number;
  category: RfmCategory;
  categoryLabel: string;
  badgeBg: string;
  badgeText: string;
  comment: string;
}

// --- BMR ---
export type BmrFormulaType = 'mifflin' | 'katch_mcardle';

export interface BmrResult {
  value: number; // kcal/dzień
  formulaUsed: BmrFormulaType;
  formulaLabel: string;
  lbmKg?: number; // Lean Body Mass jeśli użyto Katch-McArdle
  comment: string;
}

// --- TDEE ---
export type TdeeMode = 'manual_bmr' | 'auto_bmr';

export interface PALOption {
  value: number;
  label: string;
  description: string;
}

export interface TdeeResult {
  tdee: number; // Utrzymanie
  reduction: number; // Redukcja (-300 kcal)
  mass: number; // Masa (+300 kcal)
  modeUsed: TdeeMode;
  bmrValue: number;
  palValue: number;
  comment: string;
}

// POZIOMY AKTYWNOŚCI PAL
export const PAL_OPTIONS: PALOption[] = [
  {
    value: 1.2,
    label: 'Znikoma (PAL 1.2)',
    description: 'Siedzący tryb życia, brak ćwiczeń fizycznych, praca biurowa',
  },
  {
    value: 1.375,
    label: 'Niska (PAL 1.375)',
    description: 'Lekka aktywność, treningi 1-3 razy w tygodniu lub praca lekko fizyczna',
  },
  {
    value: 1.55,
    label: 'Umiarkowana (PAL 1.55)',
    description: 'Średnia aktywność, regularny trening 3-5 razy w tygodniu',
  },
  {
    value: 1.725,
    label: 'Wysoka (PAL 1.725)',
    description: 'Intensywna aktywność, mocny trening 6-7 razy w tygodniu',
  },
  {
    value: 1.9,
    label: 'Bardzo wysoka (PAL 1.9)',
    description: 'Ciężka praca fizyczna + codzienne bardzo wyczerpujące treningi',
  },
];

// OSTRZEŻENIA ZAKRESÓW WALIDACYJNYCH (NIEBLOKUJĄCE)
export const VALIDATION_LIMITS = {
  weight: { min: 30, max: 250, warning: 'Podana waga wydaje się nietypowa (30-250 kg). Sprawdź, czy nie podano błędnej wartości.' },
  height: { min: 100, max: 230, warning: 'Podany wzrost wydaje się nietypowy (100-230 cm). Zweryfikuj poprawność danych.' },
  age: { min: 10, max: 120, warning: 'Wiek spoza standardowego zakresu (10-120 lat). Sprawdź poprawność wpisu.' },
  waist: { min: 40, max: 200, warning: 'Obwód talii wydaje się nietypowy (40-200 cm). Zweryfikuj pomiar.' },
  bodyFat: { min: 3, max: 60, warning: '% tkanki tłuszczowej spoza typowego zakresu (3-60%). Sprawdź pomiar.' },
};

// DYNAMICZNE KOMENTARZE MOTYWACYJNE I EDUKACYJNE
export function getBmiCommentary(category: BmiCategory, value: number): string {
  switch (category) {
    case 'niedowaga':
      return `Twój wskaźnik BMI (${value}) wskazuje na niedowagę. Jeśli nie jest to zamierzone, warto zadbać o zwiększenie wartości kalorycznej posiłków oraz skonsultować się ze specjalistą. Dołączenie umiarkowanego treningu oporowego pomoże Ci bezpiecznie budować zdrową masę mięśniową!`;
    case 'norma':
      return `Twój wskaźnik BMI (${value}) znajduje się w optymalnej normie! Świetna robota – zachowanie zbilansowanej diety i regularnego ruchu z naszymi generatorami treningowymi pozwoli Ci utrzymać tę wysoką formę na długo.`;
    case 'nadwaga':
      return `Twoje BMI (${value}) wskazuje na nadwagę. Pamiętaj jednak: u osób aktywnych i trenujących siłowo tkanka mięśniowa często zawyża ten wynik! Jeśli nie jesteś sportowcem sylwetkowym, warto przyjrzeć się codziennemu bilansowi kalorycznemu i wdrożyć regularną aktywność fizyczną.`;
    case 'otylosc_1':
    case 'otylosc_2':
    case 'otylosc_3':
    default:
      return `Twoje BMI (${value}) sugeruje podwyższoną masę ciała. Każdy krok w stronę zdrowia ma znaczenie! Warto zacząć od umiarkowanych treningów obwodowych, stopniowego wprowadzania deficytu kalorycznego i ewentualnej konsultacji z lekarzem lub dietetykiem, aby bezpiecznie poprawić kondycję.`;
  }
}

export function getRfmCommentary(category: RfmCategory, value: number, gender: Gender): string {
  switch (category) {
    case 'sportowa_bardzo_niska':
      return `Wynik RFM (${value}%) wskazuje na bardzo niską zawartość tkanki tłuszczowej. Jest to poziom charakterystyczny dla wyczynowych zawodników dyscyplin wytrzymałościowych lub kulturystyki. Pamiętaj o dbanie o regenerację i odpowiednią podaż energii!`;
    case 'sportowa':
      return `Wynik RFM (${value}%) świadczy o bardzo sportowej, atletycznej sylwetce! Stosunek obwodu talii do wzrostu wskazuje na wysoki poziom tkanki mięśniowej i niski poziom tłuszczu wisceralnego.`;
    case 'zdrowa':
      return `Wynik RFM (${value}%) reprezentuje zdrowy i optymalny poziom tkanki tłuszczowej dla ${gender === 'female' ? 'kobiety' : 'mężczyzny'}. Regularny trening i zbalansowane żywienie pozwolą Ci zachować te proporcje!`;
    case 'lekko_podwyzszona':
      return `Wynik RFM (${value}%) wskazuje na lekko podwyższoną zawartość tkanki tłuszczowej w okolicach talii. To doskonały moment na wdrożenie regularnych treningów interwałowych 3-4 razy w tygodniu oraz lekką korektę diety.`;
    case 'podwyzszona':
    default:
      return `Wynik RFM (${value}%) jest podwyższony. Obwód talii to kluczowy wskaźnik zdrowia metabolicznego. Połączenie treningów ogólnorozwojowych z delikatnym deficytem kalorycznym pomoże Ci skutecznie zredukować tłuszcz brzuszny i zyskać energię!`;
  }
}

export function getBmrCommentary(value: number, formulaUsed: BmrFormulaType, gender: Gender, bodyFat: number | null): string {
  if (formulaUsed === 'katch_mcardle') {
    return `Wzór Katch-McArdle wyliczył Twój spoczynkowy metabolizm BMR na ${value} kcal/dobę na podstawie beztłuszczowej masy ciała (LBM). Ponieważ wzór ten bazuje bezpośrednio na ilości czystej tkanki mięśniowej, daje identyczny, bardzo precyzyjny wynik niezależnie od płci!`;
  }
  return `Wzór Mifflin-St Jeor wyliczył Twój spoczynkowy metabolizm BMR na ${value} kcal/dobę dla płci: ${gender === 'male' ? 'Mężczyzna' : 'Kobieta'}. Uwzględnia on różnicę w fizjologicznym zużyciu energii (+5 dla mężczyzn, -161 dla kobiet). To absolutne minimum potrzebne organizmowi do podstawowych funkcji życiowych.`;
}

export function getTdeeCommentary(tdee: number, reduction: number, mass: number, pal: number): string {
  return `Twoje całkowite dzienne zapotrzebowanie kaloryczne (TDEE) przy wybranym poziomie aktywności (PAL ${pal}) wynosi ${tdee} kcal. Chcesz schudnąć? Zastosuj bezpieczny deficyt (~${reduction} kcal). Budujesz masę mięśniową? Wybierz nadwyżkę (~${mass} kcal). Utrzymanie formy? Trzymaj się ${tdee} kcal.`;
}
