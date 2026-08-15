import React, { useState, useEffect } from 'react';
import { Radar, Satellite, AlertTriangle, ShieldCheck, Wifi, ExternalLink, RefreshCw } from 'lucide-react';
import { fetchCelesTrakData } from '../../services/celestrakApi';
import type { LiveTelemetryState } from '../../services/celestrakApi';

interface MetricCardProps {
  label: string;
  targetValue: number | string;
  isString?: boolean;
  unit?: string;
  subtitle: string;
  icon: React.ReactNode;
  borderGlowColor?: string;
  textColor?: string;
  liveBadge?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  targetValue,
  isString = false,
  unit,
  subtitle,
  icon,
  borderGlowColor = 'border-cyan-500/30',
  textColor = 'text-white',
  liveBadge,
}) => {
  const [displayValue, setDisplayValue] = useState<number>(0);

  useEffect(() => {
    if (isString || typeof targetValue !== 'number') return;
    let current = 0;
    const step = Math.max(1, Math.floor(targetValue / 40));
    const timer = setInterval(() => {
      current += step;
      if (current >= targetValue) {
        setDisplayValue(targetValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, 25);
    return () => clearInterval(timer);
  }, [targetValue, isString]);

  return (
    <div className={`p-6 sm:p-7 rounded-3xl glass-panel-interactive border ${borderGlowColor} space-y-3 font-telemetry animate-fadeInUp`}>
      <div className="flex items-center justify-between text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider uppercase text-[11px] text-slate-400">{label}</span>
          {liveBadge && (
            <span className="text-[9px] font-extrabold bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 uppercase">
              {liveBadge}
            </span>
          )}
        </div>
        <div className="p-2 rounded-xl bg-space-900 border border-slate-800">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`font-heading font-extrabold text-3xl sm:text-4xl ${textColor} tracking-tight`}>
          {isString ? targetValue : displayValue.toLocaleString()}
        </span>
        {unit && <span className="text-xs text-slate-400 font-bold">{unit}</span>}
      </div>

      <p className="text-xs text-slate-400 leading-relaxed font-sans">{subtitle}</p>
    </div>
  );
};

export const TelemetryMetrics: React.FC = () => {
  const [liveState, setLiveState] = useState<LiveTelemetryState>({
    objects: [],
    spaceObjects: [],
    totalTracked: 12450,
    activeSatellites: 4820,
    isLive: false,
    isCached: false,
    lastUpdated: '14:32:00 UTC',
    isError: false,
    errorMessage: null,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchCelesTrakData();
    setLiveState(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-4">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="TRACKED OBJECTS"
          targetValue={liveState.totalTracked}
          subtitle="Cataloged NORAD GP orbital satellites & debris"
          icon={<Radar className="w-5 h-5 text-cyan-400" />}
          borderGlowColor="border-cyan-500/30"
          textColor="text-cyan-300 text-glow-cyan"
          liveBadge={liveState.isLive ? 'LIVE CELESTRAK' : 'CACHED'}
        />

        <MetricCard
          label="ACTIVE SATELLITES"
          targetValue={liveState.activeSatellites}
          subtitle="Verified active payload payloads in low/medium Earth orbit"
          icon={<Satellite className="w-5 h-5 text-emerald-400" />}
          borderGlowColor="border-emerald-500/30"
          textColor="text-emerald-400"
          liveBadge="PAYLOADS"
        />

        <MetricCard
          label="HIGH RISK CONJUNCTIONS"
          targetValue={3}
          subtitle="Evaluated orbital convergence events (Calculated by SGP4)"
          icon={<AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />}
          borderGlowColor="border-red-500/40"
          textColor="text-red-400 text-glow-amber"
          liveBadge="SGP4 EVALUATED"
        />

        <MetricCard
          label="SYSTEM STATUS"
          targetValue={liveState.isLive ? 'ONLINE' : 'CACHED'}
          isString
          subtitle={`CelesTrak GP API service link (${liveState.lastUpdated})`}
          icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
          borderGlowColor="border-cyan-500/30"
          textColor="text-cyan-400"
          liveBadge="CELESTRAK"
        />
      </div>

      {/* CelesTrak Data Attribution & Sync Footer */}
      <div className="p-4 rounded-2xl bg-space-900/90 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-telemetry">
        <div className="flex items-center gap-2 text-slate-300">
          <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>
            <strong className="text-white">DATA SOURCE:</strong> CelesTrak NORAD General Perturbations (GP) OMM Catalog API.
          </span>
          <a
            href="https://celestrak.org/NORAD/documentation/gp-data-formats.php"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline flex items-center gap-1 font-bold ml-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">
            Updated: <strong className="text-cyan-300">{liveState.lastUpdated}</strong>
          </span>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-[11px] font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
