
"use client";

import React, { useState } from 'react';
import { Station, Exercise, ALL_EXERCISES, ALL_EQUIPMENT, DIFFICULTY_LEVELS, SEGMENTS, getDifficultyById } from '@/app/lib/data';
import { useAppStore } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rerollExerciseSuggestion } from '@/ai/flows/reroll-exercise-suggestion';
import { toast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  station: Station;
}

export const StationCard = ({ station }: Props) => {
  const { updateExercise, participants, difficultyId } = useAppStore();
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const difficulty = getDifficultyById(difficultyId);

  const handleReroll = async (type: 'A' | 'B') => {
    const setLoading = type === 'A' ? setLoadingA : setLoadingB;
    const currentEx = type === 'A' ? station.exerciseA : station.exerciseB;
    
    if (!currentEx) return;

    setLoading(true);
    try {
      const result = await rerollExerciseSuggestion({
        currentExercise: currentEx,
        stationContext: {
          stationName: station.zone.nazwa,
          numParticipants: participants,
          difficultyLevelName: difficulty.nazwa_grupy,
          availableEquipmentAtStation: station.zone.przypisany_sprzet || ALL_EQUIPMENT,
          segmentType: currentEx.segment_nazwa,
          otherExercisesInStation: [
            type === 'A' ? (station.exerciseB?.nazwa || '') : station.exerciseA.nazwa
          ].filter(Boolean)
        },
        allExercisesData: JSON.stringify(ALL_EXERCISES),
        allEquipmentData: JSON.stringify(ALL_EQUIPMENT),
        allDifficultyLevelsData: JSON.stringify(DIFFICULTY_LEVELS),
        allSegmentsData: JSON.stringify(SEGMENTS)
      });

      // Transformacja z powrotem na format lokalny
      const transformed: any = {
        ...result.suggestedExercise,
        nazwa: (result.suggestedExercise as any).name || (result.suggestedExercise as any).nazwa,
        instrukcja: (result.suggestedExercise as any).description || (result.suggestedExercise as any).instrukcja,
        wymagany_sprzet: Array.isArray((result.suggestedExercise as any).equipment) ? (result.suggestedExercise as any).equipment.join(', ') : (result.suggestedExercise as any).wymagany_sprzet
      };

      updateExercise(station.id, type, transformed);
    } catch (error) {
      console.error(error);
      toast({
        title: "Błąd re-rollu",
        description: "Nie udało się zaproponować nowego ćwiczenia. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const ExerciseSubCard = ({ ex, type, isLoading }: { ex: Exercise, type: 'A' | 'B', isLoading: boolean }) => (
    <div className={`relative p-5 rounded-2xl border transition-all ${type === 'B' ? 'bg-secondary/5 border-secondary/10' : 'bg-white/5 border-white/5'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <span className={`text-[10px] uppercase tracking-widest font-bold ${type === 'B' ? 'text-secondary' : 'text-primary/70'}`}>
            {station.isPair ? `Uczestnik ${type}` : `Ćwiczenie`}
          </span>
          <h3 className="text-lg font-bold leading-tight">{ex.nazwa}</h3>
        </div>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg glass-button opacity-50 hover:opacity-100">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs glass-card p-4">
                <p className="text-xs leading-relaxed">{ex.instrukcja}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            variant="ghost" 
            size="icon" 
            disabled={isLoading}
            onClick={() => handleReroll(type)}
            className={`h-8 w-8 rounded-lg glass-button ${type === 'B' ? 'text-secondary' : 'text-primary'}`}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-tight text-white/80">
        <Dumbbell className={`h-3.5 w-3.5 ${type === 'B' ? 'text-secondary' : 'text-primary'}`} />
        <span>{ex.wymagany_sprzet}</span>
      </div>

      <div className="flex gap-1 mt-3 flex-wrap">
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 uppercase font-medium">{ex.segment_nazwa}</span>
        {ex.tagi_specjalne?.map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">#{tag}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01]">
      <div className="bg-primary/10 p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-white">{station.zone.nazwa}</h2>
        </div>
        {station.zone.uwagi && (
          <span className="text-[9px] text-destructive font-bold uppercase px-2 py-1 bg-destructive/10 rounded-md">
            {station.zone.uwagi}
          </span>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        <ExerciseSubCard ex={station.exerciseA} type="A" isLoading={loadingA} />
        {station.exerciseB && station.exerciseB.id_cwiczenia !== station.exerciseA.id_cwiczenia && (
          <ExerciseSubCard ex={station.exerciseB} type="B" isLoading={loadingB} />
        )}
        {station.exerciseB && station.exerciseB.id_cwiczenia === station.exerciseA.id_cwiczenia && (
          <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 text-center">
            <p className="text-[10px] text-secondary font-bold uppercase">Praca wspólna / Synchroniczna</p>
          </div>
        )}
      </div>
    </div>
  );
};
