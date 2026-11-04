"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CloudDownload, AlertTriangle, Loader2 } from 'lucide-react';

export interface RestoreCloudBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  isRestoring?: boolean;
}

export const RestoreCloudBackupDialog: React.FC<RestoreCloudBackupDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isRestoring = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={isRestoring ? () => {} : onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border text-foreground">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CloudDownload className="h-5 w-5 text-cyan-400" />
            Przywracanie kopii z Dysku Google
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Czy na pewno chcesz zastąpić dane na tym urządzeniu kopią zapisaną na Dysku Google?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5 my-2">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <p className="leading-relaxed text-[11px] text-amber-200/90">
            Wszelkie modyfikacje oraz usunięte ćwiczenia na tym telefonie zostaną wycofane i zastąpione stanem z chmury.
          </p>
        </div>

        <DialogFooter className="pt-2 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isRestoring}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            disabled={isRestoring}
            onClick={onConfirm}
            className="min-w-[150px] bg-cyan-600 hover:bg-cyan-500 text-white font-semibold"
          >
            {isRestoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przywracanie...
              </>
            ) : (
              'Przywróć dane z chmury'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

