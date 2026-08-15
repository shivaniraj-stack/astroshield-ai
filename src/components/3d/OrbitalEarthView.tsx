import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { SpaceObject } from '../../types/mission';
import { MOCK_SATELLITES, MOCK_DEBRIS } from '../../data/mockMissionData';
import { 
  Eye, 
  Layers, 
  Maximize2, 
  Minimize2, 
  AlertTriangle, 
  Zap, 
  Compass, 
  Crosshair
} from 'lucide-react';

interface OrbitalEarthViewProps {
  onSelectConjunction?: (eventId: string) => void;
  onOpenSimulator?: (satId: string) => void;
}

// Procedural Photorealistic Dark-Blue Earth Surface Texture (100% Offline Reliable)
const generateRealisticEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Deep Oceanic Dark-Blue Base Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#040d1a');
  oceanGrad.addColorStop(0.5, '#0a2342');
  oceanGrad.addColorStop(1, '#040d1a');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper to draw landmasses
  const drawLandmass = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.PI / 12, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const subX = cx + Math.cos(angle) * (rx * 0.7);
      const subY = cy + Math.sin(angle) * (ry * 0.7);
      ctx.beginPath();
      ctx.arc(subX, subY, rx * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Continents: North America, South America, Eurasia, Africa, Australia
  drawLandmass(500, 320, 220, 140, '#153b27'); // North America
  drawLandmass(650, 650, 130, 200, '#1e5238'); // South America
  drawLandmass(1250, 300, 350, 160, '#1e5238'); // Eurasia
  drawLandmass(1100, 520, 180, 210, '#8c634b'); // Africa
  drawLandmass(1650, 680, 140, 110, '#b88b4a'); // Australia
  drawLandmass(1400, 420, 120, 90, '#153b27');  // SE Asia

  // Polar Caps
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, canvas.width, 70); // North Pole
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80); // South Pole

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

