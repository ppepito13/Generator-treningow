"use client";

import React from 'react';
import { Station, Exercise } from '@/app/lib/data';
import { useAppStore } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell, Info, Users, Trophy, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  station: Station;
}

export const StationCard = ({ station }: Props) => {
  const { rerollExercise } = useAppStore();

  const handleReroll = (type: 'A' | 'B') => {
    rerollExercise(station.id, type);
  };

  const isShared = station.exerciseB && station.exerciseB.id_cwiczenia === station.exerciseA.id_cwiczenia;

  const getEquipmentDisplay = (ex: Exercise) => {
    if (Array.isArray(ex.wymagany_sprzet)) {
      return ex.wymagany_sprzet.join(", ");
    }
    return ex.wymagany_sprzet;
  };

  const getMusclesDisplay = (ex: Exercise) => {
    if (Array.isArray(ex.zaangazowane_miesnie)) {
      return ex.zaangazowane_miesnie.join(", ");
    }
    return ex.zaangazowane_miesnie || "Praca ogólna";
  };

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
          {ex.wariant && (
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide opacity-80">
              {ex.wariant}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg glass-button opacity-50 hover:opacity-100">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white sm:max-w-md outline-none">
              <DialogHeader>
                <DialogTitle className="text-primary flex flex-col items-start gap-1">
                  <div className="flex items-center gap-2 text-xl font-bold">
                    <Info className="h-5 w-5" />
                    {ex.nazwa}
                  </div>
                  {ex.wariant && (
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest ml-7">
                      Wariant: {ex.wariant}
                    </span>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 border-b border-white/5 pb-1">Instrukcja Wykonania</h4>
                  <p className="text-sm leading-relaxed text-white/90">{ex.instrukcja}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Wymagany Sprzęt</h4>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-3.5 w-3.5 text-secondary" />
                      <span className="text-xs font-bold text-secondary uppercase">{getEquipmentDisplay(ex)}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Partie Mięśniowe</h4>
                    <p className="text-xs text-white/80 font-medium">{ex.glowne_partie.join(", ")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Poziom Trudności</h4>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-bold text-white/90 uppercase">Poziom {ex.poziom}/10</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Zaangażowane Mięśnie</h4>
                    <div className="flex items-start gap-2">
                      <Activity className="h-3.5 w-3.5 text-accent mt-0.5" />
                      <p className="text-xs text-white/80 font-medium">{getMusclesDisplay(ex)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap pt-2 border-t border-white/5 mt-2">
                  <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase font-bold">
                    {ex.segment_nazwa}
                  </span>
                  {ex.tagi_specjalne?.map(tag => (
                    <span key={tag} className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-white/50 border border-white/10">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
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
        <span>{getEquipmentDisplay(ex)}</span>
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