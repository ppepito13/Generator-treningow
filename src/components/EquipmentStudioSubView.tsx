"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/app/lib/store';
import { EquipmentItem, ALL_EQUIPMENT, formatEquipmentName } from '@/app/lib/data';
import { AddEditEquipmentDialog } from './AddEditEquipmentDialog';
import {
  Dumbbell,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Key,
  Pencil,
  ShieldAlert,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

export const EquipmentStudioSubView = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customEquipment = useAppStore((state) => state.customEquipment);
  const getAllEquipmentItems = useAppStore((state) => state.getAllEquipmentItems);
  const removeCustomEquipment = useAppStore((state) => state.removeCustomEquipment);
  const clearAllCustomEquipment = useAppStore((state) => state.clearAllCustomEquipment);
  const exportCustomEquipment = useAppStore((state) => state.exportCustomEquipment);
  const importCustomEquipment = useAppStore((state) => state.importCustomEquipment);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'builtin' | 'custom'>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null);

  const allEquipment = useMemo(() => {
    if (typeof getAllEquipmentItems === 'function') {
      return getAllEquipmentItems();
    }
    return ALL_EQUIPMENT.map(key => ({
      id: key,
      nazwa: formatEquipmentName(key),
      isCustom: false,
    }));
  }, [customEquipment, getAllEquipmentItems]);

  const filteredEquipment = useMemo(() => {
    let list = allEquipment;

    // 1. Źródło bazy
    if (filterMode === 'builtin') {
      list = list.filter((item) => !item.isCustom);
    } else if (filterMode === 'custom') {
      list = list.filter((item) => item.isCustom);
    }

    // 2. Wyszukiwarka po nazwie lub kluczu
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        item.nazwa.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [allEquipment, filterMode, searchQuery]);

  const counts = useMemo(() => {
    const total = allEquipment.length;
    const customCount = customEquipment.length;
    const builtinCount = ALL_EQUIPMENT.length;
    return { total, customCount, builtinCount };
  }, [allEquipment, customEquipment]);

  const handleExport = () => {
    if (customEquipment.length === 0) {
      toast({
        title: "Brak własnego sprzętu",
        description: "Nie dodano jeszcze żadnego własnego sprzętu do wyeksportowania.",
        variant: "destructive",
      });
      return;
    }

    const jsonStr = exportCustomEquipment();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `moj_sprzet_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Pomyślnie wyeksportowano sprzęt",
      description: `Pobrano plik z ${customEquipment.length} pozycjami sprzętowymi w formacie JSON.`,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importCustomEquipment(content);

      if (result.success) {
        toast({
          title: "Import sprzętu zakończony sukcesem",
          description: `Zaimportowano ${result.count} pozycji sprzętu.`,
        });
      } else {
        toast({
          title: "Błąd importu",
          description: result.error || "Nie udało się zaimportować bazy sprzętu.",
          variant: "destructive",
        });
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteSingle = (id: string, name: string) => {
    removeCustomEquipment(id);
    toast({
      title: "Usunięto sprzęt",
      description: `Usunięto "${name}" z bazy lokalnej.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Ukryty input dla importu pliku JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json"
        className="hidden"
      />

      {/* PASEK WYSZUKIWANIA I NARZĘDZI BAZY SPRZĘTU */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filtry źródeł: Wszystkie / Wbudowane / Własne */}
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
                  ? 'bg-cyan-500 text-neutral-950 font-extrabold shadow'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Własne ({counts.customCount})
            </button>
          </div>

          {/* Wyszukiwarka po nazwie / kluczu */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj sprzętu..."
              className="glass-input pl-10 pr-9 rounded-2xl h-10 text-xs border-white/10 text-white placeholder:text-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Przycisk dodawania sprzętu (Sama ikona +) oraz narzędzia importu/eksportu/czyszczenia */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setEditingEquipment(null);
                setIsAddDialogOpen(true);
              }}
              size="icon"
              title="Dodaj Nowy Sprzęt"
              className="h-10 w-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 shadow shrink-0"
            >
              <Plus className="h-5 w-5 stroke-[3]" />
            </Button>

            <Button
              onClick={handleExport}
              variant="outline"
              size="icon"
              title="Eksportuj własny sprzęt (JSON)"
              className="h-10 w-10 rounded-xl border-white/10 glass-button hover:bg-white/10 shrink-0"
            >
              <Download className="h-4 w-4 text-cyan-400" />
            </Button>

            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="icon"
              title="Importuj sprzęt z pliku JSON"
              className="h-10 w-10 rounded-xl border-white/10 glass-button hover:bg-white/10 shrink-0"
            >
              <Upload className="h-4 w-4 text-cyan-400" />
            </Button>

            {customEquipment.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Usuń cały dodany własny sprzęt"
                    className="h-10 w-10 rounded-xl border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="glass-card border-white/10 text-white rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                      <ShieldAlert className="h-5 w-5" /> Reset Bazy Własnego Sprzętu
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs text-muted-foreground">
                      Czy na pewno chcesz usunąć cały dodany przez siebie sprzęt ({customEquipment.length})? Sprzęt wbudowany pozostanie nienaruszony. Tej operacji nie można cofnąć.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-white/10 text-xs">Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearAllCustomEquipment();
                        toast({
                          title: "Zresetowano bazę sprzętu",
                          description: "Usunięto cały dodany przez użytkownika sprzęt.",
                        });
                      }}
                      className="rounded-xl bg-destructive text-destructive-foreground text-xs font-bold"
                    >
                      Usuń Cały Własny Sprzęt
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>

      {/* PODSUMOWANIE DANYCH */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>Znaleziono sprzętu: <strong className="text-cyan-400">{filteredEquipment.length}</strong> z {allEquipment.length}</span>
        {searchQuery && <span>Filtrowanie: "{searchQuery}"</span>}
      </div>

      {/* SIATKA KART SPRZĘTU */}
      {filteredEquipment.length === 0 ? (
        <div className="glass-card p-12 rounded-[2rem] border border-white/10 text-center space-y-3">
          <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
          <h3 className="text-base font-bold text-white">Brak sprzętu w bazie</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Nie znaleziono żadnej pozycji sprzętowej spełniającej podane kryteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredEquipment.map((item) => {
            const prettyName = item.nazwa || formatEquipmentName(item.id);

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-5 border border-white/10 hover:border-cyan-500/40 transition-all flex flex-col justify-between space-y-3 group relative"
              >
                <div className="space-y-3">
                  {/* Górny pasek karty: Ikona + Badge statusu + Ikony akcji (Prawy Górny Narożnik) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Dumbbell className="h-4 w-4" />
                      </span>
                      {item.isCustom ? (
                        <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[9px] font-bold uppercase rounded-lg px-2 py-0.5 border">
                          Własny
                        </Badge>
                      ) : (
                        <Badge className="bg-white/5 text-white/50 border-white/10 text-[9px] font-bold uppercase rounded-lg px-2 py-0.5">
                          Wbudowany
                        </Badge>
                      )}
                    </div>

                    {/* Przycisk Edycji i Usuwania w prawym górnym rogu (TYLKO dla własnego sprzętu) */}
                    {item.isCustom && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingEquipment(item);
                            setIsAddDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-white/50 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                          title="Edytuj sprzęt"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-1.5 rounded-lg text-white/50 hover:text-destructive hover:bg-white/10 transition-colors"
                              title="Usuń sprzęt"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass-card border-white/10 text-white rounded-3xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                                Usunąć sprzęt z bazy?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-xs text-muted-foreground">
                                Czy na pewno chcesz usunąć własny sprzęt "{prettyName}" (klucz: {item.id})?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="rounded-xl border-white/10 text-xs">Anuluj</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteSingle(item.id, prettyName)}
                                className="rounded-xl bg-destructive text-destructive-foreground text-xs font-bold"
                              >
                                Usuń Sprzęt
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>

                  {/* Czytelna Nazwa Sprzętu (Human-Friendly) */}
                  <div className="pt-1">
                    <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors leading-snug">
                      {prettyName}
                    </h3>
                  </div>

                  {/* Klucz w bazie / JSON */}
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono bg-black/20 p-2 rounded-xl border border-white/5">
                    <Key className="h-3 w-3 text-secondary shrink-0" />
                    <span className="truncate">{item.id}</span>
                  </div>

                  {/* Opis / Uwagi (jeśli obecne) */}
                  {item.opis && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed italic bg-black/10 p-2 rounded-xl border border-white/5">
                      {item.opis}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DIALOG DODAWANIA / EDYCJI SPRZĘTU */}
      <AddEditEquipmentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        equipmentToEdit={editingEquipment}
      />
    </div>
  );
};
