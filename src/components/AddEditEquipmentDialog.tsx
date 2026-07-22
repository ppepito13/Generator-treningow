"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import { EquipmentItem, normalizeEquipmentKey } from '@/app/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Key, FileText, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AddEditEquipmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentToEdit?: EquipmentItem | null;
}

export const AddEditEquipmentDialog: React.FC<AddEditEquipmentDialogProps> = ({
  isOpen,
  onOpenChange,
  equipmentToEdit,
}) => {
  const { toast } = useToast();
  const addCustomEquipment = useAppStore((state) => state.addCustomEquipment);

  const [nazwa, setNazwa] = useState('');
  const [opis, setOpis] = useState('');

  useEffect(() => {
    if (equipmentToEdit) {
      setNazwa(equipmentToEdit.nazwa || '');
      setOpis(equipmentToEdit.opis || '');
    } else {
      setNazwa('');
      setOpis('');
    }
  }, [equipmentToEdit, isOpen]);

  const autoKey = useMemo(() => {
    if (equipmentToEdit?.id) {
      return equipmentToEdit.id;
    }
    return normalizeEquipmentKey(nazwa);
  }, [nazwa, equipmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nazwa.trim()) {
      toast({
        title: "Brak nazwy sprzętu",
        description: "Wprowadź czytelną nazwę sprzętu przed zapisaniem.",
        variant: "destructive",
      });
      return;
    }

    const finalKey = autoKey || normalizeEquipmentKey(nazwa);

    addCustomEquipment({
      id: finalKey,
      nazwa: nazwa.trim(),
      opis: opis.trim(),
      isOverridden: false,
    });

    toast({
      title: equipmentToEdit ? "Zaktualizowano sprzęt" : "Dodano nowy sprzęt",
      description: `Sprzęt "${nazwa.trim()}" (klucz: ${finalKey}) został zapisany.`,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 text-white max-w-lg rounded-3xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Dumbbell className="h-5 w-5" />
            </span>
            <DialogTitle className="text-xl font-bold">
              {equipmentToEdit ? "Edytuj Sprzęt Własny" : "Dodaj Nowy Sprzęt"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Wprowadź czytelną nazwę sprzętu. Klucz bazy JSON wygeneruje się automatycznie bez polskich znaków i spacji.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Nazwa czytelna */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Czytelna Nazwa (dla użytkownika)
            </Label>
            <Input
              value={nazwa}
              onChange={(e) => setNazwa(e.target.value)}
              placeholder="np. Kółka gimnastyczne / Worek Bułgarski 15kg"
              className="glass-input rounded-xl h-11 text-sm font-medium border-white/10 text-white"
            />
          </div>

          {/* Klucz w bazie / JSON (Ściśle powiązany, nieedytowalny) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-secondary" /> Klucz w bazie / JSON
              </Label>
              <Badge className="bg-white/5 text-[9px] text-muted-foreground font-mono">
                automatyczny format
              </Badge>
            </div>
            <Input
              value={autoKey}
              disabled
              readOnly
              placeholder="np. kolko_gimnastyczne"
              className="glass-input rounded-xl h-11 text-xs font-mono text-cyan-300/80 border-white/10 cursor-not-allowed opacity-75"
            />
            <p className="text-[10px] text-muted-foreground">
              Klucz tworzy się automatycznie na podstawie czytelnej nazwy (bez polskich znaków, ze znakami _).
            </p>
          </div>

          {/* Opis / Uwagi */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-400" /> Opis / Uwagi (Opcjonalnie)
            </Label>
            <Textarea
              value={opis}
              onChange={(e) => setOpis(e.target.value)}
              placeholder="Dodatkowe informacje techniczne lub specyfikacja sprzętowa..."
              className="glass-input rounded-xl h-20 text-xs border-white/10 text-white resize-none"
            />
          </div>

          <DialogFooter className="pt-4 flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-white/10 text-xs font-bold"
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              className="rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-xs font-extrabold"
            >
              {equipmentToEdit ? "Zapisz Zmiany" : "Dodaj Sprzęt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
