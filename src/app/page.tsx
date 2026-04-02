"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { CircuitList } from '@/components/CircuitList';
import { GenerationConflictDialog } from '@/components/GenerationConflictDialog';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { activeView, popView, generationConflict, resolveConflict } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // Oczekujemy na tzw. "Hydratację" (Hydration) komponentu na kliencie.
  // Jest to kluczowe dla działania biblioteki Zustand (persist), aby uniknąć błędu 
  // niezgodności (mismatch) wygenerowanego kodu między serwerem a przeglądarką.
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Automatyczne przewijanie na górę po wygenerowaniu treningu
  useEffect(() => {
    if (activeView === 'CIRCUIT') {
      window.scrollTo(0, 0);
    }
  }, [activeView]);

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

          // 2. Jeśli jesteśmy w widoku innym niż HOME - cofnij widok
          if (activeView !== 'HOME') {
            popView();
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
  }, [activeView, generationConflict, popView, resolveConflict]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      {activeView === 'HOME' && <ConfigurationForm />}
      {activeView === 'CIRCUIT' && <CircuitList />}
      {/* Tu w przyszłości dodamy kolejne widoki:
          {activeView === 'BMI' && <BMIContent />}
          ...
      */}
      <GenerationConflictDialog />
      <Toaster />
    </main>
  );
}