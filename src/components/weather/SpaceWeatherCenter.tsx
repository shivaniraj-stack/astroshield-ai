import React from 'react';
import { MOCK_SPACE_WEATHER, SPACE_WEATHER_HISTORY } from '../../data/mockMissionData';
import { 
  Sun, 
  Wind, 
  ShieldCheck, 
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const SpaceWeatherCenter: React.FC = () => {
  const weather = MOCK_SPACE_WEATHER;

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-400 animate-pulse" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              SPACE WEATHER CENTER
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-400 mt-1">
            Heliospheric solar wind monitoring, Kp geomagnetic flux & upper-atmosphere LEO drag telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-telemetry">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>CURRENT STATUS: NORMAL</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-telemetry text-slate-400">SOLAR K-INDEX</span>
            <Sun className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-white">{weather.solarKIndex}</span>
            <span className="text-xs font-telemetry text-emerald-400 font-bold">NORMAL (0-9)</span>
          </div>
          <div className="w-full bg-space-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full w-[26%]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-telemetry text-slate-400">GEOMAGNETIC KP</span>
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-white">{weather.geomagneticKp}</span>
            <span className="text-xs font-telemetry text-emerald-400 font-bold">STABLE</span>
          </div>
          <div className="w-full bg-space-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full w-[33%]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-telemetry text-slate-400">SOLAR WIND SPEED</span>
            <Wind className="w-5 h-5 text-cyan-300 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-white">{weather.solarWindKmS}</span>
            <span className="text-xs font-telemetry text-slate-400">km/s</span>
          </div>
          <div className="w-full bg-space-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div className="bg-cyan-400 h-full w-[41%]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-telemetry text-slate-400">RADIATION RISK</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-emerald-400">{weather.radiationRisk}</span>
            <span className="text-xs font-telemetry text-slate-400">NOMINAL</span>
          </div>
          <div className="w-full bg-space-900 rounded-full h-2 mt-3 overflow-hidden border border-slate-800">
            <div className="bg-emerald-400 h-full w-[15%]" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading font-extrabold text-lg text-white">
              24-HOUR HELIOSPHERIC & DRAG TREND
            </h3>
            <p className="text-xs font-telemetry text-slate-400">
              Solar wind speed (km/s) & geomagnetic Kp index propagation.
            </p>
          </div>
          <span className="text-xs font-telemetry text-cyan-400 bg-cyan-950/50 px-2.5 py-1 rounded border border-cyan-500/30">
            {weather.lastUpdated}
          </span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={SPACE_WEATHER_HISTORY}>
              <defs>
                <linearGradient id="solarWindGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56, 189, 248, 0.1)" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#060b18',
                  borderColor: '#38bdf8',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                }}
              />
              <Area
                type="monotone"
                dataKey="solarWind"
                name="Solar Wind (km/s)"
                stroke="#00f0ff"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#solarWindGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-space-900/90 border border-emerald-500/30 text-xs font-telemetry flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <p className="font-bold text-white text-sm">NO CRITICAL SPACE WEATHER ALERTS</p>
            <p className="text-slate-400 mt-0.5">
              Atmospheric drag parameters normal. Satellite orbital decay models operating within nominal variance.
            </p>
          </div>
        </div>
        <span className="text-cyan-400 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-500/20 text-[10px] hidden sm:block">
          NOAA SWPC SYNCED
        </span>
      </div>
    </div>
  );
};
