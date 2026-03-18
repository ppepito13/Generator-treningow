"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { DIFFICULTY_LEVELS } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Zap, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ConfigurationForm = () => {
  const { participants, setParticipants, difficultyId, setDifficulty, generateCircuit } = useAppStore();

  const currentDiff = DIFFICULTY_LEVELS.find(d => d.id === difficultyId);

  return (
    <div className="flex flex-col gap-8 w-full max-w-md mx-auto py-12 px-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tighter text-primary font-headline cyan-glow inline-block px-4 py-2 rounded-xl">
          Kinetic Circuits
        </h1>
        <p className="text-muted-foreground text-sm uppercase tracking-widest">Generator Treningu Grupowego</p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <Label className="text-lg font-medium">Uczestnicy</Label>
            <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-md">
              {participants <= 7 ? 'TRYB SOLO' : 'TRYB PAR'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setParticipants(participants - 1)}
              className="h-12 w-12 rounded-xl glass-button"
            >
              <Minus className="h-6 w-6" />
            </Button>
            <div className="text-4xl font-bold font-mono text-primary flex-1 text-center">
              {participants.toString().padStart(2, '0')}
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setParticipants(participants + 1)}
              className="h-12 w-12 rounded-xl glass-button"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center italic">
            {participants > 7 ? `Wygenerujemy ${Math.ceil(participants/2)} stacji z podziałem A/B` : `Wygenerujemy ${participants} stacji solo`}
          </p>
        </div>

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
          Generuj Obwód
        </Button>
      </div>
    </div>
  );
};
