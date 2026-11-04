"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAppStore } from '@/app/lib/store';
import { ALL_EXERCISES } from '@/app/lib/data';
import { APP_VERSION, APP_WEBSITE_URL, APP_WEBSITE_DISPLAY } from '@/config/appInfo';
import { ModuleHeader } from '@/components/ui/ModuleHeader';
import { Button } from '@/components/ui/button';
import { DisconnectAccountDialog } from '@/components/DisconnectAccountDialog';
import { signInWithGoogle, formatAuthError } from '@/services/auth/googleAuth';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import { 
  Settings, 
  ArrowLeft, 
  Palette, 
  Moon, 
  Sun, 
  Cloud, 
  Info, 
  CheckCircle2, 
  ShieldCheck, 
  Database,
  ExternalLink,
  LogOut,
  AlertCircle,
  Loader2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  const customExercises = useAppStore((state) => state.customExercises);
  const googleUser = useAppStore((state) => state.googleUser);
  const authError = useAppStore((state) => state.authError);
  const setGoogleUser = useAppStore((state) => state.setGoogleUser);
  const setAuthStatus = useAppStore((state) => state.setAuthStatus);
  const disconnectGoogleAccount = useAppStore((state) => state.disconnectGoogleAccount);
  const validateGoogleSessionState = useAppStore((state) => state.validateGoogleSessionState);

  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light'>('dark');
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (useAppStore.getState().googleUser) {
      validateGoogleSessionState();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseCount = ALL_EXERCISES.length;
  const customCount = customExercises.length;
  const exerciseCountLabel = customCount > 0 
    ? `${baseCount} w bazie (+${customCount} własnych)` 
    : `${baseCount} w bazie`;

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setAuthStatus('loading');
      const profile = await signInWithGoogle();
      setGoogleUser(profile);
    } catch (err: unknown) {
      const message = formatAuthError(err);
      setAuthStatus('error', message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleConfirmDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disconnectGoogleAccount();
      setIsDisconnectDialogOpen(false);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="min-h-screen app-safe-top app-safe-bottom app-container-narrow px-4 sm:px-6 space-y-6">
      {/* NAGŁÓWEK MODUŁU USTAWIENIA */}
      <ModuleHeader
        icon={Settings}
        title="Ustawienia"
        subtitle="Personalizacja i preferencje aplikacji"
        iconBadgeClass="bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('generator')}
            className="border-white/10 hover:border-cyan-500/40 hover:bg-white/5 text-muted-foreground hover:text-cyan-400 gap-2 rounded-xl text-xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Wróć</span>
          </Button>
        }
      />

      {/* 1. SEKCJA: WYGLĄD I MOTYW (#15) */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Wygląd i Motyw</h2>
            <p className="text-xs text-muted-foreground">Dostosuj schemat kolorystyczny do warunków sali</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Motyw Ciemny */}
          <button
            type="button"
            onClick={() => setSelectedTheme('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-center space-y-2 relative ${
              selectedTheme === 'dark'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Moon className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Ciemny</span>
              <span className="text-[10px] text-cyan-300/80 block">Zalecany na salę</span>
            </div>
            {selectedTheme === 'dark' && (
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-1" />
            )}
          </button>

          {/* Motyw Jasny */}
          <button
            type="button"
            onClick={() => setSelectedTheme('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer text-center space-y-2 relative ${
              selectedTheme === 'light'
                ? 'bg-cyan-500/15 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
            }`}
          >
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Wkrótce
            </span>
            <div className="p-2 rounded-xl bg-white/10 text-amber-300">
              <Sun className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-sm font-semibold block">Jasny</span>
              <span className="text-[10px] text-muted-foreground block">Wysoki kontrast</span>
            </div>
            {selectedTheme === 'light' && (
              <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-1" />
            )}
          </button>
        </div>
      </div>

      {/* 2. SEKCJA: KONTO I KOPIA ZAPASOWA W CHMURZE (#39, #40) */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Konto i Kopia Zapasowa</h2>
            <p className="text-xs text-muted-foreground">Synchronizacja danych i sal z Kontem Google</p>
          </div>
        </div>

        {/* Karta bieżącego statusu */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white/90">Bieżący stan pamięci:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lokalnie (Offline First)
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Wszystkie zmodyfikowane ćwiczenia, sale treningowe oraz historia są bezpiecznie zapisywane w pamięci urządzenia i działają bez dostępu do Internetu.
          </p>
        </div>

        {/* Karta Konta Google */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          {googleUser ? (
            /* Stan zalogowany */
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {googleUser.picture ? (
                    <Image
                      src={googleUser.picture}
                      alt={googleUser.name}
                      width={40}
                      height={40}
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-full border border-white/20 object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-sm shrink-0">
                      {googleUser.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block truncate">{googleUser.name}</span>
                    <span className="text-xs text-muted-foreground block truncate font-mono">{googleUser.email}</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <CheckCircle2 className="h-3 w-3" />
                  Połączono
                </span>
              </div>

              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDisconnectDialogOpen(true)}
                  className="w-full border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 text-xs gap-2 rounded-xl cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Odłącz konto Google</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Stan niezalogowany */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
                    <GoogleIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Konto Google</span>
                    <span className="text-[10px] text-muted-foreground block">Niezalogowany</span>
                  </div>
                </div>
                
              </div>

              <p className="text-[11px] text-white/60 leading-relaxed">
                Połączenie konta pozwoli na automatyczną synchronizację Twoich autorskich ćwiczeń oraz konfiguracji sal pomiędzy telefonem a komputerem.
              </p>

              {authError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-red-300 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span className="leading-tight">{authError}</span>
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="w-full border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs gap-2 rounded-xl cursor-pointer"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Łączenie z Google...</span>
                  </>
                ) : (
                  <>
                    <GoogleIcon className="h-3.5 w-3.5 shrink-0" />
                    <span>Połącz z Kontem Google</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. SEKCJA: O APLIKACJI */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">O Aplikacji</h2>
            <p className="text-xs text-muted-foreground">Informacje techniczne i licencja</p>
          </div>
        </div>

        <div className="divide-y divide-white/5 text-xs">
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Nazwa</span>
            <span className="font-semibold text-white">Generator Sport&apos;s Way</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Wersja</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold text-cyan-400">
              {APP_VERSION}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Strona WWW</span>
            <a
              href={APP_WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-medium transition-colors group cursor-pointer"
            >
              <span>{APP_WEBSITE_DISPLAY}</span>
              <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Baza ćwiczeń</span>
            <span className="font-semibold text-white inline-flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-cyan-400" />
              {exerciseCountLabel}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-muted-foreground">Tryb pracy</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              100% Offline First
            </span>
          </div>
        </div>
      </div>

      {/* DIALOG ODŁĄCZANIA KONTA */}
      <DisconnectAccountDialog
        open={isDisconnectDialogOpen}
        onOpenChange={setIsDisconnectDialogOpen}
        onConfirm={handleConfirmDisconnect}
        userEmail={googleUser?.email}
        isDisconnecting={isDisconnecting}
      />
    </div>
  );
};
