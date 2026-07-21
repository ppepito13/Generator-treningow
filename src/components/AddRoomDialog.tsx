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
import { RoomConfig, ALL_EQUIPMENT, createDefaultRoom, Zone } from "@/app/lib/data";
import { useAppStore } from "@/app/lib/store";
import { formatEquipmentName } from "./ExerciseStudioView";
import { Building2, Plus, Users, LayoutGrid, Check, Pencil, Edit3, Dumbbell, Sparkles, ChevronDown, ChevronUp, Minus } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (room: RoomConfig) => void;
  initialRoom?: RoomConfig | null;
}

export const AddRoomDialog = ({
  open,
  onOpenChange,
  onSuccess,
  initialRoom,
}: Props) => {
  const addCustomRoom = useAppStore((state) => state.addCustomRoom);

  const [nazwaSali, setNazwaSali] = useState("");
  const [trybTreningu, setTrybTreningu] = useState<"obwodowy" | "synchroniczny">("obwodowy");
  const [maxOsoby, setMaxOsoby] = useState<number>(20);
  const [maxStacje, setMaxStacje] = useState<number>(10);
  const [forbiddenModes, setForbiddenModes] = useState<Array<"Solo" | "W_Parze">>([]);
  
  // Słownik inwentarza: sprzęt_id -> ilość
  const [inventory, setInventory] = useState<Record<string, number>>({});
  
  // Zwijane zaawansowane sekcje
  const [showInventory, setShowInventory] = useState(false);
  const [searchEquipQuery, setSearchEquipQuery] = useState("");

  const isEditing = !!initialRoom;
  const isOverridingBuiltIn = isEditing && (!initialRoom.isCustom || initialRoom.isOverridden);

  useEffect(() => {
    if (open) {
      if (initialRoom) {
        setNazwaSali(initialRoom.nazwa_sali || "");
        setTrybTreningu(initialRoom.tryb_treningu || "obwodowy");
        setMaxOsoby(initialRoom.maksymalna_pojemnosc?.osoby ?? 20);
        setMaxStacje(initialRoom.maksymalna_pojemnosc?.stacje ?? 10);
        setForbiddenModes(initialRoom.zakazane_tryby_pracy || []);
        setInventory(initialRoom.inwentarz ? { ...initialRoom.inwentarz } : {});
        setShowInventory(true);
      } else {
        setNazwaSali("");
        setTrybTreningu("obwodowy");
        setMaxOsoby(20);
        setMaxStacje(10);
        setForbiddenModes([]);
        setInventory({});
        setShowInventory(false);
      }
    }
  }, [open, initialRoom]);

  const handleReset = () => {
    setNazwaSali("");
    setTrybTreningu("obwodowy");
    setMaxOsoby(20);
    setMaxStacje(10);
    setForbiddenModes([]);
    setInventory({});
    setShowInventory(false);
    setSearchEquipQuery("");
  };

  const setItemQuantity = (key: string, qty: number) => {
    setInventory((prev) => {
      const copy = { ...prev };
      if (qty <= 0) {
        delete copy[key];
      } else {
        copy[key] = qty;
      }
      return copy;
    });
  };

  const toggleForbiddenMode = (mode: "Solo" | "W_Parze") => {
    setForbiddenModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const sortedEquipmentKeys = [...ALL_EQUIPMENT].sort((a, b) =>
    formatEquipmentName(a).localeCompare(formatEquipmentName(b), 'pl')
  );

  const filteredEquipmentKeys = sortedEquipmentKeys.filter((key) => {
    if (!searchEquipQuery.trim()) return true;
    const formatted = formatEquipmentName(key).toLowerCase();
    return formatted.includes(searchEquipQuery.toLowerCase().trim()) || key.toLowerCase().includes(searchEquipQuery.toLowerCase().trim());
  });

  const activeInventoryCount = Object.values(inventory).reduce((acc, curr) => acc + (curr > 0 ? curr : 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nazwaSali.trim()) return;

    const created = addCustomRoom({
      id_sali: initialRoom?.id_sali,
      nazwa_sali: nazwaSali.trim(),
      tryb_treningu: trybTreningu,
      maksymalna_pojemnosc: {
        osoby: maxOsoby,
        stacje: maxStacje,
      },
      inwentarz: inventory,
      strefy: initialRoom?.strefy && initialRoom.strefy.length > 0 ? initialRoom.strefy : [
        {
          id: `strefa_${Date.now()}_1`,
          nazwa: "Główna Przestrzeń Treningowa",
          kolejnosc_sortowania: 1,
          typ: "elastyczny",
          bazowa_pojemnosc_stacji: maxStacje,
        }
      ],
      zakazane_tryby_pracy: forbiddenModes,
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
      <DialogContent className="glass-card border-white/10 text-white sm:max-w-[620px] max-h-[90vh] flex flex-col p-0 outline-none overflow-hidden scrollbar-none">
        <DialogHeader className="p-6 pb-3 border-b border-white/5">
          <DialogTitle className="text-cyan-400 flex items-center gap-2 text-xl font-bold uppercase tracking-tight">
            {isEditing ? <Edit3 className="h-6 w-6 text-cyan-400" /> : <Plus className="h-6 w-6 text-cyan-400" />}
            <span>
              {isOverridingBuiltIn
                ? "Modyfikuj salę wbudowaną"
                : isEditing
                ? "Edytuj salę treningową"
                : "Dodaj nową salę treningową"}
            </span>
          </DialogTitle>
          <p className="text-xs text-white/60 leading-normal pt-1">
            {isOverridingBuiltIn
              ? "Ta edycja nadpisze domyślną konfigurację sali wbudowanej. Zmiany zostaną trwale zapisane na tym urządzeniu."
              : isEditing
              ? "Zaktualizuj parametry i inwentarz sprzętowy sali treningowej."
              : "Nowa sala zostanie trwale zapisana w bazie lokalnej i będzie dostępna w generatorze."}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Nazwa Sali (Wymagane) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider flex items-center gap-1.5">
              <span>Nazwa sali</span>
              <span className="text-cyan-400">*</span>
            </label>
            <Input
              autoFocus
              placeholder="np. Sala Główna, Strefa Kalisteniki, Sala Crossfit..."
              value={nazwaSali}
              onChange={(e) => setNazwaSali(e.target.value)}
              className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-semibold placeholder:text-white/20 focus:border-cyan-400"
            />
          </div>

          {/* Sposób ułożenia / Tryb treningu */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Tryb Treningu (Flow)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTrybTreningu("obwodowy")}
                className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                  trybTreningu === "obwodowy"
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-extrabold uppercase">Obwód Stacyjny</span>
                  {trybTreningu === "obwodowy" && <Check className="h-4 w-4 text-cyan-400" />}
                </div>
                <span className="text-[10px] font-normal text-white/50 leading-tight">
                  Rotacja między stacjami o zróżnicowanym sprzęcie
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTrybTreningu("synchroniczny")}
                className={`flex flex-col items-start gap-1 p-3.5 rounded-2xl border text-xs font-bold transition-all text-left ${
                  trybTreningu === "synchroniczny"
                    ? "bg-secondary/20 border-secondary text-secondary shadow-lg shadow-secondary/10"
                    : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-extrabold uppercase">Trening Synchroniczny</span>
                  {trybTreningu === "synchroniczny" && <Check className="h-4 w-4 text-secondary" />}
                </div>
                <span className="text-[10px] font-normal text-white/50 leading-tight">
                  Cała grupa wykonuje ten sam zestaw ćwiczeń równolegle
                </span>
              </button>
            </div>
          </div>

          {/* Maksymalna pojemność (Osoby i Stacje) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80 uppercase flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-cyan-400" /> Max Osoby
                </label>
                <span className="text-sm font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                  {maxOsoby} osób
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={maxOsoby}
                onChange={(e) => setMaxOsoby(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white/80 uppercase flex items-center gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5 text-secondary" /> Max Stacje
                </label>
                <span className="text-sm font-black text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                  {maxStacje} stacji
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={maxStacje}
                onChange={(e) => setMaxStacje(parseInt(e.target.value, 10))}
                className="w-full accent-secondary bg-white/10 h-2 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Ograniczenia wykonawcze (Opcjonalne) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white/80 uppercase tracking-wider">
              Zabronione tryby pracy w tej sali
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleForbiddenMode("W_Parze")}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  forbiddenModes.includes("W_Parze")
                    ? "bg-destructive/20 border-destructive text-destructive"
                    : "bg-white/5 border-white/10 text-white/50 hover:text-white"
                }`}
              >
                <span>Zabroń pracy W Parze</span>
                {forbiddenModes.includes("W_Parze") && <Check className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Zwijany inwentarz sprzętowy z przyciskami ilości */}
          <div className="pt-2 border-t border-white/5 space-y-4">
            <button
              type="button"
              onClick={() => setShowInventory(!showInventory)}
              className="flex items-center justify-between w-full py-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4" />
                <span>Dostępny inwentarz sprzętowy</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-cyan-500/30">
                  {Object.keys(inventory).length} pozycji ({activeInventoryCount} szt.)
                </span>
              </span>
              {showInventory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showInventory && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  placeholder="Filtruj listę sprzętu..."
                  value={searchEquipQuery}
                  onChange={(e) => setSearchEquipQuery(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-xl h-10 text-xs text-white placeholder:text-white/30"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {filteredEquipmentKeys.map((key) => {
                    const count = inventory[key] || 0;
                    return (
                      <div
                        key={key}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          count > 0
                            ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                            : 'bg-white/5 border-white/5 text-white/50'
                        }`}
                      >
                        <span className="text-xs font-bold truncate max-w-[170px]" title={formatEquipmentName(key)}>
                          {formatEquipmentName(key)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setItemQuantity(key, count - 1)}
                            disabled={count <= 0}
                            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white font-bold"
                          >
                            <Minus className="h-3 w-3" />
                          </button>

                          <input
                            type="number"
                            min="0"
                            value={count}
                            onChange={(e) => setItemQuantity(key, parseInt(e.target.value, 10) || 0)}
                            className="w-10 h-7 bg-white/5 border border-white/10 rounded-lg text-center text-xs font-black text-white focus:outline-none focus:border-cyan-400"
                          />

                          <button
                            type="button"
                            onClick={() => setItemQuantity(key, count + 1)}
                            className="w-7 h-7 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
              disabled={!nazwaSali.trim()}
              className="flex-1 rounded-2xl h-12 text-xs font-bold bg-cyan-500 text-neutral-950 hover:bg-cyan-400 disabled:opacity-40"
            >
              {isOverridingBuiltIn
                ? "Zapisz nadpisanie sali"
                : isEditing
                ? "Zapisz zmiany"
                : "Zapisz i dodaj salę"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
