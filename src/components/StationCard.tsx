"use client";

import React from 'react';
import { Station, Exercise, SEGMENTS, getDifficultyById, ROOM_CONFIG } from '@/app/lib/data';
import { useAppStore, getValidExercisesForZone } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell, Info, Users, Trophy, Activity, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  station: Station;
}

export const StationCard = ({ station }: Props) => {
  const { rerollExercise, changeStationZone, difficultyId, participants, circuit } = useAppStore();
  const currentDiff = getDifficultyById(difficultyId);
  const isPairMode = participants > 7;

  const handleReroll = (type: 'A' | 'B', segmentId?: number) => {
    rerollExercise(station.id, type, segmentId);
  };

  const isShared = station.exerciseB && station.exerciseB.id_cwiczenia === station.exerciseA.id_cwiczenia;

  const getEquipmentDisplay = (ex: Exercise) => {
    if (Array.isArray(ex.wymagany_sprzet)) {
      return ex.wymagany_sprzet.join(", ");
    }
    return String(ex.wymagany_sprzet || "");
  };

  const getMusclesDisplay = (ex: Exercise) => {
    if (Array.isArray(ex.zaangazowane_miesnie)) {
      return ex.zaangazowane_miesnie.join(", ");
    }
    return ex.zaangazowane_miesnie || "Praca ogólna";
  };

  const availableSegmentsA = SEGMENTS.filter(seg => {
    const pool = getValidExercisesForZone(station.zone, currentDiff, new Set(), isPairMode, seg.id, true);
    return pool.length > 0;
  });

  const isFixedStation = station.zone.id === 'Strefa_Modul_0';
  
  const getAvailableZones = () => {
    const currentCounts = circuit.reduce((acc, s) => {
      acc[s.zone.id] = (acc[s.zone.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hasDrabinki = Object.keys(currentCounts).includes('Strefa_Drabinki');
    const hasSciana = Object.keys(currentCounts).includes('Strefa_Sciana');
    
    const floorBase = ROOM_CONFIG.strefy.find(z => z.id === 'Strefa_Wolna_Przestrzen')?.bazowa_pojemnosc_stacji || 5;
    const floorLimit = floorBase - (hasDrabinki ? 1 : 0) - (hasSciana ? 1 : 0);

    return ROOM_CONFIG.strefy.filter(z => {
      if (z.id === 'Strefa_Modul_0') return false; 
      
      const current = currentCounts[z.id] || 0;
      const cap = z.id === 'Strefa_Wolna_Przestrzen' ? floorLimit : (z.pojemnosc_stacji || 1);

      return current < cap || z.id === station.zone.id;
    });
  };

  const availableZones = getAvailableZones();

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
            <DialogContent className="glass-card border-white/10 text-white sm:max-w-md outline-none max-h-[90vh] overflow-y-auto">
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-lg glass-button group ${shared ? 'text-primary' : type === 'B' ? 'text-secondary' : 'text-primary'}`}
              >
                <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-card border-white/10 text-white min-w-[180px] z-[100]">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-primary/60 py-2">Zmień Ćwiczenie</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleReroll(type)}
                className="text-xs font-bold focus:bg-primary focus:text-primary-foreground cursor-pointer py-2.5"
              >
                Losuj dowolne
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-primary/60 py-2">Segment (kompatybilny)</DropdownMenuLabel>
              <div className="grid grid-cols-1 gap-0.5">
                {availableSegmentsA.map(seg => (
                  <DropdownMenuItem 
                    key={seg.id} 
                    onClick={() => handleReroll(type, seg.id)}
                    className="text-xs focus:bg-primary focus:text-primary-foreground cursor-pointer py-2"
                  >
                    {seg.nazwa}
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <div className="flex flex-col">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Lokalizacja</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase">{station.zone.nazwa}</span>
              {!isFixedStation && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md glass-button text-primary/50 hover:text-primary">
                      <Settings2 className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card border-white/10 text-white min-w-[200px] z-[100]">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-primary/60 py-2">Przenieś Stację</DropdownMenuLabel>
                    <div className="max-h-[300px] overflow-y-auto">
                      {availableZones.length > 0 ? (
                        availableZones.map(zone => (
                          <DropdownMenuItem 
                            key={zone.id} 
                            onClick={() => changeStationZone(station.id, zone.id)}
                            className="text-xs font-medium focus:bg-primary focus:text-primary-foreground cursor-pointer py-2.5"
                          >
                            <div className="flex justify-between w-full">
                              <span>{zone.nazwa}</span>
                              {zone.id === station.zone.id && <span className="text-[8px] text-primary">(Bieżąca)</span>}
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <p className="text-[10px] text-center py-4 text-muted-foreground italic">Brak dostępnych stref</p>
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
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