import React, { useState, useEffect, useRef } from 'react';
import type { ManeuverOption } from '../../types/mission';
import { MOCK_MANEUVER_OPTIONS } from '../../data/mockMissionData';
import { 
  SlidersHorizontal, 
  Zap, 
  CheckCircle2, 
  Info,
  Sparkles
} from 'lucide-react';

interface AvoidanceSimulatorProps {
  onGenerateReport?: () => void;
}

export const AvoidanceSimulator: React.FC<AvoidanceSimulatorProps> = ({
  onGenerateReport,
}) => {
  const [selectedOption, setSelectedOption] = useState<ManeuverOption>(MOCK_MANEUVER_OPTIONS[1]);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionSuccess, setExecutionSuccess] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.025;
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const earthR = 60;

      ctx.fillStyle = '#060f26';
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 140, 110, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      const offsetR = selectedOption.orbitOffsetRadius * 50;
      const satRadiusX = 140 + offsetR;
      const satRadiusY = 110 + offsetR * 0.7;

      ctx.setLineDash([]);
      ctx.strokeStyle = selectedOption.id === 'OPTION_A' ? '#ef4444' : '#00f0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, cy, satRadiusX, satRadiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      const debrisAngle = time * 0.8;
      const dx = cx + 140 * Math.cos(debrisAngle + Math.PI / 6);
      const dy = cy + 110 * Math.sin(debrisAngle + Math.PI / 6);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(dx, dy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('DEBRIS-482', dx + 8, dy - 6);

      const satAngle = time * 0.8;
      const sx = cx + satRadiusX * Math.cos(satAngle);
      const sy = cy + satRadiusY * Math.sin(satAngle);

      ctx.fillStyle = selectedOption.id === 'OPTION_A' ? '#ef4444' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('SAT-01', sx + 10, sy + 14);

      if (selectedOption.id === 'OPTION_A') {
        const pulse = 12 + Math.sin(time * 8) * 4;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx + 120, cy - 40, pulse, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText('COLLISION POINT', cx + 135, cy - 40);
      } else {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx + 120, cy - 40);
        ctx.lineTo(cx + 120 + offsetR, cy - 40 - offsetR);
        ctx.stroke();

        ctx.fillStyle = '#10b981';
        ctx.fillText(`+${selectedOption.predictedMissDistanceKm} km`, cx + 125 + offsetR, cy - 45 - offsetR);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedOption]);

  const handleExecuteManeuver = () => {
    setIsExecuting(true);
    setExecutionSuccess(false);

    setTimeout(() => {
      setIsExecuting(false);
      setExecutionSuccess(true);
    }, 1500);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              AVOIDANCE MANEUVER SIMULATOR
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-400 mt-1">
            Simulate thruster ΔV impulses & evaluate trajectory clearance for SAT-01.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 text-xs font-telemetry">
          <Info className="w-4 h-4 text-amber-400" />
          <span>PROTOTYPE SIMULATION MODE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-telemetry font-bold text-slate-400 uppercase tracking-wider">
            SELECT SIMULATED MANEUVER STRATEGY
          </h2>

          {MOCK_MANEUVER_OPTIONS.map((opt) => {
            const isSelected = selectedOption.id === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => {
                  setSelectedOption(opt);
                  setExecutionSuccess(false);
                }}
                className={`p-5 rounded-2xl cursor-pointer transition-all border ${
                  isSelected
                    ? opt.id === 'OPTION_A'
                      ? 'glass-panel-danger border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.25)]'
                      : 'glass-panel border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.25)]'
                    : 'glass-panel-interactive border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`text-[10px] font-telemetry font-bold px-2 py-0.5 rounded border uppercase ${
                      opt.id === 'OPTION_A'
                        ? 'bg-red-950/80 text-red-400 border-red-500/40'
                        : opt.id === 'OPTION_B'
                        ? 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
                        : 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                    }`}>
                      {opt.title}
                    </span>
                    <h3 className="font-heading font-extrabold text-base text-white mt-1.5">
                      {opt.subTitle}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-telemetry text-slate-400 block">RISK</span>
                    <span className={`font-extrabold text-sm font-telemetry ${
                      opt.riskLevel === 'HIGH' ? 'text-red-400' : opt.riskLevel === 'LOW' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {opt.riskPercentage}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                  {opt.description}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-xs font-telemetry">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ΔV REQUIRED</span>
                    <span className="font-bold text-white">{opt.deltaV}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PREDICTED MISS</span>
                    <span className="font-bold text-cyan-400">{opt.predictedMissDistanceKm} km</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full h-80 rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden">
            <div className="absolute top-4 left-4 z-10 text-xs font-telemetry text-cyan-400 bg-space-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/20">
              ORBIT TRAJECTORY DEFLECTION PREVIEW
            </div>
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/25 space-y-4">
            <h3 className="text-xs font-telemetry font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>BEFORE VS AFTER TELEMETRY COMPARISON</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-telemetry">
              <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">PARAMETER</span>
                <span className="font-bold text-white block mt-1">Miss Distance</span>
                <span className="font-bold text-white block">Collision Risk</span>
                <span className="font-bold text-white block">Thruster Propellant</span>
              </div>

              <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30">
                <span className="text-red-400 block font-bold text-[10px]">BEFORE (BASELINE)</span>
                <span className="text-slate-300 block mt-1">14.2 km</span>
                <span className="text-red-400 font-bold block">94.2% (HIGH)</span>
                <span className="text-slate-300 block">0.0 kg</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                <span className="text-emerald-400 block font-bold text-[10px]">AFTER ({selectedOption.id})</span>
                <span className="text-cyan-300 font-bold block mt-1">{selectedOption.predictedMissDistanceKm} km</span>
                <span className="text-emerald-400 font-bold block">{selectedOption.riskPercentage}% ({selectedOption.riskLevel})</span>
                <span className="text-slate-300 block">{selectedOption.fuelCost}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] font-telemetry text-slate-400">
                Execution Window: {selectedOption.executionTimeUtc}
              </span>

              <button
                onClick={handleExecuteManeuver}
                disabled={isExecuting || selectedOption.id === 'OPTION_A'}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 text-space-950 font-extrabold text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition"
              >
                {isExecuting ? (
                  <>
                    <Zap className="w-4 h-4 text-space-950 animate-spin" />
                    <span>UPLINKING THRUSTER COMMANDS...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-space-950" />
                    <span>UPLINK SIMULATED MANEUVER COMMAND</span>
                  </>
                )}
              </button>
            </div>

            {executionSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs font-telemetry flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Maneuver burn sequence verified! SAT-01 predicted miss distance updated to +{selectedOption.predictedMissDistanceKm} km.</span>
                </div>
                {onGenerateReport && (
                  <button
                    onClick={onGenerateReport}
                    className="underline hover:text-white font-bold ml-2 whitespace-nowrap"
                  >
                    Generate Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
