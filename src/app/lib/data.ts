import { Exercise, Equipment, DifficultyLevel, Segment } from "@/ai/flows/reroll-exercise-suggestion";
import exercises from './data/lista_cwiczen.json';
import equipment from './data/lista_sprzetu.json';
import levels from './data/poziomy_trudnosci.json';
import segments from './data/segmenty.json';

export const MOCK_EQUIPMENT: Equipment[] = equipment;
export const MOCK_DIFFICULTY_LEVELS: DifficultyLevel[] = levels;
export const MOCK_SEGMENTS: Segment[] = segments;
export const MOCK_EXERCISES: Exercise[] = exercises;

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