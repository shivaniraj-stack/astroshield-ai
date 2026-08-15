import React, { useState, useEffect } from 'react';
import type { ViewTab, UserSession } from '../../types/mission';
import { 
  Shield, 
  Orbit, 
  Activity, 
  Bot, 
  Sun, 
  FileText, 
  Clock, 
  User, 
  Bell, 
  Radio, 
  AlertTriangle,
  Cpu,
  Zap,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  unreadAlertCount: number;
  onOpenAlerts: () => void;
  userSession: UserSession | null;
  onLogout: () => void;
  onSimulateCriticalEvent: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  demoMode,
  setDemoMode,
  unreadAlertCount,
  onOpenAlerts,
  userSession,
  onLogout,
  onSimulateCriticalEvent,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <Activity className="w-4 h-4" /> },
    { id: 'map', label: 'Orbital Map', icon: <Orbit className="w-4 h-4" /> },
    { id: 'conjunctions', label: 'Conjunctions', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'copilot', label: 'AI Copilot', icon: <Bot className="w-4 h-4" /> },
    { id: 'weather', label: 'Space Weather', icon: <Sun className="w-4 h-4" /> },
    { id: 'iot', label: 'IoT Telemetry', icon: <Cpu className="w-4 h-4" /> },
    { id: 'reports', label: 'Mission Reports', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-space-950/80 backdrop-blur-xl border-b border-cyan-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-400/40 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
            <Shield className="w-5 h-5 text-cyan-400 absolute" />
            <Orbit className="w-7 h-7 text-cyan-500/40 animate-orbit-rotate absolute" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                ASTROSHIELD
              </span>
              <span className="text-xs font-telemetry bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              SPACE TRAFFIC MANAGEMENT
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-space-900/90 p-1 rounded-xl border border-cyan-500/15">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-space-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Status, Master Trigger & User Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* MASTER HACKATHON TRIGGER BUTTON */}
          <button
            onClick={onSimulateCriticalEvent}
            className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 text-space-950 font-extrabold text-xs hover:opacity-90 flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse transition"
            title="Trigger End-to-End Critical Collision Demo Sequence"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">SIMULATE CRITICAL EVENT</span>
            <span className="sm:hidden">SIMULATE</span>
          </button>

          {/* System Status Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-telemetry">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-[11px] tracking-wide">SYSTEM ONLINE</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 text-xs font-telemetry text-cyan-300 bg-space-900/80 px-2.5 py-1 rounded-lg border border-cyan-500/20">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{utcTime || '14:23:50 UTC'}</span>
          </div>

          {/* Alert Bell Button */}
          <button
            onClick={onOpenAlerts}
            className="relative p-2 rounded-lg bg-space-900/80 border border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition"
            title="Mission Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                {unreadAlertCount}
              </span>
            )}
          </button>

          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-telemetry transition-all border ${
              demoMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-space-850 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>DEMO MODE</span>
          </button>

          {/* User Profile Badge & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-xl bg-space-900 border border-cyan-500/30 hover:border-cyan-400 text-xs font-telemetry text-slate-200 transition"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-900 to-space-800 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="hidden md:block text-left pr-1">
                <span className="font-bold block text-white text-[11px] leading-none">
                  {userSession?.name || 'Demo Operator'}
                </span>
                <span className="text-[9px] text-slate-400 leading-none">
                  {userSession?.role || 'Mission Analyst'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 glass-panel p-2 rounded-2xl border border-cyan-500/40 shadow-2xl font-telemetry text-xs space-y-1 z-50 animate-fadeIn">
                <div className="p-2 border-b border-slate-800">
                  <p className="font-bold text-white">{userSession?.name || 'Demo Operator'}</p>
                  <p className="text-[10px] text-cyan-400">{userSession?.role || 'Mission Control Analyst'}</p>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full p-2 rounded-xl text-red-400 hover:bg-red-950/40 flex items-center gap-2 font-bold transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout to Landing Page</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="xl:hidden flex items-center justify-around px-2 py-1.5 bg-space-900/95 border-t border-cyan-500/10 text-xs overflow-x-auto scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs whitespace-nowrap ${
              activeTab === item.id
                ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/30'
                : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
