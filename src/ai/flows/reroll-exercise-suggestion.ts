'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative exercises.
 *
 * - rerollExerciseSuggestion - A function that handles the exercise re-roll process.
 * - RerollExerciseSuggestionInput - The input type for the rerollExerciseSuggestion function.
 * - RerollExerciseSuggestionOutput - The return type for the rerollExerciseSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExerciseSchema = z.object({
  name: z.string().describe('The name of the exercise.'),
  description: z.string().describe('A brief description of the exercise.'),
  tags: z.array(z.string()).describe('Keywords or categories associated with the exercise (e.g., "chest", "compound").'),
  equipment: z.array(z.string()).describe('A list of equipment names required for the exercise.'),
  segment: z.string().describe('The segment type the exercise belongs to (e.g., PUSH, PULL, DYNAMIKA).'),
  difficulty_level: z.object({
    min: z.number().describe('Minimum difficulty level for the exercise.'),
    max: z.number().describe('Maximum difficulty level for the exercise.'),
  }).describe('The recommended difficulty level range for the exercise.'),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

const EquipmentSchema = z.object({
  name: z.string().describe('The name of the equipment.'),
  description: z.string().describe('A description of the equipment.'),
});
export type Equipment = z.infer<typeof EquipmentSchema>;

const DifficultyLevelSchema = z.object({
  level: z.string().describe('The name of the difficulty level (e.g., "Beginner", "Intermediate").'),
  min_participants: z.number().describe('Minimum number of participants for this difficulty.'),
  max_participants: z.number().describe('Maximum number of participants for this difficulty.'),
  difficulty_params: z.any().describe('Additional parameters for this difficulty level.'),
});
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;

const SegmentSchema = z.object({
  name: z.string().describe('The name of the segment (e.g., PUSH, PULL, DYNAMIKA).'),
  description: z.string().describe('A description of the segment.'),
  type: z.string().describe('The type or category of the segment.'),
});
export type Segment = z.infer<typeof SegmentSchema>;

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
  currentExercise: ExerciseSchema.describe('The exercise object that needs to be replaced.'),
  stationContext: StationContextSchema.describe('Contextual information about the training station.'),
  allExercisesData: z.string().describe('JSON string of all available exercises (from lista_cwiczen.json).'),
  allEquipmentData: z.string().describe('JSON string of all available equipment (from lista_sprzetu.json).'),
  allDifficultyLevelsData: z.string().describe('JSON string of all defined difficulty levels (from poziomy_trudnosci.json).'),
  allSegmentsData: z.string().describe('JSON string of all defined segments (from segmenty.json).'),
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
  prompt: `You are an AI personal trainer assistant specializing in group training programs. Your goal is to suggest a single, compatible alternative exercise for a given station context and a current exercise that needs replacement. You must ensure the suggested exercise fits all constraints.

Here is the current exercise to replace:
\```json
{{{currentExerciseJson}}}
\```

Here is the context of the training station where the exercise will be performed:
\```json
{{{stationContextJson}}}
\```

Here are all available exercises from the exercise database:
\```json
{{{allExercisesData}}}
\```

Here are all available equipment items:
\```json
{{{allEquipmentData}}}
\```

Here are all defined difficulty levels:
\```json
{{{allDifficultyLevelsData}}}
\```

Here are all defined segments:
\```json
{{{allSegmentsData}}}
\```

Considering the 'stationContext', specifically 'availableEquipmentAtStation', 'difficultyLevelName', and 'segmentType', and trying to find an exercise that is functionally similar or complementary to the 'currentExercise' (e.g., targeting similar muscle groups, using similar movement patterns, or fitting the same segment type), suggest ONE alternative exercise. The alternative exercise MUST use only equipment available at the station and match the overall difficulty level and segment type. The suggested exercise MUST NOT be the same as the 'currentExercise' or any of the 'otherExercisesInStation'. If no perfectly matching exercise can be found, prioritize equipment and segment type over exact difficulty match, but explain the compromise in the 'reasoning'.

Provide the suggestion in the following JSON format, including a 'reasoning' field:
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