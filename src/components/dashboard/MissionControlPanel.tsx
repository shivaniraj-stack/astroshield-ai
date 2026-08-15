import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Radar, 
  AlertTriangle,
  Wifi
} from 'lucide-react';

interface MissionControlPanelProps {
  onOpenConjunctionModal: () => void;
}

export const MissionControlPanel: React.FC<MissionControlPanelProps> = ({
  onOpenConjunctionModal,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-40 animate-fadeIn font-telemetry">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-space-950/90 backdrop-blur-md border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:border-cyan-400 transition"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>MISSION CONTROL (CELESTRAK LIVE)</span>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-1" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80 sm:w-96 glass-panel p-4 sm:p-5 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-3 font-telemetry animate-fadeIn">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-400">
            <Radar className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-extrabold text-sm text-white tracking-wide">
                MISSION CONTROL
              </h3>
              <span className="text-[9px] font-bold bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400">CelesTrak NORAD GP Active Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-850 transition"
            title="Minimize Panel"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        
        {/* Mission Status */}
        <div className="p-2.5 rounded-xl bg-space-900/90 border border-slate-800 space-y-0.5">
          <span className="text-slate-400 block text-[10px]">MISSION STATUS</span>
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>MONITORING</span>
          </div>
        </div>

        {/* Tracked Objects */}
        <div className="p-2.5 rounded-xl bg-space-900/90 border border-slate-800 space-y-0.5">
          <span className="text-slate-400 block text-[10px]">OBJECTS TRACKED</span>
          <span className="font-extrabold text-white text-xs">12,450 Catalog</span>
        </div>

        {/* Conjunctions */}
        <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-0.5">
          <span className="text-red-400 block text-[10px] font-bold">CONJUNCTIONS</span>
          <span className="font-extrabold text-red-300 text-xs">3 Evaluated</span>
        </div>

        {/* Next Close Approach */}
        <div className="p-2.5 rounded-xl bg-space-900/90 border border-slate-800 space-y-0.5">
          <span className="text-slate-400 block text-[10px]">NEXT CLOSE APPROACH</span>
          <span className="font-extrabold text-cyan-300 text-xs">18h 24m (SAT-01)</span>
        </div>

      </div>

      {/* Primary High-Risk Event Alert Bar */}
      <div 
        onClick={onOpenConjunctionModal}
        className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 hover:border-red-400 cursor-pointer flex items-center justify-between transition group"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce shrink-0" />
          <div>
            <span className="text-[10px] text-red-400 font-bold block">RISK ASSESSMENT: REVIEW REQUIRED</span>
            <span className="text-xs font-bold text-white">SAT-01 vs DEBRIS-482 (14.2 km)</span>
          </div>
        </div>
        <span className="text-[10px] text-cyan-400 group-hover:underline font-bold whitespace-nowrap">
          Analyze →
        </span>
      </div>

      {/* Telemetry Source Disclaimer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
        <span className="flex items-center gap-1">
          <Wifi className="w-3 h-3 text-emerald-400" />
          <span>{utcTime || '14:32:00 UTC'}</span>
        </span>
        <span className="text-cyan-400/80 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/20 font-bold">
          CELESTRAK GP FEED
        </span>
      </div>

    </div>
  );
};
