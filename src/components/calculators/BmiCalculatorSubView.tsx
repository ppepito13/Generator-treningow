"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import { BmiResult, BmiCategory, VALIDATION_LIMITS, getBmiCommentary } from '@/types/calculators';
import { Scale, HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BmiCalculatorSubViewProps {
  onNavigateTab?: (tab: 'rfm' | 'bmr' | 'tdee') => void;
}

export const BmiCalculatorSubView: React.FC<BmiCalculatorSubViewProps> = ({ onNavigateTab }) => {
  const { sharedUserProfile, updateSharedProfile } = useAppStore();

  const weight = sharedUserProfile.weight;
  const height = sharedUserProfile.height;
  const gender = sharedUserProfile.gender;

  const bmiResult = useMemo<BmiResult | null>(() => {
    if (!weight || !height || weight <= 0 || height <= 0) return null;

    const heightM = height / 100;
    const val = parseFloat((weight / (heightM * heightM)).toFixed(1));

    let category: BmiCategory = 'norma';
    let categoryLabel = 'W normie';
    let badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
    let badgeText = 'text-emerald-300';

    if (val < 18.5) {
      category = 'niedowaga';
      categoryLabel = 'Niedowaga';
      badgeBg = 'bg-cyan-500/20 border-cyan-500/30';
      badgeText = 'text-cyan-300';
    } else if (val >= 18.5 && val <= 24.9) {
      category = 'norma';
      categoryLabel = 'Norma (Optimum)';
      badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
      badgeText = 'text-emerald-300';
    } else if (val >= 25.0 && val <= 29.9) {
      category = 'nadwaga';
      categoryLabel = 'Nadwaga';
      badgeBg = 'bg-amber-500/20 border-amber-500/30';
      badgeText = 'text-amber-300';
    } else if (val >= 30.0 && val <= 34.9) {
      category = 'otylosc_1';
      categoryLabel = 'Otyłość I stopnia';
      badgeBg = 'bg-orange-500/20 border-orange-500/30';
      badgeText = 'text-orange-300';
    } else if (val >= 35.0 && val <= 39.9) {
      category = 'otylosc_2';
      categoryLabel = 'Otyłość II stopnia';
      badgeBg = 'bg-rose-500/20 border-rose-500/30';
      badgeText = 'text-rose-300';
    } else {
      category = 'otylosc_3';
      categoryLabel = 'Otyłość III stopnia';
      badgeBg = 'bg-rose-600/20 border-rose-600/40';
      badgeText = 'text-rose-400';
    }

    const comment = getBmiCommentary(category, val);

    return {
      value: val,
      category,
      categoryLabel,
      badgeBg,
      badgeText,
      comment,
    };
  }, [weight, height]);

  const hasWeightWarning = weight !== null && (weight < VALIDATION_LIMITS.weight.min || weight > VALIDATION_LIMITS.weight.max);
  const hasHeightWarning = height !== null && (height < VALIDATION_LIMITS.height.min || height > VALIDATION_LIMITS.height.max);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* MOTYW CYAN */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        {/* Nagłówek */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wider">Kalkulator BMI</h2>
              <p className="text-[11px] text-muted-foreground">Wskaźnik Masy Ciała (Body Mass Index)</p>
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
                BMI to prosty wskaźnik masy ciała. U osób aktywnych może być zawyżony z powodu tkanki mięśniowej, dlatego traktuj go jako ogólną wskazówkę.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* FORMULARZ */}
        <div className="space-y-4">
          {/* Płeć */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Płeć (autouzupełnianie):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSharedProfile({ gender: 'male' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
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
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
                }`}
              >
                Kobieta
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Waga */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-white/80">Waga (kg):</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-0.5 text-cyan-400/80 hover:text-cyan-300 transition-colors">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-white/10 text-xs text-white max-w-xs p-2.5">
                        Dla najwyższej dokładności waż się rano na czczo, po skorzystaniu z toalety i w samej bieliźnie.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                placeholder="np. 75"
                min={20}
                max={300}
                value={weight ?? ''}
                onChange={(e) => updateSharedProfile({ weight: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-11 text-sm font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>

            {/* Wzrost */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-white/80">Wzrost (cm):</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-0.5 text-cyan-400/80 hover:text-cyan-300 transition-colors">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-white/10 text-xs text-white max-w-xs p-2.5">
                        Mierz wzrost boso, stojąc prosto przy ścianie ze złączonymi piętami i głową opartą o ścianę.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                placeholder="np. 180"
                min={80}
                max={250}
                value={height ?? ''}
                onChange={(e) => updateSharedProfile({ height: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-11 text-sm font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* WYNIK */}
        {bmiResult ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Twój Wskaźnik BMI</span>
                <div className="font-mono font-black text-4xl text-cyan-300 tracking-tight">
                  {bmiResult.value}
                </div>
              </div>

              <Badge className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${bmiResult.badgeBg} ${bmiResult.badgeText}`}>
                {bmiResult.categoryLabel}
              </Badge>
            </div>

            <p className="text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
              {bmiResult.comment}
            </p>

            {/* LINKOWANIE DO RFM (KOLOR INDIGO DOPASOWANY DO RFM!) */}
            {onNavigateTab && (
              <Button
                onClick={() => onNavigateTab('rfm')}
                className="w-full h-11 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Sprawdź dokładniejszy kalkulator RFM</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
            Wprowadź wagę i wzrost, aby zobaczyć wyliczenie BMI.
          </div>
        )}
      </div>
    </div>
  );
};
