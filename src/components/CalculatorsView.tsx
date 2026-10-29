"use client";

import React, { useState } from 'react';
import { useAppStore } from '@/app/lib/store';
import { CalculatorTabType } from '@/types/calculators';
import { MathCalculatorSubView } from './calculators/MathCalculatorSubView';
import { BmiCalculatorSubView } from './calculators/BmiCalculatorSubView';
import { RfmCalculatorSubView } from './calculators/RfmCalculatorSubView';
import { BmrCalculatorSubView } from './calculators/BmrCalculatorSubView';
import { TdeeCalculatorSubView } from './calculators/TdeeCalculatorSubView';
import { Calculator, Scale, Ruler, Flame, Activity, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ModuleHeader } from '@/components/ui/ModuleHeader';

export const CalculatorsView = () => {
  const { toast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<CalculatorTabType>('math');
  const sharedUserProfile = useAppStore((state) => state.sharedUserProfile);
  const clearSharedProfile = useAppStore((state) => state.clearSharedProfile);

  const handleNavigateTab = (tab: 'rfm' | 'bmr' | 'tdee') => {
    setActiveSubTab(tab);
  };

  const handleClearProfile = () => {
    clearSharedProfile();
    toast({
      title: "Wyczyszczono dane profilu",
      description: "Usunięto zapisane wartości wagi, wzrostu, wieku i obwodów.",
    });
  };

  const hasProfileData = sharedUserProfile.weight !== null ||
    sharedUserProfile.height !== null ||
    sharedUserProfile.age !== null ||
    sharedUserProfile.waist !== null ||
    sharedUserProfile.bodyFat !== null;

  return (
    <div className="min-h-screen app-safe-top app-safe-bottom app-container-wide px-4 sm:px-6 space-y-6">
      {/* NAGŁÓWEK MODUŁU NARZĘDZIA */}
      <ModuleHeader
        icon={Calculator}
        title="Centrum Narzędzi i Kalkulatory"
        subtitle="Matematyka, wskaźniki biologiczne, tkanka tłuszczowa i zapotrzebowanie TDEE"
        iconBadgeClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        actions={
          hasProfileData ? (
            <Button
              onClick={handleClearProfile}
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5"
              title="Wyczyść zapisane w pamięci dane antropometryczne"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Wyczyść dane</span>
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-4">
          {/* PODSUMOWANIE WSPÓŁDZIELONEGO PROFILU */}
          {hasProfileData && (
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-white/70 bg-black/30 p-3 rounded-xl border border-white/5">
              <span className="font-bold text-cyan-400 flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" /> Profil:
              </span>
              {sharedUserProfile.gender && <span>Płeć: {sharedUserProfile.gender === 'male' ? 'M' : 'K'} •</span>}
              {sharedUserProfile.weight && <span>Waga: {sharedUserProfile.weight} kg •</span>}
              {sharedUserProfile.height && <span>Wzrost: {sharedUserProfile.height} cm •</span>}
              {sharedUserProfile.age && <span>Wiek: {sharedUserProfile.age} lat •</span>}
              {sharedUserProfile.waist && <span>Talia: {sharedUserProfile.waist} cm •</span>}
              {sharedUserProfile.bodyFat && <span>BF: {sharedUserProfile.bodyFat}%</span>}
            </div>
          )}

          {/* WEWNĘTRZNE ZAKŁADKI KALKULATORÓW Z DEDYKOWANYMI KOLORAMI */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            {/* Matematyczny - Violet */}
            <button
              onClick={() => setActiveSubTab('math')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'math'
                  ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Calculator className="h-4 w-4 text-violet-400" />
              <span>Matematyczny</span>
            </button>

            {/* BMI - Cyan */}
            <button
              onClick={() => setActiveSubTab('bmi')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'bmi'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Scale className="h-4 w-4 text-cyan-400" />
              <span>BMI</span>
            </button>

            {/* RFM - Indigo */}
            <button
              onClick={() => setActiveSubTab('rfm')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'rfm'
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Ruler className="h-4 w-4 text-indigo-400" />
              <span>RFM</span>
            </button>

            {/* BMR - Amber */}
            <button
              onClick={() => setActiveSubTab('bmr')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'bmr'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Flame className="h-4 w-4 text-amber-400" />
              <span>BMR</span>
            </button>

            {/* TDEE - Emerald */}
            <button
              onClick={() => setActiveSubTab('tdee')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeSubTab === 'tdee'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-md'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>TDEE</span>
            </button>
          </div>
        </div>
      </ModuleHeader>

      {/* RENDEROWANIE SUB-MODUŁÓW */}
      {activeSubTab === 'math' && <MathCalculatorSubView />}
      {activeSubTab === 'bmi' && <BmiCalculatorSubView onNavigateTab={handleNavigateTab} />}
      {activeSubTab === 'rfm' && <RfmCalculatorSubView onNavigateTab={handleNavigateTab} />}
      {activeSubTab === 'bmr' && <BmrCalculatorSubView onNavigateTab={handleNavigateTab} />}
      {activeSubTab === 'tdee' && <TdeeCalculatorSubView />}
    </div>
  );
};
