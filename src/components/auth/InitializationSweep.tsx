import React, { useEffect, useState } from 'react';
import { Shield, CheckCircle2, Radio } from 'lucide-react';

interface InitializationSweepProps {
  onComplete: () => void;
}

export const InitializationSweep: React.FC<InitializationSweepProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState<number>(0);

  const subsystems = [
    'ORBITAL DATA CATALOG',
    'AI RISK ENGINE (SGP4)',
    'SPACE WEATHER TELEMETRY',
    'SATELLITE TELEMETRY (ESP32)',
    'ASTROSHIELD MISSION CONTROL',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < subsystems.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return prev;
        }
      });
    }, 280);

    return () => clearInterval(interval);
  }, [subsystems.length, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/95 backdrop-blur-2xl animate-fadeIn">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-cyan-400/50 shadow-[0_0_60px_rgba(0,240,255,0.3)] text-center space-y-6">
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-950 border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.5)]">
          <Shield className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>

        <div>
          <span className="text-xs font-telemetry font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40 uppercase tracking-wider">
            AUTHENTICATION SUCCESSFUL
          </span>
          <h2 className="font-heading font-extrabold text-xl text-white mt-3">
            INITIALIZING MISSION CONTROL...
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-space-900/90 border border-slate-800 space-y-2.5 font-telemetry text-xs text-left">
          {subsystems.map((sub, idx) => {
            const isOnline = idx < stepIndex;
            const isCurrent = idx === stepIndex;

            return (
              <div
                key={sub}
                className={`flex items-center justify-between transition-all duration-200 ${
                  isOnline
                    ? 'text-cyan-300'
                    : isCurrent
                    ? 'text-amber-400 animate-pulse'
                    : 'text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isOnline ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Radio className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span className="font-bold">{sub}</span>
                </div>

                <span className="font-mono text-[11px]">
                  {isOnline ? 'ONLINE' : isCurrent ? 'CONNECTING...' : 'WAITING'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-space-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${(stepIndex / subsystems.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
