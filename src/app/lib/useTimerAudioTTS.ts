"use client";

import { useEffect, useRef, useCallback } from 'react';
import { TimerAudioSettings, TTSReadoutOption, TTSCountdownOption } from '@/types/timer';

export const useTimerAudioTTS = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Inicjalizacja i pobranie AudioContext
  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Odblokowanie kontekstu audio bezpośrednio przy kliknięciu użytkownika
  const unlockAudio = useCallback(() => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(0);
        osc.stop(ctx.currentTime + 0.01);
      }
    } catch (e) {}
  }, [getAudioContext]);

  // 1. Ciepły, przyjemny dzwonek odliczania 3, 2, 1 (Soft Marimba / Warm Wood Chime)
  const playBeep = useCallback((freq = 523.25, durationMs = 120, volume = 0.6) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Płynny miękki narastający atak (attack) eliminujący kliknięcia
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch (e) {}
  }, [getAudioContext]);

  // 2. Sygnał START PRACY (Szlachetny, podwójny dzwonek C6/E6 - 1046Hz & 1318Hz)
  const playWorkStartGong = useCallback((volume = 0.7) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const freqs = [1046.50, 1318.51];

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      });
    } catch (e) {}
  }, [getAudioContext]);

  // 3. Sygnał START PRZERWY / ZMIANY (Relaksujący, ciepły dzwon niższy E4 -> A3)
  const playRestStartGong = useCallback((volume = 0.7) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.4); // A3

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume * 0.6, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {}
  }, [getAudioContext]);

  // 4. Sygnał ZAKOŃCZENIA TRENINGU (Triumfalny, czysty akord majorowy)
  const playFinishFanfare = useCallback((volume = 0.8) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(volume * 0.4, now + index * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.6);
      });
    } catch (e) {}
  }, [getAudioContext]);

  // 5. Syntezator Mowy PL (Web SpeechSynthesis API)
  const speakText = useCallback((text: string, volume = 1.0) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Anuluj poprzednie zaległe wypowiedzi
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pl-PL';
      utterance.volume = Math.max(0, Math.min(1, volume));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  }, []);

  return {
    getAudioContext,
    unlockAudio,
    playBeep,
    playWorkStartGong,
    playRestStartGong,
    playFinishFanfare,
    speakText,
  };
};

// Hook zarządzający blokadą uśpienia ekranu (Screen Wake Lock API)
export const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {}
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (e) {}
      }
    };

    if (isActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isActive]);
};
