import React, { useState } from 'react';
import type { ViewTab, ConjunctionEvent, MissionAlert, UserSession } from './types/mission';
import { INITIAL_ALERTS, MOCK_CONJUNCTIONS } from './data/mockMissionData';
import { SpaceBackground } from './components/layout/SpaceBackground';
import { Navbar } from './components/layout/Navbar';
import { HeroSection } from './components/dashboard/HeroSection';
import { TelemetryMetrics } from './components/dashboard/TelemetryMetrics';
import { OrbitalEarthView } from './components/3d/OrbitalEarthView';
import { ConjunctionCenter } from './components/conjunctions/ConjunctionCenter';
import { ConjunctionDetailModal } from './components/conjunctions/ConjunctionDetailModal';
import { AICopilot } from './components/copilot/AICopilot';
import { AvoidanceSimulator } from './components/simulator/AvoidanceSimulator';
import { SpaceWeatherCenter } from './components/weather/SpaceWeatherCenter';
import { SatelliteHealthModule } from './components/iot/SatelliteHealthModule';
import { MissionReports } from './components/reports/MissionReports';
import { MissionAlertCenter } from './components/alerts/MissionAlertCenter';
import { MissionControlPanel } from './components/dashboard/MissionControlPanel';
import { SatelliteLandingView } from './components/landing/SatelliteLandingView';
import { MissionLoginModal } from './components/auth/MissionLoginModal';
import { InitializationSweep } from './components/auth/InitializationSweep';
import { Bot, Cpu } from 'lucide-react';

type AuthStep = 'landing' | 'login' | 'initializing' | 'authenticated';

