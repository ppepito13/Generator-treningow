"use client";

import React, { useState } from 'react';
import { Station, Exercise, MOCK_EXERCISES, MOCK_EQUIPMENT, MOCK_DIFFICULTY_LEVELS, MOCK_SEGMENTS } from '@/app/lib/data';
import { useAppStore } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { rerollExerciseSuggestion } from '@/ai/flows/reroll-exercise-suggestion';
import { toast } from '@/hooks/use-toast';

interface Props {
  station: Station;
}

export const StationCard = ({ station }: Props) => {
  const { updateExercise, participants, difficulty } = useAppStore();
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const handleReroll = async (type: 'A' | 'B') => {
    const setLoading = type === 'A' ? setLoadingA : setLoadingB;
    const currentEx = type === 'A' ? station.exerciseA : station.exerciseB;
    
    if (!currentEx) return;

    setLoading(true);
    try {
      const result = await rerollExerciseSuggestion({
        currentExercise: currentEx,
        stationContext: {
          stationName: station.zone,
          numParticipants: participants,
          difficultyLevelName: difficulty,
          availableEquipmentAtStation: MOCK_EQUIPMENT.map(e => e.name),
          segmentType: currentEx.segment,
          otherExercisesInStation: [
            type === 'A' ? (station.exerciseB?.name || '') : station.exerciseA.name
          ].filter(Boolean)
        },
        allExercisesData: JSON.stringify(MOCK_EXERCISES),
        allEquipmentData: JSON.stringify(MOCK_EQUIPMENT),
        allDifficultyLevelsData: JSON.stringify(MOCK_DIFFICULTY_LEVELS),
        allSegmentsData: JSON.stringify(MOCK_SEGMENTS)
      });

      updateExercise(station.id, type, result.suggestedExercise);
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
    <div className="relative p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-primary/70 font-bold">Ćwiczenie {type}</span>
          <h3 className="text-lg font-bold leading-tight">{ex.name}</h3>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          disabled={isLoading}
          onClick={() => handleReroll(type)}
          className="h-10 w-10 rounded-xl glass-button text-primary hover:text-primary transition-colors"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-secondary font-medium">
        <Dumbbell className="h-4 w-4" />
        <span className="font-bold uppercase tracking-tight">{ex.equipment.join(', ')}</span>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2">{ex.description}</p>
      
      <div className="flex gap-1 flex-wrap">
        {ex.tags.map(tag => (
          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/50">#{tag}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden transition-all hover:scale-[1.01] hover:shadow-primary/5">
      <div className="bg-primary/10 p-4 border-b border-white/5 flex items-center gap-3">
        <div className="bg-primary/20 p-2 rounded-lg">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white">{station.zone}</h2>
      </div>
      
      <div className="p-4 space-y-4">
        <ExerciseSubCard ex={station.exerciseA} type="A" isLoading={loadingA} />
        {station.exerciseB && (
          <ExerciseSubCard ex={station.exerciseB} type="B" isLoading={loadingB} />
        )}
      </div>
    </div>
  );
};