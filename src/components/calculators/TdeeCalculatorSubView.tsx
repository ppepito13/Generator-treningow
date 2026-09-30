"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import { TdeeResult, TdeeMode, PAL_OPTIONS, VALIDATION_LIMITS, getTdeeCommentary } from '@/types/calculators';
import { Activity, HelpCircle, AlertTriangle, Zap, TrendingDown, MinusCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const TdeeCalculatorSubView = () => {
  const { sharedUserProfile, updateSharedProfile } = useAppStore();

  const [tdeeMode, setTdeeMode] = useState<TdeeMode>('auto_bmr');
  const [manualBmrInput, setManualBmrInput] = useState<number | null>(null);

  const gender = sharedUserProfile.gender;
  const weight = sharedUserProfile.weight;
  const height = sharedUserProfile.height;
  const age = sharedUserProfile.age;
  const bodyFat = sharedUserProfile.bodyFat;
  const activityLevel = sharedUserProfile.activityLevel || 1.55;

  // Obliczenie BMR pomocniczego dla Trybu B
  const calculatedBmrForModeB = useMemo(() => {
    if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) return 0;
    if (bodyFat !== null && bodyFat > 0 && bodyFat < 70) {
      const lbm = weight * (1 - bodyFat / 100);
      return Math.round(370 + (21.6 * lbm));
    }
    const base = (10 * weight) + (6.25 * height) - (5 * age);
    return Math.round(gender === 'male' ? base + 5 : base - 161);
  }, [gender, weight, height, age, bodyFat]);

  // Obliczenie TDEE
  const tdeeResult = useMemo<TdeeResult | null>(() => {
    let bmr = 0;

    if (tdeeMode === 'manual_bmr') {
      if (!manualBmrInput || manualBmrInput <= 0) return null;
      bmr = manualBmrInput;
    } else {
      if (!calculatedBmrForModeB || calculatedBmrForModeB <= 0) return null;
      bmr = calculatedBmrForModeB;
    }

    const pal = activityLevel || 1.55;
    const tdeeVal = Math.round(bmr * pal);
    const reductionVal = Math.max(500, tdeeVal - 300);
    const massVal = tdeeVal + 300;
    const comment = getTdeeCommentary(tdeeVal, reductionVal, massVal, pal);

    return {
      tdee: tdeeVal,
      reduction: reductionVal,
      mass: massVal,
      modeUsed: tdeeMode,
      bmrValue: bmr,
      palValue: pal,
      comment,
    };
  }, [tdeeMode, manualBmrInput, calculatedBmrForModeB, activityLevel]);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        {/* NAGŁÓWEK */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wider">Kalkulator TDEE</h2>
              <p className="text-[11px] text-muted-foreground">Całkowite Dzienne Zapotrzebowanie Kaloryczne</p>
            </div>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1.5 text-white/50 hover:text-white transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-900 border-white/10 text-xs text-white max-w-xs p-3">
                TDEE określa ile kalorii spalasz dziennie, ącząc metabolizm spoczynkowy (BMR) z Twoim poziomem aktywności (PAL).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* PRZEŁĄCZNIK TRYBÓW TDEE */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-black/40 border border-white/10">
          <button
            type="button"
            onClick={() => setTdeeMode('auto_bmr')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tdeeMode === 'auto_bmr'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Tryb B: Autouzupełnij BMR
          </button>
          <button
            type="button"
            onClick={() => setTdeeMode('manual_bmr')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tdeeMode === 'manual_bmr'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            Tryb A: Wpisz BMR ręcznie
          </button>
        </div>

        {/* FORMULARZ ZALEŻNY OD TRYBU */}
        {tdeeMode === 'manual_bmr' ? (
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80">Podaj wartość BMR (kcal):</label>
            <Input
              type="number"
              placeholder="np. 1750"
              value={manualBmrInput ?? ''}
              onChange={(e) => setManualBmrInput(e.target.value ? parseFloat(e.target.value) : null)}
              className="glass-input h-11 text-sm font-mono font-bold text-white border-white/10 rounded-xl"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Płeć */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-white/80">Płeć:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSharedProfile({ gender: 'male' })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'male' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/5 text-white/50'
                  }`}
                >
                  Mężczyzna
                </button>
                <button
                  type="button"
                  onClick={() => updateSharedProfile({ gender: 'female' })}
                  className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    gender === 'female' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-white/5 border-white/5 text-white/50'
                  }`}
                >
                  Kobieta
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-white/70">Waga (kg)</label>
                <Input
                  type="number"
                  placeholder="75"
                  value={weight ?? ''}
                  onChange={(e) => updateSharedProfile({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                  className="glass-input h-9 text-xs font-mono font-bold text-white border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/70">Wzrost (cm)</label>
                <Input
                  type="number"
                  placeholder="180"
                  value={height ?? ''}
                  onChange={(e) => updateSharedProfile({ height: e.target.value ? parseFloat(e.target.value) : null })}
                  className="glass-input h-9 text-xs font-mono font-bold text-white border-white/10 rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/70">Wiek (lat)</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={age ?? ''}
                  onChange={(e) => updateSharedProfile({ age: e.target.value ? parseInt(e.target.value, 10) : null })}
                  className="glass-input h-9 text-xs font-mono font-bold text-white border-white/10 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* SELEKCJA POZIOMU AKTYWNOŚCI PAL */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-white/80">Poziom Aktywności Fizycznej (PAL):</label>
          <div className="space-y-1.5">
            {PAL_OPTIONS.map((pal) => (
              <div
                key={pal.value}
                onClick={() => updateSharedProfile({ activityLevel: pal.value })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  activityLevel === pal.value
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-sm'
                    : 'bg-black/20 border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>{pal.label}</span>
                  {activityLevel === pal.value && (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] px-1.5 py-0">Wybrany</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{pal.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* WYNIKI TDEE I CELE KALORYCZNE */}
        {tdeeResult ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="text-center border-b border-white/10 pb-3">
              <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Wyliczone TDEE (Utrzymanie)</span>
              <div className="font-mono font-black text-4xl text-emerald-400 tracking-tight">
                {tdeeResult.tdee} <span className="text-sm font-bold text-white/70">kcal / dzień</span>
              </div>
            </div>

            {/* 3 KARTY CELÓW KALORYCZNYCH */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Redukcja */}
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-rose-300 uppercase">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>Redukcja (-300)</span>
                </div>
                <div className="font-mono font-bold text-lg text-rose-200">
                  {tdeeResult.reduction} <span className="text-xs">kcal</span>
                </div>
              </div>

              {/* Utrzymanie */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-300 uppercase">
                  <MinusCircle className="h-3.5 w-3.5" />
                  <span>Utrzymanie</span>
                </div>
                <div className="font-mono font-bold text-lg text-emerald-200">
                  {tdeeResult.tdee} <span className="text-xs">kcal</span>
                </div>
              </div>

              {/* Masa */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-300 uppercase">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Masa (+300)</span>
                </div>
                <div className="font-mono font-bold text-lg text-cyan-200">
                  {tdeeResult.mass} <span className="text-xs">kcal</span>
                </div>
              </div>
            </div>

            {/* SEKCYJNY PRZEWODNIK FAQ WYNIKÓW I CELÓW KALORYCZNYCH */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3 text-xs leading-relaxed">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <HelpCircle className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white uppercase text-[11px] tracking-wider">Jak interpretować wyniki i wybrać cel?</span>
              </div>

              <p className="text-white/80">
                Twoje całkowite dzienne zapotrzebowanie (TDEE) przy aktywności <strong>PAL {tdeeResult.palValue}</strong> wynosi <strong className="text-emerald-300 font-mono">{tdeeResult.tdee} kcal/dobę</strong>.
              </p>

              <div className="space-y-3 pt-1">
                {/* Pytanie 1: Redukcja */}
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5">
                    <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                    <span>Chcesz schudnąć? (Redukcja tłuszczu)</span>
                  </div>
                  <p className="text-white/70 pl-5 text-[11px]">
                    Zastosuj bezpieczny deficyt kaloryczny. Celuj w spożycie około <strong className="text-white font-mono">{tdeeResult.reduction} kcal</strong> dziennie.
                  </p>
                </div>

                {/* Pytanie 2: Utrzymanie */}
                <div className="space-y-0.5">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <MinusCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Chcesz utrzymać aktualną masę ciała? (Zero kaloryczne)</span>
                  </div>
                  <p className="text-white/70 pl-5 text-[11px]">
                    Trzymaj się dokładnej wartości TDEE, czyli <strong className="text-white font-mono">{tdeeResult.tdee} kcal</strong> dziennie.
                  </p>
                </div>

                {/* Pytanie 3: Masa */}
                <div className="space-y-0.5">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 shrink-0" />
                    <span>Chcesz zbudować masę mięśniową? (Nadwyżka)</span>
                  </div>
                  <p className="text-white/70 pl-5 text-[11px]">
                    Celuj w umiarkowaną nadwyżkę energetyczną wynoszącą około <strong className="text-white font-mono">{tdeeResult.mass} kcal</strong> dziennie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
            Wprowadź BMR oraz wybierz poziom aktywności PAL, aby wyliczyć zapotrzebowanie TDEE.
          </div>
        )}
      </div>
    </div>
  );
};
