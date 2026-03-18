"use client";

import React, { useEffect, useState } from 'react';
import { useAppStore } from './lib/store';
import { ConfigurationForm } from '@/components/ConfigurationForm';
import { CircuitList } from '@/components/CircuitList';
import { Toaster } from '@/components/ui/toaster';

export default function Home() {
  const { isGenerated } = useAppStore();
  const [hydrated, setHydrated] = useState(false);

  // Ensure hydration for Zustand persist
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
      {!isGenerated ? (
        <ConfigurationForm />
      ) : (
        <CircuitList />
      )}
      <Toaster />
    </main>
  );
}