"use client";

import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Exercise } from "@/app/lib/data";
import { useAppStore } from "@/app/lib/store";
import { AddExerciseDialog } from "./AddExerciseDialog";
import { Search, Trophy, X, Plus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
}

export const ExerciseManualSelector = ({ open, onOpenChange, onSelect }: Props) => {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);

  const customExercises = useAppStore((state) => state.customExercises);
  const getAllExercises = useAppStore((state) => state.getAllExercises);

  const allExercises = useMemo(() => getAllExercises(), [customExercises, getAllExercises]);

  const filteredExercises = useMemo(() => {
    if (!search.trim()) return allExercises;
    const lowerSearch = search.toLowerCase().trim();
    return allExercises.filter(ex => 
      ex.nazwa.toLowerCase().includes(lowerSearch) ||
      ex.segment_nazwa.toLowerCase().includes(lowerSearch)
    );
  }, [allExercises, search]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="glass-card border-white/10 text-white sm:max-w-[600px] h-[80vh] flex flex-col p-0 outline-none overflow-hidden scrollbar-none">
          <DialogHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-primary flex items-center gap-2 text-xl font-bold uppercase tracking-tight">
                <Search className="h-5 w-5" />
                Wybierz ćwiczenie
              </DialogTitle>

              <Button
                size="sm"
                onClick={() => setIsAddOpen(true)}
                className="rounded-xl bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 text-xs font-bold flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj nowe</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="px-6 py-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/50" />
              <Input 
                placeholder="Wyszukaj ćwiczenie (np. Pompki, CORE...)" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 bg-white/5 border-white/10 rounded-2xl focus:ring-primary h-14 text-sm font-medium placeholder:text-white/20 transition-all focus:bg-white/10"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white bg-white/10 p-1 rounded-full transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4">
            <div className="flex flex-col gap-1">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => (
                  <button
                    key={ex.id_cwiczenia}
                    onClick={() => {
                      onSelect(ex);
                      onOpenChange(false);
                      setSearch("");
                    }}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-primary/10 transition-all text-left group border border-transparent hover:border-primary/20"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">{ex.nazwa}</span>
                        {ex.isCustom && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Własne
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] text-white/40 uppercase font-black bg-white/5 px-2 py-0.5 rounded tracking-widest border border-white/5">
                          {ex.segment_nazwa}
                        </span>
                        {ex.wariant && (
                          <span className="text-[10px] text-primary/60 italic font-semibold">
                            {ex.wariant}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
                          <Trophy className="h-3 w-3 text-primary" />
                          <span className="text-[10px] font-black text-primary">
                            {ex.poziom === 0 ? "UNIWERSALNY" : `POZIOM ${ex.poziom}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-16 flex flex-col items-center gap-4">
                  <div className="p-4 rounded-full bg-white/5">
                    <Search className="h-8 w-8 text-white/20" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white/60">Brak wyników dla "{search}"</p>
                    <p className="text-xs text-white/30">Możesz stworzyć to ćwiczenie i dodać je trwale do bazy!</p>
                  </div>
                  <Button
                    onClick={() => setIsAddOpen(true)}
                    className="rounded-2xl h-11 px-5 bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Stwórz ćwiczenie "{search}"</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AddExerciseDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        initialNazwa={search}
        onSuccess={(created) => {
          onSelect(created);
          onOpenChange(false);
          setSearch("");
        }}
      />
    </>
  );
};
