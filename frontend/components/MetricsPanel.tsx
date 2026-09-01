import { SessionMetrics } from '@/types/api';
import { Clock, Briefcase, Activity } from 'lucide-react';

interface MetricsPanelProps {
  metrics: SessionMetrics;
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div className="bg-[var(--color-cream)] border border-[var(--color-border-subtle)] rounded-xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-[var(--color-text-main)] mb-4">Performance Log</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Agent Response Latency</span>
          </div>
          <span className="text-2xl font-bold text-[var(--color-text-main)]">
            {metrics.total_latency_ms} ms
          </span>
          <span className="text-xs text-[var(--color-sage)] mt-1 font-medium">
            Saved {metrics.parallelism_saved_ms} ms via parallel execution
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Portfolio Risk Concentration</span>
          </div>
          <span className="text-2xl font-bold text-[var(--color-text-main)]">
            {(metrics.portfolio_concentration_score * 100).toFixed(2)}%
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Based on current user holdings
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mb-1">
            <Activity className="w-4 h-4" />
            <span>Simulated 30-Day Fwd Return</span>
          </div>
          <span className={`text-2xl font-bold ${metrics.simulated_forward_return !== undefined && metrics.simulated_forward_return !== null ? (metrics.simulated_forward_return >= 0 ? 'text-[var(--color-sage)]' : 'text-rose-500') : 'text-[var(--color-text-main)]'}`}>
            {metrics.simulated_forward_return !== undefined && metrics.simulated_forward_return !== null 
              ? `${(metrics.simulated_forward_return * 100).toFixed(2)}%`
              : 'N/A'}
          </span>
          <span className="text-xs text-[var(--color-text-secondary)] mt-1 font-medium">
            Historical correlation benchmark
          </span>
        </div>

      </div>
    </div>
  );
}
