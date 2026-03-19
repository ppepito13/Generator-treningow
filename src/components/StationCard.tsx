"use client";

import React from 'react';
import { Station, Exercise } from '@/app/lib/data';
import { useAppStore } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell, Info, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  station: Station;
}

export const StationCard = ({ station }: Props) => {
  const { rerollExercise } = useAppStore();

  const handleReroll = (type: 'A' | 'B') => {
    rerollExercise(station.id, type);
  };

  const isShared = station.exerciseB && station.exerciseB.id_cwiczenia === station.exerciseA.id_cwiczenia;

  const ExerciseSubCard = ({ ex, type, shared = false }: { ex: Exercise, type: 'A' | 'B', shared?: boolean }) => (
    <div className={`relative p-5 rounded-2xl border transition-all ${shared ? 'bg-primary/5 border-primary/20' : type === 'B' ? 'bg-secondary/5 border-secondary/10' : 'bg-white/5 border-white/5'}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] uppercase tracking-widest font-bold ${shared ? 'text-primary' : type === 'B' ? 'text-secondary' : 'text-primary/70'}`}>
              {shared ? "Obaj Uczestnicy" : station.isPair ? `Uczestnik ${type}` : `Ćwiczenie`}
            </span>
            {shared && <Users className="h-3 w-3 text-primary" />}
          </div>
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
            onClick={() => handleReroll(type)}
            className={`h-8 w-8 rounded-lg glass-button ${shared ? 'text-primary' : type === 'B' ? 'text-secondary' : 'text-primary'}`}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-tight text-white/80">
        <Dumbbell className={`h-3.5 w-3.5 ${shared ? 'text-primary' : type === 'B' ? 'text-secondary' : 'text-primary'}`} />
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
        {isShared ? (
          <ExerciseSubCard ex={station.exerciseA} type="A" shared={true} />
        ) : (
          <>
            <ExerciseSubCard ex={station.exerciseA} type="A" />
            {station.exerciseB && (
              <ExerciseSubCard ex={station.exerciseB} type="B" />
            )}
          </>
        )}
      </div>
    </div>
  );
};