export const App: React.FC = () => {
  const [authStep, setAuthStep] = useState<AuthStep>('landing');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<MissionAlert[]>(INITIAL_ALERTS);
  const [showAlertCenter, setShowAlertCenter] = useState<boolean>(false);
  const [selectedConjunctionModal, setSelectedConjunctionModal] = useState<ConjunctionEvent | null>(null);
  const [showSimulatorView, setShowSimulatorView] = useState<boolean>(false);

  const unreadAlertCount = alerts.filter((a) => !a.reviewed).length;

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    setAuthStep('initializing');
  };

  const handleContinueDemoMode = () => {
    setUserSession({
      operatorId: 'DEMO-OPERATOR-01',
      name: 'Demo Operator',
      role: 'Mission Control Analyst',
      authenticatedAt: new Date().toISOString(),
    });
    setAuthStep('initializing');
  };

  const handleLogout = () => {
    setUserSession(null);
    setAuthStep('landing');
  };

  const handleMarkAsReviewed = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a))
    );
  };

  const handleOpenSimulator = (_satId: string) => {
    setShowSimulatorView(true);
    setActiveTab('copilot');
  };

  const handleSelectConjunctionById = (eventId: string) => {
    const found = MOCK_CONJUNCTIONS.find((c) => c.id === eventId);
    if (found) {
      setSelectedConjunctionModal(found);
    }
  };

  const handleSimulateCriticalEvent = () => {
    const criticalEvent = MOCK_CONJUNCTIONS[0]; // SAT-01 vs DEBRIS-482
    setSelectedConjunctionModal(criticalEvent);

    const criticalAlert: MissionAlert = {
      id: `alert-crit-${Date.now()}`,
      severity: 'HIGH',
      title: 'CRITICAL COLLISION RISK DETECTED',
      description: 'SAT-01 vs DEBRIS-482 in 18h 24m (14.2 km). Hardware alert signal dispatched to ESP32 prototype.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      reviewed: false,
      eventId: 'conj-01',
    };

    setAlerts((prev) => [criticalAlert, ...prev]);
  };

  if (authStep === 'landing') {
    return (
      <SatelliteLandingView
        onEnterMissionControl={() => setAuthStep('login')}
      />
    );
  }

  if (authStep === 'login') {
    return (
      <div className="relative min-h-screen bg-space-950">
        <SpaceBackground />
        <MissionLoginModal
          onLoginSuccess={handleLoginSuccess}
          onContinueDemo={handleContinueDemoMode}
          onBackToSpace={() => setAuthStep('landing')}
        />
      </div>
    );
  }

  if (authStep === 'initializing') {
    return (
      <div className="relative min-h-screen bg-space-950">
        <SpaceBackground />
        <InitializationSweep
          onComplete={() => setAuthStep('authenticated')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-space-950">
      
      {/* Dynamic Deep Space Canvas Background */}
      <SpaceBackground />

      {/* Fixed Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setShowSimulatorView(false);
        }}
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        unreadAlertCount={unreadAlertCount}
        onOpenAlerts={() => setShowAlertCenter(true)}
        userSession={userSession}
        onLogout={handleLogout}
        onSimulateCriticalEvent={handleSimulateCriticalEvent}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10 space-y-8">
        
        {/* VIEW 1: DASHBOARD / HOME */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <HeroSection
              onLaunchMissionControl={() => setActiveTab('map')}
              onExploreMap={() => setActiveTab('map')}
            />

            <TelemetryMetrics />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8">
                <OrbitalEarthView
                  onSelectConjunction={(id) => handleSelectConjunctionById(id)}
                  onOpenSimulator={(satId) => handleOpenSimulator(satId)}
                />
              </div>

              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-bold text-sm text-white">
                      CRITICAL CONJUNCTIONS
                    </h3>
                    <button
                      onClick={() => setActiveTab('conjunctions')}
                      className="text-xs font-telemetry text-cyan-400 hover:underline"
                    >
                      View All (3) →
                    </button>
                  </div>

                  <div className="space-y-3">
                    {MOCK_CONJUNCTIONS.slice(0, 3).map((conj) => (
                      <div
                        key={conj.id}
                        onClick={() => setSelectedConjunctionModal(conj)}
                        className={`p-3 rounded-xl border cursor-pointer transition ${
                          conj.riskLevel === 'HIGH' || conj.riskLevel === 'CRITICAL'
                            ? 'bg-red-950/30 border-red-500/40 hover:border-red-400'
                            : 'bg-space-900 border-slate-800 hover:border-cyan-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-telemetry">
                          <span className="font-bold text-white">{conj.primaryObject.name}</span>
                          <span className="text-slate-400">TCA: {conj.tcaDisplay}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-telemetry mt-1">
                          <span className="text-slate-400">vs {conj.secondaryObject.name}</span>
                          <span className={`font-bold ${
                            conj.riskLevel === 'HIGH' ? 'text-red-400' : 'text-amber-400'
                          }`}>
                            {conj.missDistanceKm} km ({conj.riskLevel})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('copilot')}
                  className="p-5 rounded-2xl glass-panel-interactive border border-cyan-400/40 cursor-pointer space-y-2"
                >
                  <div className="flex items-center gap-2 text-cyan-400 font-telemetry text-xs font-bold">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <span>ASTROSHIELD COPILOT READY</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    "I have identified 3 conjunctions requiring attention. SAT-01 is within the operational review window."
                  </p>
                  <span className="text-[11px] font-telemetry text-cyan-300 font-bold block pt-1">
                    Ask AI Copilot for Maneuver Advice →
                  </span>
                </div>

                <div 
                  onClick={() => setActiveTab('iot')}
                  className="p-4 rounded-2xl glass-panel-interactive border border-emerald-500/30 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 font-telemetry">
                    <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-xs block">PHYSICAL SATELLITE (ESP32)</span>
                      <span className="text-[10px] text-emerald-400">Ground Station Link: ONLINE (24.8°C)</span>
                    </div>
                  </div>
                  <span className="text-cyan-400 text-xs">View →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: 3D ORBITAL MAP */}
        {activeTab === 'map' && (
          <div className="animate-fadeIn">
            <OrbitalEarthView
              onSelectConjunction={(id) => handleSelectConjunctionById(id)}
              onOpenSimulator={(satId) => handleOpenSimulator(satId)}
            />
          </div>
        )}

        {/* VIEW 3: CONJUNCTION MONITOR */}
        {activeTab === 'conjunctions' && (
          <div className="animate-fadeIn">
            <ConjunctionCenter
              onSelectConjunction={(event) => setSelectedConjunctionModal(event)}
              onOpenSimulator={(satId) => handleOpenSimulator(satId)}
            />
          </div>
        )}

        {/* VIEW 4: AI COPILOT & MANEUVER SIMULATOR */}
        {activeTab === 'copilot' && (
          <div className="space-y-6 animate-fadeIn">
            {showSimulatorView ? (
              <div className="space-y-4">
                <button
                  onClick={() => setShowSimulatorView(false)}
                  className="text-xs font-telemetry text-cyan-400 hover:underline flex items-center gap-1"
                >
                  ← Back to AI Copilot Chat
                </button>
                <AvoidanceSimulator
                  onGenerateReport={() => setActiveTab('reports')}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <AICopilot
                    onOpenSimulator={(satId) => handleOpenSimulator(satId)}
                    onSelectConjunction={(id) => handleSelectConjunctionById(id)}
                  />
                </div>
                <div className="lg:col-span-4">
                  <AvoidanceSimulator
                    onGenerateReport={() => setActiveTab('reports')}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: SPACE WEATHER CENTER */}
        {activeTab === 'weather' && (
          <div className="animate-fadeIn">
            <SpaceWeatherCenter />
          </div>
        )}

        {/* VIEW 6: IOT PHYSICAL SATELLITE TELEMETRY */}
        {activeTab === 'iot' && (
          <div className="animate-fadeIn">
            <SatelliteHealthModule />
          </div>
        )}

        {/* VIEW 7: MISSION REPORTS */}
        {activeTab === 'reports' && (
          <div className="animate-fadeIn">
            <MissionReports />
          </div>
        )}

      </main>

      {/* Conjunction Detailed Analysis Modal */}
      {selectedConjunctionModal && (
        <ConjunctionDetailModal
          event={selectedConjunctionModal}
          onClose={() => setSelectedConjunctionModal(null)}
          onOpenCopilot={() => {
            setActiveTab('copilot');
            setShowSimulatorView(false);
          }}
          onOpenSimulator={(satId) => handleOpenSimulator(satId)}
        />
      )}

      {/* Mission Alert Center Dropdown Drawer */}
      {showAlertCenter && (
        <MissionAlertCenter
          alerts={alerts}
          onClose={() => setShowAlertCenter(false)}
          onMarkAsReviewed={handleMarkAsReviewed}
          onSelectEvent={(eventId) => handleSelectConjunctionById(eventId)}
        />
      )}

      {/* Authentic Mission Control Telemetry Panel (Collapsible) */}
      <MissionControlPanel
        onOpenConjunctionModal={() => handleSelectConjunctionById('conj-01')}
      />

    </div>
  );
};

export default App;
