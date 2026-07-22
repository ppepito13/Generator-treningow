"use client";

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/app/lib/store';
import {
  IntervalPreset,
  IntervalBlock,
  IntervalStep,
  StepColor,
  STEP_COLOR_MAP,
  BUILTIN_INTERVAL_PRESETS,
  TTSReadoutOption,
  TTSCountdownOption,
} from '@/types/timer';
import { GymViewModal, FlattenedQueueItem } from './GymViewModal';
import { useTimerAudioTTS } from '@/app/lib/useTimerAudioTTS';
import {
  Play,
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Volume2,
  Mic,
  Settings,
  Sparkles,
  Zap,
  Repeat,
  Sliders,
  Check,
  Layers,
  Save,
  PlusCircle,
  FilePlus,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export const IntervalTimerSubView = () => {
  const { toast } = useToast();

  const circuit = useAppStore((state) => state.circuit);
  const customIntervalPresets = useAppStore((state) => state.customIntervalPresets);
  const addCustomIntervalPreset = useAppStore((state) => state.addCustomIntervalPreset);
  const removeCustomIntervalPreset = useAppStore((state) => state.removeCustomIntervalPreset);
  const timerAudioSettings = useAppStore((state) => state.timerAudioSettings);
  const updateTimerAudioSettings = useAppStore((state) => state.updateTimerAudioSettings);

  const activeIntervalExecution = useAppStore((state) => state.activeIntervalExecution);
  const setActiveIntervalExecution = useAppStore((state) => state.setActiveIntervalExecution);
  const maximizeGymView = useAppStore((state) => state.maximizeGymView);

  const { unlockAudio } = useTimerAudioTTS();

  // 1. Dynamiczny preset budowany bezpośrednio z aktualnie wygenerowanego zestawu ćwiczeń
  const generatedCircuitPreset: IntervalPreset | null = useMemo(() => {
    if (!circuit || circuit.length === 0) return null;
    const stationCount = circuit.length;
    return {
      id: 'preset_dynamic_circuit',
      nazwa: `⚡ Wygenerowany Zestaw (${stationCount} Stacji x 2 Serie)`,
      opis: `Automatycznie dopasowany zegar do wygenerowanego obwodu (${stationCount} stacji).`,
      bloki: [
        {
          id: `blk_w_${Date.now()}`,
          nazwaBloku: 'Rozgrzewka',
          typ: 'single',
          singleStep: { id: 'stp_w', nazwa: 'Rozgrzewka Ogólna', durationSeconds: 60, color: 'yellow' },
        },
        {
          id: `blk_s1_${Date.now()}`,
          nazwaBloku: `Seria 1 - Obwód (${stationCount} Stacji)`,
          typ: 'loop',
          roundsCount: stationCount,
          skipLastRestInLoop: true,
          loopSteps: [
            { id: 'stp_work1', nazwa: 'Praca na Stacji', durationSeconds: 45, color: 'green' },
            { id: 'stp_rest1', nazwa: 'Zmiana Stacji', durationSeconds: 15, color: 'red' },
          ],
        },
        {
          id: `blk_sr_${Date.now()}`,
          nazwaBloku: 'Przerwa Między Seriami',
          typ: 'single',
          singleStep: { id: 'stp_sr', nazwa: 'Odpoczynek Między Seriami', durationSeconds: 120, color: 'blue' },
        },
        {
          id: `blk_s2_${Date.now()}`,
          nazwaBloku: `Seria 2 - Obwód (${stationCount} Stacji)`,
          typ: 'loop',
          roundsCount: stationCount,
          skipLastRestInLoop: true,
          loopSteps: [
            { id: 'stp_work2', nazwa: 'Praca na Stacji', durationSeconds: 45, color: 'green' },
            { id: 'stp_rest2', nazwa: 'Zmiana Stacji', durationSeconds: 15, color: 'red' },
          ],
        },
        {
          id: `blk_c_${Date.now()}`,
          nazwaBloku: 'Schłodzenie',
          typ: 'single',
          singleStep: { id: 'stp_c', nazwa: 'Rozciąganie', durationSeconds: 120, color: 'purple' },
        },
      ],
      isCustom: false,
    };
  }, [circuit]);

  // Pełna lista presetów: Dynamiczny z Zestawu + Wbudowane + Własne Użytkownika
  const allPresets = useMemo(() => {
    const list: IntervalPreset[] = [];
    if (generatedCircuitPreset) {
      list.push(generatedCircuitPreset);
    }
    list.push(...BUILTIN_INTERVAL_PRESETS);
    return [...list, ...customIntervalPresets];
  }, [generatedCircuitPreset, customIntervalPresets]);

  const [activePresetId, setActivePresetId] = useState<string>(
    generatedCircuitPreset ? generatedCircuitPreset.id : BUILTIN_INTERVAL_PRESETS[0].id
  );
  const [activePreset, setActivePreset] = useState<IntervalPreset>(
    generatedCircuitPreset || BUILTIN_INTERVAL_PRESETS[0]
  );

  const [showSettings, setShowSettings] = useState(false);

  // Po zmianie wybranego presetu w rozwijanej liście
  const handleSelectPreset = (id: string) => {
    setActivePresetId(id);
    const found = allPresets.find((p) => p.id === id);
    if (found) {
      setActivePreset(JSON.parse(JSON.stringify(found))); // Głęboka kopia do edycji
    }
  };

  // Uruchomienie Gym View
  const handleLaunchGymView = () => {
    unlockAudio(); // Odblokowanie kontekstu audio na gest kliknięcia

    if (activeIntervalExecution) {
      maximizeGymView();
      return;
    }

    // Kompilacja płaskiej kolejki kroków
    const list: FlattenedQueueItem[] = [];

    activePreset.bloki.forEach((block) => {
      if (block.typ === 'single' && block.singleStep) {
        list.push({
          id: `${block.id}_single_${Date.now()}`,
          blockName: block.nazwaBloku,
          stepName: block.singleStep.nazwa,
          durationSeconds: Math.max(1, block.singleStep.durationSeconds),
          color: block.singleStep.color,
          roundIndex: 1,
          totalRounds: 1,
          nextText: '',
        });
      } else if (block.typ === 'loop' && block.loopSteps && block.loopSteps.length > 0) {
        const rounds = Math.max(1, block.roundsCount || 1);
        const skipLast = block.skipLastRestInLoop ?? false;

        for (let r = 1; r <= rounds; r++) {
          const isLastRound = r === rounds;

          block.loopSteps.forEach((step, sIdx) => {
            const isLastStepInLoop = sIdx === block.loopSteps!.length - 1;

            if (isLastRound && isLastStepInLoop && skipLast && block.loopSteps!.length > 1) {
              return;
            }

            list.push({
              id: `${block.id}_r${r}_s${sIdx}`,
              blockName: block.nazwaBloku,
              stepName: step.nazwa,
              durationSeconds: Math.max(1, step.durationSeconds),
              color: step.color,
              roundIndex: r,
              totalRounds: rounds,
              nextText: '',
            });
          });
        }
      }
    });

    for (let i = 0; i < list.length; i++) {
      if (i < list.length - 1) {
        const nextItem = list[i + 1];
        list[i].nextText = `Następnie: ${nextItem.stepName} (${nextItem.durationSeconds}s)`;
      } else {
        list[i].nextText = 'Koniec treningu!';
      }
    }

    if (list.length === 0 || !activePreset.bloki || activePreset.bloki.length === 0) {
      toast({
        title: "Brak bloków w treningu",
        description: "Dodaj co najmniej jeden blok pojedynczy lub pętlę, aby uruchomić trening.",
        variant: "destructive",
      });
      return;
    }

    setActiveIntervalExecution({
      preset: activePreset,
      queue: list,
      currentIndex: 0,
      remainingSec: list[0].durationSeconds,
      isRunning: true,
      isFinished: false,
      isGymViewOpen: true,
      isGymViewMinimized: false,
    });
  };

  // Tworzenie nowego czystego własnego presetu
  const handleCreateNewBlankPreset = () => {
    const newPreset: IntervalPreset = {
      id: `preset_custom_${Date.now()}`,
      nazwa: 'Mój Nowy Interwał',
      opis: 'Własny schemat treningowy',
      isCustom: true,
      bloki: [
        {
          id: `blk_${Date.now()}_1`,
          nazwaBloku: 'Rozgrzewka',
          typ: 'single',
          singleStep: { id: `stp_${Date.now()}_1`, nazwa: 'Rozgrzewka', durationSeconds: 60, color: 'yellow' },
        },
        {
          id: `blk_${Date.now()}_2`,
          nazwaBloku: 'Seria Główna',
          typ: 'loop',
          roundsCount: 5,
          skipLastRestInLoop: true,
          loopSteps: [
            { id: `stp_${Date.now()}_2`, nazwa: 'Praca', durationSeconds: 30, color: 'green' },
            { id: `stp_${Date.now()}_3`, nazwa: 'Przerwa', durationSeconds: 15, color: 'red' },
          ],
        },
      ],
    };

    addCustomIntervalPreset(newPreset);
    setActivePresetId(newPreset.id);
    setActivePreset(newPreset);

    toast({
      title: "Utworzono nowy preset",
      description: "Własny schemat został dodany. Możesz go skonfigurować i zapisać.",
    });
  };

  // Zapisywanie presetu (Tworzenie kopii dla wbudowanych / Aktualizacja dla własnych)
  const handleSavePreset = () => {
    if (!activePreset.bloki || activePreset.bloki.length === 0) {
      toast({
        title: "Brak bloków w treningu",
        description: "Trening musi zawierać przynajmniej jeden blok pojedynczy lub pętlę przed zapisaniem.",
        variant: "destructive",
      });
      return;
    }

    const isExistingCustom = activePreset.isCustom && customIntervalPresets.some((p) => p.id === activePreset.id);

    const presetToSave: IntervalPreset = {
      ...activePreset,
      id: isExistingCustom ? activePreset.id : `preset_custom_${Date.now()}`,
      nazwa: isExistingCustom ? activePreset.nazwa : activePreset.nazwa.includes('(Własny)') ? activePreset.nazwa : `${activePreset.nazwa} (Własny)`,
      isCustom: true,
    };

    addCustomIntervalPreset(presetToSave);
    setActivePresetId(presetToSave.id);
    setActivePreset(presetToSave);

    toast({
      title: isExistingCustom ? "Zaktualizowano preset" : "Zapisano własną kopię presetu",
      description: `Schemat "${presetToSave.nazwa}" został pomyślnie zapisany w bazie lokalnej.`,
    });
  };

  // Usuwanie wszystkich bloków (Wyczyść wszystko)
  const handleClearAllBlocks = () => {
    setActivePreset({ ...activePreset, bloki: [] });
    toast({
      title: "Wyczyszczono konfigurację",
      description: "Usunięto wszystkie bloki. Możesz zbudować nowy trening od zera.",
    });
  };

  // Usuwanie własnego presetu
  const handleDeleteCustomPreset = () => {
    const isExistingCustom = activePreset.isCustom && customIntervalPresets.some((p) => p.id === activePreset.id);

    if (!isExistingCustom) {
      toast({
        title: "Brak możliwości usunięcia",
        description: "Presety fabryczne i wygenerowane z zestawu są chronione przed usunięciem.",
        variant: "destructive",
      });
      return;
    }

    const nameToDelete = activePreset.nazwa;
    removeCustomIntervalPreset(activePreset.id);

    // Przełączenie na pierwszy fabryczny preset
    const fallback = BUILTIN_INTERVAL_PRESETS[0];
    setActivePresetId(fallback.id);
    setActivePreset(JSON.parse(JSON.stringify(fallback)));

    toast({
      title: "Usunięto preset",
      description: `Własny schemat "${nameToDelete}" został usunięty.`,
    });
  };

  // Klonowanie bloku
  const handleDuplicateBlock = (blockIndex: number) => {
    const blockToCopy = activePreset.bloki[blockIndex];
    if (!blockToCopy) return;

    const clonedBlock: IntervalBlock = JSON.parse(JSON.stringify(blockToCopy));
    clonedBlock.id = `blk_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    clonedBlock.nazwaBloku = `${clonedBlock.nazwaBloku} (Kopia)`;

    const newBlocks = [...activePreset.bloki];
    newBlocks.splice(blockIndex + 1, 0, clonedBlock);

    setActivePreset({ ...activePreset, bloki: newBlocks });
    toast({
      title: "Zduplikowano blok",
      description: `Utworzono kopię bloku "${blockToCopy.nazwaBloku}".`,
    });
  };

  // Zmiana kolejności bloków
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activePreset.bloki.length) return;

    const newBlocks = [...activePreset.bloki];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    setActivePreset({ ...activePreset, bloki: newBlocks });
  };

  // Usuwanie bloku z presetu (pozwala wyczyścić do 0)
  const handleDeleteBlock = (index: number) => {
    const newBlocks = activePreset.bloki.filter((_, i) => i !== index);
    setActivePreset({ ...activePreset, bloki: newBlocks });
  };

  // Dodanie nowego bloku
  const handleAddBlock = (typ: 'single' | 'loop') => {
    const newBlock: IntervalBlock = typ === 'single'
      ? {
          id: `blk_${Date.now()}`,
          nazwaBloku: 'Nowy Blok',
          typ: 'single',
          singleStep: { id: `stp_${Date.now()}`, nazwa: 'Nowy Krok', durationSeconds: 30, color: 'green' },
        }
      : {
          id: `blk_${Date.now()}`,
          nazwaBloku: 'Nowa Pętla',
          typ: 'loop',
          roundsCount: 5,
          skipLastRestInLoop: true,
          loopSteps: [
            { id: `stp_w_${Date.now()}`, nazwa: 'Praca', durationSeconds: 30, color: 'green' },
            { id: `stp_r_${Date.now()}`, nazwa: 'Przerwa', durationSeconds: 15, color: 'red' },
          ],
        };

    setActivePreset({ ...activePreset, bloki: [...activePreset.bloki, newBlock] });
  };

  const isCurrentPresetCustom = activePreset.isCustom && customIntervalPresets.some((p) => p.id === activePreset.id);

  return (
    <div className="space-y-6">
      {/* NAGŁÓWEK I PASEK SELEKCJI SCHEMATÓW */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Wybór Presetu */}
          <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
            <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Repeat className="h-5 w-5" />
            </span>
            <div className="space-y-0.5 flex-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                Wybrany Schemat Interwału
              </span>
              <select
                value={activePresetId}
                onChange={(e) => handleSelectPreset(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl h-10 px-3 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
              >
                {/* Wariant dynamiczny z zestawu */}
                {generatedCircuitPreset && (
                  <option value={generatedCircuitPreset.id} className="bg-neutral-900 text-cyan-400 font-bold">
                    {generatedCircuitPreset.nazwa}
                  </option>
                )}

                <optgroup label="Wbudowane Schematy (Fabryczne)">
                  {BUILTIN_INTERVAL_PRESETS.map((p) => (
                    <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                      {p.nazwa}
                    </option>
                  ))}
                </optgroup>

                {customIntervalPresets.length > 0 && (
                  <optgroup label="Moje Własne Presety (Lokalne)">
                    {customIntervalPresets.map((p) => (
                      <option key={p.id} value={p.id} className="bg-neutral-900 text-emerald-400">
                        {p.nazwa}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Przycisk Nowy Preset + Ustawienia Audio + Uruchom */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              onClick={handleCreateNewBlankPreset}
              variant="outline"
              size="sm"
              title="Stwórz nowy czysty schemat interwałowy od zera"
              className="h-10 px-3 rounded-xl border-white/10 glass-button text-white hover:text-cyan-300 text-xs font-bold flex items-center gap-1.5"
            >
              <FilePlus className="h-4 w-4 text-cyan-400" />
              <span className="hidden md:inline">Nowy Preset</span>
            </Button>

            <Button
              onClick={() => setShowSettings(!showSettings)}
              variant="outline"
              size="icon"
              title="Ustawienia Dźwięków i Lektora Mowy TTS"
              className={`h-10 w-10 rounded-xl border-white/10 glass-button ${showSettings ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : ''}`}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              onClick={handleLaunchGymView}
              className="h-10 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{activeIntervalExecution ? 'ROZWIŃ TIMER' : 'URUCHOM TIMER'}</span>
            </Button>
          </div>
        </div>

        {/* ROZWIJANY PANEL USTAWIEŃ AUDIO I LEKTORA MOWY (TTS) */}
        {showSettings && (
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Ustawienia Audio i Lektora PL (TTS)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Sygnały dźwiękowe */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="font-bold text-white text-xs">Dźwięki (Beepy i Gongi)</Label>
                  <p className="text-[10px] text-muted-foreground">Sygnały 3-2-1s oraz gong startu</p>
                </div>
                <Switch
                  checked={timerAudioSettings.soundEnabled}
                  onCheckedChange={(val) => updateTimerAudioSettings({ soundEnabled: val })}
                />
              </div>

              {/* Lektor Mowy PL */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="space-y-0.5">
                  <Label className="font-bold text-white text-xs">Lektor Mowy PL (TTS)</Label>
                  <p className="text-[10px] text-muted-foreground">Wypowiada nazwy klocków i odliczanie</p>
                </div>
                <Switch
                  checked={timerAudioSettings.ttsEnabled}
                  onCheckedChange={(val) => updateTimerAudioSettings({ ttsEnabled: val })}
                />
              </div>

              {/* Wybór co czyta lektor */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <Label className="font-bold text-white text-xs">Co czyta lektor na starcie kroku:</Label>
                <select
                  value={timerAudioSettings.ttsOption}
                  onChange={(e) => updateTimerAudioSettings({ ttsOption: e.target.value as TTSReadoutOption })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white"
                >
                  <option value="stepName">Tylko nazwa kroku (np. "Praca stacyjna")</option>
                  <option value="blockName">Tylko nazwa bloku (np. "Obwód Główny")</option>
                  <option value="both">Połączone (np. "Obwód Główny - Praca stacyjna")</option>
                  <option value="off">Wyłączony czytany nagłówek</option>
                </select>
              </div>

              {/* Odliczanie końcowe */}
              <div className="space-y-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                <Label className="font-bold text-white text-xs">Odliczanie ostatnich 5 sekund:</Label>
                <select
                  value={timerAudioSettings.ttsCountdownOption}
                  onChange={(e) => updateTimerAudioSettings({ ttsCountdownOption: e.target.value as TTSCountdownOption })}
                  className="w-full bg-neutral-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white"
                >
                  <option value="both">Oba (Beepy + Głos lektora 5-4-3-2-1)</option>
                  <option value="voice">Tylko Głos lektora (5, 4, 3, 2, 1)</option>
                  <option value="beeps">Tylko Beepy dźwiękowe</option>
                  <option value="none">Brak odliczania końcowego</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KLOCKOWY WIZUALNY KREATOR TRENINGU (VISUAL BUILDER) */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 space-y-6">
        {/* Nagłówek Edytora Presetu */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="space-y-1.5 flex-1 w-full">
            <div className="flex items-center gap-2">
              {isCurrentPresetCustom ? (
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                  <UserCheck className="h-3 w-3" /> Własny Preset
                </Badge>
              ) : (
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Wzorzec Wbudowany
                </Badge>
              )}
            </div>
            <Input
              value={activePreset.nazwa}
              onChange={(e) => setActivePreset({ ...activePreset, nazwa: e.target.value })}
              placeholder="Nazwa schematu treningowego..."
              className="glass-input h-11 text-base font-black text-white border-white/10 rounded-xl w-full"
            />
          </div>

          {/* Przyciski Akcji: Zapisz Kopię / Aktualizuj oraz Usuń Preset */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isCurrentPresetCustom && (
              <Button
                onClick={handleDeleteCustomPreset}
                variant="outline"
                className="h-10 px-3 rounded-xl border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5"
                title="Usuń ten własny preset z bazy"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Usuń Preset</span>
              </Button>
            )}

            <Button
              onClick={handleSavePreset}
              className="h-10 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5"
            >
              <Save className="h-4 w-4" />
              <span>{isCurrentPresetCustom ? 'Zapisz Zmiany' : 'Zapisz jako Własny'}</span>
            </Button>
          </div>
        </div>

        {/* LISTA BLOKÓW I PĘTLI TRENINGU */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Struktura Bloków i Pętli Treningowych ({activePreset.bloki.length})</span>
            </h3>

            {activePreset.bloki.length > 0 && (
              <Button
                onClick={handleClearAllBlocks}
                variant="ghost"
                size="sm"
                className="h-7 px-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-[11px] font-bold flex items-center gap-1 transition-colors"
                title="Wyczyść wszystkie bloki z tego schematu"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Wyczyść wszystko</span>
              </Button>
            )}
          </div>

          {activePreset.bloki.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/20 bg-black/20 space-y-2 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-white/80">Wyczyszczono konfiguracyjną listę bloków.</p>
              <p className="text-[11px] text-muted-foreground">
                Użyj poniższych przycisków, aby stworzyć od zera własną strukturę pojedynczych timerów i pętli.
              </p>
            </div>
          ) : (
            activePreset.bloki.map((block, bIdx) => (
              <div
                key={block.id}
                className="glass-card p-5 rounded-2xl border border-white/10 bg-black/20 space-y-4 relative group"
              >
              {/* Nagłówek pojedynczego Bloku / Pętli */}
              <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
                <div className="flex items-center gap-2 flex-1">
                  <Badge className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border ${
                    block.typ === 'loop'
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {block.typ === 'loop' ? 'Pętla' : 'Pojedynczy'}
                  </Badge>
                  <Input
                    value={block.nazwaBloku}
                    onChange={(e) => {
                      const updated = [...activePreset.bloki];
                      updated[bIdx].nazwaBloku = e.target.value;
                      setActivePreset({ ...activePreset, bloki: updated });
                    }}
                    className="glass-input h-9 text-xs font-bold text-white border-white/10 rounded-lg max-w-xs"
                  />
                </div>

                {/* Akcje dla Bloku: Przesuń Górę/Dół + DUPLIKUJ/KOPIUJ + Usuń */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveBlock(bIdx, 'up')}
                    disabled={bIdx === 0}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white disabled:opacity-20"
                    title="Przesuń blok w górę"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleMoveBlock(bIdx, 'down')}
                    disabled={bIdx === activePreset.bloki.length - 1}
                    className="p-1.5 rounded-lg text-white/50 hover:text-white disabled:opacity-20"
                    title="Przesuń blok w dół"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDuplicateBlock(bIdx)}
                    className="p-1.5 rounded-lg text-cyan-400/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
                    title="Kopiuj / Duplikuj cały ten blok wraz z wewnętrznymi timerami"
                  >
                    <Copy className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteBlock(bIdx)}
                    className="p-1.5 rounded-lg text-destructive/80 hover:text-destructive hover:bg-white/10 transition-colors"
                    title="Usuń blok"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Ustawienia specyficzne dla PĘTLI */}
              {block.typ === 'loop' && (
                <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/80">Liczba rund w pętli:</span>
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={block.roundsCount || 1}
                      onChange={(e) => {
                        const updated = [...activePreset.bloki];
                        updated[bIdx].roundsCount = Math.max(1, parseInt(e.target.value, 10) || 1);
                        setActivePreset({ ...activePreset, bloki: updated });
                      }}
                      className="w-16 h-8 text-center text-xs font-mono font-bold glass-input border-white/10 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      id={`skip_last_${block.id}`}
                      checked={block.skipLastRestInLoop ?? false}
                      onCheckedChange={(val) => {
                        const updated = [...activePreset.bloki];
                        updated[bIdx].skipLastRestInLoop = val;
                        setActivePreset({ ...activePreset, bloki: updated });
                      }}
                    />
                    <Label htmlFor={`skip_last_${block.id}`} className="text-xs text-white/80 font-medium cursor-pointer">
                      Pomiń ostatnią przerwę/przejście w ostatniej rundzie pętli
                    </Label>
                  </div>
                </div>
              )}

              {/* EDYCJA KROKÓW W BLOKU */}
              <div className="space-y-2">
                {block.typ === 'single' && block.singleStep && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                    <Input
                      value={block.singleStep.nazwa}
                      onChange={(e) => {
                        const updated = [...activePreset.bloki];
                        updated[bIdx].singleStep!.nazwa = e.target.value;
                        setActivePreset({ ...activePreset, bloki: updated });
                      }}
                      placeholder="Nazwa kroków..."
                      className="glass-input h-8 text-xs font-semibold text-white border-white/10 rounded-lg flex-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Czas (s):</span>
                      <Input
                        type="number"
                        min={1}
                        max={3600}
                        value={block.singleStep.durationSeconds}
                        onChange={(e) => {
                          const updated = [...activePreset.bloki];
                          updated[bIdx].singleStep!.durationSeconds = Math.max(1, parseInt(e.target.value, 10) || 1);
                          setActivePreset({ ...activePreset, bloki: updated });
                        }}
                        className="w-16 h-8 text-center text-xs font-mono font-bold glass-input border-white/10 rounded-lg"
                      />
                    </div>
                    {/* Wybór Koloru */}
                    <select
                      value={block.singleStep.color}
                      onChange={(e) => {
                        const updated = [...activePreset.bloki];
                        updated[bIdx].singleStep!.color = e.target.value as StepColor;
                        setActivePreset({ ...activePreset, bloki: updated });
                      }}
                      className="bg-neutral-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white"
                    >
                      {Object.entries(STEP_COLOR_MAP).map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {block.typ === 'loop' && block.loopSteps && (
                  <div className="space-y-2">
                    {block.loopSteps.map((step, sIdx) => (
                      <div key={step.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                        <Input
                          value={step.nazwa}
                          onChange={(e) => {
                            const updated = [...activePreset.bloki];
                            updated[bIdx].loopSteps![sIdx].nazwa = e.target.value;
                            setActivePreset({ ...activePreset, bloki: updated });
                          }}
                          placeholder="Nazwa kroku..."
                          className="glass-input h-8 text-xs font-semibold text-white border-white/10 rounded-lg flex-1"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold">Czas (s):</span>
                          <Input
                            type="number"
                            min={1}
                            max={3600}
                            value={step.durationSeconds}
                            onChange={(e) => {
                              const updated = [...activePreset.bloki];
                              updated[bIdx].loopSteps![sIdx].durationSeconds = Math.max(1, parseInt(e.target.value, 10) || 1);
                              setActivePreset({ ...activePreset, bloki: updated });
                            }}
                            className="w-16 h-8 text-center text-xs font-mono font-bold glass-input border-white/10 rounded-lg"
                          />
                        </div>
                        <select
                          value={step.color}
                          onChange={(e) => {
                            const updated = [...activePreset.bloki];
                            updated[bIdx].loopSteps![sIdx].color = e.target.value as StepColor;
                            setActivePreset({ ...activePreset, bloki: updated });
                          }}
                          className="bg-neutral-900 border border-white/10 rounded-lg h-8 px-2 text-xs text-white"
                        >
                          {Object.entries(STEP_COLOR_MAP).map(([key, val]) => (
                            <option key={key} value={key}>{val.name}</option>
                          ))}
                        </select>
                        {block.loopSteps!.length > 1 && (
                          <button
                            onClick={() => {
                              const updated = [...activePreset.bloki];
                              updated[bIdx].loopSteps = updated[bIdx].loopSteps!.filter((_, i) => i !== sIdx);
                              setActivePreset({ ...activePreset, bloki: updated });
                            }}
                            className="p-1 text-white/40 hover:text-destructive"
                            title="Usuń krok z pętli"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <Button
                      onClick={() => {
                        const updated = [...activePreset.bloki];
                        updated[bIdx].loopSteps!.push({
                          id: `stp_${Date.now()}`,
                          nazwa: 'Kolejny krok',
                          durationSeconds: 15,
                          color: 'red',
                        });
                        setActivePreset({ ...activePreset, bloki: updated });
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-cyan-400"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj krok do tej pętli
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

          {/* Przycisk dodania nowego bloku */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleAddBlock('single')}
              variant="outline"
              className="h-10 px-4 rounded-xl border-white/10 glass-button text-xs font-bold text-amber-300"
            >
              <Plus className="h-4 w-4 mr-1" /> Dodaj Pojedynczy Timer
            </Button>
            <Button
              onClick={() => handleAddBlock('loop')}
              variant="outline"
              className="h-10 px-4 rounded-xl border-white/10 glass-button text-xs font-bold text-cyan-300"
            >
              <Plus className="h-4 w-4 mr-1" /> Dodaj Pętlę Powtórzeniową
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
