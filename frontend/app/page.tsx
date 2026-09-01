import Link from 'next/link';
import { Shield, Zap, Search, Activity } from 'lucide-react';
import { KaleidoscopeBackground } from '@/components/geometric/KaleidoscopeBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)] text-[var(--color-text-main)] overflow-hidden relative">

      {/* Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[var(--color-forest)] flex items-center justify-center font-bold text-white">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-[var(--color-forest)]">Hackverse</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm font-medium text-[var(--color-text-main)]">
          <Link href="/dashboard" className="hover:text-[var(--color-forest)] transition-colors">Overview</Link>
          <Link href="/dashboard/market" className="hover:text-[var(--color-forest)] transition-colors">Market Signals</Link>
          <Link href="/dashboard/agents" className="hover:text-[var(--color-forest)] transition-colors">Agents</Link>
          <Link href="/dashboard/portfolio" className="hover:text-[var(--color-forest)] transition-colors">Portfolio</Link>
        </nav>
        
        <div>
          <Link 
            href="/dashboard" 
            className="px-5 py-2 bg-[var(--color-forest)] text-white font-medium rounded-md hover:bg-[var(--color-forest-light)] transition-colors text-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Content */}
      <main className="w-full max-w-7xl mx-auto px-8 pt-20 pb-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-5/12 max-w-xl">
            <h1 className="text-5xl font-extrabold text-[var(--color-forest)] leading-tight mb-6">
              Autonomous Financial Intelligence for Retail Investors
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] mb-10 font-medium leading-relaxed">
              Three specialized agents analyze market data, news, and fundamentals in parallel to deliver personalized, explainable recommendations.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="px-6 py-3 bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] text-white rounded-md font-medium transition-colors shadow-sm"
              >
                Run Analysis
              </Link>
              <button className="px-6 py-3 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] text-[var(--color-text-main)] rounded-md font-medium hover:bg-white transition-colors shadow-sm">
                Learn More
              </button>
            </div>
          </div>
          
          <div className="md:w-7/12 h-[400px] relative">
            <KaleidoscopeBackground variant="hero" />
          </div>
        </div>

        {/* Value Prop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32 relative z-20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-forest)] shadow-sm">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-main)] mb-1 text-sm">Parallel AI Agents</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Technical, Sentiment, Fundamental</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-forest)] shadow-sm">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-main)] mb-1 text-sm">Explainable Insights</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Visible reasoning with source attribution</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-forest)] shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-main)] mb-1 text-sm">Personalized Results</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Adjusted for your risk profile and portfolio</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-ivory)] border border-[var(--color-border-subtle)] rounded-lg text-[var(--color-forest)] shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--color-text-main)] mb-1 text-sm">Reliable & Safe</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">Graceful handling of missing data</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
