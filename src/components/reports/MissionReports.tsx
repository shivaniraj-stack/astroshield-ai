import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Sparkles, 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar
} from 'lucide-react';

export const MissionReports: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportGenerated, setReportGenerated] = useState<boolean>(false);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportGenerated(false);

    setTimeout(() => {
      setIsGenerating(false);
      setReportGenerated(true);
    }, 1800);
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              MISSION REPORTS & TELEMETRY BRIEFS
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-400 mt-1">
            Automated SGP4 risk assessments, conjunction logs, and AI executive summaries.
          </p>
        </div>

        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-space-950 font-extrabold text-xs hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 text-space-950 animate-spin" />
              <span>SYNTHESIZING TELEMETRY REPORT...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-space-950" />
              <span>GENERATE AI EXECUTIVE REPORT</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/25 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                DAILY REPORT
              </span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mt-2">
              Daily Orbital Risk Briefing
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete SGP4 risk matrix across 12,450 cataloged space objects with 24h close approach breakdown.
            </p>
          </div>
          <button className="w-full py-2 px-3 rounded-xl bg-space-900 border border-cyan-500/30 text-cyan-300 text-xs font-telemetry hover:bg-cyan-950/40 flex items-center justify-center gap-2 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Brief</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/25 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                WEEKLY AUDIT
              </span>
              <AlertTriangle className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mt-2">
              Conjunction Severity History
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Historical covariance audit, miss distance distributions, and high-probability encounter trends.
            </p>
          </div>
          <button className="w-full py-2 px-3 rounded-xl bg-space-900 border border-cyan-500/30 text-cyan-300 text-xs font-telemetry hover:bg-cyan-950/40 flex items-center justify-center gap-2 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Telemetry</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/25 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                LOGS
              </span>
              <ShieldCheck className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white mt-2">
              Avoidance Maneuver Logs
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Verified thruster ΔV impulse execution records, propellant consumption metrics, and updated trajectories.
            </p>
          </div>
          <button className="w-full py-2 px-3 rounded-xl bg-space-900 border border-cyan-500/30 text-cyan-300 text-xs font-telemetry hover:bg-cyan-950/40 flex items-center justify-center gap-2 transition">
            <Download className="w-3.5 h-3.5" />
            <span>Download JSON Records</span>
          </button>
        </div>
      </div>

      {reportGenerated && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-400/50 shadow-2xl space-y-6 animate-fadeIn font-telemetry">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                  ASTROSHIELD AI GENERATED REPORT
                </span>
                <span className="text-xs text-slate-400">REF: ASTRO-RPT-2026-0815</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl text-white mt-1">
                EXECUTIVE SPACE TRAFFIC & RISK SUMMARY
              </h2>
            </div>
            
            <button
              onClick={() => window.print()}
              className="py-2 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export Brief</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">TOTAL TRACKED OBJECTS</span>
              <span className="font-bold text-white text-base">12,450</span>
            </div>
            <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ACTIVE CONJUNCTIONS</span>
              <span className="font-bold text-amber-400 text-base">03 Events</span>
            </div>
            <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">HIGHEST RISK EVENT</span>
              <span className="font-bold text-red-400 text-base">SAT-01 vs DEBRIS-482</span>
            </div>
            <div className="p-3 rounded-xl bg-space-900/90 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RECOMMENDED ACTION</span>
              <span className="font-bold text-emerald-400 text-base">Option B (Low ΔV)</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-space-900/80 border border-cyan-500/20 text-xs leading-relaxed text-slate-200 space-y-2">
            <h4 className="font-bold text-cyan-300 uppercase text-[11px]">
              AI EXECUTIVE DECISION BRIEFING
            </h4>
            <p>
              As of UTC 14:23:50, ASTROSHIELD AI monitored 12,450 active orbit track points. SGP4 covariance propagation identified one high-priority conjunction event requiring flight director intervention: <strong>SAT-01 vs DEBRIS-482</strong> at TCA T-18h 24m.
            </p>
            <p>
              Baseline un-maneuvered clearance predicts a miss distance of 14.2 km (collision probability P = 4.12 x 10⁻³). Avoidance Simulator evaluation recommends execution of <strong>Option B (Low ΔV Retrograde)</strong> at 14:09:12 UTC. This impulse increases miss distance clearance to 64.8 km while consuming less than 0.1% station-keeping thruster propellant.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
