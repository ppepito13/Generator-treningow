"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitMerge, CloudDownload, CloudUpload, Loader2, HardDrive, Cloud } from 'lucide-react';
import type { InitialSyncConflictAction, InitialSyncConflictDetails } from '@/types/sync';
import { formatLastSyncedAt } from '@/services/sync/syncCoordinator';

export interface InitialSyncConflictDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  conflictDetails: InitialSyncConflictDetails | null;
  onResolve: (action: InitialSyncConflictAction) => Promise<void> | void;
  isResolving?: boolean;
}

export const InitialSyncConflictDialog: React.FC<InitialSyncConflictDialogProps> = ({
  isOpen,
  onOpenChange,
  conflictDetails,
  onResolve,
  isResolving = false,
}) => {
  const [selectedAction, setSelectedAction] = useState<InitialSyncConflictAction>('merge');

  const localTotal = conflictDetails?.localCount?.total ?? 0;
  const remoteTotal = conflictDetails?.remoteCount?.total ?? 0;
  const remoteModifiedTimestamp = conflictDetails?.remoteModifiedTime
    ? new Date(conflictDetails.remoteModifiedTime).getTime()
    : null;

  const handleConfirm = async () => {
    await onResolve(selectedAction);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isResolving ? () => {} : onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-primary" />
            Wykryto dane w chmurze i na urządzeniu
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground pt-1">
            To Twoje pierwsze połączenie z Dyskiem Google na tym urządzeniu. Znaleziono zarówno dane lokalne, jak i istniejącą kopię w chmurze. Wybierz sposób rozpoczęcia synchronizacji:
          </DialogDescription>
        </DialogHeader>

        {/* Podsumowanie zbiorów */}
        <div className="grid grid-cols-2 gap-3 py-2 text-xs">
          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-foreground">
              <HardDrive className="h-4 w-4 text-emerald-500" />
              Na tym urządzeniu
            </div>
            <div className="text-muted-foreground">
              Łącznie elementów: <span className="font-medium text-foreground">{localTotal}</span>
            </div>
            {conflictDetails?.localCount && (
              <div className="text-[11px] text-muted-foreground/80">
                Ćwiczenia: {conflictDetails.localCount.exercises}, Sale: {conflictDetails.localCount.rooms}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-foreground">
              <Cloud className="h-4 w-4 text-cyan-500" />
              W chmurze Google Drive
            </div>
            <div className="text-muted-foreground">
              Łącznie elementów: <span className="font-medium text-foreground">{remoteTotal}</span>
            </div>
            <div className="text-[11px] text-muted-foreground/80">
              Kopia: {formatLastSyncedAt(remoteModifiedTimestamp)}
            </div>
          </div>
        </div>

        {/* Trzy warianty wyboru */}
        <div className="space-y-2.5 pt-1">
          {/* Opcja 1: Scalenie (Zalecane / domyślne) */}
          <div
            role="radio"
            aria-checked={selectedAction === 'merge'}
            tabIndex={0}
            onClick={() => setSelectedAction('merge')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedAction('merge');
              }
            }}
            className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
              selectedAction === 'merge'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-muted/20 hover:bg-muted/40'
            }`}
          >
            <div className="mt-0.5 p-2 rounded-lg bg-primary/20 text-primary">
              <GitMerge className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Scal dane</span>
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-medium">
                  Zalecane
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Połącz zawartość z obu źródeł. Nowe elementy z chmury zostaną pobrane, a elementy z tego urządzenia zaktualizowane na Dysku.
              </p>
            </div>
          </div>

          {/* Opcja 2: Zastąpienie danymi z chmury */}
          <div
            role="radio"
            aria-checked={selectedAction === 'pull'}
            tabIndex={0}
            onClick={() => setSelectedAction('pull')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedAction('pull');
              }
            }}
            className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
              selectedAction === 'pull'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-muted/20 hover:bg-muted/40'
            }`}
          >
            <div className="mt-0.5 p-2 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-400">
              <CloudDownload className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Użyj danych z chmury</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Zastąp dane na tym urządzeniu kopią z Dysku Google. Lokalne elementy, których nie ma w chmurze, zostaną zastąpione.
              </p>
            </div>
          </div>

          {/* Opcja 3: Nadpisanie chmury danymi z urządzenia */}
          <div
            role="radio"
            aria-checked={selectedAction === 'push'}
            tabIndex={0}
            onClick={() => setSelectedAction('push')}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setSelectedAction('push');
              }
            }}
            className={`cursor-pointer rounded-xl border p-3.5 transition-all flex items-start gap-3 select-none ${
              selectedAction === 'push'
                ? 'border-primary bg-primary/10 ring-1 ring-primary'
                : 'border-border bg-muted/20 hover:bg-muted/40'
            }`}
          >
            <div className="mt-0.5 p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <CloudUpload className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-foreground">Nadpisz chmurę danymi z tego urządzenia</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Prześlij bieżący stan tego urządzenia do chmury, całkowicie nadpisując istniejącą wcześniej kopię na Dysku Google.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isResolving}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            disabled={isResolving}
            onClick={handleConfirm}
            className="min-w-[130px]"
          >
            {isResolving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              'Zatwierdź wybór'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
