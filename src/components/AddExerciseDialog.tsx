"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SEGMENTS, Exercise, normalizeExerciseKey } from "@/app/lib/data";
import { useAppStore } from "@/app/lib/store";
import { Dumbbell, Plus, Users, User, ChevronDown, ChevronUp, Sparkles, Check, Pencil, Edit3, Key } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (exercise: Exercise) => void;
  initialExercise?: Exercise | null;
  initialTrybPracy?: "Solo" | "W_Parze";
  initialNazwa?: string;
}

export const AddExerciseDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialExercise,
  initialTrybPracy = "Solo",
  initialNazwa = "",
}: Props) => {
  const addCustomExercise = useAppStore((state) => state.addCustomExercise);

  const [nazwa, setNazwa] = useState(initialNazwa);
  const [trybPracy, setTrybPracy] = useState<"Solo" | "W_Parze">(initialTrybPracy);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Opcjonalne pola zaawansowane
  const [segmentId, setSegmentId] = useState<number | undefined>(undefined);
  const [wariant, setWariant] = useState("");
  const [poziom, setPoziom] = useState<number>(0);
  const [glownePartie, setGlownePartie] = useState("");
  const [instrukcja, setInstrukcja] = useState("");

  const isEditing = !!initialExercise;
  const isOverridingBuiltIn = isEditing && (!initialExercise.isCustom || initialExercise.isOverridden);

  const autoKey = React.useMemo(() => {
    if (isOverridingBuiltIn && initialExercise?.id_cwiczenia) {
      return initialExercise.id_cwiczenia;
    }
    return normalizeExerciseKey(nazwa);
  }, [nazwa, initialExercise, isOverridingBuiltIn]);

  useEffect(() => {
    if (open) {
      if (initialExercise) {
        setNazwa(initialExercise.nazwa || "");
        setTrybPracy(initialExercise.tryb_pracy || initialTrybPracy);
        setSegmentId(initialExercise.segment_id);
        setWariant(initialExercise.wariant || "");
        setPoziom(initialExercise.poziom ?? 0);
        setGlownePartie(
          Array.isArray(initialExercise.glowne_partie)
            ? initialExercise.glowne_partie.join(", ")
            : initialExercise.glowne_partie || ""
        );
        setInstrukcja(initialExercise.instrukcja || "");
        setShowAdvanced(true); // W trybie edycji od razu rozwijamy pełny formularz
      } else {
        setNazwa(initialNazwa);
        setTrybPracy(initialTrybPracy);
        setSegmentId(undefined);
        setWariant("");
        setPoziom(0);
        setGlownePartie("");
        setInstrukcja("");
        setShowAdvanced(false);
      }
    }
  }, [open, initialExercise, initialNazwa, initialTrybPracy]);

  const handleReset = () => {
    setNazwa("");
    setTrybPracy("Solo");
    setShowAdvanced(false);
    setSegmentId(undefined);
    setWariant("");
    setPoziom(0);
    setGlownePartie("");
    setInstrukcja("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nazwa.trim()) return;

    const selectedSegment = SEGMENTS.find((s) => s.id === segmentId);

    const created = addCustomExercise({
      id_cwiczenia: autoKey,
      nazwa: nazwa.trim(),
      tryb_pracy: trybPracy,
      wariant: wariant.trim() || undefined,
      segment_id: selectedSegment?.id,
      segment_nazwa: selectedSegment?.nazwa,
      poziom: poziom,
      glowne_partie: glownePartie.trim() ? glownePartie.split(",").map((s) => s.trim()) : undefined,
      instrukcja: instrukcja.trim() || undefined,
      isOverridden: isOverridingBuiltIn,
    });

    if (onSuccess) {
      onSuccess(created);
    }

    handleReset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleReset();
      onOpenChange(val);
    }}>
      <DialogContent className="glass-card border-white/10 text-white sm:max-w-[540px] max-h-[90vh] flex flex-col p-0 outline-none overflow-hidden scrollbar-none">
        <DialogHeader className="p-6 pb-3 border-b border-white/5">
          <DialogTitle className="text-primary flex items-center gap-2 text-xl font-bold uppercase tracking-tight">
            {isEditing ? <Edit3 className="h-6 w-6 text-cyan-400" /> : <Plus className="h-6 w-6 text-primary" />}
            <span>
              {isOverridingBuiltIn
                ? "Modyfikuj ćwiczenie wbudowane"
                : isEditing
                ? "Edytuj własne ćwiczenie"
                : "Dodaj własne ćwiczenie"}
            </span>
          </DialogTitle>
          <p className="text-xs text-white/60 leading-normal pt-1">
            {isOverridingBuiltIn
              ? "Ta edycja nadpisze domyślne parametry ćwiczenia wbudowanego. Ćwiczenie zostanie oznaczone flagą isOverridden i trwale zapisane na urządzeniu."
              : isEditing
              ? "Zaktualizuj dane swojego własnego ćwiczenia w bazie lokalnej."
              : "Nowe ćwiczenie zostanie trwale zapisane na tym urządzeniu i dołączy do puli losowania."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          {/* Nazwa ćwiczenia (Wymagane) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <span>Nazwa ćwiczenia</span>
              <span className="text-primary">*</span>
            </label>
            <Input
              autoFocus
              placeholder="np. Podciąganie z wyskokiem, Dipy na krzesłach..."
              value={nazwa}
              onChange={(e) => setNazwa(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-semibold placeholder:text-white/20 focus:border-primary"
            />
          </div>

          {/* Klucz w bazie / ID ćwiczenia (Automatyczny - Widoczny, Nieedytowalny) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-cyan-400" />
                <span>Klucz w bazie / ID ćwiczenia</span>
              </label>
              <span className="text-[10px] text-white/40 font-mono">automatyczny format</span>
            </div>
            <Input
              value={autoKey}
              disabled
              readOnly
              className="bg-black/30 border-white/10 rounded-xl h-11 text-xs font-mono text-cyan-300/80 cursor-not-allowed opacity-75"
            />
            <p className="text-[10px] text-white/40 leading-normal">
              *Klucz tworzy się automatycznie na podstawie nazwy ćwiczenia (bez polskich znaków, ze znakami _).
            </p>
          </div>

          {/* Szybki przełącznik trybu pracy: Solo / W parze */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Tryb wykonania
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTrybPracy("Solo")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  trybPracy === "Solo"
                    ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Solo (Pojedyncze)</span>
                {trybPracy === "Solo" && <Check className="h-3.5 w-3.5 ml-auto text-primary" />}
              </button>

              <button
                type="button"
                onClick={() => setTrybPracy("W_Parze")}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  trybPracy === "W_Parze"
                    ? "bg-secondary/20 border-secondary text-secondary shadow-lg shadow-secondary/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>W Parze (Z partnerem)</span>
                {trybPracy === "W_Parze" && <Check className="h-3.5 w-3.5 ml-auto text-secondary" />}
              </button>
            </div>
          </div>

          {/* Zwijana / rozwijana sekcja opcji zaawansowanych */}
          <div className="pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                {showAdvanced ? "Ukryj opcje zaawansowane" : "Pokaż opcje zaawansowane (poziom, segment, opis)"}
              </span>
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAdvanced && (
              <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Poziom trudności (0 = Uniwersalny) */}
                <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-white/80 uppercase">
                      Poziom trudności
                    </label>
                    <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      {poziom === 0 ? "0 - UNIWERSALNY (Pasuje do każdego poziomu)" : `Poziom ${poziom}/10`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={poziom}
                    onChange={(e) => setPoziom(parseInt(e.target.value, 10))}
                    className="w-full accent-cyan-400 bg-white/10 h-2 rounded-lg cursor-pointer"
                  />
                  <p className="text-[10px] text-white/40 leading-tight">
                    *Wartość 0 sprawia, że ćwiczenie bierze udział w losowaniu dla KAŻDEGO poziomu trudności.
                  </p>
                </div>

                {/* Segment ćwiczenia */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">Segment</label>
                  <select
                    value={segmentId ?? ""}
                    onChange={(e) => setSegmentId(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl h-12 px-4 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="" className="bg-neutral-900 text-white/60">NIEWYBRANY / OGÓLNE (Domyślny)</option>
                    {SEGMENTS.map((seg) => (
                      <option key={seg.id} value={seg.id} className="bg-neutral-900 text-white">
                        {seg.nazwa}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wariant */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">Wariant (opcjonalny)</label>
                  <Input
                    placeholder="np. Klasyczny, Nachwyt, Podchwyt..."
                    value={wariant}
                    onChange={(e) => setWariant(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-11 text-xs text-white placeholder:text-white/20"
                  />
                </div>

                {/* Główne partie mięśniowe */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">Główne partie mięśniowe</label>
                  <Input
                    placeholder="np. Barki, Plecy, Klatka (oddziel przecinkami)"
                    value={glownePartie}
                    onChange={(e) => setGlownePartie(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl h-11 text-xs text-white placeholder:text-white/20"
                  />
                </div>

                {/* Opis / Instrukcja */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/80 uppercase">Instrukcja wykonania</label>
                  <Textarea
                    placeholder="Opisz prawidłową technikę wykonania ćwiczenia..."
                    value={instrukcja}
                    onChange={(e) => setInstrukcja(e.target.value)}
                    className="bg-white/5 border-white/10 rounded-xl min-h-[90px] text-xs text-white placeholder:text-white/20"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/5">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 rounded-2xl h-12 text-xs border border-white/10 hover:bg-white/10"
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={!nazwa.trim()}
              className="flex-1 rounded-2xl h-12 text-xs font-bold bg-cyan-500 text-neutral-950 hover:bg-cyan-400 disabled:opacity-40"
            >
              {isOverridingBuiltIn
                ? "Zapisz nadpisanie"
                : isEditing
                ? "Zapisz zmiany"
                : "Zapisz i dodaj do bazy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
