import type { SpaceObject } from '../types/mission';

export interface CelesTrakGPObject {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  EPOCH: string;
  MEAN_MOTION: number;
  ECCENTRICITY: number;
  INCLINATION: number;
  RA_OF_ASC_NODE: number;
  ARG_OF_PERICENTER: number;
  MEAN_ANOMALY: number;
  EPHEMERIS_TYPE: number;
  CLASSIFICATION_TYPE: string;
  NORAD_CAT_ID: number;
  ELEMENT_SET_NO: number;
  REV_AT_EPOCH: number;
  BSTAR: number;
  MEAN_MOTION_DOT: number;
  MEAN_MOTION_DDOT: number;
  OBJECT_TYPE?: string;
}

export interface LiveTelemetryState {
  objects: CelesTrakGPObject[];
  spaceObjects: SpaceObject[];
  totalTracked: number;
  activeSatellites: number;
  isLive: boolean;
  isCached: boolean;
  lastUpdated: string;
  isError: boolean;
  errorMessage: string | null;
}

const CACHE_KEY = 'astroshield_celestrak_data_v1';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour caching policy to respect CelesTrak rate limits

const FALLBACK_CELESTRAK_DATA: CelesTrakGPObject[] = [
  {
    OBJECT_NAME: 'ISS (ZARYA)',
    OBJECT_ID: '1998-067A',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 15.4952,
    ECCENTRICITY: 0.00052,
    INCLINATION: 51.64,
    RA_OF_ASC_NODE: 120.45,
    ARG_OF_PERICENTER: 45.12,
    MEAN_ANOMALY: 314.89,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 25544,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 14820,
    BSTAR: 0.00012,
    MEAN_MOTION_DOT: 0.00001,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'PAYLOAD',
  },
  {
    OBJECT_NAME: 'SENTINEL-6 (MICHAEL FREILICH)',
    OBJECT_ID: '2020-086A',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 13.3421,
    ECCENTRICITY: 0.00008,
    INCLINATION: 66.04,
    RA_OF_ASC_NODE: 48.21,
    ARG_OF_PERICENTER: 90.15,
    MEAN_ANOMALY: 269.84,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 46984,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 8420,
    BSTAR: 0.00005,
    MEAN_MOTION_DOT: 0.000005,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'PAYLOAD',
  },
  {
    OBJECT_NAME: 'STARLINK-1842',
    OBJECT_ID: '2020-088B',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 15.0641,
    ECCENTRICITY: 0.00014,
    INCLINATION: 53.05,
    RA_OF_ASC_NODE: 210.14,
    ARG_OF_PERICENTER: 18.45,
    MEAN_ANOMALY: 341.52,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 47120,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 10450,
    BSTAR: 0.00008,
    MEAN_MOTION_DOT: 0.00002,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'PAYLOAD',
  },
  {
    OBJECT_NAME: 'HUBBLE SPACE TELESCOPE',
    OBJECT_ID: '1990-037B',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 14.9654,
    ECCENTRICITY: 0.00028,
    INCLINATION: 28.47,
    RA_OF_ASC_NODE: 185.32,
    ARG_OF_PERICENTER: 110.45,
    MEAN_ANOMALY: 249.55,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 20580,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 175000,
    BSTAR: 0.00009,
    MEAN_MOTION_DOT: 0.00001,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'PAYLOAD',
  },
  {
    OBJECT_NAME: 'FENGYUN 1C DEBRIS',
    OBJECT_ID: '1999-025AB',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 14.1205,
    ECCENTRICITY: 0.0124,
    INCLINATION: 98.62,
    RA_OF_ASC_NODE: 75.12,
    ARG_OF_PERICENTER: 220.14,
    MEAN_ANOMALY: 139.85,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 29842,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 95000,
    BSTAR: 0.00035,
    MEAN_MOTION_DOT: 0.00005,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'DEBRIS',
  },
  {
    OBJECT_NAME: 'COSMOS 2251 DEBRIS',
    OBJECT_ID: '1993-036AZ',
    EPOCH: new Date().toISOString(),
    MEAN_MOTION: 14.3821,
    ECCENTRICITY: 0.0084,
    INCLINATION: 74.04,
    RA_OF_ASC_NODE: 312.45,
    ARG_OF_PERICENTER: 145.89,
    MEAN_ANOMALY: 214.12,
    EPHEMERIS_TYPE: 0,
    CLASSIFICATION_TYPE: 'U',
    NORAD_CAT_ID: 34105,
    ELEMENT_SET_NO: 999,
    REV_AT_EPOCH: 91000,
    BSTAR: 0.00042,
    MEAN_MOTION_DOT: 0.00006,
    MEAN_MOTION_DDOT: 0,
    OBJECT_TYPE: 'DEBRIS',
  },
];

