import React, { useState, useEffect } from 'react';
import { Radar, Satellite, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MetricCardProps {
  label: string;
  targetValue: number | string;
  isString?: boolean;
  unit?: string;
  icon: React.ReactNode;
  statusColor: 'cyan' | 'emerald' | 'amber' | 'red';
  subText: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  targetValue,
  isString = false,
  unit,
  icon,
  statusColor,
  subText,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (isString || typeof targetValue !== 'number') return;
    let start = 0;
    const duration = 1500;
    const steps = 40;
    const increment = targetValue / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [targetValue, isString]);

  const colorStyles = {
    cyan: 'border-cyan-500/30 hover:border-cyan-400 text-cyan-400 bg-cyan-950/20 shadow-[0_0_20px_rgba(0,240,255,0.1)]',
    emerald: 'border-emerald-500/30 hover:border-emerald-400 text-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    amber: 'border-amber-500/40 hover:border-amber-400 text-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    red: 'border-red-500/40 hover:border-red-400 text-red-400 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  };

  return (
    <div className={`relative p-5 rounded-2xl border backdrop-blur-xl transition-all duration-300 ${colorStyles[statusColor]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-telemetry uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              {isString
                ? targetValue
                : count.toLocaleString('en-US')}
            </span>
            {unit && <span className="text-xs font-telemetry text-slate-400">{unit}</span>}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-space-900/80 border border-slate-700/50">
          {icon}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] font-telemetry">
        <span className="text-slate-400">{subText}</span>
        <span className="text-cyan-400/80 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
          DEMO DATA
        </span>
      </div>
    </div>
  );
};

export const TelemetryMetrics: React.FC = () => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        label="TRACKED OBJECTS"
        targetValue={12450}
        icon={<Radar className="w-6 h-6 text-cyan-400 animate-pulse" />}
        statusColor="cyan"
        subText="Cataloged orbital bodies"
      />
      <MetricCard
        label="ACTIVE SATELLITES"
        targetValue={5820}
        icon={<Satellite className="w-6 h-6 text-emerald-400" />}
        statusColor="emerald"
        subText="Operational payloads in LEO/GEO"
      />
      <MetricCard
        label="HIGH-RISK CONJUNCTIONS"
        targetValue="03"
        isString={true}
        icon={<AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />}
        statusColor="amber"
        subText="Critical review required (<15km)"
      />
      <MetricCard
        label="SYSTEM STATUS"
        targetValue="NOMINAL"
        isString={true}
        icon={<ShieldCheck className="w-6 h-6 text-emerald-400" />}
        statusColor="emerald"
        subText="SGP4 Propagator 100% active"
      />
    </section>
  );
};
