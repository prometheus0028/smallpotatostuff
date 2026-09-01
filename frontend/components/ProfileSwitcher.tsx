'use client';

import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { RiskProfile } from '../lib/types';
import { Shield, Zap, Info } from 'lucide-react';

interface ProfileSwitcherProps {
  activeProfile: RiskProfile;
  onSelectProfile: (profile: RiskProfile) => void;
}

const PROFILES: { id: RiskProfile; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'Conservative', label: 'Conservative Profile', icon: Shield },
  { id: 'Aggressive',   label: 'Aggressive Profile',   icon: Zap    },
];

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  activeProfile,
  onSelectProfile,
}) => {
  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-4 shadow-card">
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-fin-border">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-fin-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
            Investor Risk Profile
          </h2>
        </div>
        <div className="flex items-center space-x-1 text-[10px] font-bold tracking-widest uppercase text-fin-text2 bg-fin-surface2 px-2 py-0.5 rounded border border-fin-border/60">
          <span>SAME MARKET INPUT · DIFFERENT RISK PROFILE</span>
        </div>
      </div>

      <LayoutGroup id="profile-tabs">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {PROFILES.map(({ id, label, icon: Icon }) => {
            const isActive = activeProfile === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectProfile(id)}
                className={`relative flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all ${
                  isActive
                    ? 'bg-fin-surface2 border-fin-accent/80 text-fin-text shadow-sm ring-1 ring-fin-accent/40'
                    : 'bg-fin-surface border-fin-border text-fin-text2 hover:border-fin-border2 hover:bg-fin-surface2/50'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="profile-active-border"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-fin-accent rounded-r"
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                )}
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-fin-accent' : 'text-fin-text3'}`} />
                  <div>
                    <span className="text-xs font-bold block">{label}</span>
                    <span className="text-[10px] text-fin-text3 block">
                      {id === 'Conservative' ? 'Capital Preservation' : 'Upside Capture'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isActive ? 'border-fin-accent/30 text-fin-accent bg-fin-accent/10' : 'border-fin-border text-fin-text3'
                  }`}
                >
                  {isActive ? 'ACTIVE' : 'IDLE'}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Surface Behavioral Fields directly under tabs */}
      <div className="rounded-lg border border-fin-border bg-fin-surface2 p-3 text-xs flex flex-col space-y-2">
        <span className="text-[10px] font-bold tracking-wider uppercase text-fin-text3 mb-1">
          PROFILE-BASED RISK ADJUSTMENT
        </span>
        <div className="flex items-center justify-between">
          <span className="text-fin-text2">Risk Tolerance</span>
          <span className="font-bold text-fin-text">{activeProfile === 'Conservative' ? 'Low (Capital Preservation)' : 'High (Capital Growth)'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-fin-text2">Portfolio Concentration Limit</span>
          <span className="font-bold text-fin-text">{activeProfile === 'Conservative' ? 'Max 10% per Asset' : 'Max 25% per Asset'}</span>
        </div>
      </div>
    </div>
  );
};
