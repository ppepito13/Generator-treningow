
"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { DIFFICULTY_LEVELS, ALL_ROOMS, KATEGORIE_TRENINGOW, ALL_EXERCISES } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Zap, Trophy, LayoutGrid, ShieldAlert, ShieldCheck, MapPin, Settings2, Dumbbell, History } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { EquipmentSelectionDialog } from './EquipmentSelectionDialog';

export const ConfigurationForm = () => {
  const { 
    selectedRoomId,
    setSelectedRoom,
    participants, 
    setParticipants, 
    difficultyId, 
    setDifficulty, 
    generateCircuit,
    stationCount,
    setStationCount,
    isStrictDifficulty,
    setStrictDifficulty,
    // Stan sali niestandardowej
    customRoomMode,
    setCustomRoomMode,
    customRoomCategory,
    setCustomRoomCategory,
    customRoomEquipment,
    resetCustomRoom
  } = useAppStore();

  const currentRoom = ALL_ROOMS.find(r => r.id_sali === selectedRoomId) || ALL_ROOMS[0];
  const currentDiff = DIFFICULTY_LEVELS.find(d => d.id === difficultyId);

  // Dynamiczne ustalanie trybu dla potrzeb UI (suwaki itp.)
  const isSynchronized = selectedRoomId === 'custom' 
    ? customRoomMode === 'synchroniczny' 
    : currentRoom.tryb_treningu === 'synchroniczny';

  // Obliczenia dla ograniczeń stacji
  const minStations = isSynchronized ? 1 : Math.ceil(participants / 2);
  const maxStations = isSynchronized ? currentRoom.maksymalna_pojemnosc.stacje : Math.min(participants, currentRoom.maksymalna_pojemnosc.stacje);
  const numPairs = Math.max(0, participants - stationCount);

  // Dynamiczne filtrowanie kategorii, które mają ćwiczenia w bazie (case-insensitive)
  const availableCategories = KATEGORIE_TRENINGOW.filter(cat => 
    ALL_EXERCISES.some(ex => 
      ex.kategorie_treningu?.some(exCat => exCat.toLowerCase() === cat.id.toLowerCase())
    )
  );

  return (
    <>
      <div 
        className="fixed top-0 left-0 right-0 h-[calc(max(env(safe-area-inset-top,0px),48px)+40px)] z-[40] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, hsl(var(--background) / 0.95) 0%, hsl(var(--background) / 0) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)'
        }}
      />
      <div className="flex flex-col gap-8 w-full max-w-md mx-auto pt-[calc(max(env(safe-area-inset-top,0px),48px)+24px)] pb-[calc(env(safe-area-inset-bottom,0px)+64px)] px-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter text-primary font-headline cyan-glow inline-block px-4 py-2 rounded-xl">
          SW Calisthenics
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Generator Treningu Grupowego</p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        
        {/* Sekcja Wyboru Sali */}
        <div className="space-y-4">
          <Label className="text-lg font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Wybierz Salę
            </div>
            {selectedRoomId === 'custom' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCustomRoom}
                className="text-[9px] uppercase font-bold h-6 rounded-md bg-white/5 hover:bg-destructive/20 hover:text-destructive flex gap-1"
              >
                <History className="h-3 w-3" />
                Resetuj Custom
              </Button>
            )}
          </Label>
          <Select value={selectedRoomId} onValueChange={setSelectedRoom}>
            <SelectTrigger className="h-14 rounded-xl glass-button text-left border-white/10 text-lg font-bold">
              <SelectValue placeholder="Wybierz Salę" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              {ALL_ROOMS.map(room => (
                <SelectItem key={room.id_sali} value={room.id_sali} className="py-3 focus:bg-primary focus:text-primary-foreground">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{room.nazwa_sali}</span>
                    <span className="text-[10px] opacity-70 uppercase tracking-widest">{room.id_sali === 'custom' ? 'Konfiguracja ręczna' : (room.tryb_treningu === 'obwodowy' ? 'Trening Obwodowy' : 'Trening Grupowy')} • Max {room.maksymalna_pojemnosc.osoby} os.</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- NOWA SEKCJA: Ustawienia Niestandardowe (Conditional) --- */}
        {selectedRoomId === 'custom' && (
          <div className="space-y-6 p-6 rounded-3xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 border-b border-primary/10 pb-2 mb-4">
              <Settings2 className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary">Konfiguracja Sali</h3>
            </div>

            {/* Wybór Trybu FLOW */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Sposób Ułożenia (Flow)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setCustomRoomMode('obwodowy')}
                  className={`h-11 rounded-xl text-[10px] uppercase font-bold border transition-all ${customRoomMode === 'obwodowy' ? 'bg-primary border-primary text-primary-foreground' : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50'}`}
                >
                  Obwód Stacyjny
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setCustomRoomMode('synchroniczny')}
                  className={`h-11 rounded-xl text-[10px] uppercase font-bold border transition-all ${customRoomMode === 'synchroniczny' ? 'bg-primary border-primary text-primary-foreground' : 'bg-white/5 border-white/10 text-white/60 hover:border-primary/50'}`}
                >
                  Trening Grupowy
                </Button>
              </div>
            </div>

            {/* Wybór Kategorii */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Kategoria Ćwiczeń (Filtr)</Label>
              <Select value={customRoomCategory} onValueChange={setCustomRoomCategory}>
                <SelectTrigger className="h-12 rounded-xl glass-button text-left border-white/10 text-xs font-bold uppercase">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent className="glass-card border-white/10">
                  <SelectItem value="all" className="text-[10px] uppercase font-bold py-2 focus:bg-primary">Wszystkie kategorie</SelectItem>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id} className="text-[10px] uppercase font-bold py-2 focus:bg-primary">
                      {cat.nazwa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Wybór Sprzętu */}
            <div className="space-y-3">
              <Label className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Dostępny inwentarz</Label>
              <EquipmentSelectionDialog />
            </div>
          </div>
        )}

        {/* Sekcja Uczestników */}
        {!(selectedRoomId === 'custom' && customRoomMode === 'synchroniczny') && (
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <Label className="text-lg font-medium">Uczestnicy</Label>
            </div>
            <div className="flex flex-col gap-4">
              <div className="text-5xl font-bold font-mono text-primary text-center">
                {participants.toString().padStart(2, '0')}
              </div>
              <Slider 
                value={[participants]} 
                onValueChange={(vals) => setParticipants(vals[0])}
                min={1}
                max={currentRoom.maksymalna_pojemnosc.osoby}
                step={1}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-1">
                <span>Minimum: 1 Osoba</span>
                <span>Maksimum: {currentRoom.maksymalna_pojemnosc.osoby} Osób</span>
              </div>
            </div>
          </div>
        )}

        {/* Sekcja Liczby Stacji */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-secondary" />
              <Label className="text-lg font-medium">Liczba Stacji</Label>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-5xl font-bold font-mono text-secondary text-center">
              {stationCount.toString().padStart(2, '0')}
            </div>
            <Slider 
              value={[stationCount]} 
              onValueChange={(vals) => setStationCount(vals[0])}
              min={minStations}
              max={maxStations}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold px-1">
              <span>Minimum: {minStations}</span>
              <span>Maksimum: {maxStations}</span>
            </div>
          </div>
          {numPairs > 0 && !isSynchronized && (
            <p className="text-[10px] text-primary/80 text-center font-medium bg-primary/5 py-2 rounded-lg border border-primary/10">
              W tym układzie wygenerujemy {numPairs} {numPairs === 1 ? 'stację podwójną' : 'stacje podwójne'}.
            </p>
          )}
        </div>

        {/* Sekcja Poziomu */}
        <div className="space-y-4">
          <Label className="text-lg font-medium">Poziom Grupy</Label>
          <Select value={difficultyId} onValueChange={setDifficulty}>
            <SelectTrigger className="h-14 rounded-xl glass-button text-left border-white/10">
              <SelectValue placeholder="Wybierz poziom" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10 max-h-80">
              {DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level.id} value={level.id} className="py-3 focus:bg-primary focus:text-primary-foreground">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold">{level.nazwa_grupy}</span>
                    <span className="text-[10px] opacity-70">Poziomy: {level.min_poziom}-{level.max_poziom}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Nowy przełącznik Trybu Ścisłego */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                {isStrictDifficulty ? <ShieldAlert className="h-4 w-4 text-primary" /> : <ShieldCheck className="h-4 w-4 text-secondary" />}
                <span className="text-sm font-bold uppercase tracking-tighter">Tryb Ścisły</span>
              </div>
              <span className="text-[10px] text-muted-foreground leading-none">
                {isStrictDifficulty ? "Tylko wybrany poziom (max intensywność)" : "Zezwalaj na lżejsze stacje techniczne"}
              </span>
            </div>
            <Switch 
              checked={isStrictDifficulty} 
              onCheckedChange={setStrictDifficulty}
            />
          </div>

          {currentDiff && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] text-muted-foreground leading-relaxed">
              <Trophy className="h-3 w-3 text-secondary inline mb-1 mr-1" />
              {currentDiff.charakterystyka_biomechaniczna}
            </div>
          )}
        </div>

        <Button 
          onClick={generateCircuit}
          className="w-full h-16 rounded-2xl text-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 flex gap-2 group"
        >
          <Zap className="h-6 w-6 fill-current group-hover:scale-125 transition-transform" />
          {isSynchronized ? 'Generuj GRP (Synchr)' : 'Generuj Obwód'}
        </Button>
      </div>
    </div>
    </>
  );
};
