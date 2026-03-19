'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative exercises.
 * Gemini AI is used here as an "intelligent assistant" to suggest smart replacements 
 * based on complex station constraints.
 * 
 * Note: The core generator remains offline-first (client-side). 
 * This AI flow is an online-only enhancement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExerciseSchema = z.object({
  id_cwiczenia: z.string().optional(),
  nazwa: z.string().describe('The name of the exercise.'),
  wariant: z.string().optional(),
  segment_id: z.number().optional(),
  segment_nazwa: z.string().describe('The segment type the exercise belongs to (e.g., PUSH, PULL, DYNAMIKA).'),
  tryb_pracy: z.enum(['Solo', 'W_Parze']).describe('Work mode.'),
  wymagany_sprzet: z.string().describe('Equipment string.'),
  biomechanika: z.string().optional(),
  poziom: z.number().describe('Difficulty level.'),
  glowne_partie: z.array(z.string()).describe('Main body parts.'),
  zaangazowane_miesnie: z.string().optional(),
  tagi_specjalne: z.array(z.string()).describe('Tags.'),
  kategorie_treningu: z.array(z.string()).describe('Categories.'),
  instrukcja: z.string().describe('Brief instruction.'),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

const StationContextSchema = z.object({
  stationName: z.string().describe('The name of the training station (e.g., "Stacja 1: Ściana Startowa").'),
  numParticipants: z.number().int().min(1).max(14).describe('The number of participants in the training session.'),
  difficultyLevelName: z.string().describe('The name of the selected difficulty level for the training.'),
  availableEquipmentAtStation: z.array(z.string()).describe('A list of equipment names available at this specific station.'),
  segmentType: z.string().describe('The segment type of the current exercise (e.g., PUSH, PULL, DYNAMIKA).'),
  otherExercisesInStation: z.array(z.string()).describe('Names of other exercises currently assigned to this station, to avoid duplication.'),
}).describe('Contextual information about the training station.');
export type StationContext = z.infer<typeof StationContextSchema>;

const RerollExerciseSuggestionInputSchema = z.object({
  currentExercise: z.any().describe('The exercise object that needs to be replaced.'),
  stationContext: StationContextSchema.describe('Contextual information about the training station.'),
  allExercisesData: z.string().describe('JSON string of all available exercises.'),
  allEquipmentData: z.string().describe('JSON string of all available equipment.'),
  allDifficultyLevelsData: z.string().describe('JSON string of all defined difficulty levels.'),
  allSegmentsData: z.string().describe('JSON string of all defined segments.'),
}).describe('Input for requesting an alternative exercise suggestion.');
export type RerollExerciseSuggestionInput = z.infer<typeof RerollExerciseSuggestionInputSchema>;

const RerollExerciseSuggestionOutputSchema = z.object({
  suggestedExercise: ExerciseSchema.describe('The suggested alternative exercise object.'),
  reasoning: z.string().optional().describe('An optional explanation for why this exercise was suggested.'),
}).describe('Output for the suggested alternative exercise.');
export type RerollExerciseSuggestionOutput = z.infer<typeof RerollExerciseSuggestionOutputSchema>;

export async function rerollExerciseSuggestion(input: RerollExerciseSuggestionInput): Promise<RerollExerciseSuggestionOutput> {
  return rerollExerciseSuggestionFlow(input);
}

const rerollExercisePrompt = ai.definePrompt({
  name: 'rerollExercisePrompt',
  input: { 
    schema: RerollExerciseSuggestionInputSchema.extend({
      currentExerciseJson: z.string(),
      stationContextJson: z.string(),
    }) 
  },
  output: { schema: RerollExerciseSuggestionOutputSchema },
  prompt: `You are an AI personal trainer assistant specializing in group training programs. Your goal is to suggest a single, compatible alternative exercise for a given station context.

CRITICAL RULE:
If 'numParticipants' in 'stationContext' is 7 or less, the workout is in SOLO mode. In SOLO mode, you MUST NOT suggest any exercise where 'tryb_pracy' is 'W_Parze' or the segment is 'PARTNER'.

Here is the current exercise to replace:
\`\`\`json
{{{currentExerciseJson}}}
\`\`\`

Here is the context of the training station:
\`\`\`json
{{{stationContextJson}}}
\`\`\`

Here are all available exercises from the database:
\`\`\`json
{{{allExercisesData}}}
\`\`\`

Considering the 'stationContext' (equipment, difficulty, segment), find an exercise that is functionally similar to 'currentExercise'. 
The suggested exercise MUST:
1. Use equipment available at the station.
2. Match the difficulty level range.
3. Match the segment type.
4. NOT be the same as 'currentExercise' or 'otherExercisesInStation'.
5. If numParticipants <= 7, it MUST be a 'Solo' exercise.

Provide the suggestion in the following JSON format, preserving all original fields from the database schema:
`,
});

const rerollExerciseSuggestionFlow = ai.defineFlow(
  {
    name: 'rerollExerciseSuggestionFlow',
    inputSchema: RerollExerciseSuggestionInputSchema,
    outputSchema: RerollExerciseSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await rerollExercisePrompt({
      ...input,
      currentExerciseJson: JSON.stringify(input.currentExercise, null, 2),
      stationContextJson: JSON.stringify(input.stationContext, null, 2),
    });
    if (!output) {
      throw new Error('Failed to get a suggestion from the AI.');
    }
    return output;
  }
);
