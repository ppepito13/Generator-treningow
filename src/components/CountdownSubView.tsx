"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTimerAudioTTS } from '@/app/lib/useTimerAudioTTS';
import { Play, Pause, RotateCcw, Plus, Minus, Hourglass, BellRing, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const CountdownSubView = () => {
  const { toast } = useToast();
  const { playBeep, playFinishFanfare } = useTimerAudioTTS();

  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);

  const [initialTotalSec, setInitialTotalSec] = useState(300);
  const [remainingSec, setRemainingSec] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  const timerRef = useRef<any>(null);

  // Aktualizacja początkowej wartości gdy użytkownik zmienia input (tylko gdy minutnik jest zatrzymany)
  const handleInputChange = (min: number, sec: number) => {
    if (isRunning) return;
    const validMin = Math.max(0, Math.min(999, min || 0));
    const validSec = Math.max(0, Math.min(59, sec || 0));
    setInputMinutes(validMin);
    setInputSeconds(validSec);
    const total = validMin * 60 + validSec;
    setInitialTotalSec(total);
    setRemainingSec(total);
  };

  const handleAdjustTime = (deltaSec: number) => {
    if (isRunning) {
      setRemainingSec((prev) => Math.max(0, prev + deltaSec));
    } else {
      const newTotal = Math.max(0, initialTotalSec + deltaSec);
      const min = Math.floor(newTotal / 60);
      const sec = newTotal % 60;
      setInputMinutes(min);
      setInputSeconds(sec);
      setInitialTotalSec(newTotal);
      setRemainingSec(newTotal);
    }
  };

  const handleStartPause = () => {
    if (remainingSec <= 0) return;

    if (isRunning) {
      // Pauza
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
    } else {
      // Start / Wznowienie
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setRemainingSec(initialTotalSec);
  };

  const handleAddOneMin = () => {
    handleAdjustTime(60);
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemainingSec((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playFinishFanfare();
            toast({
              title: "Czas minął!",
              description: "Minutnik zakończył odliczanie.",
            });
            return 0;
          }
          if (prev <= 4) {
            playBeep(880, 100);
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, playBeep, playFinishFanfare, toast]);

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialTotalSec > 0 ? (remainingSec / initialTotalSec) * 100 : 0;

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* KARTA MINUTNIKA */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-widest px-2">
          <div className="flex items-center gap-2">
            <Hourglass className="h-4 w-4 text-cyan-400" />
            <span>Minutnik Treningowy</span>
          </div>
          <Badge className="bg-white/5 text-white/70 border-white/10 font-mono">
            {isRunning ? 'Odliczanie...' : remainingSec === 0 ? 'Koniec!' : 'Pauza'}
          </Badge>
        </div>

        {/* WIZUALNY WYŚWIETLACZ MINUTNIKA */}
        <div className="relative py-4 flex flex-col items-center justify-center">
          <div className="font-mono font-black text-6xl sm:text-7xl text-white tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.25)]">
            {formatSec(remainingSec)}
          </div>

          {/* Paseczek postępu */}
          <div className="w-full max-w-md bg-white/5 h-2 rounded-full mt-6 overflow-hidden border border-white/10 p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* DWA RZĘDY PRZYCISKÓW KROKOWYCH REGULACJI CZASU (ODEJMOWANIE I DODAWANIE) */}
        <div className="space-y-2 pt-1">
          {/* Rząd 1: Wartości Ujemne (-5s, -30s, -1 min, -5 min, -10 min) */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <Button
              onClick={() => handleAdjustTime(-5)}
              disabled={(isRunning ? remainingSec : initialTotalSec) <= 0}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/20 text-xs font-bold disabled:opacity-30"
            >
              -5s
            </Button>
            <Button
              onClick={() => handleAdjustTime(-30)}
              disabled={(isRunning ? remainingSec : initialTotalSec) <= 0}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/20 text-xs font-bold disabled:opacity-30"
            >
              -30s
            </Button>
            <Button
              onClick={() => handleAdjustTime(-60)}
              disabled={(isRunning ? remainingSec : initialTotalSec) <= 0}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/20 text-xs font-bold disabled:opacity-30"
            >
              -1 min
            </Button>
            <Button
              onClick={() => handleAdjustTime(-300)}
              disabled={(isRunning ? remainingSec : initialTotalSec) <= 0}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/20 text-xs font-bold disabled:opacity-30"
            >
              -5 min
            </Button>
            <Button
              onClick={() => handleAdjustTime(-600)}
              disabled={(isRunning ? remainingSec : initialTotalSec) <= 0}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/20 bg-rose-500/5 text-rose-300 hover:bg-rose-500/20 text-xs font-bold disabled:opacity-30"
            >
              -10 min
            </Button>
          </div>

          {/* Rząd 2: Wartości Dodatnie (+5s, +30s, +1 min, +5 min, +10 min) */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <Button
              onClick={() => handleAdjustTime(5)}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold"
            >
              +5s
            </Button>
            <Button
              onClick={() => handleAdjustTime(30)}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold"
            >
              +30s
            </Button>
            <Button
              onClick={() => handleAdjustTime(60)}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold"
            >
              +1 min
            </Button>
            <Button
              onClick={() => handleAdjustTime(300)}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold"
            >
              +5 min
            </Button>
            <Button
              onClick={() => handleAdjustTime(600)}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-emerald-500/20 bg-emerald-500/5 text-emerald-300 hover:bg-emerald-500/20 text-xs font-bold"
            >
              +10 min
            </Button>
          </div>
        </div>

        {/* RĘCZNE WPROWADZANIE CZASU (MINUTY I SEKUNDY) */}
        {!isRunning && (
          <div className="flex items-center justify-center gap-3 pt-2 bg-black/20 p-4 rounded-2xl border border-white/5 max-w-xs mx-auto">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Minuty</span>
              <Input
                type="number"
                min={0}
                max={999}
                value={inputMinutes}
                onChange={(e) => handleInputChange(parseInt(e.target.value, 10) || 0, inputSeconds)}
                className="w-20 text-center font-mono font-bold text-sm h-10 glass-input border-white/10 rounded-xl"
              />
            </div>
            <span className="text-xl font-bold text-white/40 pt-4">:</span>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Sekundy</span>
              <Input
                type="number"
                min={0}
                max={59}
                value={inputSeconds}
                onChange={(e) => handleInputChange(inputMinutes, parseInt(e.target.value, 10) || 0)}
                className="w-20 text-center font-mono font-bold text-sm h-10 glass-input border-white/10 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* PANEL PRZYCISKÓW KONTROLI (START / PAUZA / RESET / +1M) */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Przycisk +1 min w trakcie działania */}
          <Button
            onClick={handleAddOneMin}
            variant="outline"
            className="h-12 px-4 rounded-2xl border-white/10 glass-button text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4 text-cyan-400" />
            <span>+1 min</span>
          </Button>

          {/* Główny Przycisk Start / Pauza */}
          <Button
            onClick={handleStartPause}
            className={`h-14 px-8 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow-cyan-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                <span>Pauza</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current ml-0.5" />
                <span>{remainingSec < initialTotalSec ? 'Wznowienie' : 'Start'}</span>
              </>
            )}
          </Button>

          {/* Przycisk Reset */}
          <Button
            onClick={handleReset}
            variant="outline"
            className="h-12 px-4 rounded-2xl border-white/10 glass-button text-xs font-bold flex items-center gap-1.5 hover:bg-destructive/20 hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
