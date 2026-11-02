"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/app/lib/store';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  ArrowLeft, 
  Palette, 
  Moon, 
  Sun, 
  Cloud, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  Database,
  Sparkles
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="min-h-screen app-safe-top app-safe-bottom app-container-narrow px-4 sm:px-6 space-y-6">
      {/* NAGŁÓWEK MODUŁU USTAWIENIA */}
      <ModuleHeader
        icon={Settings}
        title="Ustawienia"
        subtitle="Personalizacja i preferencje aplikacji"
        iconBadgeClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('generator')}
            className="border-white/10 hover:border-cyan-500/40 hover:bg-white/5 text-muted-foreground hover:text-cyan-400 gap-2 rounded-xl text-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć</span>
          </Button>
        }
      />

      {/* 1. SEKCJA: WYGLĄD I MOTYW (#15) */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Wygląd i Motyw</h2>
            <p className="text-xs text-muted-foreground">Wybierz preferowany schemat kolorystyczny</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Motyw Ciemny */}
          <button
            type="button"
            onClick={() => setSelectedTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-center space-y-2 ${
              selectedTheme === 'dark'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <div className="p-2 rounded-xl bg-black/40 text-cyan-400">
              <Moon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Ciemny</span>
              <span className="text-[10px] text-cyan-300/80 block">Zalecany na salę</span>
            </div>
            {selectedTheme === 'dark' && (
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-1" />
            )}
          </button>

          {/* Motyw Jasny */}
          <button
            type="button"
            onClick={() => setSelectedTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-center space-y-2 relative ${
              selectedTheme === 'light'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Wkrótce #15
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Sun className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Jasny</span>
              <span className="text-[10px] text-muted-foreground block">Wysoki kontrast</span>
            </div>
            {selectedTheme === 'light' && (
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-1" />
            )}
          </button>
        </div>
      </div>

      {/* 2. SEKCJA: KONTO I KOPIA ZAPASOWA W CHMURZE (#39, #40) */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Konto i Kopia Zapasowa</h2>
            <p className="text-xs text-muted-foreground">Synchronizacja danych i sal z Kontem Google</p>
          </div>
        </div>

        {/* Karta bieżącego statusu */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Bieżący stan pamięci:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lokalnie (Offline First)
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Wszystkie zmodyfikowane ćwiczenia, sale treningowe oraz historia są bezpiecznie zapisywane w pamięci urządzenia i działają bez dostępu do Internetu.
          </p>
        </div>

        {/* Placeholder integracji Google (#39, #40) */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center font-black text-black text-xs shadow-sm">
                G
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Konto Google</span>
                <span className="text-[10px] text-muted-foreground block">Niezalogowany</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
              Etap #39
            </span>
          </div>
          <p className="text-[11px] text-white/60 leading-relaxed">
            Połączenie konta pozwoli na automatyczną synchronizację Twoich autorskich ćwiczeń oraz konfiguracji sal pomiędzy telefonem a komputerem.
          </p>
          <Button
            variant="outline"
            disabled
            className="w-full border-white/10 bg-white/5 text-muted-foreground text-xs gap-2 rounded-xl cursor-not-allowed"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400/50" />
            <span>Połącz z Kontem Google (Wkrótce)</span>
          </Button>
        </div>
      </div>

      {/* 3. SEKCJA: O APLIKACJI */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">O Aplikacji</h2>
            <p className="text-xs text-muted-foreground">Informacje techniczne i licencja</p>
          </div>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Nazwa</span>
            <span className="font-semibold text-white">Generator Sport&apos;s Way</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Wersja</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-400">
              v1.3.0
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Baza ćwiczeń</span>
            <span className="inline-flex items-center gap-1 text-white/80">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              40 ćwiczeń kalibrowanych
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Silnik generatora</span>
            <span className="inline-flex items-center gap-1 text-white/80">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              SDD Heurystyka v1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
