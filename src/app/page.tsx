"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { CircuitList } from '@/components/CircuitList';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { isGenerated } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // Oczekujemy na tzw. "Hydratację" (Hydration) komponentu na kliencie.
  // Jest to kluczowe dla działania biblioteki Zustand (persist), aby uniknąć błędu 
  // niezgodności (mismatch) wygenerowanego kodu między serwerem a przeglądarką.
  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden">
      {/* 
        Główna mechanika przełączania ekranów aplikacji:
        Jeśli użytkownik jeszcze nie wygenerował treningu, pokazujemy formularz.
        W przeciwnym wypadku wyświetlamy wygenerowaną, docelową listę (obwód).
      */}
      {!isGenerated ? (
        <ConfigurationForm />
      ) : (
        <CircuitList />
      )}
      <Toaster />
    </main>
  );
}