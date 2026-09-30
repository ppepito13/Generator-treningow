"use client";

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/app/lib/store';
import { Calculator, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const MathCalculatorSubView = () => {
  const { calculatorResults, setCalculatorResult } = useAppStore();

  const [display, setDisplay] = useState<string>('0');
  const [equation, setEquation] = useState<string>('');
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);

  useEffect(() => {
    if (calculatorResults?.math) {
      setDisplay(calculatorResults.math.display || '0');
      setEquation(calculatorResults.math.equation || '');
    }
  }, []);

  const saveMathState = (newDisplay: string, newEq: string) => {
    setCalculatorResult('math', { display: newDisplay, equation: newEq });
  };

  const handleDigit = (digit: string) => {
    if (display === '0' || isNewNumber) {
      setDisplay(digit);
      setIsNewNumber(false);
      saveMathState(digit, equation);
    } else {
      if (display.length >= 14) return;
      const updated = display + digit;
      setDisplay(updated);
      saveMathState(updated, equation);
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
      saveMathState('0.', equation);
      return;
    }
    if (!display.includes('.')) {
      const updated = display + '.';
      setDisplay(updated);
      saveMathState(updated, equation);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
    saveMathState('0', '');
  };

  const handleToggleSign = () => {
    if (display === '0') return;
    const val = (parseFloat(display) * -1).toString();
    setDisplay(val);
    saveMathState(val, equation);
  };

  const handlePercent = () => {
    const val = (parseFloat(display) / 100).toString();
    setDisplay(val);
    saveMathState(val, equation);
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setIsNewNumber(true);
    saveMathState(display, `${display} ${op} `);
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const fullExpr = equation + display;
      const sanitized = fullExpr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/[^0-9\.\+\-\*\/\(\)\s]/g, '');

      const res = Function(`'use strict'; return (${sanitized})`)();
      let resStr = String(res);
      if (resStr.includes('.') && resStr.split('.')[1].length > 6) {
        resStr = res.toFixed(6).replace(/\.?0+$/, '');
      }

      setEquation(`${fullExpr} =`);
      setDisplay(resStr);
      setIsNewNumber(true);
      saveMathState(resStr, `${fullExpr} =`);
    } catch (err) {
      setDisplay('Błąd');
      setIsNewNumber(true);
    }
  };

  return (
    <div className="space-y-6 max-w-sm mx-auto">
      {/* KARTA KALKULATORA MATEMATYCZNEGO - MOTYW VIOLET */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 space-y-4">
        {/* Nagłówek */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-violet-400">
            <Calculator className="h-4 w-4" />
            <span>Kalkulator Matematyczny</span>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 text-white/50 hover:text-white transition-colors">
                  <HelpCircle className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-neutral-900 border-white/10 text-xs text-white max-w-xs p-3">
                Podręczny kalkulator do szybkich obliczeń ciężarów, dodawania serii, objętości lub wyliczania proporcji odżywczych.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* EKRAN WYNIKOWY KALKULATORA */}
        <div className="p-4 rounded-2xl bg-black/50 border border-violet-500/20 text-right space-y-1 overflow-hidden min-h-[5.5rem] flex flex-col justify-end">
          <div className="font-mono text-xs text-muted-foreground truncate h-4">
            {equation}
          </div>
          <div className="font-mono font-black text-3xl sm:text-4xl text-violet-200 tracking-tight truncate">
            {display}
          </div>
        </div>

        {/* SIATKA PRZYCISKÓW 4x5 */}
        <div className="grid grid-cols-4 gap-2">
          {/* Rząd 1 */}
          <Button
            onClick={handleClear}
            variant="outline"
            className="h-12 rounded-xl border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-black"
          >
            AC
          </Button>
          <Button
            onClick={handleToggleSign}
            variant="outline"
            className="h-12 rounded-xl border-white/10 glass-button text-xs font-bold"
          >
            +/−
          </Button>
          <Button
            onClick={handlePercent}
            variant="outline"
            className="h-12 rounded-xl border-white/10 glass-button text-xs font-bold"
          >
            %
          </Button>
          <Button
            onClick={() => handleOperator('÷')}
            className="h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 text-base font-black"
          >
            ÷
          </Button>

          {/* Rząd 2 */}
          <Button onClick={() => handleDigit('7')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">7</Button>
          <Button onClick={() => handleDigit('8')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">8</Button>
          <Button onClick={() => handleDigit('9')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">9</Button>
          <Button
            onClick={() => handleOperator('×')}
            className="h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 text-base font-black"
          >
            ×
          </Button>

          {/* Rząd 3 */}
          <Button onClick={() => handleDigit('4')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">4</Button>
          <Button onClick={() => handleDigit('5')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">5</Button>
          <Button onClick={() => handleDigit('6')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">6</Button>
          <Button
            onClick={() => handleOperator('−')}
            className="h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 text-base font-black"
          >
            −
          </Button>

          {/* Rząd 4 */}
          <Button onClick={() => handleDigit('1')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">1</Button>
          <Button onClick={() => handleDigit('2')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">2</Button>
          <Button onClick={() => handleDigit('3')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">3</Button>
          <Button
            onClick={() => handleOperator('+')}
            className="h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 text-violet-300 hover:bg-violet-500/30 text-base font-black"
          >
            +
          </Button>

          {/* Rząd 5 */}
          <Button onClick={() => handleDigit('0')} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold col-span-2">0</Button>
          <Button onClick={handleDecimal} variant="outline" className="h-12 rounded-xl border-white/10 glass-button text-sm font-bold">.</Button>
          <Button
            onClick={handleEqual}
            className="h-12 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-base font-black shadow-lg shadow-violet-500/20"
          >
            =
          </Button>
        </div>
      </div>
    </div>
  );
};
