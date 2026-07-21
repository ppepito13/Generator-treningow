"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Exercise } from "@/app/lib/data";
import { formatEquipmentName } from "./ExerciseStudioView";
import { Info, Dumbbell, Trophy, Activity } from "lucide-react";

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExerciseDetailDialog = ({ exercise, open, onOpenChange }: Props) => {
  if (!exercise) return null;

  const getEquipmentDisplay = (ex: Exercise) => {
    if (!ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0) {
      return "BRAK / MASA CIAŁA";
    }

    const items = new Set<string>();
    ex.wymagania_sprzetowe.forEach((rule) => {
      if (Array.isArray(rule)) {
        rule.forEach((alt) => Object.keys(alt).forEach((k) => items.add(k)));
      } else if (rule && typeof rule === 'object') {
        Object.keys(rule).forEach((k) => items.add(k));
      }
    });

    if (items.size === 0) return "BRAK / MASA CIAŁA";
    return Array.from(items).map((k) => formatEquipmentName(k)).join(", ").toUpperCase();
  };

  const getMusclesDisplay = (ex: Exercise) => {
    if (!ex.zaangazowane_miesnie) return "Praca ogólna";
    if (Array.isArray(ex.zaangazowane_miesnie)) {
      return ex.zaangazowane_miesnie.join(", ");
    }
    return ex.zaangazowane_miesnie;
  };

  const getGlownePartieDisplay = (ex: Exercise) => {
    if (!ex.glowne_partie) return "Ogólne";
    if (Array.isArray(ex.glowne_partie)) {
      return ex.glowne_partie.join(", ");
    }
    return ex.glowne_partie;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-white/10 text-white w-full sm:max-w-md outline-none max-h-[90vh] overflow-y-auto custom-scrollbar p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-primary flex flex-col items-start gap-1">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Info className="h-5 w-5 text-primary shrink-0" />
              <span className="text-white">{exercise.nazwa}</span>
            </div>
            {exercise.wariant && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest ml-7">
                WARIANT: {exercise.wariant}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Instrukcja Wykonania */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60 border-b border-white/5 pb-1">
              Instrukcja Wykonania
            </h4>
            <p className="text-sm leading-relaxed text-white/90 font-normal">
              {exercise.instrukcja || "Brak opisanej techniki wykonania."}
            </p>
          </div>
          
          {/* Siatka detali 1: Sprzęt + Partie główne */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Wymagany Sprzęt
              </h4>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-3.5 w-3.5 text-secondary shrink-0" />
                <span className="text-xs font-bold text-secondary uppercase leading-tight">
                  {getEquipmentDisplay(exercise)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Partie Mięśniowe
              </h4>
              <p className="text-xs text-white/80 font-medium">
                {getGlownePartieDisplay(exercise)}
              </p>
            </div>
          </div>

          {/* Siatka detali 2: Poziom + Zaangażowane mięśnie */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Poziom Trudności
              </h4>
              <div className="flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-xs font-bold text-white/90 uppercase">
                  {exercise.poziom === 0 ? "POZIOM 0 (UNIWERSALNY)" : `POZIOM ${exercise.poziom}/10`}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                Zaangażowane Mięśnie
              </h4>
              <div className="flex items-start gap-2">
                <Activity className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <p className="text-xs text-white/80 font-medium leading-tight">
                  {getMusclesDisplay(exercise)}
                </p>
              </div>
            </div>
          </div>

          {/* Tagi i kategorie na dole */}
          <div className="flex gap-1.5 flex-wrap pt-2 border-t border-white/5 mt-2">
            <span className="text-[9px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase font-bold">
              {exercise.segment_nazwa}
            </span>

            {exercise.isCustom && (
              <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                Moje Własne
              </span>
            )}

            {exercise.tagi_specjalne?.map((tag) => (
              <span key={tag} className="text-[9px] px-2 py-1 rounded-full bg-white/5 text-white/50 border border-white/10 font-normal">
                #{tag}
              </span>
            ))}

            {exercise.kategorie_treningu?.map((cat) => (
              <span key={cat} className="text-[9px] px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase font-bold">
                {cat}
              </span>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
