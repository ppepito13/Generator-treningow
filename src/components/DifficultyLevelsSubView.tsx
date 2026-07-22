"use client";

import React from 'react';
import { DIFFICULTY_LEVELS, DifficultyLevel } from '@/app/lib/data';
import { BarChart3, Activity, Dumbbell, Cpu, Info, ShieldCheck, Flame, Zap, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const DifficultyLevelsSubView = () => {
  const getLevelTheme = (id: string) => {
    switch (id) {
      case 'fundamenty_regresje':
        return {
          border: 'border-emerald-500/20 hover:border-emerald-500/50',
          bg: 'bg-emerald-500/5',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          iconColor: 'text-emerald-400',
          gradient: 'from-emerald-500/10 via-transparent to-transparent',
          icon: ShieldCheck
        };
      case 'baza_silowa_standard':
        return {
          border: 'border-cyan-500/20 hover:border-cyan-500/50',
          bg: 'bg-cyan-500/5',
          badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          iconColor: 'text-cyan-400',
          gradient: 'from-cyan-500/10 via-transparent to-transparent',
          icon: BarChart3
        };
      case 'progresja_dynamika':
        return {
          border: 'border-amber-500/20 hover:border-amber-500/50',
          bg: 'bg-amber-500/5',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          iconColor: 'text-amber-400',
          gradient: 'from-amber-500/10 via-transparent to-transparent',
          icon: Zap
        };
      case 'zaawansowana_sila_strict':
        return {
          border: 'border-orange-500/20 hover:border-orange-500/50',
          bg: 'bg-orange-500/5',
          badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          iconColor: 'text-orange-400',
          gradient: 'from-orange-500/10 via-transparent to-transparent',
          icon: Flame
        };
      case 'elita_sufit':
        return {
          border: 'border-rose-500/20 hover:border-rose-500/50',
          bg: 'bg-rose-500/5',
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          iconColor: 'text-rose-400',
          gradient: 'from-rose-500/10 via-transparent to-transparent',
          icon: Activity
        };
      default:
        return {
          border: 'border-primary/20 hover:border-primary/50',
          bg: 'bg-primary/5',
          badgeBg: 'bg-primary/10 text-primary border-primary/20',
          iconColor: 'text-primary',
          gradient: 'from-primary/10 via-transparent to-transparent',
          icon: Layers
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* NAGŁÓWEK INFORMACYJNY POZIOMÓW TRUDNOŚCI */}
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 relative overflow-hidden bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-transparent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <BarChart3 className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Poziomy Trudności Algorytmu</h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Poniżej znajduje się pełna specyfikacja 5 poziomów trudności sklasyfikowanych w naszym generatorze. Algorytm dobiera ćwiczenia na podstawie tych skali (poziomy 1-10), dbając o optymalne obciążenie biomechaniczne i właściwy czas regeneracji.
            </p>
          </div>
          <Badge className="bg-white/10 text-white/80 border-white/10 px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-widest shrink-0">
            5 Grup Poziomów
          </Badge>
        </div>
      </div>

      {/* SIATKA KART POZIOMÓW TRUDNOŚCI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {DIFFICULTY_LEVELS.map((level) => {
          const theme = getLevelTheme(level.id);
          const IconComp = theme.icon;

          return (
            <div
              key={level.id}
              className={`glass-card rounded-[2rem] p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${theme.border} ${theme.bg}`}
            >
              {/* Subtle top glow gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-50 pointer-events-none`} />

              <div className="relative z-10 space-y-5">
                {/* Nagłówek Karty */}
                <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <IconComp className={`h-5 w-5 ${theme.iconColor}`} />
                      <h3 className="font-bold text-base text-white tracking-tight">{level.nazwa_grupy}</h3>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">
                      ID: {level.id}
                    </span>
                  </div>
                  <Badge className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-xl border ${theme.badgeBg}`}>
                    Poziom {level.min_poziom} - {level.max_poziom}
                  </Badge>
                </div>

                {/* Charakterystyka Biomechaniczna */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                    <Activity className="h-3.5 w-3.5 text-primary" />
                    <span>Charakterystyka Biomechaniczna</span>
                  </div>
                  <p className="text-xs text-white/80 leading-relaxed font-normal bg-black/20 p-3 rounded-xl border border-white/5">
                    {level.charakterystyka_biomechaniczna}
                  </p>
                </div>

                {/* Przykłady z Bazy */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                    <Dumbbell className="h-3.5 w-3.5 text-secondary" />
                    <span>Przykłady z Bazy Ćwiczeń</span>
                  </div>
                  <p className="text-xs text-white/90 leading-relaxed font-medium bg-black/20 p-3 rounded-xl border border-white/5">
                    {level.przyklady_z_bazy}
                  </p>
                </div>

                {/* Logika Algorytmu */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white/70">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Logika Algorytmiczna</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic bg-black/20 p-3 rounded-xl border border-white/5">
                    "{level.logika_algorytmu}"
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
