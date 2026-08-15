import React, { useState } from 'react';
import type { AICopilotMessage, StructuredAIResponse } from '../../types/mission';
import { INITIAL_COPILOT_MESSAGES } from '../../data/mockMissionData';
import { 
  Bot, 
  Send, 
  Sparkles, 
  SlidersHorizontal, 
  Info
} from 'lucide-react';

interface AICopilotProps {
  onOpenSimulator?: (satelliteId: string) => void;
  onSelectConjunction?: (eventId: string) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  onOpenSimulator,
}) => {
  const [messages, setMessages] = useState<AICopilotMessage[]>(INITIAL_COPILOT_MESSAGES);
  const [inputValue, setInputValue] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const suggestedQuestions = [
    { label: '🚀 Analyze highest-risk conjunction', query: 'Analyze the highest-risk conjunction event.' },
    { label: '🛡️ Why is SAT-01 at risk?', query: 'Why is SAT-01 at risk?' },
    { label: '⚡ Compare available maneuver options', query: 'Compare available maneuver options for SAT-01.' },
    { label: '📡 Show today\'s critical events', query: 'Show today\'s critical orbital events.' },
    { label: '☀️ Space-weather status', query: 'What is the current space-weather status?' },
  ];

  const handleSendMessage = (textToSend?: string) => {
    const promptText = textToSend || inputValue;
    if (!promptText.trim()) return;

    const userMsg: AICopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsAnalyzing(true);

    setTimeout(() => {
      let aiText = '';
      let structured: StructuredAIResponse | undefined = undefined;

      const lowerPrompt = promptText.toLowerCase();

      if (lowerPrompt.includes('highest-risk') || lowerPrompt.includes('sat-01')) {
        aiText = 'SAT-01 (Sentinel-X) is experiencing a high-risk close approach with DEBRIS-482 (SL-16 R/B Frag) at TCA T-18h 24m. Predicted miss distance is 14.2 km with a radial clearance of only 0.32 km.';
        structured = {
          riskAssessment: 'HIGH',
          reason: 'Predicted miss distance (14.2 km) is below the configured safety threshold (15.0 km) with high radial covariance.',
          recommendation: 'Execute Low ΔV Retrograde Maneuver (Option B) at 14:09:12 UTC to increase separation to +64.8 km.',
          confidence: 92,
          eventId: 'conj-01',
          maneuverOptionRecommended: 'OPTION_B',
        };
      } else if (lowerPrompt.includes('maneuver') || lowerPrompt.includes('compare')) {
        aiText = 'I have evaluated 3 maneuver trajectories for SAT-01. Option B (Low ΔV Retrograde) provides the optimal balance of fuel consumption (0.1%) and risk reduction (94.2% -> 4.1%).';
        structured = {
          riskAssessment: 'HIGH',
          reason: 'Baseline trajectory (Option A) maintains unacceptable collision risk (P = 4.12 x 10⁻³).',
          recommendation: 'Option B is recommended. Option C offers 142.0 km clearance but consumes 4x more propellant.',
          confidence: 96,
          eventId: 'conj-01',
          maneuverOptionRecommended: 'OPTION_B',
        };
      } else if (lowerPrompt.includes('weather') || lowerPrompt.includes('solar')) {
        aiText = 'Current space weather is NOMINAL. Solar K-index is 2.4, Geomagnetic Kp index is 3.0, and Solar Wind velocity is 412.5 km/s. Atmospheric density drag at 525 km LEO altitude is stable.';
        structured = {
          riskAssessment: 'LOW',
          reason: 'No solar flare (X-class/M-class) or coronal mass ejections detected in past 24 hours.',
          recommendation: 'Standard orbital tracking. Atmospheric drag model requires no high-altitude correction.',
          confidence: 98,
        };
      } else {
        aiText = `Analyzing orbital telemetry for "${promptText}". All active SGP4 tracking nodes report nominal tracking with 12,450 cataloged space objects monitored.`;
        structured = {
          riskAssessment: 'LOW',
          reason: 'Query processed against real-time NORAD TLE catalog.',
          recommendation: 'Continue monitoring active conjunction review windows.',
          confidence: 89,
        };
      }

      const copilotMsg: AICopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
        text: aiText,
        structuredResponse: structured,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsAnalyzing(false);
    }, 1000);
  };

  return (
    <div className="w-full h-[calc(100vh-6rem)] flex flex-col glass-panel rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl">
      
      <div className="p-4 bg-space-900/90 border-b border-cyan-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-400/40">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-base text-white">
                ASTROSHIELD COPILOT
              </h2>
              <span className="text-[10px] font-telemetry bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                AI MISSION DECISION SUPPORT
              </span>
            </div>
            <p className="text-[11px] font-telemetry text-slate-400">
              SGP4 Perturbation & Covariance Analysis Engine
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-telemetry text-cyan-400 bg-space-950/80 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>CONFIDENCE SCORE: 92%</span>
        </div>
      </div>

      <div className="p-3 bg-space-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-telemetry text-slate-400 whitespace-nowrap">
          QUICK PROMPTS:
        </span>
        {suggestedQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(sq.query)}
            disabled={isAnalyzing}
            className="px-2.5 py-1 rounded-lg bg-space-900 border border-cyan-500/20 text-[11px] font-telemetry text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/40 whitespace-nowrap transition"
          >
            {sq.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 font-sans">
        {messages.map((msg) => {
          const isCopilot = msg.sender === 'copilot';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                isCopilot ? 'justify-start' : 'justify-end'
              }`}
            >
              {isCopilot && (
                <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                  isCopilot
                    ? 'bg-space-900/90 border border-cyan-500/25 text-slate-200 shadow-lg'
                    : 'bg-cyan-600/30 border border-cyan-400/40 text-cyan-100'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-telemetry text-slate-400 mb-1.5 border-b border-slate-800/60 pb-1">
                  <span className="font-bold">
                    {isCopilot ? 'ASTROSHIELD AI ASSISTANT' : 'COMMAND OPERATOR'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <p className="whitespace-pre-line">{msg.text}</p>

                {msg.structuredResponse && (
                  <div className="mt-4 p-4 rounded-xl bg-space-950 border border-cyan-500/30 font-telemetry text-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-bold">
                        STRUCTURED RISK ASSESSMENT
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        msg.structuredResponse.riskAssessment === 'HIGH'
                          ? 'bg-red-950 text-red-400 border border-red-500/50'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                      }`}>
                        RISK: {msg.structuredResponse.riskAssessment}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">REASON</span>
                      <p className="text-slate-200 text-xs mt-0.5">
                        {msg.structuredResponse.reason}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">RECOMMENDATION</span>
                      <p className="text-cyan-300 font-bold text-xs mt-0.5">
                        {msg.structuredResponse.recommendation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-[10px] text-slate-400">
                        CONFIDENCE: {msg.structuredResponse.confidence}%
                      </span>

                      {onOpenSimulator && msg.structuredResponse.eventId && (
                        <button
                          onClick={() => onOpenSimulator('sat-01')}
                          className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-bold flex items-center gap-1 transition"
                        >
                          <SlidersHorizontal className="w-3 h-3 text-amber-400" />
                          <span>Execute Avoidance Simulator</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isAnalyzing && (
          <div className="flex items-center gap-3 text-xs font-telemetry text-cyan-400 animate-pulse">
            <Bot className="w-5 h-5 text-cyan-400 animate-spin" />
            <span>Processing orbital covariance and SGP4 trajectory vectors...</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-space-900/90 border-t border-cyan-500/20 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask ASTROSHIELD Copilot about conjunctions, maneuvers, or space weather..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isAnalyzing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-space-950 border border-cyan-500/30 text-xs font-telemetry text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <button
            type="submit"
            disabled={isAnalyzing || !inputValue.trim()}
            className="py-2.5 px-5 rounded-xl bg-cyan-500 text-space-950 font-bold hover:bg-cyan-400 disabled:opacity-50 text-xs flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

        <div className="flex items-center gap-1.5 text-[10px] font-telemetry text-slate-400 justify-center">
          <Info className="w-3 h-3 text-amber-400 shrink-0" />
          <span>
            <strong className="text-amber-400">IMPORTANT:</strong> AI recommendations serve strictly as <span className="underline">decision support</span> and require human flight-director authorization prior to command uplink.
          </span>
        </div>
      </div>

    </div>
  );
};
