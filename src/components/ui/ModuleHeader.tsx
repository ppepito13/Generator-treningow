"use client";

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ModuleHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  iconBadgeClass?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export const ModuleHeader: React.FC<ModuleHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconBadgeClass = "bg-primary/10 border-primary/20 text-primary",
  actions,
  children,
}) => {
  return (
    <header className="glass-card p-6 rounded-[2rem] border border-white/10 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${iconBadgeClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {actions}
          </div>
        )}
      </div>

      {children && (
        <div className="border-t border-white/5 pt-4">
          {children}
        </div>
      )}
    </header>
  );
};

