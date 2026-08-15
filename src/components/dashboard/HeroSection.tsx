import React from 'react';
import { Shield, Orbit, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

interface HeroSectionProps {
  onLaunchMissionControl: () => void;
  onExploreMap: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onLaunchMissionControl,
  onExploreMap,
}) => {
  const heroRef = useScrollReveal<HTMLDivElement>();
  const cardRef = useScrollReveal<HTMLDivElement>();

  return (
    <div 
      ref={heroRef}
      className="scroll-reveal relative rounded-3xl glass-panel p-8 sm:p-12 border border-cyan-500/30 overflow-hidden shadow-2xl"
    >
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Column: Heading & CTAs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 bg-cyan-950/80 px-3.5 py-1.5 rounded-full border border-cyan-400/40 text-cyan-300 text-xs font-telemetry font-bold shadow-[0_0_15px_rgba(0,240,255,0.25)]">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>AI-POWERED ORBITAL TRAFFIC MANAGEMENT</span>
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-tight drop-shadow-[0_0_35px_rgba(0,240,255,0.3)]">
            PROTECTING THE FUTURE OF ORBIT
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-sans">
            Real-time space situational awareness, automated collision-risk prediction, space weather warning feeds, and AI-optimized avoidance maneuver tactics.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 font-telemetry">
            <button
              onClick={onLaunchMissionControl}
              className="py-3.5 px-7 rounded-2xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-space-950 font-extrabold text-xs hover:opacity-95 flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:scale-[1.02] transition-all duration-200"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>LAUNCH 3D ORBITAL MAP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreMap}
              className="py-3.5 px-7 rounded-2xl bg-space-900/90 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 font-extrabold text-xs flex items-center justify-center gap-3 hover:bg-space-850 transition-all duration-200"
            >
              <Orbit className="w-4 h-4 text-cyan-400 animate-orbit-rotate" />
              <span>VIEW TELEMETRY</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/80 font-telemetry text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">SATELLITE CATALOG</span>
              <span className="font-bold text-white text-sm">12,450 Bodies</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">PREDICTION WINDOW</span>
              <span className="font-bold text-cyan-300 text-sm">72 Hours</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">RELIABILITY (SGP4)</span>
              <span className="font-bold text-emerald-400 text-sm">99.98% Acc.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Graphic Badge Preview */}
        <div 
          ref={cardRef}
          className="scroll-reveal stagger-2 lg:col-span-5 flex items-center justify-center"
        >
          <div className="relative w-full max-w-sm aspect-square rounded-3xl bg-space-900/80 border border-cyan-500/40 p-6 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <div className="w-20 h-20 rounded-3xl bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] mb-4">
              <Shield className="w-10 h-10 text-cyan-400 animate-pulse" />
            </div>

            <h3 className="font-heading font-extrabold text-lg text-white">
              ASTROSHIELD CORE
            </h3>
            <p className="text-xs font-telemetry text-cyan-300 mt-1 font-bold">
              SYSTEM ONLINE • NO HAZARD DEVIATION
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Active orbital monitoring link operational. Receiving telemetry stream from NORAD & ESA catalog databases.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
