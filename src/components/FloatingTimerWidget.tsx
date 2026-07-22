"use client";

import React from 'react';
import { FlattenedQueueItem } from './GymViewModal';
import { STEP_COLOR_MAP } from '@/types/timer';
import { Play, Pause, Maximize2, X, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FloatingTimerWidgetProps {
  currentItem: FlattenedQueueItem | null;
  remainingSec: number;
  isRunning: boolean;
  onTogglePlayPause: () => void;
  onMaximize: () => void;
  onClose: () => void;
}

export const FloatingTimerWidget: React.FC<FloatingTimerWidgetProps> = ({
  currentItem,
  remainingSec,
  isRunning,
  onTogglePlayPause,
  onMaximize,
  onClose,
}) => {
  if (!currentItem) return null;

  const colorTheme = STEP_COLOR_MAP[currentItem.color] || STEP_COLOR_MAP.green;
  const minutes = Math.floor(remainingSec / 60).toString().padStart(2, '0');
  const seconds = (remainingSec % 60).toString().padStart(2, '0');

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className={`p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 ${colorTheme.darkBg} ${colorTheme.border}`}>
        {/* Lewa strona: Nazwa kroku + Runda */}
        <div
          onClick={onMaximize}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
        >
          <span className={`p-2 rounded-xl text-neutral-950 font-black shadow shrink-0 ${colorTheme.bg}`}>
            <Timer className="h-5 w-5" />
          </span>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black uppercase text-white truncate group-hover:text-cyan-400 transition-colors">
                {currentItem.stepName}
              </h4>
              {currentItem.totalRounds > 1 && (
                <Badge className="bg-white/10 text-white/80 border-white/20 text-[9px] font-mono font-bold px-1.5 py-0">
                  {currentItem.roundIndex}/{currentItem.totalRounds}
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-white/60 truncate">
              {currentItem.nextText}
            </p>
          </div>
        </div>

        {/* Środek: Czas */}
        <div onClick={onMaximize} className="font-mono font-black text-2xl text-white tracking-tight cursor-pointer">
          {minutes}:{seconds}
        </div>

        {/* Prawa strona: Przyciski Akcji */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            onClick={onTogglePlayPause}
            size="icon"
            className={`h-9 w-9 rounded-xl font-bold transition-all shadow ${
              isRunning ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400' : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
          </Button>

          <Button
            onClick={onMaximize}
            variant="ghost"
            size="icon"
            title="Maksymalizuj timer"
            className="h-9 w-9 rounded-xl text-white/70 hover:text-white hover:bg-white/10"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            title="Zamknij zegar"
            className="h-9 w-9 rounded-xl text-white/40 hover:text-rose-400 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
