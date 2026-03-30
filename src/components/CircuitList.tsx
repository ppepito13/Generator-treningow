
"use client";

import React from 'react';
import { useAppStore } from '@/app/lib/store';
import { StationCard } from './StationCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2, ClipboardList, Copy, Check, Send } from 'lucide-react';
import { DIFFICULTY_LEVELS } from '@/app/lib/data';
import { Share } from '@capacitor/share';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

export const CircuitList = () => {
  const { circuit, reset, difficultyId, participants } = useAppStore();
  const currentDiff = DIFFICULTY_LEVELS.find(d => d.id === difficultyId);
  const [copied, setCopied] = React.useState(false);

  const getSummary = () => {
    const header = `💪 TRENING SW CALISTHENICS\n${currentDiff?.nazwa_grupy || 'Trening'} • ${participants} osób\n\n`;
    const list = circuit.map((station, idx) => {
      let line = `${idx + 1}. ${station.exerciseA.nazwa}`;
      if (station.exerciseA.wariant) line += ` - ${station.exerciseA.wariant}`;
      
      // Jeśli mamy partnera z innym ćwiczeniem, dodajemy je pod spodem
      if (station.exerciseB && station.exerciseB.id_cwiczenia !== station.exerciseA.id_cwiczenia) {
        line += `\n   Partner: ${station.exerciseB.nazwa}`;
        if (station.exerciseB.wariant) line += ` - ${station.exerciseB.wariant}`;
      }
      return line;
    }).join('\n');
    return header + list;
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(getSummary());
      setCopied(true);
      toast({
        title: "Skopiowano!",
        description: "Podsumowanie treningu trafiło do schowka.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = getSummary();
    const { Capacitor } = await import('@capacitor/core');

    if (Capacitor.isNativePlatform()) {
      // Natywne udostępnianie przez Capacitor (Android/iOS)
      try {
        await Share.share({
          title: 'Mój Trening SW Calisthenics',
          text: text,
          dialogTitle: 'Prześlij trening ekipie',
        });
      } catch (err) {
        handleCopy();
      }
    } else if (typeof navigator !== 'undefined' && navigator.share) {
      // Web Share API w przeglądarce
      try {
        await navigator.share({
          title: 'Mój Trening SW Calisthenics',
          text: text,
        });
      } catch (webErr) {
        if ((webErr as Error).name !== 'AbortError') handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Zawsze pokazujemy przycisk nawigacyjny udostępniania
  const isShareSupported = true;

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto pb-12">
      <div
        className="sticky top-0 z-20 bg-background/80 backdrop-blur-md px-6 pb-4 flex items-center justify-between border-b border-white/5"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' }}
      >
        <Button variant="ghost" onClick={reset} className="glass-button rounded-xl flex gap-2">
          <ArrowLeft className="h-4 w-4" />
          Wstecz
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Twój Obwód
          </h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
            {currentDiff?.nazwa_grupy || 'Trening'} • {participants} osób
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="glass-button rounded-xl text-secondary">
              <Share2 className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 text-white sm:max-w-md outline-none">
            <DialogHeader>
              <DialogTitle className="text-secondary flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Udostępnij Trening
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="bg-white/5 p-5 rounded-2xl font-mono text-[13px] whitespace-pre-wrap border border-white/5 leading-relaxed max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                {getSummary()}
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {isShareSupported && (
                  <Button 
                    onClick={handleShare} 
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl flex gap-2 transition-all active:scale-95"
                  >
                    <Send className="h-4 w-4" />
                    Wyślij wiadomość (Messenger/WA)
                  </Button>
                )}
                
                <Button 
                  onClick={handleCopy} 
                  variant={isShareSupported ? "outline" : "default"}
                  className={`w-full h-12 ${!isShareSupported ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90' : 'glass-button border-white/10'} font-bold rounded-xl flex gap-2 transition-all active:scale-95`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Skopiowano do schowka" : "Kopiuj listę ćwiczeń"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="px-6 pt-6 space-y-6 overflow-y-auto">
        {circuit.map((station) => (
          <StationCard key={station.id} station={station} />
        ))}
      </div>

      <div className="px-6 mt-8">
        <div className="p-6 rounded-3xl bg-secondary/10 border border-secondary/20 text-center space-y-2">
          <p className="text-secondary font-bold text-sm">Gotowy na trening?</p>
          <p className="text-xs text-muted-foreground">
            Wygenerowano {circuit.length} {circuit.length === 1 ? 'stację' : circuit.length < 5 ? 'stacje' : 'stacji'}. 
            Pamiętaj o rozgrzewce przed rozpoczęciem obwodu!
          </p>
        </div>
      </div>
    </div>
  );
};
