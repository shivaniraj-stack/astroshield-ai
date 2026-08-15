import React, { useState } from 'react';
import type { ViewTab } from '../../types/mission';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  X, 
  Radio
} from 'lucide-react';

interface DemoStoryGuideProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  onTriggerConjunctionDetail: () => void;
  onTriggerCopilotQuery: () => void;
}

export const DemoStoryGuide: React.FC<DemoStoryGuideProps> = ({
  setActiveTab,
  onTriggerCopilotQuery,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [minimized, setMinimized] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      title: '1. Mission Overview',
      desc: 'Dashboard displays active telemetry (12,450 objects, 3 high-risk conjunctions).',
      actionText: 'Go to Dashboard',
      action: () => setActiveTab('dashboard'),
    },
    {
      step: 2,
      title: '2. High-Risk Conjunction',
      desc: 'Critical conjunction detected: SAT-01 vs DEBRIS-482 (T-18h 24m, 14.2 km).',
      actionText: 'Open Conjunctions',
      action: () => setActiveTab('conjunctions'),
    },
    {
      step: 3,
      title: '3. 3D Orbital Highlight',
      desc: 'Visualize 3D Earth, glowing orbits & target collision ring in WebGL.',
      actionText: 'Launch 3D Map',
      action: () => setActiveTab('map'),
    },
    {
      step: 4,
      title: '4. AI Copilot Decision Support',
      desc: 'Ask ASTROSHIELD Copilot for structured risk assessment & recommendation.',
      actionText: 'Consult AI Copilot',
      action: () => {
        setActiveTab('copilot');
        onTriggerCopilotQuery();
      },
    },
    {
      step: 5,
      title: '5. Avoidance Maneuver Simulator',
      desc: 'Compare Options A, B, C; execute thruster burn & see orbit morphing.',
      actionText: 'Launch Simulator',
      action: () => setActiveTab('copilot'),
    },
    {
      step: 6,
      title: '6. Executive Mission Report',
      desc: 'Synthesize telemetry brief & export AI flight director summary.',
      actionText: 'Generate Report',
      action: () => setActiveTab('reports'),
    },
  ];

  const stepData = steps[currentStep - 1];

  if (minimized) {
    return (
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-space-950 font-bold text-xs shadow-xl hover:bg-amber-400 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Demo Story Guide ({currentStep}/6)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-40 w-80 sm:w-96 glass-panel-amber p-4 rounded-2xl border border-amber-500/50 shadow-2xl space-y-3 font-telemetry animate-fadeIn">
      <div className="flex items-center justify-between border-b border-amber-500/30 pb-2">
        <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>HACKATHON DEMO STORY GUIDE</span>
        </div>
        
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-amber-400 font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
            STEP {currentStep} OF 6
          </span>
          <button
            onClick={() => setMinimized(true)}
            className="text-amber-300 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div>
        <h4 className="font-heading font-extrabold text-sm text-white">
          {stepData.title}
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {stepData.desc}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-amber-500/20">
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 text-xs"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
            disabled={currentStep === 6}
            className="p-1.5 rounded-lg bg-space-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-40 text-xs"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={stepData.action}
          className="py-1.5 px-3 rounded-xl bg-amber-500 text-space-950 font-extrabold text-xs hover:bg-amber-400 flex items-center gap-1 shadow-md transition"
        >
          <span>{stepData.actionText}</span>
          <Play className="w-3 h-3 fill-current" />
        </button>
      </div>
    </div>
  );
};
