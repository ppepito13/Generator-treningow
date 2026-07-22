export type StepColor = 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'purple' | 'gray';

export interface IntervalStep {
  id: string;
  nazwa: string;            // np. "Praca stacyjna", "Przejście", "Rozgrzewka"
  durationSeconds: number; // np. 30s
  color: StepColor;        // Kolor tła / akcentu
}

export interface IntervalBlock {
  id: string;
  nazwaBloku: string;              // np. "Rozgrzewka", "Obwód Główny", "Schłodzenie"
  typ: 'single' | 'loop';         // Pojedynczy krok vs Pętla powtórzeniowa
  
  // Gdy typ === 'single'
  singleStep?: IntervalStep;
  
  // Gdy typ === 'loop'
  loopSteps?: IntervalStep[];      // np. [ { nazwa: "Ćwiczenie", 30s }, { nazwa: "Zmiana", 5s } ]
  roundsCount?: number;            // np. 6 powtórzeń / serii
  skipLastRestInLoop?: boolean;   // Pomiń ostatnie przejście/przerwę w ostatniej rundzie pętli!
}

export interface IntervalPreset {
  id: string;
  nazwa: string;                  // np. "Obwód 7 Stacji", "Tabata Pro"
  opis?: string;
  bloki: IntervalBlock[];
  isCustom?: boolean;
}

export interface LapRecord {
  id: number;
  lapTimeMs: number;       // Czas tego konkretnego okrążenia
  totalTimeMs: number;     // Skumulowany czas całkowity od początku
}

export type TTSReadoutOption = 'stepName' | 'blockName' | 'both' | 'off';
export type TTSCountdownOption = 'beeps' | 'voice' | 'both' | 'none';

export interface TimerAudioSettings {
  soundEnabled: boolean;
  ttsEnabled: boolean;
  ttsOption: TTSReadoutOption;
  ttsCountdownOption: TTSCountdownOption;
  volume: number; // 0.0 - 1.0
}

// Kolory CSS i klasy stylów dla poszczególnych kolorów kroków
export const STEP_COLOR_MAP: Record<StepColor, {
  name: string;
  bg: string;
  text: string;
  border: string;
  hex: string;
  darkBg: string;
}> = {
  green: {
    name: 'Zieleń (Praca)',
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    hex: '#10b981',
    darkBg: 'bg-[#022c22]', // 100% nieprzezroczyste ciemne morze
  },
  red: {
    name: 'Czerwień (Przerwa / Zmiana)',
    bg: 'bg-rose-500',
    text: 'text-rose-400',
    border: 'border-rose-500/40',
    hex: '#f43f5e',
    darkBg: 'bg-[#4c0519]', // 100% nieprzezroczysty ciemny róż/czerwień
  },
  blue: {
    name: 'Niebieski (Przerwa Główna)',
    bg: 'bg-indigo-500',
    text: 'text-indigo-400',
    border: 'border-indigo-500/40',
    hex: '#6366f1',
    darkBg: 'bg-[#1e1b4b]', // 100% nieprzezroczysty ciemny granat
  },
  yellow: {
    name: 'Żółty (Rozgrzewka)',
    bg: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    hex: '#f59e0b',
    darkBg: 'bg-[#451a03]', // 100% nieprzezroczysty ciemny bursztyn
  },
  orange: {
    name: 'Pomarańczowy (Przygotowanie)',
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500/40',
    hex: '#f97316',
    darkBg: 'bg-[#431407]', // 100% nieprzezroczysty ciemny pomarańcz
  },
  purple: {
    name: 'Fiolet (Schłodzenie)',
    bg: 'bg-purple-500',
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    hex: '#a855f7',
    darkBg: 'bg-[#3b0764]', // 100% nieprzezroczysty ciemny fiolet
  },
  gray: {
    name: 'Szary (Pauza / Neutralny)',
    bg: 'bg-slate-600',
    text: 'text-slate-400',
    border: 'border-slate-500/40',
    hex: '#64748b',
    darkBg: 'bg-[#0f172a]', // 100% nieprzezroczysty ciemny szary
  },
};

