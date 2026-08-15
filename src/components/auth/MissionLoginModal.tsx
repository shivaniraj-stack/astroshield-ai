import React, { useState } from 'react';
import type { UserSession } from '../../types/mission';
import { Shield, Lock, User, AlertCircle, ArrowRight, Radio } from 'lucide-react';

interface MissionLoginModalProps {
  onLoginSuccess: (session: UserSession) => void;
  onContinueDemo: () => void;
  onBackToSpace: () => void;
}

export const MissionLoginModal: React.FC<MissionLoginModalProps> = ({
  onLoginSuccess,
  onContinueDemo,
  onBackToSpace,
}) => {
  const [operatorId, setOperatorId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!operatorId.trim()) {
      setErrorMessage('Please enter your Mission Operator ID.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your secure password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      if (operatorId.toLowerCase() === 'admin' || operatorId.length >= 3) {
        const session: UserSession = {
          operatorId: operatorId,
          name: `Operator ${operatorId}`,
          role: 'Flight Operations Analyst',
          authenticatedAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
      } else {
        setErrorMessage('Authentication failed. Check your Mission Operator ID and password.');
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-xl animate-fadeIn">
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md glass-panel p-8 rounded-3xl border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.25)] space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[11px] font-telemetry text-emerald-400 font-bold tracking-wider uppercase">
              SYSTEM ONLINE
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            MISSION CONTROL ACCESS
          </h2>
          <p className="text-xs font-telemetry text-slate-400">
            ASTROSHIELD AI OPERATOR AUTHENTICATION
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-telemetry flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-telemetry text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold block text-[11px]">
              MISSION OPERATOR ID
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter operator ID (e.g. OP-4091)"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-900 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold block text-[11px]">
              SECURE PASSWORD
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-space-900 border border-cyan-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-space-900 text-cyan-400 focus:ring-0"
              />
              <span>Remember this device</span>
            </label>

            <button
              type="button"
              className="text-cyan-400 hover:underline text-[11px]"
              onClick={() => alert('For hackathon demonstration, click "Continue in Demo Mode" to access mission control instantly.')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-space-950 font-extrabold text-xs hover:bg-cyan-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] transition mt-2"
          >
            {isLoading ? (
              <>
                <Shield className="w-4 h-4 text-space-950 animate-spin" />
                <span>AUTHENTICATING OPERATOR...</span>
              </>
            ) : (
              <>
                <span>ENTER MISSION CONTROL</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-space-950 px-3 text-[10px] font-telemetry text-slate-500 uppercase">
            OR DEMO ACCESS
          </span>
        </div>

        <button
          onClick={onContinueDemo}
          className="w-full py-3 px-6 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-telemetry font-bold flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>CONTINUE IN DEMO MODE (INSTANT ACCESS)</span>
        </button>

        <div className="text-center pt-2">
          <button
            onClick={onBackToSpace}
            className="text-[11px] font-telemetry text-slate-400 hover:text-cyan-300 transition"
          >
            ← Back to Space Satellite View
          </button>
        </div>
      </div>
    </div>
  );
};
