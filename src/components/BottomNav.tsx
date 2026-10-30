"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/app/lib/store';
import type { TabType } from '@/app/lib/store';
import { Wand2, ClipboardCheck, Timer, Calculator, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

export const BottomNav = () => {
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const hasCircuit = useAppStore((state) => state.circuit.length > 0);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport;
      if (!vv) return;
      // Wirtualna klawiatura ekranowa na urządzeniach mobilnych zmniejsza wysokość visualViewport o > 150px
      const isKeyboard = vv.height < window.innerHeight - 150;
      setIsKeyboardVisible(isKeyboard);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

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
      disabled: false,
    },
    {
      id: 'calculators',
      icon: Calculator,
      label: 'Narzędzia',
      disabled: false,
    },
    {
      id: 'studio',
      icon: Database,
      label: 'Studio',
      disabled: false,
    },
  ];

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 w-full bg-background/85 backdrop-blur-md border-t border-white/5 transition-all duration-300 ease-in-out select-none",
        isKeyboardVisible ? "translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
      )}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), var(--safe-area-inset-bottom, 0px))',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="relative mx-auto w-full max-w-md">
        {/* Glow effect at the top border */}
        <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
        
        <div className="flex items-center justify-between px-2 h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id as TabType)}
                disabled={tab.disabled}
                className={cn(
                  "relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 select-none",
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
