"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/app/lib/store";
import { ALL_EQUIPMENT } from "@/app/lib/data";
import { Dumbbell, CheckSquare, Square, Eraser } from "lucide-react";

export const EquipmentSelectionDialog = () => {
  const { customRoomEquipment, toggleCustomEquipment, setAllCustomEquipment } = useAppStore();

  const sortedEquipment = [...ALL_EQUIPMENT].sort((a, b) => a.localeCompare(b));

  const formatName = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleSelectAll = () => setAllCustomEquipment(ALL_EQUIPMENT);
  const handleClearAll = () => setAllCustomEquipment([]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full h-12 rounded-xl glass-button flex justify-between px-4 border-white/10 group">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="font-bold uppercase tracking-tight text-xs">Wybierz dostępny sprzęt</span>
          </div>
          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
            {customRoomEquipment.length}
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-white/10 text-white sm:max-w-[550px] outline-none flex flex-col h-[90vh] sm:h-[80vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-primary flex items-center gap-2 text-xl font-bold">
              <Dumbbell className="h-5 w-5" />
              Dostępny Sprzęt
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
              Zaznacz sprzęt, który jest dostępny w Twojej przestrzeni.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 px-6 py-4 border-b border-white/5">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSelectAll}
              className="text-[10px] uppercase font-bold flex gap-2 h-8 rounded-lg bg-white/5 hover:bg-primary/20 hover:text-primary transition-all"
            >
              <CheckSquare className="h-3.5 w-3.5" />
              Zaznacz wszystkie
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearAll}
              className="text-[10px] uppercase font-bold flex gap-2 h-8 rounded-lg bg-white/5 hover:bg-destructive/20 hover:text-destructive transition-all"
            >
              <Eraser className="h-3.5 w-3.5" />
              Wyczyść wszystko
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-4">
              {sortedEquipment.map((item) => {
                const isSelected = customRoomEquipment.includes(item);
                return (
                  <div 
                    key={item}
                    onClick={() => toggleCustomEquipment(item)}
                    className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected 
                        ? 'bg-primary/10 border-primary/30 text-white' 
                        : 'bg-white/5 border-white/5 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Checkbox 
                      id={`equip-${item}`} 
                      checked={isSelected}
                      onCheckedChange={() => toggleCustomEquipment(item)}
                      className={`border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary`}
                    />
                    <label
                      htmlFor={`equip-${item}`}
                      className="text-xs font-bold uppercase tracking-tight cursor-pointer flex-1"
                      onClick={(e) => e.preventDefault()} // Prevent double toggle due to parent div click
                    >
                      {formatName(item)}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t border-white/5">
            <DialogClose asChild>
              <Button 
                variant="default" 
                className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-widest bg-primary hover:bg-primary/90"
              >
                Gotowe
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};
