'use client';

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReasoningTraceEntry } from '../lib/types';
import { ListOrdered, Radio } from 'lucide-react';

interface ReasoningTraceTimelineProps {
  trace: ReasoningTraceEntry[];
  isAnalyzing: boolean;
}

function traceColor(type: ReasoningTraceEntry['type']): string {
  if (type === 'WARNING')        return 'text-fin-bearish font-bold';
  if (type === 'SYNTHESIS')      return 'text-fin-bullish font-bold';
  if (type === 'AGENT_COMPLETE') return 'text-fin-text font-medium';
  return 'text-fin-text2';
}

function dotColor(type: ReasoningTraceEntry['type']): string {
  if (type === 'WARNING')        return 'bg-fin-bearish';
  if (type === 'SYNTHESIS')      return 'bg-fin-bullish';
  if (type === 'AGENT_COMPLETE') return 'bg-fin-accent';
  return 'bg-fin-text3';
}

export const ReasoningTraceTimeline: React.FC<ReasoningTraceTimelineProps> = ({
  trace,
  isAnalyzing,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [trace.length]);

  return (
    <div className="bg-fin-surface border border-fin-border rounded-xl p-5 shadow-card space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-fin-border">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-4 h-4 text-fin-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
            Autonomous Reasoning Trace (Audit Log)
          </h2>
        </div>
        {isAnalyzing && (
          <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <Radio className="w-3 h-3 text-amber-600" />
            <span>STREAMING LOG</span>
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-lg bg-fin-surface2 border border-fin-border max-h-[260px] overflow-y-auto font-mono text-[11px]">
        {trace.length === 0 ? (
          <p className="text-fin-text3 italic py-2 text-center">
            Click "Run Analysis" to stream live execution trace…
          </p>
        ) : (
          <div className="relative pl-4 space-y-2.5">
            {/* Vertical Guide Line */}
            <div className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-fin-border2" />

            <AnimatePresence initial={false}>
              {trace.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative flex items-start gap-3 group"
                >
                  {/* Timeline Dot Marker */}
                  <div
                    className={`absolute -left-[14px] top-[5px] w-[7px] h-[7px] rounded-full border border-white shrink-0 shadow-sm ${dotColor(
                      item.type
                    )}`}
                  />

                  <span className="text-[10px] font-bold text-fin-text3 shrink-0 pt-0.5">
                    {item.timestamp}
                  </span>
                  <span className={`leading-snug ${traceColor(item.type)}`}>
                    {item.event}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
