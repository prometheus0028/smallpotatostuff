'use client';

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { SynthesisResult, RiskProfile } from '../lib/types';
import { Target, CheckCircle2, ShieldCheck, AlertTriangle, ArrowUpRight, Ban } from 'lucide-react';

interface SynthesisPanelProps {
  synthesis: SynthesisResult;
  activeProfile: RiskProfile;
}

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const SynthesisPanel: React.FC<SynthesisPanelProps> = ({
  synthesis,
  activeProfile,
}) => {
  const isDegraded = synthesis.isDegraded;

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return {
          textColor: 'text-fin-bullish',
          badgeBg: 'bg-fin-bullishBg border-fin-bullishBorder text-fin-bullish',
          meterBg: 'bg-fin-bullish',
        };
      case 'HOLD':
        return {
          textColor: 'text-fin-text',
          badgeBg: 'bg-fin-surface2 border-fin-border text-fin-text',
          meterBg: 'bg-fin-accent',
        };
      case 'REDUCE':
      case 'SELL':
        return {
          textColor: 'text-fin-bearish',
          badgeBg: 'bg-fin-bearishBg border-fin-bearishBorder text-fin-bearish',
          meterBg: 'bg-fin-bearish',
        };
      case 'INSUFFICIENT EVIDENCE':
      default:
        return {
          textColor: 'text-fin-cautious',
          badgeBg: 'bg-fin-cautiousBg border-fin-cautiousBorder text-fin-cautious',
          meterBg: 'bg-fin-cautious',
        };
    }
  };

  const style = getRecommendationStyle(synthesis.recommendation);

  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-6 shadow-card">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-fin-border">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-fin-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
            Synthesized Intelligence Recommendation
          </h2>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-fin-surface2 border border-fin-border text-fin-text2">
          {activeProfile} Profile Applied
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeProfile + (isDegraded ? '-degraded' : '-nominal')}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {isDegraded ? (
            /* DEGRADED DATA MODE SAFETY REFUSAL CARD */
            <div className="p-6 rounded-xl border border-fin-cautiousBorder bg-fin-cautiousBg/40 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-fin-cautiousBg border border-fin-cautiousBorder flex items-center justify-center text-fin-cautious shrink-0">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-fin-cautious block">
                    DATA STATUS: DEGRADED
                  </span>
                  <h3 className="text-xl font-extrabold text-fin-text">
                    DECISION WITHHELD
                  </h3>
                  <p className="text-xs text-fin-text2 mt-1">INSUFFICIENT EVIDENCE</p>
                </div>
              </div>

              <p className="text-xs text-fin-text2 leading-relaxed font-medium bg-fin-surface p-3.5 rounded-lg border border-fin-border">
                "The system will not generate an unsupported recommendation because required fundamental evidence is unavailable."
              </p>

              <div className="flex items-center space-x-2 text-[11px] text-fin-text3">
                <AlertTriangle className="w-3.5 h-3.5 text-fin-cautious shrink-0" />
                <span>Fundamental RAG agent data feed is offline. Recommendation withheld to prevent ungrounded advice.</span>
              </div>
            </div>
          ) : (
            /* NORMAL RESEARCH SYNTHESIS DISPLAY */
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* Left: Prominent Recommendation badge + Confidence meter */}
              <motion.div
                variants={itemVariants}
                className="md:col-span-4 p-5 rounded-xl bg-fin-surface2 border border-fin-border flex flex-col items-center justify-center text-center space-y-3"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-fin-text3">
                  Actionable Signal
                </span>

                <div className={`px-6 py-2 rounded-xl border text-3xl font-black tracking-tight ${style.badgeBg}`}>
                  {synthesis.recommendation}
                </div>

                <div className="w-full pt-1">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-fin-text mb-1.5 px-1">
                    <span className="text-[11px] text-fin-text3 font-sans font-medium">Confidence</span>
                    <span>{synthesis.confidence}%</span>
                  </div>
                  <div className="w-full bg-fin-surface3 rounded-full h-2 overflow-hidden border border-fin-border/60">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${style.meterBg}`}
                      style={{ width: `${synthesis.confidence}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Right: Key Drivers + Risk Adjustment Note */}
              <div className="md:col-span-8 space-y-5">
                {/* Key Drivers List */}
                <motion.div variants={itemVariants}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-fin-text mb-2.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-fin-bullish" />
                    Key Catalysts & Drivers
                  </h3>
                  <ul className="space-y-2">
                    {synthesis.reasons.map((reason, i) => {
                      const isMinus =
                        reason.toLowerCase().includes('margin') ||
                        reason.toLowerCase().includes('contract') ||
                        reason.toLowerCase().includes('pressure');
                      return (
                        <li
                          key={i}
                          className="flex items-center space-x-2 text-xs text-fin-text font-medium bg-fin-surface2/60 border border-fin-border p-2.5 rounded-lg"
                        >
                          <span
                            className={`w-4 h-4 rounded flex items-center justify-center text-[11px] font-mono font-bold shrink-0 ${
                              isMinus
                                ? 'bg-fin-bearishBg text-fin-bearish border border-fin-bearishBorder'
                                : 'bg-fin-bullishBg text-fin-bullish border border-fin-bullishBorder'
                            }`}
                          >
                            {isMinus ? '-' : '+'}
                          </span>
                          <span className="leading-snug">{reason}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>

                {/* Risk Adjustment Card */}
                <motion.div
                  variants={itemVariants}
                  className="p-3.5 rounded-lg bg-fin-surface2 border border-fin-border space-y-1"
                >
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-fin-accent">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Personalized Risk Adjustment ({activeProfile})</span>
                  </div>
                  <p className="text-xs text-fin-text2 leading-relaxed">
                    {synthesis.riskAdjustment}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
