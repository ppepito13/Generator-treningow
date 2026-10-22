"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/app/lib/store';
import { useTimerAudioTTS } from '@/app/lib/useTimerAudioTTS';
import { GymViewModal, FlattenedQueueItem } from './GymViewModal';
import { FloatingTimerWidget } from './FloatingTimerWidget';

export const GlobalIntervalTimerController = () => {
  const activeIntervalExecution = useAppStore((state) => state.activeIntervalExecution);
  const updateActiveIntervalExecution = useAppStore((state) => state.updateActiveIntervalExecution);
  const closeActiveIntervalExecution = useAppStore((state) => state.closeActiveIntervalExecution);
  const minimizeGymView = useAppStore((state) => state.minimizeGymView);
  const maximizeGymView = useAppStore((state) => state.maximizeGymView);
  const timerAudioSettings = useAppStore((state) => state.timerAudioSettings);

  const { playBeep, playWorkStartGong, playRestStartGong, playFinishFanfare, speakText } = useTimerAudioTTS();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastAnnouncedStepIdRef = useRef<string | null>(null);

  // Stabilne referencje do ustawień audio oraz stanu egzekucji (zapobiegają restartom setInterval)
  const audioSettingsRef = useRef(timerAudioSettings);
  useEffect(() => {
    audioSettingsRef.current = timerAudioSettings;
  });

  const activeExecutionRef = useRef(activeIntervalExecution);
  useEffect(() => {
    activeExecutionRef.current = activeIntervalExecution;
  });

  // Zapowiedź kroku ze stabilnymi zależnościami
  const announceStep = useCallback((item: FlattenedQueueItem) => {
    const settings = audioSettingsRef.current;
    if (!settings.soundEnabled && !settings.ttsEnabled) return;

    if (settings.soundEnabled) {
      if (item.color === 'green') {
        playWorkStartGong(settings.volume);
      } else {
        playRestStartGong(settings.volume);
      }
    }

    if (settings.ttsEnabled) {
      let speechText = '';
      if (settings.ttsOption === 'stepName') {
        speechText = item.stepName;
      } else if (settings.ttsOption === 'blockName') {
        speechText = item.blockName;
      } else if (settings.ttsOption === 'both') {
        speechText = `${item.blockName}, ${item.stepName}`;
      }
      if (speechText) {
        setTimeout(() => speakText(speechText, settings.volume), 300);
      }
    }
  }, [playWorkStartGong, playRestStartGong, speakText]);

  const isRunning = activeIntervalExecution?.isRunning;
  const isFinished = activeIntervalExecution?.isFinished;
  const currentStep = activeIntervalExecution ? activeIntervalExecution.queue[activeIntervalExecution.currentIndex] : null;

  // Automatyczne odtworzenie zapowiedzi dla pierwszego kroku przy uruchomieniu
  useEffect(() => {
    if (isRunning && !isFinished && currentStep) {
      if (lastAnnouncedStepIdRef.current !== currentStep.id) {
        lastAnnouncedStepIdRef.current = currentStep.id;
        announceStep(currentStep);
      }
    } else if (!isRunning) {
      lastAnnouncedStepIdRef.current = null;
    }
  }, [isRunning, isFinished, currentStep, announceStep]);

  // Główna pętla odliczania w tle (działa nieprzerwanie, korzystając z activeExecutionRef)
  useEffect(() => {
    if (isRunning && !isFinished) {
      timerRef.current = setInterval(() => {
        const currentExec = activeExecutionRef.current;
        if (!currentExec || !currentExec.isRunning || currentExec.isFinished) return;

        const { queue, currentIndex, remainingSec } = currentExec;
        const settings = audioSettingsRef.current;

        if (remainingSec <= 1) {
          if (currentIndex < queue.length - 1) {
            const nextIdx = currentIndex + 1;
            const nextItem = queue[nextIdx];
            updateActiveIntervalExecution({
              currentIndex: nextIdx,
              remainingSec: nextItem.durationSeconds,
            });
          } else {
            if (timerRef.current) clearInterval(timerRef.current);
            updateActiveIntervalExecution({
              isRunning: false,
              isFinished: true,
              remainingSec: 0,
            });
            if (settings.soundEnabled) playFinishFanfare(settings.volume);
            if (settings.ttsEnabled) speakText("Trening zakończony! Dobra robota!", settings.volume);
          }
          return;
        }

        const nextSec = remainingSec - 1;
        updateActiveIntervalExecution({ remainingSec: nextSec });

        if (nextSec <= 5 && nextSec >= 1) {
          if (settings.ttsCountdownOption === 'voice' || settings.ttsCountdownOption === 'both') {
            const words: Record<number, string> = { 5: 'Pięć', 4: 'Cztery', 3: 'Trzy', 2: 'Dwa', 1: 'Jeden' };
            if (settings.ttsEnabled) speakText(words[nextSec] || `${nextSec}`, settings.volume);
          }
          if (settings.soundEnabled && (settings.ttsCountdownOption === 'beeps' || settings.ttsCountdownOption === 'both')) {
            playBeep(523.25, 120, settings.volume); // Miękki, przyjemny dzwonek C5
          }
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isFinished, updateActiveIntervalExecution, playBeep, playFinishFanfare, speakText]);

  if (!activeIntervalExecution) return null;

  const currentItem = activeIntervalExecution.queue[activeIntervalExecution.currentIndex] || activeIntervalExecution.queue[0];

  const handleTogglePlayPause = () => {
    updateActiveIntervalExecution({ isRunning: !activeIntervalExecution.isRunning });
  };

  const handleNextStep = () => {
    if (activeIntervalExecution.currentIndex < activeIntervalExecution.queue.length - 1) {
      const nextIdx = activeIntervalExecution.currentIndex + 1;
      const nextItem = activeIntervalExecution.queue[nextIdx];
      updateActiveIntervalExecution({
        currentIndex: nextIdx,
        remainingSec: nextItem.durationSeconds,
      });
      announceStep(nextItem);
    }
  };

  const handlePrevStep = () => {
    if (activeIntervalExecution.currentIndex > 0) {
      const prevIdx = activeIntervalExecution.currentIndex - 1;
      const prevItem = activeIntervalExecution.queue[prevIdx];
      updateActiveIntervalExecution({
        currentIndex: prevIdx,
        remainingSec: prevItem.durationSeconds,
      });
      announceStep(prevItem);
    }
  };

  return (
    <>
      {/* 1. Fullscreen Gym View Modal gdy rozwinięty */}
      {activeIntervalExecution.isGymViewOpen && !activeIntervalExecution.isGymViewMinimized && (
        <GymViewModal
          isOpen={true}
          onClose={closeActiveIntervalExecution}
          onMinimize={minimizeGymView}
          preset={activeIntervalExecution.preset}
          audioSettings={timerAudioSettings}
          externalState={{
            queue: activeIntervalExecution.queue,
            currentIndex: activeIntervalExecution.currentIndex,
            remainingSec: activeIntervalExecution.remainingSec,
            isRunning: activeIntervalExecution.isRunning,
            isFinished: activeIntervalExecution.isFinished,
          }}
          onTogglePlayPause={handleTogglePlayPause}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
        />
      )}

      {/* 2. Floating Timer Widget gdy zminimalizowany */}
      {activeIntervalExecution.isGymViewMinimized && (
        <FloatingTimerWidget
          currentItem={currentItem}
          remainingSec={activeIntervalExecution.remainingSec}
          isRunning={activeIntervalExecution.isRunning}
          onTogglePlayPause={handleTogglePlayPause}
          onMaximize={maximizeGymView}
          onClose={closeActiveIntervalExecution}
        />
      )}
    </>
  );
};
