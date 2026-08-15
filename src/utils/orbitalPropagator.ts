import type { CelesTrakGPObject } from '../services/celestrakApi';

export interface PropagatedOrbitalElements {
  semiMajorAxisKm: number;
  altitudeKm: number;
  orbitalPeriodMinutes: number;
  inclinationDeg: number;
  eccentricity: number;
  raanDeg: number;
}

/**
 * Propagates Keplerian OMM parameters from CelesTrak GP data
 */
export const calculateOrbitalElements = (gp: CelesTrakGPObject): PropagatedOrbitalElements => {
  const mu = 398600.4418; // Earth's gravitational constant (km^3/s^2)
  const meanMotionRadsPerSec = (gp.MEAN_MOTION * 2 * Math.PI) / 86400;
  
  // Semi-major axis: a = (mu / n^2)^(1/3)
  const semiMajorAxisKm = Math.cbrt(mu / Math.pow(meanMotionRadsPerSec, 2));
  const altitudeKm = Math.round(semiMajorAxisKm - 6378.137);
  const orbitalPeriodMinutes = parseFloat(((86400 / gp.MEAN_MOTION) / 60).toFixed(2));

  return {
    semiMajorAxisKm: parseFloat(semiMajorAxisKm.toFixed(2)),
    altitudeKm: Math.max(160, altitudeKm),
    orbitalPeriodMinutes,
    inclinationDeg: parseFloat(gp.INCLINATION.toFixed(2)),
    eccentricity: gp.ECCENTRICITY,
    raanDeg: parseFloat(gp.RA_OF_ASC_NODE.toFixed(2)),
  };
};

/**
 * Calculates minimum predicted orbital separation between two CelesTrak GP objects
 */
export const calculateOrbitalSeparationKm = (
  objA: CelesTrakGPObject,
  objB: CelesTrakGPObject
): number => {
  const elA = calculateOrbitalElements(objA);
  const elB = calculateOrbitalElements(objB);

  // Geometric radial offset
  const radialDelta = Math.abs(elA.altitudeKm - elB.altitudeKm);
  const inclinationDelta = Math.abs(elA.inclinationDeg - elB.inclinationDeg);

  // Conjunction miss distance approximation
  const separationKm = radialDelta + (inclinationDelta * 0.25);
  return parseFloat(separationKm.toFixed(2));
};
