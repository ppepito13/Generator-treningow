"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LapRecord } from '@/types/timer';
import { Play, Pause, RotateCcw, Flag, Trophy, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const StopwatchSubView = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeMs, setTimeMs] = useState(0);
  const [laps, setLaps] = useState<LapRecord[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  const updateTime = () => {
    if (startTimeRef.current > 0) {
      const now = performance.now();
      const current = accumulatedTimeRef.current + (now - startTimeRef.current);
      setTimeMs(current);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      // Pauza
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      accumulatedTimeRef.current = timeMs;
      startTimeRef.current = 0;
      setIsRunning(false);
    } else {
      // Start / Wznowienie
      startTimeRef.current = performance.now();
      setIsRunning(true);
      animationFrameRef.current = requestAnimationFrame(updateTime);
    }
  };

  const handleLap = () => {
    if (!isRunning) return;

    const previousTotal = laps.length > 0 ? laps[0].totalTimeMs : 0;
    const currentTotal = timeMs;
    const lapTime = currentTotal - previousTotal;

    const newLap: LapRecord = {
      id: laps.length + 1,
      lapTimeMs: lapTime,
      totalTimeMs: currentTotal,
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  const handleReset = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsRunning(false);
    startTimeRef.current = 0;
    accumulatedTimeRef.current = 0;
    setTimeMs(0);
    setLaps([]);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((ms % 1000) / 10);

    const mStr = minutes.toString().padStart(2, '0');
    const sStr = seconds.toString().padStart(2, '0');
    const hStr = hundredths.toString().padStart(2, '0');

    return { mStr, sStr, hStr, formatted: `${mStr}:${sStr}.${hStr}` };
  };

  const { mStr, sStr, hStr } = formatTime(timeMs);

  // Wyznaczenie najszybszego i najwolniejszego okrążenia dla podświetleń
  const lapStats = useMemo(() => {
    if (laps.length < 2) return { fastestId: null, slowestId: null };
    let fastestId = laps[0].id;
    let slowestId = laps[0].id;
    let minTime = laps[0].lapTimeMs;
    let maxTime = laps[0].lapTimeMs;

    laps.forEach((lap) => {
      if (lap.lapTimeMs < minTime) {
        minTime = lap.lapTimeMs;
        fastestId = lap.id;
      }
      if (lap.lapTimeMs > maxTime) {
        maxTime = lap.lapTimeMs;
        slowestId = lap.id;
      }
    });

    return { fastestId, slowestId };
  }, [laps]);

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      {/* KARTA GŁÓWNEGO STOPERA */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 text-center space-y-6 relative overflow-hidden bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent">
        <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-mono tracking-widest px-2">
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-cyan-400" />
            <span>Precyzyjny Stoper</span>
          </div>
          <Badge className="bg-white/5 text-white/70 border-white/10 font-mono">
            {isRunning ? 'Wpływie...' : timeMs > 0 ? 'Wstrzymany' : 'Gotowy'}
          </Badge>
        </div>

        {/* GŁÓWNY ZEGAR STOPERA */}
        <div className="py-4">
          <div className="font-mono font-black text-6xl sm:text-7xl text-white tracking-tight flex items-baseline justify-center gap-1 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <span>{mStr}:{sStr}</span>
            <span className="text-3xl sm:text-4xl text-cyan-400">.{hStr}</span>
          </div>
        </div>

        {/* PANEL STEROWANIA: START/PAUZA | OKRĄŻENIE | RESET */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Przycisk Lap (Okrążenie) */}
          <Button
            onClick={handleLap}
            disabled={!isRunning}
            variant="outline"
            className="h-12 px-5 rounded-2xl border-white/10 glass-button text-xs font-bold flex items-center gap-2 disabled:opacity-30"
          >
            <Flag className="h-4 w-4 text-amber-400" />
            <span>Okrążenie</span>
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
                <span>{timeMs > 0 ? 'Wznowienie' : 'Start'}</span>
              </>
            )}
          </Button>

          {/* Przycisk Reset */}
          <Button
            onClick={handleReset}
            disabled={timeMs === 0}
            variant="outline"
            className="h-12 px-5 rounded-2xl border-white/10 glass-button text-xs font-bold flex items-center gap-2 disabled:opacity-30 hover:bg-destructive/20 hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* TABELA OKRĄŻEŃ (ZGODNIE Z WYMAGANIEM: WIDOCZNA PO STOPU DO RESETU) */}
      {laps.length > 0 && (
        <div className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="h-4 w-4 text-cyan-400" />
              <span>Wyniki Okrążeń ({laps.length})</span>
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">
              Najszybsze (Zielony) / Najwolniejsze (Czerwony)
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
            {laps.map((lap) => {
              const isFastest = lap.id === lapStats.fastestId;
              const isSlowest = lap.id === lapStats.slowestId;

              const splitFormatted = formatTime(lap.lapTimeMs).formatted;
              const totalFormatted = formatTime(lap.totalTimeMs).formatted;

              return (
                <div
                  key={lap.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isFastest
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isSlowest
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                      : 'bg-black/20 border-white/5 text-white/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`font-mono text-xs px-2.5 py-0.5 rounded-lg border ${
                      isFastest
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isSlowest
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-white/5 text-white/60 border-white/10'
                    }`}>
                      #{lap.id}
                    </Badge>
                    <span className="text-xs font-bold">
                      {isFastest && 'Najszybsze okrążenie'}
                      {isSlowest && 'Najwolniejsze okrążenie'}
                      {!isFastest && !isSlowest && `Okrążenie ${lap.id}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-right font-mono">
                    <div>
                      <div className="text-xs font-bold text-white">+{splitFormatted}</div>
                      <div className="text-[10px] text-muted-foreground">Łącznie: {totalFormatted}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
