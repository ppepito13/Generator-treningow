"use client";

import React, { useState } from 'react';
import { StopwatchSubView } from './StopwatchSubView';
import { CountdownSubView } from './CountdownSubView';
import { IntervalTimerSubView } from './IntervalTimerSubView';
import { Timer, Hourglass, Repeat, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const TimerView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stopwatch' | 'countdown' | 'interval'>('interval');

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* NAGŁÓWEK MODUŁU ZEGAR */}
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Timer className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">Centrum Czasowe i Zegary Treningowe</h1>
            <p className="text-xs text-white/50">Stoper, minutnik oraz zaawansowany zegar interwałowy (Gym View & TTS)</p>
          </div>
        </div>

        {/* WEWNĘTRZNE ZAKŁADKI MODUŁU ZEGAR */}
        <div className="flex gap-2 border-t border-white/5 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('interval')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'interval'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-md'
                : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Repeat className="h-4 w-4" />
            <span>Zegar Interwałowy</span>
          </button>

          <button
            onClick={() => setActiveSubTab('countdown')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'countdown'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-md'
                : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Hourglass className="h-4 w-4" />
            <span>Minutnik</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stopwatch')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'stopwatch'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-md'
                : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Timer className="h-4 w-4" />
            <span>Stoper</span>
          </button>
        </div>
      </div>

      {/* RENDEROWANIE AKTYWNEGO SUB-MODUŁU */}
      {activeSubTab === 'interval' && <IntervalTimerSubView />}
      {activeSubTab === 'countdown' && <CountdownSubView />}
      {activeSubTab === 'stopwatch' && <StopwatchSubView />}
    </div>
  );
};
