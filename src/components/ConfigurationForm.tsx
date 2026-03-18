"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { MOCK_DIFFICULTY_LEVELS } from '@/app/lib/data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, Minus, Zap } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const ConfigurationForm = () => {
  const { participants, setParticipants, difficulty, setDifficulty, generateCircuit } = useAppStore();

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
          <Label className="text-lg font-medium">Liczba uczestników</Label>
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
          <p className="text-xs text-muted-foreground text-center italic">Zalecane od 1 do 14 osób</p>
        </div>

        <div className="space-y-4">
          <Label className="text-lg font-medium">Poziom trudności</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="h-14 rounded-xl glass-button text-lg border-white/10">
              <SelectValue placeholder="Wybierz poziom" />
            </SelectTrigger>
            <SelectContent className="glass-card border-white/10">
              {MOCK_DIFFICULTY_LEVELS.map((level) => (
                <SelectItem key={level.level} value={level.level} className="h-12 text-lg focus:bg-primary focus:text-primary-foreground">
                  {level.level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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