"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import { BmrResult, BmrFormulaType, VALIDATION_LIMITS, getBmrCommentary } from '@/types/calculators';
import { Flame, HelpCircle, AlertTriangle, ArrowRight, Sparkles, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BmrCalculatorSubViewProps {
  onNavigateTab?: (tab: 'rfm' | 'bmr' | 'tdee') => void;
}

export const BmrCalculatorSubView: React.FC<BmrCalculatorSubViewProps> = ({ onNavigateTab }) => {
  const { sharedUserProfile, updateSharedProfile } = useAppStore();

  const gender = sharedUserProfile.gender;
  const weight = sharedUserProfile.weight;
  const height = sharedUserProfile.height;
  const age = sharedUserProfile.age;
  const bodyFat = sharedUserProfile.bodyFat;

  const bmrResult = useMemo<BmrResult | null>(() => {
    if (!weight || !height || !age || weight <= 0 || height <= 0 || age <= 0) return null;

    let bmrVal = 0;
    let formulaUsed: BmrFormulaType = 'mifflin';
    let formulaLabel = 'Wzór Mifflin-St Jeor (Standard)';
    let lbmKg: number | undefined = undefined;

    if (bodyFat !== null && bodyFat > 0 && bodyFat < 70) {
      formulaUsed = 'katch_mcardle';
      formulaLabel = 'Wzór Katch-McArdle (Z % BF)';
      lbmKg = parseFloat((weight * (1 - bodyFat / 100)).toFixed(1));
      bmrVal = Math.round(370 + (21.6 * lbmKg));
    } else {
      const base = (10 * weight) + (6.25 * height) - (5 * age);
      bmrVal = Math.round(gender === 'male' ? base + 5 : base - 161);
    }

    const comment = getBmrCommentary(bmrVal, formulaUsed, gender, bodyFat);

    return {
      value: bmrVal,
      formulaUsed,
      formulaLabel,
      lbmKg,
      comment,
    };
  }, [gender, weight, height, age, bodyFat]);

  const hasWeightWarning = weight !== null && (weight < VALIDATION_LIMITS.weight.min || weight > VALIDATION_LIMITS.weight.max);
  const hasHeightWarning = height !== null && (height < VALIDATION_LIMITS.height.min || height > VALIDATION_LIMITS.height.max);
  const hasAgeWarning = age !== null && (age < VALIDATION_LIMITS.age.min || age > VALIDATION_LIMITS.age.max);
  const hasBfWarning = bodyFat !== null && (bodyFat < VALIDATION_LIMITS.bodyFat.min || bodyFat > VALIDATION_LIMITS.bodyFat.max);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* MOTYW AMBER */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        {/* Nagłówek */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wider">Kalkulator BMR</h2>
              <p className="text-[11px] text-muted-foreground">Podstawowa Przemiana Materii (Basal Metabolic Rate)</p>
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
                BMR wylicza spoczynkowe zużycie kalorii. Podanie % tkanki tłuszczowej (np. z kalkulatora RFM) automatycznie przełącza na dokładniejszy wzór Katch-McArdle!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* FORMULARZ */}
        <div className="space-y-4">
          {/* Płeć */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80">Płeć:</label>
              {bodyFat !== null && bodyFat > 0 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 cursor-pointer">
                        <Info className="h-3 w-3" /> Metoda Katch-McArdle
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2 max-w-xs">
                      Gdy podano % tkanki tłuszczowej, BMR wyliczany jest ze wzoru Katch-McArdle na podstawie beztłuszczowej masy ciała (LBM), dlatego daje ten sam wynik niezależnie od płci!
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSharedProfile({ gender: 'male' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
                }`}
              >
                Mężczyzna
              </button>
              <button
                type="button"
                onClick={() => updateSharedProfile({ gender: 'female' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  gender === 'female'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
                }`}
              >
                Kobieta
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Waga */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80">Waga (kg):</label>
                {hasWeightWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2">
                        {VALIDATION_LIMITS.weight.warning}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                type="number"
                placeholder="75"
                value={weight ?? ''}
                onChange={(e) => updateSharedProfile({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-10 text-xs font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>

            {/* Wzrost */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80">Wzrost (cm):</label>
                {hasHeightWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2">
                        {VALIDATION_LIMITS.height.warning}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                type="number"
                placeholder="180"
                value={height ?? ''}
                onChange={(e) => updateSharedProfile({ height: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-10 text-xs font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>

            {/* Wiek */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80">Wiek (lat):</label>
                {hasAgeWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2">
                        {VALIDATION_LIMITS.age.warning}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                type="number"
                placeholder="30"
                value={age ?? ''}
                onChange={(e) => updateSharedProfile({ age: e.target.value ? parseInt(e.target.value, 10) : null })}
                className="glass-input h-10 text-xs font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>
          </div>

          {/* Opcjonalny BF% */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <span>Opcjonalny BF (% tkanki tłuszczowej):</span>
                {bodyFat !== null && <Sparkles className="h-3.5 w-3.5 text-amber-400" />}
              </label>
              {hasBfWarning && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2">
                      {VALIDATION_LIMITS.bodyFat.warning}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              type="number"
              placeholder="np. 15 (odblokowuje wzór Katch-McArdle)"
              value={bodyFat ?? ''}
              onChange={(e) => updateSharedProfile({ bodyFat: e.target.value ? parseFloat(e.target.value) : null })}
              className="glass-input h-10 text-xs font-mono text-white border-white/10 rounded-xl"
            />
          </div>
        </div>

        {/* WYNIK */}
        {bmrResult ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Twój Metabolizm Spoczynkowy</span>
                <div className="font-mono font-black text-4xl text-amber-400 tracking-tight">
                  {bmrResult.value} <span className="text-base font-bold text-white/70">kcal / dzień</span>
                </div>
              </div>

              <Badge className="px-3 py-1.5 rounded-xl font-bold text-[11px] border bg-amber-500/20 border-amber-500/30 text-amber-300">
                {bmrResult.formulaLabel}
              </Badge>
            </div>

            {bmrResult.lbmKg && (
              <div className="text-[11px] font-mono text-amber-300/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                Beztłuszczowa masa ciała (LBM): <strong>{bmrResult.lbmKg} kg</strong> (wzór Katch-McArdle)
              </div>
            )}

            <p className="text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
              {bmrResult.comment}
            </p>

            {/* LINKOWANIE DO TDEE (KOLOR EMERALD DOPASOWANY DO TDEE!) */}
            {onNavigateTab && (
              <Button
                onClick={() => onNavigateTab('tdee')}
                className="w-full h-11 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Przejdź do kalkulatora TDEE (Całkowite Zapotrzebowanie)</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
            Wprowadź wagę, wzrost oraz wiek, aby wyliczyć metabolizm spoczynkowy BMR.
          </div>
        )}
      </div>
    </div>
  );
};
