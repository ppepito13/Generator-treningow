"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { Wand2, ClipboardCheck, Timer, Calculator, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const hasCircuit = useAppStore((state) => state.circuit.length > 0);

  const tabs = [
    {
      id: 'generator',
      icon: Wand2,
      label: 'Generator',
      disabled: false,
    },
    {
      id: 'circuit',
      icon: ClipboardCheck,
      label: 'Zestaw',
      disabled: false,
      showBadge: hasCircuit,
    },
    {
      id: 'timer',
      icon: Timer,
      label: 'Zegar',
      disabled: true,
    },
    {
      id: 'calculators',
      icon: Calculator,
      label: 'Narzędzia',
      disabled: true,
    },
    {
      id: 'studio',
      icon: Database,
      label: 'Studio',
      disabled: true,
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-auto"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="relative mx-auto w-full max-w-md">
        {/* Glow effect at the top border */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div 
          className="flex items-center justify-between px-2 h-16 bg-background/80 backdrop-blur-md border-t border-white/5"
          style={{ WebkitBackdropFilter: 'blur(12px)' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                  isActive ? "text-cyan-400" : "text-muted-foreground",
                  tab.disabled ? "opacity-30 cursor-not-allowed" : "hover:text-cyan-400/80 active:scale-95"
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-6 w-6", isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")} />
                  {tab.showBadge && !isActive && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-cyan-500 rounded-full border-2 border-background" />
                  )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {tab.label}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
