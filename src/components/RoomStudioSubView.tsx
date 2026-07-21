"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/app/lib/store';
import { RoomConfig, ALL_ROOMS } from '@/app/lib/data';
import { AddRoomDialog } from './AddRoomDialog';
import { RoomDetailDialog } from './RoomDetailDialog';
import {
  Building2,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Users,
  LayoutGrid,
  Dumbbell,
  Info,
  Layers,
  AlertCircle,
  X,
  SlidersHorizontal,
  Pencil,
  RotateCcw,
  ShieldAlert
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const RoomStudioSubView = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customRooms = useAppStore((state) => state.customRooms);
  const getAllRooms = useAppStore((state) => state.getAllRooms);
  const removeCustomRoom = useAppStore((state) => state.removeCustomRoom);
  const clearAllCustomRooms = useAppStore((state) => state.clearAllCustomRooms);
  const exportCustomRooms = useAppStore((state) => state.exportCustomRooms);
  const importCustomRooms = useAppStore((state) => state.importCustomRooms);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'builtin' | 'custom'>('all');
  const [filterTryb, setFilterTryb] = useState<'all' | 'obwodowy' | 'synchroniczny'>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomConfig | null>(null);
  const [selectedRoomInfo, setSelectedRoomInfo] = useState<RoomConfig | null>(null);

  const allRooms = useMemo(() => {
    if (typeof getAllRooms === 'function') {
      return getAllRooms();
    }
    return ALL_ROOMS;
  }, [customRooms, getAllRooms]);

  const filteredRooms = useMemo(() => {
    let list = allRooms;

    // 1. Źródło bazy
    if (filterMode === 'builtin') {
      list = list.filter((r) => !r.isCustom || r.isOverridden);
    } else if (filterMode === 'custom') {
      list = list.filter((r) => r.isCustom);
    }

    // 2. Tryb treningu
    if (filterTryb !== 'all') {
      list = list.filter((r) => r.tryb_treningu === filterTryb);
    }

    // 3. Wyszukiwarka po nazwie sali
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((r) =>
        r.nazwa_sali.toLowerCase().includes(q) ||
        r.id_sali.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allRooms, filterMode, filterTryb, searchQuery]);

  const counts = useMemo(() => {
    const total = allRooms.length;
    const customCount = customRooms.length;
    const builtinCount = ALL_ROOMS.length;
    return { total, customCount, builtinCount };
  }, [allRooms, customRooms]);

  const handleExport = () => {
    if (customRooms.length === 0) {
      toast({
        title: "Brak zaktualizowanych sal",
        description: "Nie dodano ani nie zmodyfikowano jeszcze żadnych sal do wyeksportowania.",
        variant: "destructive",
      });
      return;
    }

    const jsonStr = exportCustomRooms();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `moje_sale_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Pomyślnie wyeksportowano sale",
      description: `Pobrano plik z ${customRooms.length} zmodyfikowanymi/własnymi salami w formacie JSON.`,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importCustomRooms(content);

      if (result.success) {
        toast({
          title: "Import sal zakończony sukcesem",
          description: `Zaimportowano / zaktualizowano ${result.count} sal.`,
        });
      } else {
        toast({
          title: "Błąd importu",
          description: result.error || "Nie udało się zaimportować bazy sal.",
          variant: "destructive",
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteSingle = (id: string, name: string, isOverridden?: boolean) => {
    removeCustomRoom(id);
    toast({
      title: isOverridden ? "Przywrócono domyślną salę" : "Usunięto salę",
      description: isOverridden
        ? `Sala "${name}" została przywrócona do fabrycznej wersji wbudowanej.`
        : `Sala "${name}" została usunięta z Twojej bazy lokalnej.`,
    });
  };

  const handleClearAll = () => {
    clearAllCustomRooms();
    toast({
      title: "Wyczyszczono bazę sal",
      description: "Wszystkie modyfikacje i własne sale zostały usunięte.",
    });
  };

  return (
    <div className="space-y-5">
      {/* Pasek narzędzi Sal: Przycisk dodawania, źródło, wyszukiwarka */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filtry źródeł: Wszystkie / Wbudowane / Zapisane lokalnie */}
          <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5 self-start sm:self-auto">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-cyan-500 text-neutral-950 font-extrabold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Wszystkie ({counts.total})
            </button>
            <button
              onClick={() => setFilterMode('builtin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'builtin'
                  ? 'bg-cyan-500 text-neutral-950 font-extrabold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Wbudowane ({counts.builtinCount})
            </button>
            <button
              onClick={() => setFilterMode('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterMode === 'custom'
                  ? 'bg-emerald-500 text-neutral-950 font-extrabold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Zapisane lokalnie ({counts.customCount})
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:justify-end">
            {/* Wyszukiwarka */}
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Szukaj sali..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-9 bg-white/5 border-white/10 rounded-2xl h-11 text-xs text-white placeholder:text-white/30 focus:border-cyan-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Button
              onClick={() => {
                setEditingRoom(null);
                setIsAddDialogOpen(true);
              }}
              className="rounded-2xl h-11 px-4 bg-cyan-500 text-neutral-950 font-bold hover:bg-cyan-400 transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 text-xs"
            >
              <Plus className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Dodaj salę</span>
            </Button>
          </div>
        </div>

        {/* Drugi wiersz: Tryb + Przyciski zarządzania JSON */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Tryb:</span>
            <button
              onClick={() => setFilterTryb('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTryb === 'all' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              Wszystkie
            </button>
            <button
              onClick={() => setFilterTryb('obwodowy')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTryb === 'obwodowy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-white/40 hover:text-white'
              }`}
            >
              Obwodowe
            </button>
            <button
              onClick={() => setFilterTryb('synchroniczny')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                filterTryb === 'synchroniczny' ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'text-white/40 hover:text-white'
              }`}
            >
              Synchroniczne
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              title="Eksportuj moje sale w formacie JSON"
              className="rounded-xl h-9 px-3 bg-white/5 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Eksport JSON</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              title="Zaimportuj sale z pliku JSON"
              className="rounded-xl h-9 px-3 bg-white/5 border-white/10 hover:bg-white/10 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
            >
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span>Import JSON</span>
            </Button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            {counts.customCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Wyczyść wszystkie własne/zmodyfikowane sale"
                    className="rounded-xl h-9 px-3 text-xs font-bold text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-destructive/20 flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Wyczyść ({counts.customCount})</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-white/10 text-white max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2 text-lg font-bold">
                      <AlertCircle className="h-5 w-5" />
                      Wyczyścić bazę lokalną sal?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70 text-xs leading-relaxed">
                      Ta akcja nieodwracalnie usunie **wszystkie {counts.customCount} własne oraz zmodyfikowane sale** zapisane na tym urządzeniu.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-4">
                    <AlertDialogCancel className="rounded-xl text-xs border-white/10 bg-white/5">Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearAll}
                      className="rounded-xl text-xs bg-destructive text-white hover:bg-destructive/90 font-bold"
                    >
                      Tak, wyczyść moją bazę sal
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* Lista sal w siatce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => {
            const inventoryCount = Object.keys(room.inwentarz || {}).length;
            const totalItemCount = Object.values(room.inwentarz || {}).reduce((acc, curr) => acc + (curr > 0 ? curr : 0), 0);

            return (
              <div
                key={room.id_sali}
                className={`glass-card p-5 rounded-[2rem] border transition-all flex flex-col justify-between gap-4 group relative ${
                  room.isOverridden
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                    : room.isCustom
                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                    : 'bg-white/5 border-white/5 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                        room.isOverridden
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : room.isCustom
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/10 text-white/60 border border-white/10'
                      }`}>
                        {room.isOverridden ? "Modyfikowana Wbudowana" : room.isCustom ? "Moja Własna" : "Wbudowana"}
                      </span>

                      <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                        room.tryb_treningu === 'synchroniczny'
                          ? 'bg-secondary/20 text-secondary border border-secondary/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {room.tryb_treningu === 'synchroniczny' ? 'Synchroniczny' : 'Obwodowy'}
                      </span>
                    </div>

                    {/* Akcje w prawym górnym rogu: Edycja ✏️ oraz Usuwanie/Przywracanie 🗑️ */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingRoom(room);
                          setIsAddDialogOpen(true);
                        }}
                        className="text-white/40 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        title={room.isOverridden ? "Modyfikuj to nadpisanie sali" : room.isCustom ? "Edytuj własną salę" : "Zmodyfikuj tę salę wbudowaną (nadpisz)"}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {(room.isCustom || room.isOverridden) && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="text-white/30 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                              title={room.isOverridden ? "Przywróć fabryczną wersję wbudowaną" : "Usuń tę salę z bazy"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10 text-white max-w-sm">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-destructive text-base">
                                {room.isOverridden ? "Przywrócić wersję wbudowaną?" : "Usunąć salę?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-xs text-white/70">
                                {room.isOverridden
                                  ? `Czy na pewno chcesz usunąć modyfikacje i przywrócić fabryczną wersję sali "${room.nazwa_sali}"?`
                                  : `Czy na pewno chcesz usunąć salę "${room.nazwa_sali}" ze swojej bazy lokalnej?`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="pt-2">
                              <AlertDialogCancel className="rounded-xl text-xs">Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSingle(room.id_sali, room.nazwa_sali, room.isOverridden)}
                                className="rounded-xl text-xs bg-destructive text-white hover:bg-destructive/90 font-bold"
                              >
                                {room.isOverridden ? "Przywróć fabryczne" : "Usuń"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  <h3 className="font-extrabold text-base text-white leading-tight group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-cyan-400 shrink-0" />
                    <span>{room.nazwa_sali}</span>
                  </h3>
                </div>

                <div className="space-y-3 pt-3 border-t border-white/5 text-xs">
                  {/* Pojemność */}
                  <div className="grid grid-cols-2 gap-2 text-white/80 font-bold">
                    <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl">
                      <Users className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Max {room.maksymalna_pojemnosc.osoby} os.</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-xl">
                      <LayoutGrid className="h-3.5 w-3.5 text-secondary" />
                      <span>Max {room.maksymalna_pojemnosc.stacje} stacji</span>
                    </div>
                  </div>

                  {/* Podsumowanie sprzętu i stref */}
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <div className="flex items-center gap-1">
                      <Dumbbell className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Sprzęt: <strong className="text-white">{inventoryCount} rodzajów</strong> ({totalItemCount} szt.)</span>
                    </div>

                    <button
                      onClick={() => setSelectedRoomInfo(room)}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 ml-auto"
                    >
                      <Info className="h-3.5 w-3.5" />
                      <span>Szczegóły</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl border border-white/5 space-y-3">
            <Building2 className="h-10 w-10 text-white/20 mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-white/70">Brak sal spełniających kryteria</p>
              <p className="text-xs text-white/40">Zmień frazę wyszukiwania lub zresetuj aktywne filtry.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal ze szczegółowym podglądem sali */}
      <RoomDetailDialog
        room={selectedRoomInfo}
        open={!!selectedRoomInfo}
        onOpenChange={(open) => !open && setSelectedRoomInfo(null)}
      />

      {/* Modal dodawania / edycji sali */}
      <AddRoomDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingRoom(null);
        }}
        initialRoom={editingRoom}
        onSuccess={(updated) => {
          toast({
            title: editingRoom
              ? updated.isOverridden
                ? "Zmodyfikowano salę wbudowaną!"
                : "Zaktualizowano salę!"
              : "Dodano nową salę!",
            description: `Sala "${updated.nazwa_sali}" została pomyślnie zapisana w bazie lokalnej.`,
          });
        }}
      />
    </div>
  );
};
