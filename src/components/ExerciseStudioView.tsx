"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppStore } from '@/app/lib/store';
import { Exercise, ALL_EXERCISES, SEGMENTS, DIFFICULTY_LEVELS } from '@/app/lib/data';
import { AddExerciseDialog } from './AddExerciseDialog';
import { ExerciseDetailDialog } from './ExerciseDetailDialog';
import {
  Database,
  Search,
  Plus,
  Download,
  Upload,
  Trash2,
  Trophy,
  Users,
  User,
  Sparkles,
  Info,
  Building2,
  Layers,
  AlertCircle,
  FileJson,
  X,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  Edit3
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

// Słownik tłumaczeń kluczy sprzętowych na przyjazne etykiety po polsku
export const formatEquipmentName = (key: string): string => {
  if (!key) return '';
  const dictionary: Record<string, string> = {
    ab_wheel: "AB Wheel (Kółko)",
    bloczek_joga: "Bloczek do jogi",
    box_plyometryczny_miekki_ciezki: "Box miękki / ciężki",
    box_posladki: "Box do pośladków",
    brama_rig: "Brama / RIG",
    drabinka_pionowa: "Drabinka pionowa",
    drabinka_pozioma: "Drabinka pozioma",
    drazek: "Drążek",
    gryf_olimpijski: "Gryf olimpijski",
    guma_oporowa_dluga: "Guma oporowa długa",
    guma_oporowa_mini: "Guma oporowa mini",
    hantel: "Hantel / Hantle",
    kamizelka_obciazeniowa: "Kamizelka obciążeniowa",
    kettlebell: "Kettlebell",
    kij_drewniany: "Kij drewniany",
    klin: "Klin mobilizacyjny",
    kolko_gimnastyczne: "Kółka gimnastyczne",
    kulki_drazek: "Kulki na drążek",
    mata: "Mata do ćwiczeń",
    materac: "Materac ochronny",
    nunczako: "Nunczako / Uchwyty",
    obciazenia_kostki: "Obciążniki na kostki",
    paraletka: "Paraletki",
    pilka_bosu: "Piłka Bosu",
    pilka_gimnastyczna: "Piłka gimnastyczna",
    pilka_lekarska: "Piłka lekarska",
    pilka_materialowa: "Piłka materiałowa",
    pilka_tenisowa: "Piłka tenisowa",
    porecz_dip: "Poręcze do dipów",
    ramiona_asekuracyjne: "Ramiona asekuracyjne",
    recznik: "Ręcznik",
    roller: "Roller / Wałek",
    sciana_handstand: "Ściana do Handstandu",
    skakanka: "Skakanka",
    skrzynia_drewniana: "Skrzynia drewniana",
    stepper: "Stepper",
    sztanga_5kg: "Sztanga 5kg",
    talerz: "Talerz / Obciążenie",
    trx: "Taśmy TRX",
    uchwyt_sztangi_rig: "Uchwyt sztangi RIG",
    worek_obciazeniowy: "Worek obciążeniowy",
  };

  if (dictionary[key]) return dictionary[key];
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const ExerciseStudioView = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const customExercises = useAppStore((state) => state.customExercises);
  const getAllExercises = useAppStore((state) => state.getAllExercises);
  const removeCustomExercise = useAppStore((state) => state.removeCustomExercise);
  const clearAllCustomExercises = useAppStore((state) => state.clearAllCustomExercises);
  const exportCustomExercises = useAppStore((state) => state.exportCustomExercises);
  const importCustomExercises = useAppStore((state) => state.importCustomExercises);

  const [activeSubTab, setActiveSubTab] = useState<'exercises' | 'rooms' | 'categories'>('exercises');
  
  // Stan rozwijania panelu filtrów i narzędzi
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // Stan filtrów
  const [filterMode, setFilterMode] = useState<'all' | 'builtin' | 'custom'>('all');
  const [filterTrybPracy, setFilterTrybPracy] = useState<'all' | 'Solo' | 'W_Parze'>('all');
  const [filterSegment, setFilterSegment] = useState<number | 'all'>('all');
  const [filterPoziomGroup, setFilterPoziomGroup] = useState<string>('all');
  const [filterEquipment, setFilterEquipment] = useState<string>('all');
  const [filterMuscle, setFilterMuscle] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [selectedExerciseInfo, setSelectedExerciseInfo] = useState<Exercise | null>(null);

  const allExercises = useMemo(() => getAllExercises(), [customExercises, getAllExercises]);

  // Lista unikalnego sprzętu z całej bazy posortowana po sformatowanych nazwach po polsku
  const availableEquipmentList = useMemo(() => {
    const equipSet = new Set<string>();
    allExercises.forEach((ex) => {
      if (ex.wymagania_sprzetowe && Array.isArray(ex.wymagania_sprzetowe)) {
        ex.wymagania_sprzetowe.forEach((rule) => {
          if (Array.isArray(rule)) {
            rule.forEach((alt) => Object.keys(alt).forEach((k) => equipSet.add(k)));
          } else if (rule && typeof rule === 'object') {
            Object.keys(rule).forEach((k) => equipSet.add(k));
          }
        });
      }
    });

    return Array.from(equipSet).sort((a, b) => 
      formatEquipmentName(a).localeCompare(formatEquipmentName(b), 'pl')
    );
  }, [allExercises]);

  // Lista unikalnych partii mięśniowych z całej bazy
  const availableMusclesList = useMemo(() => {
    const muscleSet = new Set<string>();
    allExercises.forEach((ex) => {
      if (ex.glowne_partie && Array.isArray(ex.glowne_partie)) {
        ex.glowne_partie.forEach((m) => muscleSet.add(m));
      }
    });
    return Array.from(muscleSet).sort((a, b) => a.localeCompare(b, 'pl'));
  }, [allExercises]);

  // Filtrowanie listy ćwiczeń
  const filteredExercises = useMemo(() => {
    let list = allExercises;

    // 1. Źródło bazy
    if (filterMode === 'builtin') {
      list = list.filter((ex) => !ex.isCustom || ex.isOverridden);
    } else if (filterMode === 'custom') {
      list = list.filter((ex) => ex.isCustom);
    }

    // 2. Tryb pracy
    if (filterTrybPracy !== 'all') {
      list = list.filter((ex) => ex.tryb_pracy === filterTrybPracy);
    }

    // 3. Segment
    if (filterSegment !== 'all') {
      list = list.filter((ex) => ex.segment_id === filterSegment);
    }

    // 4. Poziom trudności (dopasowanie ścisłe z poziomy_trudnosci.json)
    if (filterPoziomGroup === '0') {
      list = list.filter((ex) => ex.poziom === 0);
    } else if (filterPoziomGroup !== 'all') {
      const selectedDiff = DIFFICULTY_LEVELS.find((d) => d.id === filterPoziomGroup);
      if (selectedDiff) {
        list = list.filter((ex) => ex.poziom >= selectedDiff.min_poziom && ex.poziom <= selectedDiff.max_poziom);
      }
    }

    // 5. Wymagany sprzęt
    if (filterEquipment === 'none') {
      list = list.filter((ex) => !ex.wymagania_sprzetowe || ex.wymagania_sprzetowe.length === 0);
    } else if (filterEquipment !== 'all') {
      list = list.filter((ex) => {
        if (!ex.wymagania_sprzetowe) return false;
        return ex.wymagania_sprzetowe.some((rule) => {
          if (Array.isArray(rule)) {
            return rule.some((alt) => Object.keys(alt).includes(filterEquipment));
          }
          return Object.keys(rule).includes(filterEquipment);
        });
      });
    }

    // 6. Partie mięśniowe
    if (filterMuscle !== 'all') {
      list = list.filter((ex) =>
        ex.glowne_partie?.some((m) => m.toLowerCase() === filterMuscle.toLowerCase())
      );
    }

    // 7. Wyszukiwarka tekstowa
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter((ex) =>
        ex.nazwa.toLowerCase().includes(query) ||
        ex.segment_nazwa.toLowerCase().includes(query) ||
        (ex.wariant && ex.wariant.toLowerCase().includes(query)) ||
        (ex.glowne_partie && ex.glowne_partie.some((p) => p.toLowerCase().includes(query)))
      );
    }

    return list;
  }, [allExercises, filterMode, filterTrybPracy, filterSegment, filterPoziomGroup, filterEquipment, filterMuscle, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterMode !== 'all') count++;
    if (filterTrybPracy !== 'all') count++;
    if (filterSegment !== 'all') count++;
    if (filterPoziomGroup !== 'all') count++;
    if (filterEquipment !== 'all') count++;
    if (filterMuscle !== 'all') count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [filterMode, filterTrybPracy, filterSegment, filterPoziomGroup, filterEquipment, filterMuscle, searchQuery]);

  const handleResetFilters = () => {
    setFilterMode('all');
    setFilterTrybPracy('all');
    setFilterSegment('all');
    setFilterPoziomGroup('all');
    setFilterEquipment('all');
    setFilterMuscle('all');
    setSearchQuery('');
  };

  const counts = useMemo(() => {
    const total = allExercises.length;
    const customCount = customExercises.length;
    const builtinCount = ALL_EXERCISES.length;
    return { total, customCount, builtinCount };
  }, [allExercises, customExercises]);

  const handleExport = () => {
    if (customExercises.length === 0) {
      toast({
        title: "Brak własnych ćwiczeń",
        description: "Nie dodano ani nie zmodyfikowano jeszcze żadnych ćwiczeń do wyeksportowania.",
        variant: "destructive",
      });
      return;
    }

    const jsonStr = exportCustomExercises();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `moje_cwiczenia_${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Pomyślnie wyeksportowano",
      description: `Pobrano plik z ${customExercises.length} zmodyfikowanymi/własnymi ćwiczeniami w formacie JSON.`,
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importCustomExercises(content);

      if (result.success) {
        toast({
          title: "Import zakończony sukcesem",
          description: `Dodano / zaktualizowano ${result.count} własnych/nadpisanych ćwiczeń.`,
        });
      } else {
        toast({
          title: "Błąd importu",
          description: result.error || "Nie udało się zaimportować bazy.",
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
    removeCustomExercise(id);
    toast({
      title: isOverridden ? "Przywrócono wersję wbudowaną" : "Usunięto ćwiczenie",
      description: isOverridden
        ? `Ćwiczenie "${name}" zostało przywrócone do fabrycznej wersji wbudowanej.`
        : `Ćwiczenie "${name}" zostało usunięte z Twojej bazy lokalnej.`,
    });
  };

  const handleClearAll = () => {
    clearAllCustomExercises();
    toast({
      title: "Wyczyszczono bazę lokalną",
      description: "Wszystkie modyfikacje i własne ćwiczenia zostały usunięte. Wbudowana baza została przywrócona do stanu domyślnego.",
    });
  };

  const selectedDiffLabel = useMemo(() => {
    if (filterPoziomGroup === 'all') return null;
    if (filterPoziomGroup === '0') return '0 (Uniwersalne)';
    const found = DIFFICULTY_LEVELS.find(d => d.id === filterPoziomGroup);
    return found ? `${found.nazwa_grupy} (${found.min_poziom}-${found.max_poziom})` : filterPoziomGroup;
  }, [filterPoziomGroup]);

  return (
    <div className="min-h-screen pb-28 pt-4 px-4 max-w-4xl mx-auto space-y-6">
      {/* Nagłówek Studio */}
      <div className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tight text-white">Studio Bazy Treningowej</h1>
              <p className="text-xs text-white/50">Zarządzaj swoją bazą ćwiczeń, edytuj pozycje wbudowane i dodawaj własne</p>
            </div>
          </div>

          <Button
            onClick={() => {
              setEditingExercise(null);
              setIsAddDialogOpen(true);
            }}
            className="rounded-2xl h-12 px-5 bg-cyan-500 text-neutral-950 font-bold hover:bg-cyan-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
            <span>Dodaj ćwiczenie</span>
          </Button>
        </div>

        {/* Wewnętrzne zakładki Studio */}
        <div className="flex gap-2 border-t border-white/5 pt-4 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('exercises')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'exercises'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                : 'bg-white/5 border border-white/5 text-white/50 hover:text-white'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Ćwiczenia ({counts.total})</span>
          </button>

          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 text-white/20 cursor-not-allowed opacity-50"
            title="Dostępne w przyszłych aktualizacjach"
          >
            <Building2 className="h-4 w-4" />
            <span>Sale (W przygotowaniu)</span>
          </button>

          <button
            disabled
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/5 text-white/20 cursor-not-allowed opacity-50"
            title="Dostępne w przyszłych aktualizacjach"
          >
            <Layers className="h-4 w-4" />
            <span>Kategorie (W przygotowaniu)</span>
          </button>
        </div>
      </div>

      {/* PASEK FILTRÓW, WYSZUKIWANIA I NARZĘDZI BAZY */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 space-y-4">
        {/* Wiersz 1: Źródło bazy + Wyszukiwarka + Przycisk Zwijania Filtrów */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filtry źródeł: Wszystkie / Wbudowane / Zmodyfikowane i Własne */}
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
                placeholder="Szukaj ćwiczenia..."
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

            {/* Przycisk Zwijania / Rozwijania dodatkowych filtrów i narzędzi */}
            <Button
              variant="outline"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              className={`rounded-2xl h-11 px-3.5 border text-xs font-bold transition-all flex items-center gap-2 ${
                isFiltersExpanded || activeFiltersCount > 0
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
              <span className="hidden xs:inline">Filtry / Opcje</span>
              {activeFiltersCount > 0 && (
                <span className="bg-cyan-500 text-neutral-950 px-1.5 py-0.2 text-[10px] font-black rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              {isFiltersExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* ZWIJANA SEKCJA DODATKOWYCH FILTRÓW I OPERACJI NA PLIKACH */}
        {isFiltersExpanded && (
          <div className="space-y-4 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Nagłówek filtrów */}
            <div className="flex items-center justify-between text-xs font-bold text-white/70 uppercase tracking-wider">
              <span className="text-cyan-400 flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5" />
                Szczegółowe kryteria selekcji
              </span>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] font-bold text-destructive/90 hover:text-destructive flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Wyczyść filtry ({activeFiltersCount})</span>
                </button>
              )}
            </div>

            {/* Zwarty, dopasowany flex z elastycznymi szerokościami */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* 1. Tryb pracy */}
              <div className="flex-1 min-w-[130px] max-w-[180px] space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Tryb wykonania</label>
                <select
                  value={filterTrybPracy}
                  onChange={(e) => setFilterTrybPracy(e.target.value as any)}
                  className={`w-full bg-white/5 border rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 ${
                    filterTrybPracy !== 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10'
                  }`}
                >
                  <option value="all" className="bg-neutral-900 text-white">Wszystkie tryby</option>
                  <option value="Solo" className="bg-neutral-900 text-white">Solo (Pojedyncze)</option>
                  <option value="W_Parze" className="bg-neutral-900 text-white">W Parze (Partner)</option>
                </select>
              </div>

              {/* 2. Segment */}
              <div className="flex-1 min-w-[150px] max-w-[200px] space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Segment</label>
                <select
                  value={filterSegment}
                  onChange={(e) => setFilterSegment(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))}
                  className={`w-full bg-white/5 border rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 ${
                    filterSegment !== 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10'
                  }`}
                >
                  <option value="all" className="bg-neutral-900 text-white">Wszystkie segmenty</option>
                  {SEGMENTS.map((seg) => (
                    <option key={seg.id} value={seg.id} className="bg-neutral-900 text-white">
                      {seg.nazwa}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Poziom trudności */}
              <div className="flex-1 min-w-[190px] max-w-[260px] space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Poziom trudności</label>
                <select
                  value={filterPoziomGroup}
                  onChange={(e) => setFilterPoziomGroup(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 ${
                    filterPoziomGroup !== 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10'
                  }`}
                >
                  <option value="all" className="bg-neutral-900 text-white">Wszystkie poziomy</option>
                  <option value="0" className="bg-neutral-900 text-white">0 - Uniwersalne</option>
                  {DIFFICULTY_LEVELS.map((diff) => (
                    <option key={diff.id} value={diff.id} className="bg-neutral-900 text-white">
                      {diff.nazwa_grupy} ({diff.min_poziom}-{diff.max_poziom})
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. Wymagany sprzęt */}
              <div className="flex-1 min-w-[170px] max-w-[240px] space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Wymagany sprzęt</label>
                <select
                  value={filterEquipment}
                  onChange={(e) => setFilterEquipment(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 ${
                    filterEquipment !== 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10'
                  }`}
                >
                  <option value="all" className="bg-neutral-900 text-white">Wszystkie sprzęty</option>
                  <option value="none" className="bg-neutral-900 text-white">Brak / Masa ciała</option>
                  {availableEquipmentList.map((eq) => (
                    <option key={eq} value={eq} className="bg-neutral-900 text-white">
                      {formatEquipmentName(eq)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Główna partia mięśniowa */}
              <div className="flex-1 min-w-[160px] max-w-[220px] space-y-1">
                <label className="text-[10px] font-bold text-white/50 uppercase">Partia mięśniowa</label>
                <select
                  value={filterMuscle}
                  onChange={(e) => setFilterMuscle(e.target.value)}
                  className={`w-full bg-white/5 border rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-500 ${
                    filterMuscle !== 'all' ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300' : 'border-white/10'
                  }`}
                >
                  <option value="all" className="bg-neutral-900 text-white">Wszystkie partie</option>
                  {availableMusclesList.map((m) => (
                    <option key={m} value={m} className="bg-neutral-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SEKCJA ZARZĄDZANIA PLIKAMI BAZY */}
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Zarządzanie plikami JSON:</span>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  title="Eksportuj moje i zmodyfikowane ćwiczenia w formacie JSON"
                  className="rounded-xl h-9 px-3 bg-white/5 border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-xs font-bold text-white flex items-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Eksport JSON</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Zaimportuj ćwiczenia z pliku JSON"
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
                        title="Wyczyść wszystkie modyfikacje i własne ćwiczenia"
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
                          Wyczyścić całą bazę lokalną?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-white/70 text-xs leading-relaxed">
                          Ta akcja nieodwracalnie usunie **wszystkie {counts.customCount} własne oraz zmodyfikowane ćwiczenia** zapisane na tym urządzeniu.
                          Wbudowana baza główna zostanie przywrócona do stanu fabrycznego.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="rounded-xl text-xs border-white/10 bg-white/5">Anuluj</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAll}
                          className="rounded-xl text-xs bg-destructive text-white hover:bg-destructive/90 font-bold"
                        >
                          Tak, wyczyść moją bazę
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pasek statusu wyników */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-xs">
          <span className="font-bold text-white/70">
            Wyniki: <span className="text-cyan-400 font-black">{filteredExercises.length}</span> z {allExercises.length} ćwiczeń
          </span>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {filterMode !== 'all' && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Źródło: {filterMode === 'builtin' ? 'Wbudowane' : 'Lokalne'}
                  <button onClick={() => setFilterMode('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              {filterTrybPracy !== 'all' && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Tryb: {filterTrybPracy === 'Solo' ? 'Solo' : 'W Parze'}
                  <button onClick={() => setFilterTrybPracy('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              {filterSegment !== 'all' && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Segment: {SEGMENTS.find((s) => s.id === filterSegment)?.nazwa}
                  <button onClick={() => setFilterSegment('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              {filterPoziomGroup !== 'all' && selectedDiffLabel && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Poziom: {selectedDiffLabel}
                  <button onClick={() => setFilterPoziomGroup('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              {filterEquipment !== 'all' && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Sprzęt: {filterEquipment === 'none' ? 'Brak' : formatEquipmentName(filterEquipment)}
                  <button onClick={() => setFilterEquipment('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              {filterMuscle !== 'all' && (
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1">
                  Partia: {filterMuscle}
                  <button onClick={() => setFilterMuscle('all')}><X className="h-3 w-3 hover:text-white" /></button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-[10px] font-bold text-destructive hover:underline ml-1"
              >
                Resetuj wszystkie
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lista przefiltrowanych ćwiczeń */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((ex) => (
            <div
              key={ex.id_cwiczenia}
              className={`glass-card p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 group relative ${
                ex.isOverridden
                  ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                  : ex.isCustom
                  ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                  : 'bg-white/5 border-white/5 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider ${
                      ex.isOverridden
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : ex.isCustom
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-white/60 border border-white/10'
                    }`}>
                      {ex.isOverridden ? "Modyfikowane Wbudowane" : ex.isCustom ? "Moje Własne" : "Wbudowane"}
                    </span>

                    <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-white/5 text-white/50 border border-white/5">
                      {ex.segment_nazwa}
                    </span>
                  </div>

                  {/* Ikony akcji w prawym górnym rogu karty: Edycja (Pencil) oraz Usuwanie/Przywracanie */}
                  <div className="flex items-center gap-1">
                    {/* Ikonka Ołówka - Edycja ćwiczenia */}
                    <button
                      onClick={() => {
                        setEditingExercise(ex);
                        setIsAddDialogOpen(true);
                      }}
                      className="text-white/40 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      title={ex.isOverridden ? "Modyfikuj to nadpisane ćwiczenie" : ex.isCustom ? "Edytuj własne ćwiczenie" : "Zmodyfikuj to ćwiczenie wbudowane (nadpisz)"}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Przycisk Usuwania / Przywracania fabrycznego */}
                    {(ex.isCustom || ex.isOverridden) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            className="text-white/30 hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                            title={ex.isOverridden ? "Przywróć fabryczną wersję wbudowaną" : "Usuń to ćwiczenie z bazy"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/10 text-white max-w-sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-destructive text-base">
                              {ex.isOverridden ? "Przywrócić wersję wbudowaną?" : "Usunąć ćwiczenie?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-xs text-white/70">
                              {ex.isOverridden
                                ? `Czy na pewno chcesz usunąć własne modyfikacje i przywrócić fabryczną wersję ćwiczenia "${ex.nazwa}"?`
                                : `Czy na pewno chcesz usunąć "${ex.nazwa}" ze swojej bazy lokalnej?`}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-2">
                            <AlertDialogCancel className="rounded-xl text-xs">Anuluj</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteSingle(ex.id_cwiczenia, ex.nazwa, ex.isOverridden)}
                              className="rounded-xl text-xs bg-destructive text-white hover:bg-destructive/90 font-bold"
                            >
                              {ex.isOverridden ? "Przywróć fabryczne" : "Usuń"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-white leading-tight group-hover:text-cyan-400 transition-colors">
                  {ex.nazwa}
                </h3>

                {ex.wariant && (
                  <p className="text-[10px] text-white/50 italic font-semibold mt-0.5">
                    Wariant: {ex.wariant}
                  </p>
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center justify-between text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="font-bold">
                      {ex.poziom === 0 ? "0 - UNIWERSALNY" : `Poziom ${ex.poziom}/10`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {ex.tryb_pracy === 'W_Parze' ? (
                      <span className="text-[10px] font-bold text-secondary flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded">
                        <Users className="h-3 w-3" /> W parze
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-white/40 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded">
                        <User className="h-3 w-3" /> Solo
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-white/40 font-semibold truncate max-w-[180px]">
                    Partie: {Array.isArray(ex.glowne_partie) ? ex.glowne_partie.join(", ") : ex.glowne_partie}
                  </span>

                  <button
                    onClick={() => setSelectedExerciseInfo(ex)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 ml-auto"
                  >
                    <Info className="h-3.5 w-3.5" />
                    <span>Opis</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center glass-card rounded-2xl border border-white/5 space-y-3">
            <Database className="h-10 w-10 text-white/20 mx-auto" />
            <div className="space-y-1">
              <p className="font-bold text-white/70">Brak ćwiczeń spełniających kryteria</p>
              <p className="text-xs text-white/40">Zmień frazę wyszukiwania lub zresetuj aktywne filtry.</p>
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-xl text-xs bg-white/5 border-white/10 hover:bg-white/10 text-cyan-400 font-bold"
              >
                Wyczyść wszystkie filtry
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal ze szczegółowym opisem ćwiczenia */}
      <ExerciseDetailDialog
        exercise={selectedExerciseInfo}
        open={!!selectedExerciseInfo}
        onOpenChange={(open) => !open && setSelectedExerciseInfo(null)}
      />

      {/* Modal dodawania / edycji ćwiczenia */}
      <AddExerciseDialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingExercise(null);
        }}
        initialExercise={editingExercise}
        onSuccess={(updated) => {
          toast({
            title: editingExercise
              ? updated.isOverridden
                ? "Zmodyfikowano ćwiczenie wbudowane!"
                : "Zaktualizowano ćwiczenie!"
              : "Dodano nowe ćwiczenie!",
            description: `Ćwiczenie "${updated.nazwa}" zostało pomyślnie zapisane w bazie lokalnej.`,
          });
        }}
      />
    </div>
  );
};
