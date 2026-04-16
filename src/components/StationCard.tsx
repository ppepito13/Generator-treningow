
"use client";

import React from 'react';
import { Station, Exercise, SEGMENTS, getDifficultyById, ALL_ROOMS } from '@/app/lib/data';
import { useAppStore, getValidExercisesForZone } from '@/app/lib/store';
import { RefreshCw, MapPin, Dumbbell, Info, Users, Trophy, Activity, Settings2, AlertTriangle, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const { rerollExercise, changeStationZone, difficultyId, participants, circuit, selectedRoomId } = useAppStore();
  const currentRoom = ALL_ROOMS.find(r => r.id_sali === selectedRoomId) || ALL_ROOMS[0];
  const isSynchronized = currentRoom.tryb_treningu === 'synchroniczny';
  const currentDiff = getDifficultyById(difficultyId);
  const isPairMode = participants > circuit.length;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleReroll = (type: 'A' | 'B', segmentId?: number) => {
    rerollExercise(station.id, type, segmentId);
  };

  const isShared = station.exerciseB && station.exerciseB.id_cwiczenia === station.exerciseA.id_cwiczenia;

  const getEquipmentDisplay = (ex: Exercise) => {
    if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) return "BRAK / MASA CIAŁA";
    
    return ex.wymagania_sprzetowe.map(rule => {
      if (Array.isArray(rule)) {
        const alts = new Set<string>();
        rule.forEach(alt => Object.keys(alt).forEach(k => alts.add(k)));
        return Array.from(alts).map(i => i.replace(/_/g, ' ')).join(' / ');
      } else {
        return Object.keys(rule).map(i => i.replace(/_/g, ' ')).join(', ');
      }
    }).join(' + ');
  };

  const getMusclesDisplay = (ex: Exercise) => {
    if (Array.isArray(ex.zaangazowane_miesnie)) {
      return ex.zaangazowane_miesnie.join(", ");
    }
    return ex.zaangazowane_miesnie || "Praca ogólna";
  };

  const availableSegmentsA = SEGMENTS.filter(seg => {
    const levelRange = { min: currentDiff.min_poziom, max: currentDiff.max_poziom };
    const pool = getValidExercisesForZone(station.zone, levelRange, new Set(), station.isPair, currentRoom, seg.id, true);
    return pool.length > 0;
  });

  const isFixedStation = station.zone.blokada_zmiany_recznej || isSynchronized;
  
  // Dynamiczna kalkulacja pojemności strefy
  const getZoneCapacity = (zoneId: string) => {
    const zone = currentRoom.strefy.find(z => z.id === zoneId);
    if (!zone) return 1;

    if (zone.typ === 'elastyczny') {
      let limit = zone.bazowa_pojemnosc_stacji || 5;
      if (zone.zaleznosci_pojemnosci_od) {
        zone.zaleznosci_pojemnosci_od.forEach(zal => {
           if (circuit.some(s => s.zone.id === zal)) limit -= 1;
        });
      }
      return limit;
    }

    if (isPairMode && zone.typ === 'klatka_rig') return 1;

    return zone.pojemnosc_stacji || 1;
  };

  const stationsInSameZone = circuit.filter(s => s.zone.id === station.zone.id);
  const currentZoneCapacity = getZoneCapacity(station.zone.id);
  const isOvercrowded = stationsInSameZone.length > currentZoneCapacity;

  const getAvailableZones = () => {
    return currentRoom.strefy.filter(z => !z.blokada_zmiany_recznej);
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
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`glass-card rounded-[2rem] overflow-hidden transition-all ${isDragging ? 'opacity-80 scale-105 shadow-2xl relative z-50' : 'hover:scale-[1.01]'}`}
    >
      <div className={`p-4 border-b border-white/5 flex flex-col gap-2 ${isOvercrowded ? 'bg-destructive/20' : 'bg-primary/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOvercrowded ? 'bg-destructive/30' : 'bg-primary/20'}`}>
              <MapPin className={`h-5 w-5 ${isOvercrowded ? 'text-destructive' : 'text-primary'}`} />
            </div>
            <div className="flex flex-col">
              <h2 className={`text-[10px] font-bold uppercase tracking-widest ${isOvercrowded ? 'text-destructive' : 'text-primary/60'}`}>
                {isSynchronized ? 'Stanowisko' : 'Lokalizacja'}
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white uppercase">
                  {isSynchronized ? `Ćwiczenie ${circuit.findIndex(s => s.id === station.id) + 1}` : station.zone.nazwa}
                </span>
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
                        {availableZones.map(zone => (
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
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div {...attributes} {...listeners} className="p-2 cursor-grab active:cursor-grabbing text-primary/50 hover:text-primary focus:outline-none touch-none">
              <GripVertical className="h-5 w-5" />
            </div>
          </div>
        </div>
        
        {isOvercrowded && (
          <div className="flex items-center gap-2 bg-destructive/10 px-3 py-2 rounded-xl border border-destructive/20 animate-pulse">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            <p className="text-[10px] font-bold text-destructive uppercase leading-none">
              Uwaga - większa liczba ćwiczących niż dostępnych modułów
            </p>
          </div>
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
