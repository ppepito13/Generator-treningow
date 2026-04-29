
"use client";

import React, { useState, useMemo, memo } from 'react';
import { Station, Exercise, SEGMENTS, getDifficultyById, ALL_ROOMS } from '@/app/lib/data';
import { useAppStore, getValidExercisesForZone } from '@/app/lib/store';
import { ExerciseManualSelector } from './ExerciseManualSelector';
import { RefreshCw, MoreVertical, MapPin, Dumbbell, Info, Users, Trophy, Activity, Settings2, AlertTriangle, GripVertical, Search, ChevronDown, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";

interface Props {
  station: Station;
}

export const StationCard = memo(({ station }: Props) => {
  const rerollExercise = useAppStore(state => state.rerollExercise);
  const setStationExercise = useAppStore(state => state.setStationExercise);
  const difficultyId = useAppStore(state => state.difficultyId);
  const participants = useAppStore(state => state.participants);
  const circuit = useAppStore(state => state.circuit);
  const selectedRoomId = useAppStore(state => state.selectedRoomId);
  const getEffectiveRoomConfig = useAppStore(state => state.getEffectiveRoomConfig);

  const [selectorOpen, setSelectorOpen] = useState(false);
  const [activeSelectType, setActiveSelectType] = useState<'A' | 'B'>('A');
  const [openDialogType, setOpenDialogType] = useState<'A' | 'B' | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  
  const currentRoom = useMemo(() => getEffectiveRoomConfig(), [getEffectiveRoomConfig, selectedRoomId]);
  const isSynchronized = useMemo(() => currentRoom.tryb_treningu === 'synchroniczny', [currentRoom.tryb_treningu]);
  const currentDiff = useMemo(() => getDifficultyById(difficultyId), [difficultyId]);
  const isPairMode = participants > circuit.length;

  const stationIndex = useMemo(() => circuit.findIndex(s => s.id === station.id) + 1, [circuit, station.id]);
  const isCustom = selectedRoomId === 'custom';

  const displayTitle = useMemo(() => isCustom
    ? (isSynchronized ? `Ćwiczenie ${stationIndex}` : `Stacja ${stationIndex}`)
    : (isSynchronized ? `Ćwiczenie ${stationIndex}` : station.zone.nazwa), [isCustom, isSynchronized, stationIndex, station.zone.nazwa]);

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

  const handleManualSelect = (type: 'A' | 'B') => {
    setActiveSelectType(type);
    setTimeout(() => setSelectorOpen(true), 150);
  };

  const handleSaveCustom = (type: 'A' | 'B') => {
    if (!customExerciseName.trim()) return;
    const customEx: Exercise = {
      id_cwiczenia: `custom-${Date.now()}`,
      nazwa: customExerciseName.trim(),
      wariant: "",
      segment_id: 99,
      segment_nazwa: "WŁASNE",
      tryb_pracy: "Solo",
      biomechanika: "Własna",
      poziom: 5,
      glowne_partie: ["Inne"],
      zaangazowane_miesnie: "Praca ogólna",
      tagi_specjalne: ["ręcznie dodane"],
      kategorie_treningu: [],
      instrukcja: "Zajęcia z ćwiczeniem dodanym ręcznie przez trenera."
    };
    setStationExercise(station.id, type, customEx);
    setOpenDialogType(null);
    setIsAddingCustom(false);
    setCustomExerciseName('');
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

  const availableSegmentsA = useMemo(() => SEGMENTS.filter(seg => {
    const levelRange = { min: currentDiff.min_poziom, max: currentDiff.max_poziom };
    const pool = getValidExercisesForZone(station.zone, levelRange, new Set(), station.isPair, currentRoom, seg.id, true);
    return pool.length > 0;
  }), [currentDiff, station.zone, station.isPair, currentRoom]);

  // Dynamiczna kalkulacja pojemności strefy
  const getZoneCapacity = useMemo(() => (zoneId: string) => {
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
  }, [currentRoom.strefy, circuit, isPairMode]);

  const stationsInSameZone = useMemo(() => circuit.filter(s => s.zone.id === station.zone.id), [circuit, station.zone.id]);
  const currentZoneCapacity = useMemo(() => getZoneCapacity(station.zone.id), [getZoneCapacity, station.zone.id]);
  const isOvercrowded = useMemo(() => stationsInSameZone.length > currentZoneCapacity, [stationsInSameZone.length, currentZoneCapacity]);

  const renderExerciseSubCard = (ex: Exercise, type: 'A' | 'B', shared: boolean = false) => (
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
          
          <Dialog open={openDialogType === type} onOpenChange={(open) => {
            setOpenDialogType(open ? type : null);
            if (!open) {
              setIsAddingCustom(false);
              setCustomExerciseName('');
            }
          }}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 rounded-lg glass-button group ${shared ? 'text-primary' : type === 'B' ? 'text-secondary' : 'text-primary'}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/10 text-white w-full sm:max-w-sm outline-none flex flex-col p-6">
              <DialogHeader className="pb-4 border-b border-white/5">
                <DialogTitle className="text-primary flex items-center gap-2 text-lg font-bold">
                  <RefreshCw className="h-5 w-5" />
                  Zmiana Ćwiczenia
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-2 pt-2">
                {isAddingCustom ? (
                  <div className="flex flex-col gap-3 p-4 bg-black/20 border border-white/10 rounded-xl animate-in fade-in zoom-in-95 duration-200">
                    <input 
                      autoFocus
                      placeholder="Wpisz nazwę ćwiczenia..." 
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:border-primary placeholder:text-white/30"
                      value={customExerciseName}
                      onChange={e => setCustomExerciseName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && customExerciseName.trim()) {
                          handleSaveCustom(type);
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 text-xs h-10 border border-white/10" onClick={() => { setIsAddingCustom(false); setCustomExerciseName(''); }}>Anuluj</Button>
                      <Button size="sm" className="flex-1 text-xs h-10 bg-primary text-primary-foreground hover:bg-primary/90" disabled={!customExerciseName.trim()} onClick={() => handleSaveCustom(type)}>Zapisz i Dodaj</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <DialogClose asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => handleReroll(type)}
                        className="w-full h-12 justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold"
                      >
                        <RefreshCw className="h-4 w-4 text-primary" />
                        Losuj dowolne z bazy
                      </Button>
                    </DialogClose>

                    <details className="group border border-white/10 rounded-xl bg-white/5 overflow-hidden">
                      <summary className="w-full h-12 flex items-center gap-3 px-4 text-xs font-bold cursor-pointer hover:bg-white/10 list-none outline-none">
                        <Settings2 className="h-4 w-4 text-primary" />
                        <span className="flex-1 text-left">Wybierz segment...</span>
                        <ChevronDown className="h-4 w-4 text-white/50 group-open:rotate-180 transition-transform" />
                      </summary>
                      <div className="p-2 border-t border-white/10 max-h-[40vh] overflow-y-auto custom-scrollbar flex flex-col gap-1 bg-black/20">
                        <div className="text-[10px] uppercase tracking-widest text-primary/60 px-2 py-2 font-bold">Kompatybilne segmenty</div>
                        {availableSegmentsA.map(seg => (
                          <DialogClose asChild key={seg.id}>
                            <Button
                              variant="ghost"
                              onClick={() => handleReroll(type, seg.id)}
                              className="w-full justify-start h-10 text-xs text-white/80 hover:bg-primary/20 hover:text-white"
                            >
                              {seg.nazwa}
                            </Button>
                          </DialogClose>
                        ))}
                      </div>
                    </details>

                    <DialogClose asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => handleManualSelect(type)}
                        className="w-full h-12 justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold"
                      >
                        <Search className="h-4 w-4 text-primary" />
                        Wyszukaj z listy ręcznie
                      </Button>
                    </DialogClose>

                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddingCustom(true)}
                      className="w-full h-12 justify-start gap-3 bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4 text-primary" />
                      Dodaj własne ćwiczenie
                    </Button>
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
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
                  {displayTitle}
                </span>
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
          renderExerciseSubCard(station.exerciseA, 'A', true)
        ) : (
          <>
            {renderExerciseSubCard(station.exerciseA, 'A')}
            {station.exerciseB && (
              renderExerciseSubCard(station.exerciseB, 'B')
            )}
          </>
        )}
      </div>

      <ExerciseManualSelector 
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelect={(ex) => setStationExercise(station.id, activeSelectType, ex)}
      />
    </div>
  );
});
