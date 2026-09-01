'use client';

import { FileText, ExternalLink } from 'lucide-react';

import { AgentSource } from '@/types/api';

interface EvidencePanelProps {
  sources: AgentSource[];
}

export function EvidencePanel({ sources }: EvidencePanelProps) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-[var(--color-forest)] mb-4">Fundamental Evidence</h2>
      <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#EBE7DF]/50 text-[var(--color-text-main)] text-xs uppercase tracking-wider font-semibold border-b border-[var(--color-border-subtle)]">
              <tr>
                <th className="px-6 py-4">Document</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Excerpt</th>
                <th className="px-6 py-4 text-right">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)] text-[var(--color-text-secondary)]">
              {sources.map((source, index) => (
                <tr key={`${source.document_id}-${index}`} className="hover:bg-[var(--color-ivory)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-[var(--color-text-main)] align-top">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--color-sage)]" />
                      {source.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span className="text-[var(--color-forest-light)] font-medium">
                      {source.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-xs italic leading-relaxed text-[var(--color-text-secondary)] line-clamp-3">
                      "{source.chunk_text}"
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right align-top">
                    <div className="flex flex-col items-end gap-1">
                      {source.similarity !== undefined && (
                        <span className="inline-flex items-center gap-1 bg-[var(--color-forest)]/10 text-[var(--color-forest)] px-2 py-0.5 rounded text-xs font-bold font-mono">
                          Sim: {(source.similarity * 100).toFixed(1)}%
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-secondary)] font-mono uppercase tracking-wider">
                        ID: {source.document_id}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
