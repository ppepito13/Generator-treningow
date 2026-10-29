"use client";

import React, { useState } from 'react';
import { StopwatchSubView } from './StopwatchSubView';
import { CountdownSubView } from './CountdownSubView';
import { IntervalTimerSubView } from './IntervalTimerSubView';
import { Timer, Hourglass, Repeat } from 'lucide-react';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

export const TimerView = () => {
  const [activeSubTab, setActiveSubTab] = useState<'stopwatch' | 'countdown' | 'interval'>('interval');

  return (
    <div className="min-h-screen app-safe-top app-safe-bottom app-container-wide px-4 sm:px-6 space-y-6">
      {/* NAGŁÓWEK MODUŁU ZEGAR */}
      <ModuleHeader
        icon={Timer}
        title="Centrum Czasowe i Zegary Treningowe"
        subtitle="Stoper, minutnik oraz zaawansowany zegar interwałowy (Gym View & TTS)"
        iconBadgeClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
      >
        {/* WEWNĘTRZNE ZAKŁADKI MODUŁU ZEGAR */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
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
      </ModuleHeader>

      {/* RENDEROWANIE AKTYWNEGO SUB-MODUŁU */}
      {activeSubTab === 'interval' && <IntervalTimerSubView />}
      {activeSubTab === 'countdown' && <CountdownSubView />}
      {activeSubTab === 'stopwatch' && <StopwatchSubView />}
    </div>
  );
};
