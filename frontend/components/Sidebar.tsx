'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BarChart3, Bot, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CubeCluster } from './geometric/CubeCluster';

const navItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Market Signals', href: '/dashboard/market', icon: BarChart3 },
  { name: 'Agents', href: '/dashboard/agents', icon: Bot },
  { name: 'Portfolio', href: '/dashboard/portfolio', icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 bg-[var(--color-ivory)] text-[var(--color-text-main)] border-r border-[var(--color-border-subtle)] h-screen flex flex-col fixed left-0 top-0 z-50 shadow-sm overflow-hidden"
    >
      {/* SIDEBAR SUBTLE CUBES */}
      <CubeCluster
        className="absolute z-[-1] pointer-events-none opacity-50"
        style={{ left: '-20px', bottom: '10%' }}
        cubes={[
          { id: 'sb-1', size: 140, x: 0, y: 0, theme: 'mixed-green', opacity: 0.1 },
          { id: 'sb-2', size: 100, x: 60, y: 40, theme: 'sage', opacity: 0.15 },
          { id: 'sb-3', size: 60, x: 100, y: -20, theme: 'cream', opacity: 0.3 },
        ]}
      />

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-[var(--color-forest)] flex items-center justify-center font-bold text-white shadow-sm">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--color-forest)]">Hackverse</span>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative',
                  isActive 
                    ? 'text-[var(--color-text-main)] bg-[#EBE7DF] font-medium' 
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)] hover:bg-[#EBE7DF]/50'
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-forest)] rounded-l-md"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <item.icon className={cn("w-4 h-4", isActive ? "text-[var(--color-forest)]" : "text-[var(--color-sage)] group-hover:text-[var(--color-forest)]")} />
                <span className="text-sm z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="mt-auto p-6 border-t border-[var(--color-border-subtle)] relative z-10 bg-[var(--color-ivory)]/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-forest-light)] text-white flex items-center justify-center shadow-sm">
            <span className="text-sm font-medium">U</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-text-main)]">Demo User</span>
            <span className="text-xs text-[var(--color-text-secondary)]">Analyst</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
