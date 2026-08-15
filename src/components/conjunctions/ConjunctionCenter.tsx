import React, { useState } from 'react';
import type { ConjunctionEvent, RiskLevel } from '../../types/mission';
import { MOCK_CONJUNCTIONS } from '../../data/mockMissionData';
import { 
  AlertTriangle, 
  Search, 
  Clock, 
  ShieldAlert
} from 'lucide-react';

interface ConjunctionCenterProps {
  onSelectConjunction: (event: ConjunctionEvent) => void;
  onOpenSimulator: (satId: string) => void;
}

export const ConjunctionCenter: React.FC<ConjunctionCenterProps> = ({
  onSelectConjunction,
  onOpenSimulator,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');

  const filteredEvents = MOCK_CONJUNCTIONS.filter((event) => {
    const matchesSearch =
      event.primaryObject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.secondaryObject.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk =
      selectedRiskFilter === 'ALL' || event.riskLevel === selectedRiskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'HIGH':
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-telemetry font-bold bg-red-950/80 text-red-400 border border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] whitespace-nowrap">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-telemetry font-bold bg-amber-950/80 text-amber-300 border border-amber-500/50 whitespace-nowrap">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg text-xs font-telemetry font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 whitespace-nowrap">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950 border border-red-500/40 text-red-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              CONJUNCTION ANALYSIS CENTER
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-300 mt-2 leading-relaxed max-w-2xl">
            Real-time orbital convergence tracking, close-approach assessment, and automated collision probability calculations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-red-950/40 px-4 py-2 rounded-xl border border-red-500/40 text-red-300 text-xs font-telemetry font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="w-4 h-4 text-red-400 animate-bounce shrink-0" />
            <span>3 HIGH RISK EVENTS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 font-telemetry">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search satellite or debris name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-space-900 border border-cyan-500/30 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-bold hidden md:inline shrink-0">FILTER RISK:</span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRiskFilter(risk)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedRiskFilter === risk
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : 'bg-space-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Conjunction Telemetry Data Table with Horizontal Scroll Wrapper */}
      <div className="rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left border-collapse font-telemetry">
            <thead>
              <tr className="border-b border-cyan-500/20 bg-space-900/90 text-[11px] text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">PRIMARY OBJECT</th>
                <th className="py-4 px-6">SECONDARY OBJECT</th>
                <th className="py-4 px-6">TCA (CLOSEST APPROACH)</th>
                <th className="py-4 px-6">MISS DISTANCE</th>
                <th className="py-4 px-6">COLLISION PROB.</th>
                <th className="py-4 px-6">RISK LEVEL</th>
                <th className="py-4 px-6 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-space-850/60 transition group"
                >
                  <td className="py-4 px-6">
                    <span className="font-extrabold text-white block text-sm">
                      {event.primaryObject.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      NORAD #{event.primaryObject.noradId} • {event.primaryObject.type}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-bold text-red-300 block text-sm">
                      {event.secondaryObject.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      NORAD #{event.secondaryObject.noradId} • {event.secondaryObject.type}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{event.tcaDisplay}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">TCA: {event.tcaHours}h</span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`font-extrabold text-sm ${
                      event.riskLevel === 'HIGH' ? 'text-red-400' : 'text-amber-300'
                    }`}>
                      {event.missDistanceKm} km
                    </span>
                    <span className="text-[10px] text-slate-400 block">Relative sep.</span>
                  </td>

                  <td className="py-4 px-6">
                    <span className={`font-extrabold text-sm ${
                      event.collisionProbabilityVal > 0.001 ? 'text-red-400' : 'text-amber-300'
                    }`}>
                      {event.collisionProbability}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Prob. Score</span>
                  </td>

                  <td className="py-4 px-6">
                    {getRiskBadge(event.riskLevel)}
                  </td>

                  <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => onSelectConjunction(event)}
                      className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-bold transition"
                    >
                      Analyze
                    </button>

                    <button
                      onClick={() => onOpenSimulator(event.primaryObject.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold transition"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
