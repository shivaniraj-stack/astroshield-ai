import React, { useState, useEffect } from 'react';
import { Radar, Satellite, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MetricCardProps {
  label: string;
  targetValue: number | string;
  isString?: boolean;
  unit?: string;
  subtitle: string;
  icon: React.ReactNode;
  borderGlowColor?: string;
  textColor?: string;
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
        <span className="font-bold tracking-wider uppercase text-[11px] text-slate-400">{label}</span>
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="TRACKED OBJECTS"
        targetValue={12450}
        subtitle="Cataloged active satellites & catalog debris"
        icon={<Radar className="w-5 h-5 text-cyan-400" />}
        borderGlowColor="border-cyan-500/30"
        textColor="text-cyan-300 text-glow-cyan"
      />

      <MetricCard
        label="ACTIVE SATELLITES"
        targetValue={4820}
        subtitle="Operational payloads under situational monitoring"
        icon={<Satellite className="w-5 h-5 text-emerald-400" />}
        borderGlowColor="border-emerald-500/30"
        textColor="text-emerald-400"
      />

      <MetricCard
        label="HIGH RISK CONJUNCTIONS"
        targetValue={3}
        subtitle="Conjunction events within 72h window"
        icon={<AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />}
        borderGlowColor="border-red-500/40"
        textColor="text-red-400 text-glow-amber"
      />

      <MetricCard
        label="SYSTEM HEALTH"
        targetValue="NOMINAL"
        isString
        subtitle="AI risk calculation engine SGP4 active"
        icon={<ShieldCheck className="w-5 h-5 text-cyan-400" />}
        borderGlowColor="border-cyan-500/30"
        textColor="text-cyan-400"
      />
    </div>
  );
};
