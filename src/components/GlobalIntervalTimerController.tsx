"use client";

import React, { useEffect, useRef } from 'react';
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
  const timerRef = useRef<any>(null);
  const lastAnnouncedStepIdRef = useRef<string | null>(null);

  // Zapowiedź kroku
  const announceStep = (item: FlattenedQueueItem) => {
    if (!timerAudioSettings.soundEnabled && !timerAudioSettings.ttsEnabled) return;

    if (timerAudioSettings.soundEnabled) {
      if (item.color === 'green') {
        playWorkStartGong(timerAudioSettings.volume);
      } else {
        playRestStartGong(timerAudioSettings.volume);
      }
    }

    if (timerAudioSettings.ttsEnabled) {
      let speechText = '';
      if (timerAudioSettings.ttsOption === 'stepName') {
        speechText = item.stepName;
      } else if (timerAudioSettings.ttsOption === 'blockName') {
        speechText = item.blockName;
      } else if (timerAudioSettings.ttsOption === 'both') {
        speechText = `${item.blockName}, ${item.stepName}`;
      }
      if (speechText) {
        setTimeout(() => speakText(speechText, timerAudioSettings.volume), 300);
      }
    }
  };

  // Automatyczne odtworzenie zapowiedzi dla pierwszego kroku przy uruchomieniu
  useEffect(() => {
    if (activeIntervalExecution && activeIntervalExecution.isRunning && !activeIntervalExecution.isFinished) {
      const currentItem = activeIntervalExecution.queue[activeIntervalExecution.currentIndex];
      if (currentItem && lastAnnouncedStepIdRef.current !== currentItem.id) {
        lastAnnouncedStepIdRef.current = currentItem.id;
        announceStep(currentItem);
      }
    } else if (!activeIntervalExecution) {
      lastAnnouncedStepIdRef.current = null;
    }
  }, [activeIntervalExecution?.currentIndex, activeIntervalExecution?.isRunning, activeIntervalExecution?.isFinished]);

  // Główna pętla odliczania w tle
  useEffect(() => {
    if (activeIntervalExecution && activeIntervalExecution.isRunning && !activeIntervalExecution.isFinished) {
      timerRef.current = setInterval(() => {
        const { queue, currentIndex, remainingSec } = activeIntervalExecution;

        if (remainingSec <= 1) {
          if (currentIndex < queue.length - 1) {
            const nextIdx = currentIndex + 1;
            const nextItem = queue[nextIdx];
            updateActiveIntervalExecution({
              currentIndex: nextIdx,
              remainingSec: nextItem.durationSeconds,
            });
          } else {
            clearInterval(timerRef.current);
            updateActiveIntervalExecution({
              isRunning: false,
              isFinished: true,
              remainingSec: 0,
            });
            if (timerAudioSettings.soundEnabled) playFinishFanfare(timerAudioSettings.volume);
            if (timerAudioSettings.ttsEnabled) speakText("Trening zakończony! Dobra robota!", timerAudioSettings.volume);
          }
          return;
        }

        const nextSec = remainingSec - 1;
        updateActiveIntervalExecution({ remainingSec: nextSec });

        if (nextSec <= 5 && nextSec >= 1) {
          if (timerAudioSettings.ttsCountdownOption === 'voice' || timerAudioSettings.ttsCountdownOption === 'both') {
            const words: Record<number, string> = { 5: 'Pięć', 4: 'Cztery', 3: 'Trzy', 2: 'Dwa', 1: 'Jeden' };
            if (timerAudioSettings.ttsEnabled) speakText(words[nextSec] || `${nextSec}`, timerAudioSettings.volume);
          }
          if (timerAudioSettings.soundEnabled && (timerAudioSettings.ttsCountdownOption === 'beeps' || timerAudioSettings.ttsCountdownOption === 'both')) {
            playBeep(523.25, 120, timerAudioSettings.volume); // Miękki, przyjemny dzwonek C5
          }
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeIntervalExecution?.isRunning, activeIntervalExecution?.currentIndex, activeIntervalExecution?.remainingSec, activeIntervalExecution?.isFinished]);

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
