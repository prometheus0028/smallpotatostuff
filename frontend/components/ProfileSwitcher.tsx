'use client';

import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSwitcherProps {
  currentProfile: 'CONSERVATIVE' | 'AGGRESSIVE';
  onChange: (profile: 'CONSERVATIVE' | 'AGGRESSIVE') => void;
}

export function ProfileSwitcher({ currentProfile, onChange }: ProfileSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--color-ivory)] rounded-lg border border-[var(--color-border-subtle)] w-fit">
      <button
        onClick={() => onChange('CONSERVATIVE')}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors z-10",
          currentProfile === 'CONSERVATIVE' ? "text-[var(--color-forest)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
        )}
      >
        {currentProfile === 'CONSERVATIVE' && (
          <motion.div
            layoutId="profile-pill"
            className="absolute inset-0 bg-white border border-[var(--color-border-subtle)] rounded-md -z-10 shadow-sm"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Shield className="w-3.5 h-3.5" />
        Conservative
      </button>

      <button
        onClick={() => onChange('AGGRESSIVE')}
        className={cn(
          "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors z-10",
          currentProfile === 'AGGRESSIVE' ? "text-[var(--color-forest)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-main)]"
        )}
      >
        {currentProfile === 'AGGRESSIVE' && (
          <motion.div
            layoutId="profile-pill"
            className="absolute inset-0 bg-white border border-[var(--color-border-subtle)] rounded-md -z-10 shadow-sm"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Zap className="w-3.5 h-3.5" />
        Aggressive
      </button>
    </div>
  );
}
