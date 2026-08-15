import React, { useState } from 'react';
import type { IoTTelemetry } from '../../types/mission';
import { 
  Cpu, 
  Thermometer, 
  BatteryCharging, 
  ShieldCheck, 
  AlertTriangle, 
  Wifi, 
  Compass, 
  CheckCircle2
} from 'lucide-react';

interface SatelliteHealthModuleProps {
  onTriggerHardwareAlert?: () => void;
}

export const SatelliteHealthModule: React.FC<SatelliteHealthModuleProps> = ({
  onTriggerHardwareAlert,
}) => {
  const [telemetry, setTelemetry] = useState<IoTTelemetry>({
    deviceId: 'ASTRO-01-ESP32',
    name: 'AstroShield Tabletop Physical Satellite Prototype',
    connectionStatus: 'ONLINE',
    temperatureC: 24.8,
    orientation: {
      pitch: 2.1,
      roll: -0.8,
      yaw: 14.5,
    },
    motionStatus: 'STABLE',
    batteryPercent: 87,
    healthStatus: 'NOMINAL',
    emergencyAlertActive: false,
    lastPingUtc: '14:23:50 UTC',
  });

  const [simulatedAlertActive, setSimulatedAlertActive] = useState<boolean>(false);

  const handleTestEmergencyAlert = () => {
    setSimulatedAlertActive(true);
    setTelemetry((prev) => ({
      ...prev,
      healthStatus: 'CRITICAL',
      emergencyAlertActive: true,
    }));

    if (onTriggerHardwareAlert) {
      onTriggerHardwareAlert();
    }
  };

  const handleClearEmergencyAlert = () => {
    setSimulatedAlertActive(false);
    setTelemetry((prev) => ({
      ...prev,
      healthStatus: 'NOMINAL',
      emergencyAlertActive: false,
    }));
  };

  return (
    <div className="w-full space-y-6">
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <h1 className="font-heading font-extrabold text-2xl text-white">
              PHYSICAL SATELLITE TELEMETRY (ESP32)
            </h1>
          </div>
          <p className="text-sm font-telemetry text-slate-400 mt-1">
            Real-time IoT telemetry from tabletop physical prototype ASTRO-01 ground station link.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 text-emerald-400 text-xs font-telemetry font-bold">
            <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>ESP32 LINK: {telemetry.connectionStatus}</span>
          </div>

          <button
            onClick={simulatedAlertActive ? handleClearEmergencyAlert : handleTestEmergencyAlert}
            className={`py-2 px-4 rounded-xl text-xs font-telemetry font-extrabold flex items-center gap-2 transition border ${
              simulatedAlertActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30'
            }`}
          >
            <AlertTriangle className="w-4 h-4 animate-bounce" />
            <span>{simulatedAlertActive ? 'RESET HARDWARE ALERT' : 'TEST HARDWARE ALERT SIGNAL'}</span>
          </button>
        </div>
      </div>

      {simulatedAlertActive ? (
        <div className="p-5 rounded-2xl glass-panel-danger border border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4 font-telemetry">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 flex items-center justify-center text-red-400 border border-red-500 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-400 uppercase">
                EMERGENCY ALERT BROADCAST TO PHYSICAL SATELLITE
              </span>
              <h3 className="font-heading font-extrabold text-base text-white">
                ASTRO-01 HARDWARE LED FLASHING RED • BUZZER ACTIVE • OLED: "COLLISION ALERT"
              </h3>
            </div>
          </div>

          <span className="text-xs text-red-300 font-bold bg-red-950 px-3 py-1 rounded-xl border border-red-500/40 whitespace-nowrap">
            MQTT HARDWARE SYNC ACTIVE
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-space-900/90 border border-emerald-500/30 font-telemetry text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>PHYSICAL SATELLITE HARDWARE HEALTH NOMINAL — RGB LED: GREEN — OLED: "ASTROSHIELD ONLINE"</span>
          </div>
          <span className="text-slate-400 text-[11px] hidden sm:block">ESP32-WROOM-32 • MPU6050 IMU SYNCED</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-telemetry">
        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>INTERNAL TEMPERATURE</span>
            <Thermometer className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-white">{telemetry.temperatureC}°C</span>
            <span className="text-xs text-emerald-400 font-bold">NORMAL</span>
          </div>
          <p className="text-[11px] text-slate-400">Thermal threshold: 45.0°C</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MPU6050 IMU ORIENTATION</span>
            <Compass className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-xl text-white">
              P:{telemetry.orientation.pitch}° R:{telemetry.orientation.roll}°
            </span>
          </div>
          <p className="text-[11px] text-emerald-400 font-bold">ATTITUDE STABLE (3-AXIS)</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>PROTOTYPE BATTERY</span>
            <BatteryCharging className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-3xl text-white">{telemetry.batteryPercent}%</span>
            <span className="text-xs text-emerald-400 font-bold">CHARGING</span>
          </div>
          <div className="w-full bg-space-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div className="bg-emerald-400 h-full w-[87%]" />
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-cyan-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>HARDWARE SYSTEM HEALTH</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-heading font-extrabold text-2xl ${
              telemetry.healthStatus === 'CRITICAL' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {telemetry.healthStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Device ID: {telemetry.deviceId}</p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 space-y-4 font-telemetry">
        <h3 className="font-heading font-extrabold text-lg text-white">
          HARDWARE PROTOTYPE CIRCUITRY & GROUND STATION LINK
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-space-900/90 border border-slate-800 space-y-2">
            <span className="text-cyan-400 font-bold block">1. SENSORS & MICROCONTROLLER</span>
            <p className="text-slate-300">
              ESP32 dual-core microcontroller connected via I2C to MPU6050 6-DOF IMU accelerometer & temperature sensor module.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900/90 border border-slate-800 space-y-2">
            <span className="text-amber-400 font-bold block">2. ALERT ACTUATORS</span>
            <p className="text-slate-300">
              RGB LED indicator, 0.96" SSD1306 OLED display screen, and piezoelectric buzzer alert triggered via WebSocket/MQTT broker.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-space-900/90 border border-slate-800 space-y-2">
            <span className="text-emerald-400 font-bold block">3. GROUND STATION SYNC</span>
            <p className="text-slate-300">
              Real-time telemetry packet transmission over Wi-Fi/MQTT updating the AstroShield AI mission-control dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
