"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { CircuitList } from '@/components/CircuitList';
import { GenerationConflictDialog } from '@/components/GenerationConflictDialog';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { activeTab, activeView, popView, generationConflict, resolveConflict } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // Oczekujemy na tzw. "Hydratację" (Hydration) komponentu na kliencie.
  // Jest to kluczowe dla działania biblioteki Zustand (persist), aby uniknąć błędu 
  // niezgodności (mismatch) wygenerowanego kodu między serwerem a przeglądarką.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Automatyczne przewijanie na górę po wygenerowaniu treningu
  useEffect(() => {
    if (activeTab === 'circuit') {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Obsługa sprzętowego przycisku "Wstecz" (Capacitor)
  useEffect(() => {
    let backListener: any;

    const setupBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        
        backListener = await App.addListener('backButton', () => {
          // 1. Jeśli jest otwarty konflikt/dialog - zamknij go
          if (generationConflict) {
            resolveConflict({ action: 'cancel' });
            return;
          }

          // 2. Jeśli jesteśmy w widoku innym niż HOME (generator) - cofnij widok (TODO: dostosować do Tabs)
          if (activeTab !== 'generator') {
            useAppStore.getState().setActiveTab('generator');
            return;
          }

          // 3. Jeśli jesteśmy na HOME - pozwól aplikacji się zamknąć (domyślna akcja Capacitor)
          App.exitApp();
        });
      } catch (e) {
        // Ignoruj błędy w przeglądarce (brak pluginu App)
      }
    };

    setupBackButton();

    return () => {
      if (backListener) backListener.remove();
    };
  }, [activeTab, generationConflict, resolveConflict]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <div style={{ display: activeTab === 'generator' ? 'block' : 'none' }}>
        <ConfigurationForm />
      </div>
      <div style={{ display: activeTab === 'circuit' ? 'block' : 'none' }}>
        <CircuitList />
      </div>
      {/* Tu w przyszłości dodamy kolejne widoki:
          {activeTab === 'timer' && <TimerContent />}
          ...
      */}
      <GenerationConflictDialog />
      <Toaster />
    </main>
  );
}