export const OrbitalEarthView: React.FC<OrbitalEarthViewProps> = ({
  onSelectConjunction,
  onOpenSimulator,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedObject, setSelectedObject] = useState<SpaceObject | null>(MOCK_SATELLITES[0]);
  const [showDebris, setShowDebris] = useState<boolean>(true);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. WebGL 3D Scene Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.005);

    // Uncropped complete Earth framing (camera at Z=18, FOV=45)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3.5, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Three.js OrbitControls for Full 360° Cursor Rotation & Smooth Scroll Zoom
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 6.0;
    controls.maxDistance = 45.0;
    controls.target.set(0, 0, 0);

    // 3. Deep-Space Starfield (3,000 fine star particles across 3D space)
    const starGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let i = 0; i < 3000; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 450,
        (Math.random() - 0.5) * 450,
        (Math.random() - 0.5) * 450
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Realistic Lighting with Natural Day/Night Terminator
    const ambientLight = new THREE.AmbientLight(0x0a1628, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 3.8);
    sunLight.position.set(16, 12, 14);
    scene.add(sunLight);

    const oceanGlowLight = new THREE.DirectionalLight(0x00f0ff, 1.2);
    oceanGlowLight.position.set(-16, -8, -12);
    scene.add(oceanGlowLight);

    // 4. Realistic Dark-Blue Earth Globe (Centered at 0,0,0)
    const earthRadius = 3.2;
    const earthTexture = generateRealisticEarthTexture();
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: 0x00f0ff,
      shininess: 25,
      emissive: 0x020a1c,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // Subtle Grid Overlay
    const gridGeo = new THREE.SphereGeometry(earthRadius * 1.002, 36, 18);
    const gridMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const gridMesh = new THREE.Mesh(gridGeo, gridMat);
    earthMesh.add(gridMesh);

    // Thin Atmospheric Glow Halo
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.05, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 5. Prominent Primary Orbital Trajectory Ring (Radius 9.5) Extending Widely Across Viewport
    const primaryOrbitPts: THREE.Vector3[] = [];
    const primaryR = 9.5;
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      primaryOrbitPts.push(new THREE.Vector3(
        Math.cos(theta) * primaryR,
        Math.sin(theta) * 2.8,
        Math.sin(theta) * primaryR
      ));
    }
    const primaryOrbitGeo = new THREE.BufferGeometry().setFromPoints(primaryOrbitPts);
    const primaryOrbitMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.6,
    });
    const primaryOrbitLine = new THREE.Line(primaryOrbitGeo, primaryOrbitMat);
    scene.add(primaryOrbitLine);

    // 6. Active Satellites & Reduced Debris (12 Representative Objects to Eliminate Clutter)
    const satelliteMeshes: { object: SpaceObject; mesh: THREE.Mesh; orbitLine: THREE.Line }[] = [];

    // Filter to 12 representative debris objects to prevent visual clutter
    const representativeDebris: SpaceObject[] = MOCK_DEBRIS.slice(0, 12).map((deb, i) => ({
      ...deb,
      orbitRadius: 4.6 + (i % 8) * 0.7,
      inclinationDeg: 15 + (i * 11) % 75,
    }));

    // Render Revolving Satellites
    MOCK_SATELLITES.forEach((sat, idx) => {
      const orbitR = 5.0 + idx * 1.2;
      const tilt = (sat.inclinationDeg * Math.PI) / 180;

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 96; i++) {
        const theta = (i / 96) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          Math.cos(theta) * orbitR,
          Math.sin(theta) * Math.sin(tilt) * orbitR * 0.45,
          Math.sin(theta) * orbitR
        ));
      }
      const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const oMat = new THREE.LineBasicMaterial({
        color: selectedObject?.id === sat.id ? 0x00f0ff : 0x0284c7,
        transparent: true,
        opacity: selectedObject?.id === sat.id ? 0.95 : 0.45,
      });
      const oLine = new THREE.Line(oGeo, oMat);
      scene.add(oLine);

      const sGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const sMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: selectedObject?.id === sat.id ? 0.9 : 0.5,
      });
      const sMesh = new THREE.Mesh(sGeo, sMat);
      sMesh.userData = { spaceObject: sat };
      scene.add(sMesh);

      satelliteMeshes.push({ object: sat, mesh: sMesh, orbitLine: oLine });
    });

    // Render 12 Debris Objects (Clean, De-cluttered Representative Markers)
    const debrisMeshes: { object: SpaceObject; mesh: THREE.Mesh; orbitLine: THREE.Line }[] = [];

    representativeDebris.forEach((deb, idx) => {
      const orbitR = 4.6 + (idx % 8) * 0.7;
      const tilt = (deb.inclinationDeg * Math.PI) / 180;

      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        pts.push(new THREE.Vector3(
          Math.cos(theta) * orbitR,
          Math.sin(theta) * Math.sin(tilt) * orbitR * 0.5,
          Math.sin(theta) * orbitR
        ));
      }
      const oGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const oMat = new THREE.LineBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.3,
      });
      const oLine = new THREE.Line(oGeo, oMat);
      scene.add(oLine);

      const dGeo = new THREE.SphereGeometry(0.07, 12, 12);
      const dMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const dMesh = new THREE.Mesh(dGeo, dMat);
      dMesh.userData = { spaceObject: deb };
      scene.add(dMesh);

      debrisMeshes.push({ object: deb, mesh: dMesh, orbitLine: oLine });
    });

    // Convergence Line for Collision Conjunction (SAT-01 vs DEBRIS-482)
    const convergenceGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0),
    ]);
    const convergenceMat = new THREE.LineDashedMaterial({
      color: 0xef4444,
      dashSize: 0.3,
      gapSize: 0.15,
    });
    const convergenceLine = new THREE.Line(convergenceGeo, convergenceMat);
    scene.add(convergenceLine);

    // Raycasting Object Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const allTargets = [
        ...satelliteMeshes.map((m) => m.mesh),
        ...debrisMeshes.map((m) => m.mesh),
      ];
      const intersects = raycaster.intersectObjects(allTargets);

      if (intersects.length > 0) {
        const obj = intersects[0].object.userData.spaceObject as SpaceObject;
        if (obj) {
          setSelectedObject(obj);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('click', handleCanvasClick);

    // Native Browser Fullscreen API Change Listener
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement
      );
      setIsFullscreen(isFull);

      setTimeout(() => {
        if (!containerRef.current) return;
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // Animation Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Continuous Earth Mesh Y-axis rotation (0.25 rad/s)
      earthMesh.rotation.y = elapsed * 0.25;
      starField.rotation.y = elapsed * 0.003;

      controls.update();

      // Satellite orbital revolution
      satelliteMeshes.forEach(({ object, mesh }, idx) => {
        const orbitR = 5.0 + idx * 1.2;
        const tilt = (object.inclinationDeg * Math.PI) / 180;
        const speed = 0.35 + idx * 0.06;
        const theta = elapsed * speed + idx;

        mesh.position.x = Math.cos(theta) * orbitR;
        mesh.position.y = Math.sin(theta) * Math.sin(tilt) * orbitR * 0.45;
        mesh.position.z = Math.sin(theta) * orbitR;
        mesh.visible = true;
      });

      // Debris orbital revolution (12 objects)
      debrisMeshes.forEach(({ object, mesh, orbitLine }, idx) => {
        const orbitR = 4.6 + (idx % 8) * 0.7;
        const tilt = (object.inclinationDeg * Math.PI) / 180;
        const speed = 0.4 + (idx % 5) * 0.05;
        const theta = elapsed * speed + idx * 0.5;

        mesh.position.x = Math.cos(theta) * orbitR;
        mesh.position.y = Math.sin(theta) * Math.sin(tilt) * orbitR * 0.5;
        mesh.position.z = Math.sin(theta) * orbitR;

        mesh.visible = showDebris;
        orbitLine.visible = showDebris && showOrbits;
      });

      // Convergence Line Update
      if (satelliteMeshes[0] && debrisMeshes[0]) {
        const satPos = satelliteMeshes[0].mesh.position;
        const debPos = debrisMeshes[0].mesh.position;

        const positions = convergenceGeo.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, satPos.x, satPos.y, satPos.z);
        positions.setXYZ(1, debPos.x, debPos.y, debPos.z);
        positions.needsUpdate = true;
        convergenceLine.computeLineDistances();
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domEl.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [showDebris, showOrbits, selectedObject]);

  // Native Browser Fullscreen API Trigger
  const handleToggleFullscreen = () => {
    const targetEl = containerRef.current;
    if (!targetEl) return;

    if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
      if (targetEl.requestFullscreen) {
        targetEl.requestFullscreen();
      } else if ((targetEl as any).webkitRequestFullscreen) {
        (targetEl as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full rounded-3xl glass-panel border border-cyan-500/30 overflow-hidden shadow-2xl transition-all ${
        isFullscreen ? 'w-screen h-screen rounded-none border-none bg-space-950' : 'h-[600px]'
      }`}
    >
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Toolbar Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 font-telemetry text-xs">
        <div className="bg-space-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 flex items-center gap-2 text-cyan-300">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="font-bold">3D ORBIT VIEWER</span>
        </div>

        <button
          onClick={() => setShowDebris(!showDebris)}
          className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
            showDebris
              ? 'bg-red-950/80 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
              : 'bg-space-900/80 text-slate-400 border-slate-700'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>DEBRIS (12)</span>
        </button>

        <button
          onClick={() => setShowOrbits(!showOrbits)}
          className={`px-3 py-1.5 rounded-xl border font-bold transition flex items-center gap-1.5 ${
            showOrbits
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400/40'
              : 'bg-space-900/80 text-slate-400 border-slate-700'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>ORBIT TRAJECTORIES</span>
        </button>
      </div>

      {/* Top Right Controls & Native Fullscreen Button */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 font-telemetry text-xs">
        <div className="bg-space-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/20 text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>LIVE RENDER</span>
        </div>

        <button
          onClick={handleToggleFullscreen}
          className="p-2 rounded-xl bg-space-900/90 border border-cyan-500/40 text-cyan-300 hover:bg-space-850 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
        </button>
      </div>

      {/* Object Inspector Overlay (Bottom Right) */}
      {selectedObject && (
        <div className="absolute bottom-4 right-4 z-10 w-72 sm:w-80 glass-panel p-4 rounded-2xl border border-cyan-500/40 shadow-2xl font-telemetry text-xs space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="font-bold text-white text-sm truncate">{selectedObject.name}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
              selectedObject.type === 'DEBRIS'
                ? 'bg-red-950/80 text-red-400 border-red-500/40'
                : 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40'
            }`}>
              {selectedObject.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px]">NORAD ID</span>
              <span className="font-bold text-white">#{selectedObject.noradId}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">ALTITUDE</span>
              <span className="font-bold text-cyan-300">{selectedObject.altitudeKm} km</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">VELOCITY</span>
              <span className="font-bold text-white">{selectedObject.velocityKms} km/s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">INCLINATION</span>
              <span className="font-bold text-white">{selectedObject.inclinationDeg}°</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span className={`font-bold ${
              selectedObject.riskLevel === 'HIGH' ? 'text-red-400' : 'text-emerald-400'
            }`}>
              Risk Level: {selectedObject.riskLevel}
            </span>

            {onOpenSimulator && selectedObject.type === 'PAYLOAD' && (
              <button
                onClick={() => onOpenSimulator(selectedObject.id)}
                className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-bold transition flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Simulate Deflection</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Convergence Alert Card (Bottom Left) */}
      <div 
        onClick={() => onSelectConjunction && onSelectConjunction('conj-01')}
        className="absolute bottom-4 left-4 z-10 p-3 rounded-2xl bg-red-950/80 backdrop-blur-md border border-red-500/50 hover:border-red-400 cursor-pointer flex items-center gap-3 font-telemetry text-xs shadow-[0_0_20px_rgba(239,68,68,0.3)] transition"
      >
        <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce shrink-0" />
        <div>
          <span className="text-[10px] text-red-400 font-bold block uppercase">
            ACTIVE CONJUNCTION VECTOR
          </span>
          <span className="font-bold text-white">SAT-01 vs DEBRIS-482 (14.2 km)</span>
        </div>
      </div>

    </div>
  );
};
