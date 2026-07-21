"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RoomConfig } from "@/app/lib/data";
import { formatEquipmentName } from "./ExerciseStudioView";
import { Building2, Users, LayoutGrid, Dumbbell, Layers, ShieldAlert } from "lucide-react";

interface Props {
  room: RoomConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoomDetailDialog = ({ room, open, onOpenChange }: Props) => {
  if (!room) return null;

  const inventoryEntries = Object.entries(room.inwentarz || {}).filter(([_, qty]) => qty > 0);
  const totalEquipCount = inventoryEntries.reduce((acc, [_, qty]) => acc + qty, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 text-white w-full sm:max-w-md outline-none max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-cyan-400 flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Building2 className="h-5 w-5 text-cyan-400 shrink-0" />
              <span className="text-white">{room.nazwa_sali}</span>
            </div>
            <span className="text-[10px] text-white/50 block font-bold uppercase tracking-widest ml-7">
              TRYB: {room.tryb_treningu === 'synchroniczny' ? 'Synchroniczny (Grupowy)' : 'Obwód Stacyjny'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Siatka 1: Pojemność */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Max Uczestnicy
              </h4>
              <p className="text-sm font-bold text-white">
                {room.maksymalna_pojemnosc.osoby} Osób
              </p>
            </div>

            <div className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 flex items-center gap-1.5">
                <LayoutGrid className="h-3.5 w-3.5" /> Max Stacje
              </h4>
              <p className="text-sm font-bold text-white">
                {room.maksymalna_pojemnosc.stacje} Stacji
              </p>
            </div>
          </div>

          {/* Ograniczenia i zakazy */}
          {room.zakazane_tryby_pracy && room.zakazane_tryby_pracy.length > 0 && (
            <div className="space-y-2 bg-destructive/10 p-3 rounded-xl border border-destructive/20 text-xs">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-destructive flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" /> Ograniczenia Wykonawcze
              </h4>
              <p className="text-white/90 font-medium">
                Zabronione tryby: {room.zakazane_tryby_pracy.join(", ")}
              </p>
            </div>
          )}

          {/* Strefy sali */}
          {room.strefy && room.strefy.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 border-b border-white/5 pb-1 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" /> Układ Stref w Sali ({room.strefy.length})
              </h4>
              <div className="space-y-2">
                {room.strefy.map((z) => (
                  <div key={z.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white block">{z.nazwa}</span>
                      <span className="text-[10px] text-white/40 uppercase">Typ: {z.typ}</span>
                    </div>
                    {(z.pojemnosc_stacji || z.bazowa_pojemnosc_stacji) && (
                      <span className="text-[10px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {z.pojemnosc_stacji || z.bazowa_pojemnosc_stacji} stacji
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inwentarz sprzętowy */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 border-b border-white/5 pb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5" /> Inwentarz Sprzętowy
              </span>
              <span className="text-white/50 text-[10px]">{inventoryEntries.length} rodzajów ({totalEquipCount} szt.)</span>
            </h4>

            {inventoryEntries.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {inventoryEntries.map(([key, qty]) => (
                  <div key={key} className="bg-white/5 px-3 py-2 rounded-lg border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-white/80 font-medium truncate max-w-[130px]" title={formatEquipmentName(key)}>
                      {formatEquipmentName(key)}
                    </span>
                    <span className="font-black text-cyan-400 text-xs">
                      x{qty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/40 italic">Brak zadeklarowanego inwentarza w tej sali.</p>
            )}
          </div>

          {/* Tagi dolne */}
          <div className="flex gap-1.5 flex-wrap pt-2 border-t border-white/5">
            <span className="text-[9px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase font-black tracking-wider">
              {room.tryb_treningu}
            </span>

            {room.isOverridden && (
              <span className="text-[9px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase font-black tracking-wider">
                Modyfikowana Wbudowana
              </span>
            )}

            {room.isCustom && !room.isOverridden && (
              <span className="text-[9px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-black tracking-wider">
                Moja Własna
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
