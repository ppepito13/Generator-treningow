import { Exercise, Equipment, DifficultyLevel, Segment } from "@/ai/flows/reroll-exercise-suggestion";

export const MOCK_EQUIPMENT: Equipment[] = [
  { name: "Kettlebell", description: "Ciężarek w kształcie kuli z uchwytem." },
  { name: "Sztanga", description: "Długi gryf z obciążeniem." },
  { name: "Drążek", description: "Przyrząd do podciągania." },
  { name: "Hantle", description: "Krótkie gryfy z obciążeniem." },
  { name: "Guma oporowa", description: "Elastyczna taśma do ćwiczeń." },
  { name: "Pudełko (Plyo Box)", description: "Skrzynia do skoków." },
  { name: "Brak", description: "Ćwiczenie z masą własnego ciała." }
];

export const MOCK_DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { level: "Początkujący", min_participants: 1, max_participants: 14, difficulty_params: {} },
  { level: "Średniozaawansowany", min_participants: 1, max_participants: 14, difficulty_params: {} },
  { level: "Zaawansowany", min_participants: 1, max_participants: 14, difficulty_params: {} }
];

export const MOCK_SEGMENTS: Segment[] = [
  { name: "PUSH", description: "Ruchy pchające", type: "STRENGHT" },
  { name: "PULL", description: "Ruchy ciągnące", type: "STRENGHT" },
  { name: "DYNAMIKA", description: "Ruchy eksplozywne", type: "POWER" },
  { name: "CORE", description: "Stabilizacja centralna", type: "STABILITY" }
];

export const MOCK_EXERCISES: Exercise[] = [
  {
    name: "Pompki Klasyczne",
    description: "Podstawowe ćwiczenie klatki piersiowej i tricepsów.",
    tags: ["chest", "push", "bodyweight"],
    equipment: ["Brak"],
    segment: "PUSH",
    difficulty_level: { min: 1, max: 3 }
  },
  {
    name: "Podciąganie na drążku",
    description: "Budowanie siły pleców i bicepsów.",
    tags: ["back", "pull", "upper body"],
    equipment: ["Drążek"],
    segment: "PULL",
    difficulty_level: { min: 2, max: 5 }
  },
  {
    name: "Przysiady ze sztangą",
    description: "Królewskie ćwiczenie nóg.",
    tags: ["legs", "squat", "compound"],
    equipment: ["Sztanga"],
    segment: "PUSH",
    difficulty_level: { min: 2, max: 5 }
  },
  {
    name: "Swing Kettlebell",
    description: "Dynamiczny ruch bioder.",
    tags: ["hips", "glutes", "explosive"],
    equipment: ["Kettlebell"],
    segment: "DYNAMIKA",
    difficulty_level: { min: 1, max: 4 }
  },
  {
    name: "Plank (Deska)",
    description: "Izometryczne napięcie brzucha.",
    tags: ["abs", "core", "stability"],
    equipment: ["Brak"],
    segment: "CORE",
    difficulty_level: { min: 1, max: 3 }
  },
  {
    name: "Wyciskanie Hantli stojąc",
    description: "Siła barków i stabilizacja.",
    tags: ["shoulders", "push"],
    equipment: ["Hantle"],
    segment: "PUSH",
    difficulty_level: { min: 2, max: 4 }
  },
  {
    name: "Wiosłowanie Hantlem",
    description: "Jednostronne budowanie pleców.",
    tags: ["back", "pull"],
    equipment: ["Hantle"],
    segment: "PULL",
    difficulty_level: { min: 1, max: 4 }
  },
  {
    name: "Box Jumps",
    description: "Skoki na skrzynię dla mocy.",
    tags: ["legs", "explosive", "jump"],
    equipment: ["Pudełko (Plyo Box)"],
    segment: "DYNAMIKA",
    difficulty_level: { min: 2, max: 4 }
  }
];

export interface Station {
  id: string;
  zone: string;
  exerciseA: Exercise;
  exerciseB?: Exercise;
}

export const MOCK_ROOM_CONFIG = {
  name: "Główna Sala Kinetic",
  zones: [
    "Stacja 1: Ściana Startowa",
    "Stacja 2: Wolne Ciężary",
    "Stacja 3: Strefa Cardio",
    "Stacja 4: Klatka Cross",
    "Stacja 5: Maty Środkowe",
    "Stacja 6: Ściana Tylna"
  ]
};