// Domyślne Presety Fabryczne
export const BUILTIN_INTERVAL_PRESETS: IntervalPreset[] = [
  {
    id: 'tabata_standard',
    nazwa: 'Tabata (20s / 10s x 8 RUND)',
    opis: 'Klasyczny protokół Tabaty: 8 rund po 20s pracy z 10s przerwą.',
    bloki: [
      {
        id: 'blk_prep',
        nazwaBloku: 'Przygotowanie',
        typ: 'single',
        singleStep: { id: 'stp_prep', nazwa: 'Przygotowanie', durationSeconds: 10, color: 'yellow' },
      },
      {
        id: 'blk_tabata',
        nazwaBloku: 'Pętla Tabata',
        typ: 'loop',
        roundsCount: 8,
        skipLastRestInLoop: true,
        loopSteps: [
          { id: 'stp_work', nazwa: 'Praca (Maksimum)', durationSeconds: 20, color: 'green' },
          { id: 'stp_rest', nazwa: 'Odpoczynek', durationSeconds: 10, color: 'red' },
        ],
      },
      {
        id: 'blk_cool',
        nazwaBloku: 'Rozciąganie',
        typ: 'single',
        singleStep: { id: 'stp_cool', nazwa: 'Schłodzenie', durationSeconds: 60, color: 'purple' },
      },
    ],
  },
  {
    id: 'obwod_stacyjny_standard',
    nazwa: 'Obwód Stacyjny 45/15 (7 Stacji x 2 Serie)',
    opis: 'Pełny obwód stacyjny: 7 stacji (45s praca / 15s zmiana), 2 serie oddzielone przerwą 2 min.',
    bloki: [
      {
        id: 'blk_warmup',
        nazwaBloku: 'Rozgrzewka',
        typ: 'single',
        singleStep: { id: 'stp_warm', nazwa: 'Rozgrzewka Ogólna', durationSeconds: 60, color: 'yellow' },
      },
      {
        id: 'blk_series_1',
        nazwaBloku: 'Seria 1 - Obwód (7 Stacji)',
        typ: 'loop',
        roundsCount: 7,
        skipLastRestInLoop: true,
        loopSteps: [
          { id: 'stp_work_st1', nazwa: 'Praca na Stacji', durationSeconds: 45, color: 'green' },
          { id: 'stp_move_st1', nazwa: 'Zmiana Stacji', durationSeconds: 15, color: 'red' },
        ],
      },
      {
        id: 'blk_set_rest',
        nazwaBloku: 'Przerwa Między Seriami',
        typ: 'single',
        singleStep: { id: 'stp_set_rest', nazwa: 'Odpoczynek Między Seriami', durationSeconds: 120, color: 'blue' },
      },
      {
        id: 'blk_series_2',
        nazwaBloku: 'Seria 2 - Obwód (7 Stacji)',
        typ: 'loop',
        roundsCount: 7,
        skipLastRestInLoop: true,
        loopSteps: [
          { id: 'stp_work_st2', nazwa: 'Praca na Stacji', durationSeconds: 45, color: 'green' },
          { id: 'stp_move_st2', nazwa: 'Zmiana Stacji', durationSeconds: 15, color: 'red' },
        ],
      },
      {
        id: 'blk_cool',
        nazwaBloku: 'Rozciąganie',
        typ: 'single',
        singleStep: { id: 'stp_cool', nazwa: 'Schłodzenie i Rozciąganie', durationSeconds: 120, color: 'purple' },
      },
    ],
  },
  {
    id: 'emom_10min',
    nazwa: 'EMOM 10 Minut (10 RUND x 60s)',
    opis: 'Every Minute on the Minute: co 60 sekund rozpoczyna się nowa minuta pracy przez 10 minut.',
    bloki: [
      {
        id: 'blk_prep_emom',
        nazwaBloku: 'Przygotowanie',
        typ: 'single',
        singleStep: { id: 'stp_prep_e', nazwa: 'Przygotowanie', durationSeconds: 10, color: 'yellow' },
      },
      {
        id: 'blk_emom',
        nazwaBloku: 'EMOM 10 min',
        typ: 'loop',
        roundsCount: 10,
        skipLastRestInLoop: false,
        loopSteps: [
          { id: 'stp_emom_work', nazwa: 'Praca w Minucie', durationSeconds: 60, color: 'green' },
        ],
      },
      {
        id: 'blk_cool_emom',
        nazwaBloku: 'Schłodzenie',
        typ: 'single',
        singleStep: { id: 'stp_cool_e', nazwa: 'Rozciąganie', durationSeconds: 60, color: 'purple' },
      },
    ],
  },
  {
    id: 'hiit_30_30',
    nazwa: 'HIIT 30s / 30s (10 RUND)',
    opis: 'Interwał wysiłkowy: 10 rund po 30s intensywnej pracy na 30s pełnego odpoczynku.',
    bloki: [
      {
        id: 'blk_hiit_warm',
        nazwaBloku: 'Rozgrzewka',
        typ: 'single',
        singleStep: { id: 'stp_hiit_w_step', nazwa: 'Rozgrzewka', durationSeconds: 60, color: 'yellow' },
      },
      {
        id: 'blk_hiit',
        nazwaBloku: 'Główna Pętla HIIT',
        typ: 'loop',
        roundsCount: 10,
        skipLastRestInLoop: true,
        loopSteps: [
          { id: 'stp_hiit_w', nazwa: 'Intensywna Praca', durationSeconds: 30, color: 'green' },
          { id: 'stp_hiit_r', nazwa: 'Odpoczynek', durationSeconds: 30, color: 'red' },
        ],
      },
      {
        id: 'blk_hiit_cool',
        nazwaBloku: 'Schłodzenie',
        typ: 'single',
        singleStep: { id: 'stp_hiit_c', nazwa: 'Rozciąganie', durationSeconds: 60, color: 'purple' },
      },
    ],
  },
];