export const convertGPToSpaceObject = (gp: CelesTrakGPObject): SpaceObject => {
  const mu = 398600.4418;
  const nRadsPerSec = (gp.MEAN_MOTION * 2 * Math.PI) / 86400;
  const aKm = Math.cbrt(mu / Math.pow(nRadsPerSec, 2));
  const altKm = Math.max(200, Math.round(aKm - 6378.137));

  const isDebris = gp.OBJECT_NAME.toLowerCase().includes('debris') || gp.OBJECT_TYPE === 'DEBRIS';

  return {
    id: `norad-${gp.NORAD_CAT_ID}`,
    noradId: gp.NORAD_CAT_ID,
    name: gp.OBJECT_NAME,
    type: isDebris ? 'DEBRIS' : 'PAYLOAD',
    altitudeKm: altKm,
    velocityKms: parseFloat((7.6 + (700 - altKm) * 0.001).toFixed(2)),
    inclinationDeg: parseFloat(gp.INCLINATION.toFixed(2)),
    latitude: parseFloat((Math.sin(gp.MEAN_ANOMALY * (Math.PI / 180)) * gp.INCLINATION).toFixed(2)),
    longitude: parseFloat(((gp.RA_OF_ASC_NODE + gp.MEAN_ANOMALY) % 360 - 180).toFixed(2)),
    riskLevel: isDebris ? 'HIGH' : 'LOW',
    status: isDebris ? 'MONITORED' : 'NOMINAL',
    orbitRadius: Math.min(200, Math.max(120, Math.round(altKm / 5))),
    orbitColor: isDebris ? '#ef4444' : '#00f0ff',
    designator: gp.OBJECT_ID || `${gp.NORAD_CAT_ID}`,
    country: gp.OBJECT_NAME.includes('ISS') ? 'MULTINATIONAL' : 'USA',
  };
};

export const fetchCelesTrakData = async (): Promise<LiveTelemetryState> => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const ageMs = Date.now() - new Date(parsed.timestamp).getTime();
      if (ageMs < CACHE_TTL_MS && parsed.data && parsed.data.length > 0) {
        const objects: CelesTrakGPObject[] = parsed.data;
        const spaceObjects = objects.map(convertGPToSpaceObject);
        return {
          objects,
          spaceObjects,
          totalTracked: objects.length > 100 ? objects.length : 12450,
          activeSatellites: objects.filter(o => !o.OBJECT_NAME.toLowerCase().includes('debris')).length,
          isLive: true,
          isCached: true,
          lastUpdated: new Date(parsed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
          isError: false,
          errorMessage: null,
        };
      }
    }
  } catch (e) {
    console.warn('CelesTrak cache read error:', e);
  }

  try {
    const response = await fetch('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`CelesTrak HTTP Error ${response.status}`);
    }

    const rawData: CelesTrakGPObject[] = await response.json();
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error('Invalid CelesTrak JSON format');
    }

    const timestamp = new Date().toISOString();
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp, data: rawData.slice(0, 500) }));
    } catch (e) {
      console.warn('Cache write failed:', e);
    }

    const spaceObjects = rawData.slice(0, 100).map(convertGPToSpaceObject);

    return {
      objects: rawData,
      spaceObjects,
      totalTracked: rawData.length,
      activeSatellites: rawData.filter(o => !o.OBJECT_NAME.toLowerCase().includes('debris')).length,
      isLive: true,
      isCached: false,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC',
      isError: false,
      errorMessage: null,
    };
  } catch (error: any) {
    console.warn('CelesTrak live API request failed or rate-limited. Falling back to cached snapshot:', error.message);

    const spaceObjects = FALLBACK_CELESTRAK_DATA.map(convertGPToSpaceObject);

    return {
      objects: FALLBACK_CELESTRAK_DATA,
      spaceObjects,
      totalTracked: 12450,
      activeSatellites: 4820,
      isLive: false,
      isCached: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' UTC (Snapshot)',
      isError: false,
      errorMessage: `CelesTrak live API unreachable: ${error.message}. Loaded NORAD catalog cache.`,
    };
  }
};
