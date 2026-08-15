import React from 'react';
import type { MissionAlert } from '../../types/mission';
import { Bell, Check, X, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface MissionAlertCenterProps {
  alerts: MissionAlert[];
  onClose: () => void;
  onMarkAsReviewed: (alertId: string) => void;
  onSelectEvent?: (eventId: string) => void;
}

export const MissionAlertCenter: React.FC<MissionAlertCenterProps> = ({
  alerts,
  onClose,
  onMarkAsReviewed,
  onSelectEvent,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-space-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md glass-panel p-5 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="font-heading font-bold text-base text-white">
              MISSION ALERT CENTER
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-space-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 font-telemetry text-xs">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3.5 rounded-xl border transition-all ${
                alert.severity === 'HIGH'
                  ? 'bg-red-950/40 border-red-500/50 text-red-200'
                  : alert.severity === 'MEDIUM'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-space-900 border-slate-800 text-slate-300'
              } ${alert.reviewed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  {alert.severity === 'HIGH' && <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />}
                  {alert.severity === 'MEDIUM' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {alert.severity === 'SUCCESS' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <span className="text-white text-sm">{alert.title}</span>
                </div>
                <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
              </div>

              <p className="mt-1.5 leading-relaxed text-slate-300">{alert.description}</p>

              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                {alert.eventId && onSelectEvent ? (
                  <button
                    onClick={() => {
                      onClose();
                      onSelectEvent(alert.eventId!);
                    }}
                    className="text-cyan-400 hover:underline font-bold text-[11px]"
                  >
                    View Conjunction Event →
                  </button>
                ) : (
                  <span />
                )}

                {!alert.reviewed && (
                  <button
                    onClick={() => onMarkAsReviewed(alert.id)}
                    className="px-2 py-0.5 rounded bg-space-850 hover:bg-space-800 border border-slate-700 text-slate-300 text-[10px] flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Mark Reviewed</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
