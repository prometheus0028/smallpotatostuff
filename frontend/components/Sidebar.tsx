'use client';

import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { LayoutDashboard, Cpu, Briefcase, LineChart, Activity } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'overview',   label: 'OVERVIEW',    icon: LayoutDashboard, active: true  },
  { id: 'agents',     label: 'AGENTS',      icon: Cpu,             active: false },
  { id: 'portfolio',  label: 'PORTFOLIO',   icon: Briefcase,       active: false },
  { id: 'market',     label: 'MARKET DATA', icon: LineChart,       active: false },
  { id: 'activity',   label: 'ACTIVITY',    icon: Activity,        active: false },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-52 border-r border-fin-border flex flex-col h-screen sticky top-0 bg-fin-surface shrink-0 select-none">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-5 border-b border-fin-border shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-fin-text flex items-center justify-center text-white text-xs font-bold shadow-sm">
            F
          </div>
          <div>
            <span className="text-fin-text font-bold tracking-tight text-xs block">
              FININT
            </span>
            <span className="text-fin-text3 font-medium text-[10px] block -mt-0.5">PS-01 Platform</span>
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-fin-text3">
          Modules
        </div>
        <LayoutGroup id="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                className={`relative flex items-center space-x-3 px-3 h-9 rounded-lg cursor-pointer transition-colors duration-150 ${
                  item.active
                    ? 'bg-fin-surface2 text-fin-text font-semibold'
                    : 'text-fin-text2 hover:bg-fin-surface2/60 hover:text-fin-text'
                }`}
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {/* Active indicator */}
                {item.active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-fin-accent"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
                <Icon className={`w-4 h-4 ${item.active ? 'text-fin-accent' : 'text-fin-text3'}`} />
                <span className="text-[11px] tracking-wide">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </LayoutGroup>
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-fin-border shrink-0 bg-fin-surface">
        <div className="p-2.5 rounded-xl bg-fin-surface2 border border-fin-border flex items-center space-x-2.5 text-[11px]">
          <div className="w-2 h-2 rounded-full bg-fin-bullish animate-pulse" />
          <div className="flex-1 min-w-0">
            <span className="text-fin-text font-medium block leading-tight">System Online</span>
            <span className="text-fin-text3 text-[10px] font-mono block">3 Agents Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
