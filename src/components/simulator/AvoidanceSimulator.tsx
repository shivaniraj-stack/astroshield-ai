import React, { useState, useEffect, useRef } from 'react';
import type { ManeuverOption } from '../../types/mission';
import { MOCK_MANEUVER_OPTIONS } from '../../data/mockMissionData';
import { 
  SlidersHorizontal, 
  Zap, 
  CheckCircle2, 
  Info,
  Sparkles,
  Play,
  Pause,
  Clock,
  RotateCcw
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
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simTimeSeconds, setSimTimeSeconds] = useState<number>(2535); // T+00:42:15

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Time simulation clock effect
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimTimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatSimTime = (totalSeconds: number) => {
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `T+${hrs}:${mins}:${secs}`;
  };

  // Physically-driven Keplerian Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let animTime = 0;

    const render = () => {
      if (isPlaying) {
        animTime += 0.015;
      }

      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      // Grid Overlay
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Earth Core Mesh
      const earthR = 50;
      ctx.fillStyle = '#060f26';
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Parametric Keplerian Ellipse Function
      const getKeplerianPoint = (
        theta: number,
        a: number,
        b: number,
        tiltRad: number
      ) => {
        const unrotatedX = a * Math.cos(theta);
        const unrotatedY = b * Math.sin(theta);
        const x = cx + (unrotatedX * Math.cos(tiltRad) - unrotatedY * Math.sin(tiltRad));
        const y = cy + (unrotatedX * Math.sin(tiltRad) + unrotatedY * Math.cos(tiltRad));
        return { x, y };
      };

      // 1. DEBRIS ORBIT TRAJECTORY (Red Dashed Keplerian Ellipse)
      const debrisA = 145;
      const debrisB = 105;
      const debrisTilt = (25 * Math.PI) / 180;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const pt = getKeplerianPoint(t, debrisA, debrisB, debrisTilt);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // 2. SATELLITE TRAJECTORY (Baseline vs Maneuvered Deflection)
      const isBaseline = selectedOption.id === 'OPTION_A';
      const offsetA = selectedOption.orbitOffsetRadius * 55;
      const satA = 135 + offsetA;
      const satB = 95 + offsetA * 0.7;
      const satTilt = (-15 * Math.PI) / 180;

      ctx.setLineDash([]);
      ctx.strokeStyle = isBaseline ? '#ef4444' : '#00f0ff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      for (let t = 0; t <= Math.PI * 2; t += 0.05) {
        const pt = getKeplerianPoint(t, satA, satB, satTilt);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Calculate Current Positions based on Simulation Time
      const debrisAngle = animTime * 0.6 + Math.PI / 4;
      const satAngle = animTime * 0.6 + Math.PI / 4;

      const posDebris = getKeplerianPoint(debrisAngle, debrisA, debrisB, debrisTilt);
      const posSat = getKeplerianPoint(satAngle, satA, satB, satTilt);

      // Render Debris Object Marker
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(posDebris.x, posDebris.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('DEBRIS-482', posDebris.x + 8, posDebris.y - 6);

      // Render Satellite Object Marker
      ctx.fillStyle = isBaseline ? '#ef4444' : '#00f0ff';
      ctx.beginPath();
      ctx.arc(posSat.x, posSat.y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('SAT-01', posSat.x + 10, posSat.y + 14);

      // Render Separation Vector Line & Predicted Miss Distance
      ctx.strokeStyle = isBaseline ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(posSat.x, posSat.y);
      ctx.lineTo(posDebris.x, posDebris.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label Clearance Distance Vector
      const midX = (posSat.x + posDebris.x) / 2;
      const midY = (posSat.y + posDebris.y) / 2;

      ctx.fillStyle = isBaseline ? '#ef4444' : '#10b981';
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.fillText(`${selectedOption.predictedMissDistanceKm} km`, midX + 8, midY - 6);

      // Collision Highlight Pulse if Option A
      if (isBaseline) {
        const pulse = 14 + Math.sin(animTime * 8) * 4;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(midX, midY, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [selectedOption, isPlaying]);

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
      
      {/* Header Banner */}
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

        <div className="flex items-center gap-2 bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 text-xs font-telemetry font-bold">
          <Info className="w-4 h-4 text-amber-400" />
          <span>PHYSICAL SGP4 ORBITAL SIMULATION ENGINE (PROTOTYPE)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Options */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-xs font-telemetry font-bold text-slate-400 uppercase tracking-wider">
            SELECT MANEUVER TACTIC
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

        {/* Right 7 Cols: Physics-Driven Orbit Canvas & Controls */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Canvas Wrapper */}
          <div className="relative w-full h-80 rounded-2xl glass-panel border border-cyan-500/30 overflow-hidden">
            
            {/* Top Toolbar overlay */}
            <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between font-telemetry text-xs">
              <div className="text-cyan-400 bg-space-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold">{formatSimTime(simTimeSeconds)}</span>
                <span className="text-[10px] text-slate-400">(14:32:15 UTC)</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-xl bg-space-900/90 border border-cyan-500/30 text-cyan-300 hover:border-cyan-400 flex items-center gap-1.5 transition"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Resume</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSimTimeSeconds(2535)}
                  className="p-1.5 rounded-xl bg-space-900/90 border border-slate-700 text-slate-400 hover:text-white"
                  title="Reset Simulation Time"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          {/* Before vs After Telemetry Comparison Card */}
          <div className="p-5 rounded-2xl glass-panel border border-cyan-500/25 space-y-4 font-telemetry">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>BEFORE VS AFTER TELEMETRY COMPARISON</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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

            {/* Execution Trigger */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
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
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
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
