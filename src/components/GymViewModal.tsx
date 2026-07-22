"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { IntervalPreset, StepColor, STEP_COLOR_MAP, TimerAudioSettings } from '@/types/timer';
import { useTimerAudioTTS, useWakeLock } from '@/app/lib/useTimerAudioTTS';
import { Play, Pause, SkipForward, SkipBack, X, Minimize2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface FlattenedQueueItem {
  id: string;
  blockName: string;
  stepName: string;
  durationSeconds: number;
  color: StepColor;
  roundIndex: number; // 1-indexed
  totalRounds: number;
  nextText: string;
}

interface GymViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  preset: IntervalPreset;
  audioSettings: TimerAudioSettings;
  externalState?: {
    queue: FlattenedQueueItem[];
    currentIndex: number;
    remainingSec: number;
    isRunning: boolean;
    isFinished: boolean;
  };
  onTogglePlayPause?: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
}

export const GymViewModal: React.FC<GymViewModalProps> = ({
  isOpen,
  onClose,
  onMinimize,
  preset,
  audioSettings,
  externalState,
  onTogglePlayPause,
  onNextStep,
  onPrevStep,
}) => {
  const { playBeep, playWorkStartGong, playRestStartGong, playFinishFanfare, speakText } = useTimerAudioTTS();

  const queue = useMemo<FlattenedQueueItem[]>(() => {
    if (externalState?.queue && externalState.queue.length > 0) {
      return externalState.queue;
    }

    const list: FlattenedQueueItem[] = [];

    preset.bloki.forEach((block) => {
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

    return list;
  }, [preset, externalState]);

  const [internalIndex, setInternalIndex] = useState(0);
  const [internalRemainingSec, setInternalRemainingSec] = useState(0);
  const [internalIsRunning, setInternalIsRunning] = useState(false);
  const [internalIsFinished, setInternalIsFinished] = useState(false);

  const timerRef = useRef<any>(null);

  const currentIndex = externalState ? externalState.currentIndex : internalIndex;
  const remainingSec = externalState ? externalState.remainingSec : internalRemainingSec;
  const isRunning = externalState ? externalState.isRunning : internalIsRunning;
  const isFinished = externalState ? externalState.isFinished : internalIsFinished;

  useWakeLock(isOpen && isRunning);

  const currentItem = queue[currentIndex] || queue[0];
  const colorTheme = STEP_COLOR_MAP[currentItem?.color || 'green'];

  useEffect(() => {
    if (!externalState) {
      if (isOpen) {
        setInternalIndex(0);
        setInternalIsFinished(false);
        if (queue.length > 0) {
          setInternalRemainingSec(queue[0].durationSeconds);
          setInternalIsRunning(true);
          announceStepStart(queue[0]);
        }
      } else {
        setInternalIsRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }
  }, [isOpen, queue, externalState]);

  const announceStepStart = (item: FlattenedQueueItem) => {
    if (!audioSettings.soundEnabled && !audioSettings.ttsEnabled) return;

    if (audioSettings.soundEnabled) {
      if (item.color === 'green') {
        playWorkStartGong(audioSettings.volume);
      } else {
        playRestStartGong(audioSettings.volume);
      }
    }

    if (audioSettings.ttsEnabled) {
      let speechText = '';
      if (audioSettings.ttsOption === 'stepName') {
        speechText = item.stepName;
      } else if (audioSettings.ttsOption === 'blockName') {
        speechText = item.blockName;
      } else if (audioSettings.ttsOption === 'both') {
        speechText = `${item.blockName}, ${item.stepName}`;
      }
      if (speechText) {
        setTimeout(() => speakText(speechText, audioSettings.volume), 300);
      }
    }
  };

  useEffect(() => {
    if (!externalState && isRunning && !isFinished) {
      timerRef.current = setInterval(() => {
        setInternalRemainingSec((prev) => {
          if (prev <= 1) {
            if (currentIndex < queue.length - 1) {
              const nextIdx = currentIndex + 1;
              setInternalIndex(nextIdx);
              const nextItem = queue[nextIdx];
              announceStepStart(nextItem);
              return nextItem.durationSeconds;
            } else {
              clearInterval(timerRef.current);
              setInternalIsRunning(false);
              setInternalIsFinished(true);
              if (audioSettings.soundEnabled) playFinishFanfare(audioSettings.volume);
              if (audioSettings.ttsEnabled) speakText("Trening zakończony! Dobra robota!", audioSettings.volume);
              return 0;
            }
          }

          const nextSec = prev - 1;

          if (nextSec <= 5 && nextSec >= 1) {
            if (audioSettings.ttsCountdownOption === 'voice' || audioSettings.ttsCountdownOption === 'both') {
              const words: Record<number, string> = { 5: 'Pięć', 4: 'Cztery', 3: 'Trzy', 2: 'Dwa', 1: 'Jeden' };
              if (audioSettings.ttsEnabled) speakText(words[nextSec] || `${nextSec}`, audioSettings.volume);
            }
            if (audioSettings.soundEnabled && (audioSettings.ttsCountdownOption === 'beeps' || audioSettings.ttsCountdownOption === 'both')) {
              playBeep(880, 100, audioSettings.volume);
            }
          }

          return nextSec;
        });
      }, 1000);
    } else if (!externalState && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (!externalState && timerRef.current) clearInterval(timerRef.current);
    };
  }, [externalState, isRunning, currentIndex, isFinished, queue, audioSettings]);

  const handleNextStep = () => {
    if (onNextStep) {
      onNextStep();
    } else if (currentIndex < queue.length - 1) {
      const nextIdx = currentIndex + 1;
      setInternalIndex(nextIdx);
      setInternalRemainingSec(queue[nextIdx].durationSeconds);
      announceStepStart(queue[nextIdx]);
    }
  };

  const handlePrevStep = () => {
    if (onPrevStep) {
      onPrevStep();
    } else if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setInternalIndex(prevIdx);
      setInternalRemainingSec(queue[prevIdx].durationSeconds);
      announceStepStart(queue[prevIdx]);
    }
  };

  const handleTogglePlay = () => {
    if (onTogglePlayPause) {
      onTogglePlayPause();
    } else {
      setInternalIsRunning(!internalIsRunning);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-neutral-950 overflow-hidden">
      <div className={`w-full h-full flex flex-col justify-between p-6 transition-colors duration-700 select-none ${colorTheme.darkBg}`}>
        {/* Pasek Górny */}
        <div className="flex items-center justify-between z-10">
          <div className="space-y-1">
            <Badge className="bg-white/10 text-white border-white/20 px-3 py-1 font-bold text-xs uppercase tracking-widest">
              {currentItem?.blockName || preset.nazwa}
            </Badge>
            <h2 className="text-sm font-semibold text-white/70">{preset.nazwa}</h2>
          </div>

          <div className="flex items-center gap-2">
            {onMinimize && (
              <Button
                onClick={onMinimize}
                variant="ghost"
                className="h-11 px-4 rounded-2xl bg-white/10 text-white hover:bg-white/20 text-xs font-bold flex items-center gap-2 border border-white/10"
                title="Minimalizuj zegar i przejdź do aplikacji"
              >
                <Minimize2 className="h-4 w-4" />
                <span className="hidden sm:inline">Minimalizuj</span>
              </Button>
            )}

            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              title="Zamknij zegar"
              className="h-11 w-11 rounded-2xl bg-white/10 text-white hover:bg-white/20 border border-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* ŚRODKOWA SEKCJA: GIGANTYCZNY ZEGAR */}
        {isFinished ? (
          <div className="flex flex-col items-center justify-center space-y-6 text-center py-12 animate-in zoom-in-95 duration-500">
            <CheckCircle2 className="h-24 w-24 text-emerald-400 animate-bounce" />
            <h1 className="text-4xl font-black uppercase text-white tracking-tight">Trening Zakończony!</h1>
            <p className="text-sm text-white/70 max-w-sm">
              Gratulacje! Wszystkie pętle i serie treningu zostały pomyślnie ukończone.
            </p>
            <Button
              onClick={onClose}
              className="h-14 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-black text-base shadow-lg"
            >
              Zamknij Ekran Treningowy
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 text-center my-auto">
            {/* Nazwa kroku */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow">
                {currentItem?.stepName}
              </h1>
              {currentItem?.totalRounds > 1 && (
                <Badge className="bg-black/30 text-white/90 border-white/20 text-xs font-mono font-bold px-3 py-1 rounded-xl">
                  Runda {currentItem.roundIndex} z {currentItem.totalRounds}
                </Badge>
              )}
            </div>

            {/* GIGANTYCZNE ODICZANIE CZASU */}
            <div className="font-mono font-black text-8xl sm:text-9xl text-white tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              {Math.floor(remainingSec / 60).toString().padStart(2, '0')}:
              {(remainingSec % 60).toString().padStart(2, '0')}
            </div>

            {/* Podgląd kolejnego kroku */}
            <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/10 text-xs font-medium text-white/80 max-w-md">
              {currentItem?.nextText}
            </div>
          </div>
        )}

        {/* DOLNY PASEK KONTROLI TRENINGOWEJ */}
        {!isFinished && (
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10 z-10">
            <Button
              onClick={handlePrevStep}
              disabled={currentIndex === 0}
              variant="ghost"
              className="h-14 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-30"
            >
              <SkipBack className="h-5 w-5" />
              <span className="hidden sm:inline">Poprzedni</span>
            </Button>

            <Button
              onClick={handleTogglePlay}
              className={`h-16 px-10 rounded-2xl font-black text-base shadow-xl flex items-center gap-3 ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-6 w-6 fill-current" />
                  <span>Pauza</span>
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 fill-current ml-1" />
                  <span>Wznowienie</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleNextStep}
              disabled={currentIndex === queue.length - 1}
              variant="ghost"
              className="h-14 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-30"
            >
              <span className="hidden sm:inline">Następny</span>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
