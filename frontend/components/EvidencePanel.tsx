'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EvidenceItem } from '../lib/types';
import { FileCheck, Database, ChevronDown, ChevronUp } from 'lucide-react';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  isDegraded: boolean;
}

function EvidenceRow({ item }: { item: EvidenceItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="p-3.5 rounded-lg bg-fin-surface2 border border-fin-border space-y-2 cursor-default group"
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
    >
      {/* Agent tag + Document Title */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-fin-accentDim text-fin-accent border border-fin-accentBorder">
              {item.agentName}
            </span>
            <span className="text-[11px] text-fin-text3 font-mono">Filed {item.date}</span>
          </div>
          <h3 className="text-xs font-bold text-fin-text leading-snug">{item.title}</h3>
          <div className="text-[11px] text-fin-text3 font-medium">Source: {item.source}</div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 flex items-center space-x-1 text-[10px] font-mono font-bold px-2 py-1 rounded bg-fin-surface border border-fin-border text-fin-text2 hover:text-fin-text hover:bg-fin-surface3/50 transition-colors"
        >
          <span>{expanded ? 'COLLAPSE' : 'EXPAND'}</span>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Excerpt with smooth animation */}
      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <blockquote className="text-xs text-fin-text2 leading-relaxed italic p-3 rounded bg-fin-surface border-l-2 border-fin-accent">
              &ldquo;{item.excerpt}&rdquo;
            </blockquote>
          </motion.div>
        ) : (
          <motion.blockquote
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-xs text-fin-text3 truncate italic pl-2 border-l-2 border-fin-border"
          >
            &ldquo;{item.excerpt.split('.')[0]}.&rdquo;
          </motion.blockquote>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence, isDegraded }) => {
  return (
    <div id="evidence" className="bg-fin-surface border border-fin-border rounded-xl p-5 shadow-card max-h-[400px] flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-fin-border shrink-0">
        <div className="flex items-center space-x-2">
          <FileCheck className="w-4 h-4 text-fin-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-fin-text">
            Verified RAG Evidence Provenance
          </h2>
        </div>
        <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-fin-accentDim text-fin-accent border border-fin-accentBorder">
          <Database className="w-3 h-3" />
          <span>VECTOR DB VERIFIED</span>
        </span>
      </div>

      {isDegraded || evidence.length === 0 ? (
        <div className="p-4 rounded-lg bg-fin-surface2 border border-fin-border text-center text-xs text-fin-text3 italic">
          Fundamental evidence unavailable — RAG vector pipeline offline.
        </div>
      ) : (
        <div className="space-y-3">
          {evidence.map((item) => (
            <EvidenceRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
