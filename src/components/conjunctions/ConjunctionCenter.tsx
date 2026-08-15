import React, { useState } from 'react';
import type { ConjunctionEvent, RiskLevel } from '../../types/mission';
import { MOCK_CONJUNCTIONS } from '../../data/mockMissionData';
import { 
  AlertTriangle, 
  Search, 
  Zap, 
  SlidersHorizontal, 
  Clock, 
  CheckCircle2, 
  ShieldAlert
} from 'lucide-react';

interface ConjunctionCenterProps {
  onSelectConjunction: (event: ConjunctionEvent) => void;
  onOpenSimulator: (satelliteId: string) => void;
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
      event.secondaryObject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.primaryObject.noradId.toString().includes(searchTerm) ||
      event.secondaryObject.noradId.toString().includes(searchTerm);

    const matchesRisk =
      selectedRiskFilter === 'ALL' || event.riskLevel === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-telemetry font-bold bg-red-950/80 text-red-400 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            HIGH (CRITICAL)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-telemetry font-semibold bg-amber-950/80 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-3.5 h-3.5" />
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-telemetry font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            LOW
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              CONJUNCTION CENTER
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-400 mt-1">
            Real-time SGP4 orbit propagation & close approach risk telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Satellite / NORAD ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-space-900/90 border border-cyan-500/30 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 w-64"
            />
          </div>

          <div className="flex items-center gap-1 bg-space-900/80 p-1 rounded-xl border border-slate-800">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedRiskFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-telemetry transition ${
                  selectedRiskFilter === filter
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-panel border border-cyan-500/25 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-space-900/90 border-b border-cyan-500/20 text-[11px] font-telemetry text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-5">OBJECT A (PRIMARY)</th>
                <th className="py-4 px-5">OBJECT B (SECONDARY)</th>
                <th className="py-4 px-5">TCA (TIME TO APPROACH)</th>
                <th className="py-4 px-5">MISS DISTANCE</th>
                <th className="py-4 px-5">RISK LEVEL</th>
                <th className="py-4 px-5">STATUS</th>
                <th className="py-4 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs font-telemetry">
              {filteredEvents.map((event) => (
                <tr
                  key={event.id}
                  className={`hover:bg-space-850/80 transition-colors ${
                    event.riskLevel === 'HIGH' || event.riskLevel === 'CRITICAL'
                      ? 'bg-red-950/10'
                      : ''
                  }`}
                >
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">
                      {event.primaryObject.name}
                    </div>
                    <div className="text-[11px] text-cyan-400/80">
                      NORAD #{event.primaryObject.noradId} • {event.primaryObject.altitudeKm} km
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">
                      {event.secondaryObject.name}
                    </div>
                    <div className="text-[11px] text-red-400/80">
                      NORAD #{event.secondaryObject.noradId} • {event.secondaryObject.type}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{event.tcaDisplay}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      P(Collision): {event.collisionProbability}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="font-extrabold text-sm text-white">
                      {event.missDistanceKm} km
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Radial Δ: {event.radialSeparationKm} km
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    {getRiskBadge(event.riskLevel)}
                  </td>

                  <td className="py-4 px-5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-space-900 border border-slate-700 text-slate-300">
                      {event.status}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectConjunction(event)}
                        className="py-1.5 px-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-medium text-xs flex items-center gap-1 transition"
                      >
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ANALYZE</span>
                      </button>

                      {event.primaryObject.type !== 'DEBRIS' && (
                        <button
                          onClick={() => onOpenSimulator(event.primaryObject.id)}
                          className="py-1.5 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium text-xs flex items-center gap-1 transition"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                          <span>SIMULATE</span>
                        </button>
                      )}
                    </div>
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
