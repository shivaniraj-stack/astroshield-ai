import React from 'react';
import { Shield, Orbit, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onLaunchMissionControl: () => void;
  onExploreMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchMissionControl,
  onExploreMap,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl glass-panel border border-cyan-500/30 p-8 sm:p-12 md:p-16">
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-telemetry">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI-POWERED SPACE TRAFFIC MANAGEMENT</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.1]">
            PROTECTING THE{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent glow-text-cyan">
              FUTURE OF ORBIT
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-sans leading-relaxed">
            "AI-powered space traffic intelligence for safer satellites and smarter missions."
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onLaunchMissionControl}
              className="py-3.5 px-7 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-space-950 font-extrabold text-sm hover:bg-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 transition group"
            >
              <Zap className="w-4 h-4 text-space-950" />
              <span>Launch Mission Control</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreMap}
              className="py-3.5 px-7 rounded-xl bg-space-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-950/50 font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              <Orbit className="w-4 h-4 text-cyan-400 animate-orbit-rotate" />
              <span>Explore 3D Orbital Map</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-telemetry text-slate-400 pt-4 border-t border-slate-800/80">
            <span className="text-slate-500">MONITORED CONSTELLATIONS:</span>
            <span className="text-cyan-400 font-bold">ISS</span>
            <span>•</span>
            <span className="text-red-400 font-bold">SAT-01</span>
            <span>•</span>
            <span className="text-cyan-300 font-bold">STARLINK</span>
            <span>•</span>
            <span className="text-red-400 font-bold">DEBRIS-482</span>
          </div>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-orbit-rotate" />
            <div className="absolute inset-4 rounded-full border border-dashed border-red-500/40 animate-[orbitRotate_30s_linear_infinite_reverse]" />
            <div className="absolute inset-10 rounded-full border border-cyan-400/20" />

            <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-cyan-950 via-space-900 to-blue-950 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_40px_rgba(0,240,255,0.3)]">
              <Shield className="w-16 h-16 text-cyan-400/80" />
            </div>

            <div className="absolute top-2 left-6 bg-red-950/90 border border-red-500/60 px-2.5 py-1 rounded-lg text-[10px] font-telemetry text-red-300 font-bold shadow-lg animate-float">
              SAT-01 [HIGH RISK]
            </div>

            <div className="absolute bottom-4 right-4 bg-space-900/90 border border-emerald-500/60 px-2.5 py-1 rounded-lg text-[10px] font-telemetry text-emerald-400 font-bold shadow-lg animate-[float_5s_ease-in-out_infinite_1s]">
              ISS (ZARYA)
            </div>

            <div className="absolute bottom-8 left-2 bg-space-900/90 border border-amber-500/60 px-2.5 py-1 rounded-lg text-[10px] font-telemetry text-amber-300 font-bold shadow-lg animate-[float_7s_ease-in-out_infinite_2s]">
              DEBRIS-482
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
