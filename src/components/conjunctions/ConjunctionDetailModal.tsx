import React, { useEffect, useRef } from 'react';
import type { ConjunctionEvent } from '../../types/mission';
import { 
  X, 
  AlertTriangle, 
  Clock, 
  SlidersHorizontal, 
  Bot, 
  ShieldAlert
} from 'lucide-react';

interface ConjunctionDetailModalProps {
  event: ConjunctionEvent | null;
  onClose: () => void;
  onOpenCopilot: (query?: string) => void;
  onOpenSimulator: (satelliteId: string) => void;
}

export const ConjunctionDetailModal: React.FC<ConjunctionDetailModalProps> = ({
  event,
  onClose,
  onOpenCopilot,
  onOpenSimulator,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!event) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const w = (canvas.width = canvas.clientWidth);
      const h = (canvas.height = canvas.clientHeight);

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      const pathA = (t: number) => ({
        x: w * 0.15 + t * (w * 0.7),
        y: h * 0.7 - Math.sin(t * Math.PI) * (h * 0.4),
      });

      const pathB = (t: number) => ({
        x: w * 0.85 - t * (w * 0.7),
        y: h * 0.3 + Math.sin(t * Math.PI) * (h * 0.4),
      });

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.02) {
        const pt = pathA(t);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let t = 0; t <= 1; t += 0.02) {
        const pt = pathB(t);
        if (t === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      const intersectPoint = pathA(0.5);
      const pulse = 15 + Math.sin(time * 6) * 5;

      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.arc(intersectPoint.x, intersectPoint.y, pulse * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(intersectPoint.x, intersectPoint.y, pulse * 1.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const progress = (time * 0.15) % 1.0;
      const posA = pathA(progress);
      const posB = pathB(progress);

      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(posA.x, posA.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px JetBrains Mono';
      ctx.fillText('SAT-01', posA.x + 10, posA.y - 8);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(posB.x, posB.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillText('DEBRIS-482', posB.x + 10, posB.y + 16);

      if (Math.abs(progress - 0.5) < 0.15) {
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(posA.x, posA.y);
        ctx.lineTo(posB.x, posB.y);
        ctx.stroke();

        ctx.fillStyle = '#f59e0b';
        ctx.fillText(`${event.missDistanceKm} km`, (posA.x + posB.x) / 2 + 8, (posA.y + posB.y) / 2);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [event]);

  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl glass-panel p-6 sm:p-8 rounded-3xl border border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.2)] max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-space-850 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/50 text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-telemetry font-bold bg-red-950/80 text-red-400 px-2 py-0.5 rounded border border-red-500/40 uppercase">
                HIGH RISK CONJUNCTION ANALYSIS
              </span>
              <span className="text-xs font-telemetry text-slate-400">
                EVENT ID: {event.id.toUpperCase()}
              </span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl text-white mt-0.5">
              {event.primaryObject.name} vs {event.secondaryObject.name}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-xs font-telemetry">
          <div className="p-3.5 rounded-2xl bg-space-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">TIME TO APPROACH (TCA)</span>
            <div className="flex items-center gap-1.5 mt-1 text-cyan-300 font-bold text-base">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{event.tcaDisplay}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-space-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">PREDICTED SEPARATION</span>
            <div className="mt-1 font-extrabold text-base text-white">
              {event.missDistanceKm} km
            </div>
            <span className="text-[10px] text-slate-500">Radial: {event.radialSeparationKm} km</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-space-900/90 border border-slate-800">
            <span className="text-slate-400 block text-[11px]">COLLISION PROBABILITY</span>
            <div className="mt-1 font-extrabold text-base text-red-400">
              {event.collisionProbability}
            </div>
            <span className="text-[10px] text-red-400/80 font-bold">EXCEEDS SAFETY THRESHOLD</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40">
            <span className="text-red-300 block text-[11px]">CONJUNCTION RISK</span>
            <div className="mt-1 font-extrabold text-base text-red-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>HIGH (CRITICAL)</span>
            </div>
          </div>
        </div>

        <div className="my-6 p-4 rounded-2xl bg-space-900/80 border border-cyan-500/20">
          <p className="text-xs font-telemetry font-bold text-slate-400 uppercase tracking-wider mb-3">
            SGP4 CONJUNCTION TIMELINE SEQUENCE
          </p>

          <div className="relative flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-cyan-500 via-amber-500 to-red-500 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-cyan-500 text-space-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(0,240,255,0.8)]">
                1
              </div>
              <span className="text-[11px] font-telemetry text-cyan-300 font-bold mt-1.5">NOW</span>
              <span className="text-[9px] text-slate-400">Telemetry Active</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <span className="text-[11px] font-telemetry text-cyan-200 font-bold mt-1.5">PROPAGATION</span>
              <span className="text-[9px] text-slate-400">Covariance Calculated</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-space-950 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(245,158,11,0.8)]">
                3
              </div>
              <span className="text-[11px] font-telemetry text-amber-300 font-bold mt-1.5">CLOSE APPROACH</span>
              <span className="text-[9px] text-amber-400/80">TCA Window</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                4
              </div>
              <span className="text-[11px] font-telemetry text-red-400 font-bold mt-1.5">RISK WINDOW</span>
              <span className="text-[9px] text-red-400">Action Required</span>
            </div>
          </div>
        </div>

        <div className="my-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-telemetry text-slate-400">
              RELATIVE VECTOR ORBIT APPROACH SIMULATION
            </span>
            <span className="text-[10px] font-telemetry text-cyan-400">
              LEO Orbit Altitude 525.4 km
            </span>
          </div>
          <div className="w-full h-56 rounded-2xl bg-space-950 border border-cyan-500/30 overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onOpenCopilot('Analyze the highest-risk conjunction event SAT-01.');
            }}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-medium flex items-center justify-center gap-2 transition"
          >
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Consult AI Copilot</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenSimulator(event.primaryObject.id);
            }}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-amber-500 text-space-950 font-bold hover:bg-amber-400 text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Launch Avoidance Simulator</span>
          </button>
        </div>

      </div>
    </div>
  );
};
