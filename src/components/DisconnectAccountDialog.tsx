'use client';

import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle, ShieldCheck, CloudOff } from 'lucide-react';

interface DisconnectAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userEmail?: string;
  isDisconnecting?: boolean;
}

export const DisconnectAccountDialog: React.FC<DisconnectAccountDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  userEmail,
  isDisconnecting = false,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="glass-card border border-white/10 bg-[#0f172a]/95 text-white max-w-md rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
        <AlertDialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-bold text-white tracking-tight">
                Odłączanie Konta Google
              </AlertDialogTitle>
              {userEmail && (
                <span className="text-xs text-muted-foreground block font-mono">
                  {userEmail}
                </span>
              )}
            </div>
          </div>

          <AlertDialogDescription asChild>
            <div className="text-xs text-white/80 leading-relaxed space-y-3 pt-2">
              <span className="block font-medium text-white/90">
                Czy na pewno chcesz odłączyć swoje konto Google od aplikacji Generator Sport&apos;s Way?
              </span>

              <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/5 text-left text-[11px]">
                <div className="flex items-start gap-2 text-amber-300/90">
                  <CloudOff className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Wstrzymanie synchronizacji:</strong> Twoje autorskie ćwiczenia i sale nie będą synchronizowane w chmurze z innymi urządzeniami.
                  </span>
                </div>
                <div className="flex items-start gap-2 text-emerald-400">
                  <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    <strong>Bezpieczeństwo danych:</strong> Wszystkie modyfikacje zapisane lokalnie na tym urządzeniu pozostaną w 100% nienaruszone.
                  </span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
          <AlertDialogCancel
            disabled={isDisconnecting}
            className="rounded-xl border-white/10 bg-white/5 text-xs text-white hover:bg-white/10"
          >
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDisconnecting}
            className="rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-semibold"
          >
            {isDisconnecting ? 'Odłączanie...' : 'Potwierdzam, odłącz konto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
