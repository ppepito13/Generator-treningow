"use client";

import React, { useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import { RfmResult, RfmCategory, VALIDATION_LIMITS, getRfmCommentary } from '@/types/calculators';
import { Ruler, HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RfmCalculatorSubViewProps {
  onNavigateTab?: (tab: 'rfm' | 'bmr' | 'tdee') => void;
}

export const RfmCalculatorSubView: React.FC<RfmCalculatorSubViewProps> = ({ onNavigateTab }) => {
  const { sharedUserProfile, updateSharedProfile } = useAppStore();

  const height = sharedUserProfile.height;
  const waist = sharedUserProfile.waist;
  const gender = sharedUserProfile.gender;

  const rfmResult = useMemo<RfmResult | null>(() => {
    if (!height || !waist || height <= 0 || waist <= 0) return null;

    const baseConstant = gender === 'female' ? 76 : 64;
    const rfmVal = parseFloat((baseConstant - (20 * (height / waist))).toFixed(1));
    const val = Math.max(2, Math.min(65, rfmVal));

    let category: RfmCategory = 'zdrowa';
    let categoryLabel = 'Zdrowy poziom';
    let badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
    let badgeText = 'text-emerald-300';

    if (gender === 'male') {
      if (val < 6) {
        category = 'sportowa_bardzo_niska';
        categoryLabel = 'Bardzo niska zawartość';
        badgeBg = 'bg-indigo-500/20 border-indigo-500/30';
        badgeText = 'text-indigo-300';
      } else if (val < 14) {
        category = 'sportowa';
        categoryLabel = 'Bardzo sportowa sylwetka';
        badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
        badgeText = 'text-emerald-300';
      } else if (val < 18) {
        category = 'zdrowa';
        categoryLabel = 'Zdrowy poziom (Dobry)';
        badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
        badgeText = 'text-emerald-300';
      } else if (val < 25) {
        category = 'lekko_podwyzszona';
        categoryLabel = 'Lekko podwyższony';
        badgeBg = 'bg-amber-500/20 border-amber-500/30';
        badgeText = 'text-amber-300';
      } else {
        category = 'podwyzszona';
        categoryLabel = 'Podwyższony / Wysoki';
        badgeBg = 'bg-rose-500/20 border-rose-500/30';
        badgeText = 'text-rose-300';
      }
    } else {
      if (val < 14) {
        category = 'sportowa_bardzo_niska';
        categoryLabel = 'Bardzo niska zawartość';
        badgeBg = 'bg-indigo-500/20 border-indigo-500/30';
        badgeText = 'text-indigo-300';
      } else if (val < 21) {
        category = 'sportowa';
        categoryLabel = 'Bardzo sportowa sylwetka';
        badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
        badgeText = 'text-emerald-300';
      } else if (val < 25) {
        category = 'zdrowa';
        categoryLabel = 'Zdrowy poziom (Dobry)';
        badgeBg = 'bg-emerald-500/20 border-emerald-500/30';
        badgeText = 'text-emerald-300';
      } else if (val < 32) {
        category = 'lekko_podwyzszona';
        categoryLabel = 'Lekko podwyższony';
        badgeBg = 'bg-amber-500/20 border-amber-500/30';
        badgeText = 'text-amber-300';
      } else {
        category = 'podwyzszona';
        categoryLabel = 'Podwyższony / Wysoki';
        badgeBg = 'bg-rose-500/20 border-rose-500/30';
        badgeText = 'text-rose-300';
      }
    }

    const comment = getRfmCommentary(category, val, gender);

    return {
      value: val,
      category,
      categoryLabel,
      badgeBg,
      badgeText,
      comment,
    };
  }, [height, waist, gender]);

  const handleUseRfmForBmr = () => {
    if (rfmResult) {
      updateSharedProfile({ bodyFat: rfmResult.value });
      if (onNavigateTab) onNavigateTab('bmr');
    }
  };

  const hasHeightWarning = height !== null && (height < VALIDATION_LIMITS.height.min || height > VALIDATION_LIMITS.height.max);
  const hasWaistWarning = waist !== null && (waist < VALIDATION_LIMITS.waist.min || waist > VALIDATION_LIMITS.waist.max);

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* MOTYW INDIGO */}
      <div className="glass-card p-6 sm:p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        {/* Nagłówek */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Ruler className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase text-white tracking-wider">Kalkulator RFM</h2>
              <p className="text-[11px] text-muted-foreground">Wskaźnik Względnej Masy Tłuszczowej (Relative Fat Mass)</p>
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
                RFM wylicza szacunkowy procent tkanki tłuszczowej na podstawie stosunku wzrostu do obwodu talii. Daje znacznie bardziej miarodajne wyniki dla osób ćwiczących niż standardowe BMI.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* FORMULARZ */}
        <div className="space-y-4">
          {/* Płeć */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white/80">Płeć:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSharedProfile({ gender: 'male' })}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  gender === 'male'
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
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
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : 'bg-white/5 border-white/5 text-white/50 hover:text-white'
                }`}
              >
                Kobieta
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="np. 180"
                min={80}
                max={250}
                value={height ?? ''}
                onChange={(e) => updateSharedProfile({ height: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-11 text-sm font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>

            {/* Obwód talii */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-white/80">Obwód talii (cm):</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="p-0.5 text-indigo-400/80 hover:text-indigo-300 transition-colors">
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-white/10 text-xs text-white max-w-xs p-3 space-y-1.5">
                        <p className="font-bold text-indigo-300">Jak poprawnie zmierzyć obwód talii?</p>
                        {gender === 'female' ? (
                          <p><strong>Kobiety:</strong> Mierz miarą krawiecką w najwęższym miejscu tułowia (zazwyczaj 2–3 cm powyżej pępka) na swobodnym wydechu, stojąc prosto.</p>
                        ) : (
                          <p><strong>Mężczyźni:</strong> Mierz miarą krawiecką poziomo na wysokości pępka. Wykonaj pomiar na luźnym wydechu, bez wciągania brzucha.</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {hasWaistWarning && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-neutral-900 border-amber-500/30 text-amber-300 text-xs p-2">
                        {VALIDATION_LIMITS.waist.warning}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <Input
                type="number"
                placeholder="np. 82"
                min={30}
                max={250}
                value={waist ?? ''}
                onChange={(e) => updateSharedProfile({ waist: e.target.value ? parseFloat(e.target.value) : null })}
                className="glass-input h-11 text-sm font-mono font-bold text-white border-white/10 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* WYNIK */}
        {rfmResult ? (
          <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-mono font-bold block">Szacowana Tkanka Tłuszczowa (RFM)</span>
                <div className="font-mono font-black text-4xl text-indigo-300 tracking-tight">
                  {rfmResult.value} %
                </div>
              </div>

              <Badge className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${rfmResult.badgeBg} ${rfmResult.badgeText}`}>
                {rfmResult.categoryLabel}
              </Badge>
            </div>

            <p className="text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed">
              {rfmResult.comment}
            </p>

            {/* LINKOWANIE DO BMR (KOLOR AMBER DOPASOWANY DO BMR!) */}
            {onNavigateTab && (
              <Button
                onClick={handleUseRfmForBmr}
                className="w-full h-11 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Użyj RFM ({rfmResult.value}%) do wyliczenia BMR</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="p-6 text-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-xs text-muted-foreground">
            Wprowadź wzrost oraz obwód talii, aby przeliczyć wynik RFM%.
          </div>
        )}
      </div>
    </div>
  );
};
