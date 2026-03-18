"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { StationCard } from './StationCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, ClipboardList } from 'lucide-react';

export const CircuitList = () => {
  const { circuit, reset, difficulty, participants } = useAppStore();

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto pb-12">
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md p-6 flex items-center justify-between border-b border-white/5">
        <Button variant="ghost" onClick={reset} className="glass-button rounded-xl flex gap-2">
          <ArrowLeft className="h-4 w-4" />
          Wstecz
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Twój Obwód
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            {difficulty} • {participants} osób
          </p>
        </div>
        <Button variant="ghost" size="icon" className="glass-button rounded-xl text-secondary">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="px-6 pt-6 space-y-6 overflow-y-auto">
        {circuit.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>

      <div className="px-6 mt-8">
        <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 text-center space-y-2">
          <p className="text-secondary font-bold text-sm">Gotowy na trening?</p>
          <p className="text-xs text-muted-foreground">Wygenerowano 6 stacji. Pamiętaj o rozgrzewce przed rozpoczęciem obwodu!</p>
        </div>
      </div>
    </div>
  );
};