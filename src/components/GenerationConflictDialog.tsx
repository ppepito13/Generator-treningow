"use client";

import React from 'react';
import { useAppStore, MAX_DIFFICULTY_LOOSENING } from '@/app/lib/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, GripHorizontal, Settings2, SkipBack } from 'lucide-react';

export function GenerationConflictDialog() {
  const { generationConflict, resolveConflict } = useAppStore();

  if (!generationConflict) return null;

  const { type, requestedStations, availableStations, canLoosenDifficulty } = generationConflict;
  const isReroll = type === 'reroll';

  const handleLoosen = () => resolveConflict({ action: 'loosen' });
  const handleDuplicate = () => resolveConflict({ action: 'duplicate' });
  const handleReduce = () => resolveConflict({ action: 'reduce' });
  const handleCancel = () => resolveConflict({ action: 'cancel' });

  return (
    <Dialog open={!!generationConflict} onOpenChange={(open) => { if (!open) handleCancel() }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0" />
            Brak wystarczającej puli ćwiczeń
          </DialogTitle>
          <DialogDescription className="pt-2 text-foreground/80 leading-relaxed space-y-3">
            {isReroll ? (
              <span>
                Obecne filtry (sprzęt sali + Twoje odrzucenia) sprawiają, że nie ma żadnego ćwiczenia do podmiany na uchodźcę tej stacji.
              </span>
            ) : (
              <span>
                Twój wybrany sprzęt pozwolił wygenerować jedynie <strong>{availableStations}</strong> z żądanych <strong>{requestedStations}</strong> stacji. Ze względu na włączone opcje sprzętowe lub trudności, pula ćwiczeń została wyczerpana.
              </span>
            )}
            <span className="block">Masz do wyboru następujące rozwiązania awaryjne:</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-4">
          
          {canLoosenDifficulty && (
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4" onClick={handleLoosen}>
              <div className="flex items-center gap-3 w-full min-w-0">
                <Settings2 className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">Poluzuj poziomy trudności (+/– {MAX_DIFFICULTY_LOOSENING})</span>
                  <span className="text-xs text-muted-foreground font-normal whitespace-normal">Poszerza granice wylosowania ćwiczeń, ratując sytuację poziomem wyżej/niżej.</span>
                </div>
              </div>
            </Button>
          )}

          <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4" onClick={handleDuplicate}>
            <div className="flex items-center gap-3 w-full min-w-0">
              <GripHorizontal className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-semibold">Zezwól na duplikaty</span>
                <span className="text-xs text-muted-foreground font-normal whitespace-normal">Aplikacja wylosuje powtórnie pasujące ćwiczenia, by zamknąć pustą pulę bez łamania reguł.</span>
              </div>
            </div>
          </Button>

          {isReroll ? (
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4" onClick={handleCancel}>
              <div className="flex items-center gap-3 w-full min-w-0">
                <SkipBack className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">Anuluj akcję</span>
                  <span className="text-xs text-muted-foreground font-normal whitespace-normal">Pozostawia wylosowane wcześniej rozwiązanie na tym stanowisku bez zmian.</span>
                </div>
              </div>
            </Button>
          ) : (
            <Button variant="outline" className="w-full justify-start text-left h-auto py-3 px-4" onClick={handleReduce}>
              <div className="flex items-center gap-3 w-full min-w-0">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold">Zmniejsz ilość stacji do {availableStations}</span>
                  <span className="text-xs text-muted-foreground font-normal whitespace-normal">Utworzy mniejszy obwód, ale zachowa absolutną czystość i unikalność Twoich wymagań.</span>
                </div>
              </div>
            </Button>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
