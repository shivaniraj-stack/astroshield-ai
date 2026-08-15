export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ObjectType = 'PAYLOAD' | 'DEBRIS' | 'ROCKET_BODY' | 'CONSTELLATION';
export type OperationalStatus = 'NOMINAL' | 'MONITORED' | 'WARNING' | 'CRITICAL';

export interface SpaceObject {
  id: string;
  noradId: number;
  name: string;
  type: ObjectType;
  altitudeKm: number;
  velocityKms: number;
  inclinationDeg: number;
  latitude: number;
  longitude: number;
  riskLevel: RiskLevel;
  status: OperationalStatus;
  orbitRadius: number;
  orbitColor: string;
  designator: string;
  country: string;
}

export interface ConjunctionEvent {
  id: string;
  primaryObject: SpaceObject;
  secondaryObject: SpaceObject;
  tcaDisplay: string; // e.g. "18h 24m 12s"
  tcaHours: number;
  missDistanceKm: number;
  radialSeparationKm: number;
  collisionProbability: string; // e.g. "4.12 x 10^-3"
  collisionProbabilityVal: number;
  riskLevel: RiskLevel;
  status: 'REVIEW' | 'MONITORED' | 'ACTION_REQUIRED' | 'RESOLVED';
  recommendedAction: string;
}

export interface ManeuverOption {
  id: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
  title: string;
  subTitle: string;
  riskLevel: 'HIGH' | 'LOW' | 'VERY_LOW';
  riskPercentage: number;
  deltaV: string; // e.g., "0.42 m/s"
  deltaVValueMs: number;
  fuelCost: string; // e.g., "LOW (0.1%)"
  predictedMissDistanceKm: number;
  executionTimeUtc: string;
  description: string;
  orbitOffsetRadius: number;
}

export interface SpaceWeather {
  solarKIndex: number;
  geomagneticKp: number;
  solarWindKmS: number;
  radiationRisk: 'LOW' | 'MODERATE' | 'SEVERE';
  atmosphericDrag: 'NORMAL' | 'ELEVATED' | 'HIGH';
  status: 'NORMAL' | 'ELEVATED_ACTIVITY' | 'ALERT';
  lastUpdated: string;
}

export interface StructuredAIResponse {
  riskAssessment: RiskLevel;
  reason: string;
  recommendation: string;
  confidence: number;
  eventId?: string;
  maneuverOptionRecommended?: 'OPTION_A' | 'OPTION_B' | 'OPTION_C';
}

export interface AICopilotMessage {
  id: string;
  sender: 'copilot' | 'user';
  timestamp: string;
  text: string;
  structuredResponse?: StructuredAIResponse;
}

export interface MissionAlert {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'INFO' | 'SUCCESS';
  title: string;
  description: string;
  timestamp: string;
  reviewed: boolean;
  eventId?: string;
}

export interface UserSession {
  operatorId: string;
  name: string;
  role: string;
  authenticatedAt: string;
}

export interface IoTTelemetry {
  deviceId: string;
  name: string;
  connectionStatus: 'ONLINE' | 'OFFLINE';
  temperatureC: number;
  orientation: {
    pitch: number;
    roll: number;
    yaw: number;
  };
  motionStatus: 'STABLE' | 'TUMBLING' | 'ELEVATED';
  batteryPercent: number;
  healthStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  emergencyAlertActive: boolean;
  lastPingUtc: string;
}

export type ViewTab = 'dashboard' | 'map' | 'conjunctions' | 'copilot' | 'weather' | 'iot' | 'reports';
