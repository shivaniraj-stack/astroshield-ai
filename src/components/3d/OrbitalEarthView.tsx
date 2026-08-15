import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SpaceObject } from '../../types/mission';
import { MOCK_SATELLITES, MOCK_DEBRIS } from '../../data/mockMissionData';
import { 
  Eye, 
  Layers, 
  RotateCcw, 
  Target, 
  AlertTriangle, 
  Zap, 
  SlidersHorizontal,
  X
} from 'lucide-react';

interface OrbitalEarthViewProps {
  onSelectConjunction?: (eventId: string) => void;
  onOpenSimulator?: (satelliteId: string) => void;
  highlightEventId?: string | null;
}

export const OrbitalEarthView: React.FC<OrbitalEarthViewProps> = ({
  onSelectConjunction,
  onOpenSimulator,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [selectedObject, setSelectedObject] = useState<SpaceObject | null>(MOCK_SATELLITES[0]);
  const [showSatellites, setShowSatellites] = useState<boolean>(true);
  const [showDebris, setShowDebris] = useState<boolean>(true);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [isRotating] = useState<boolean>(true);

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const earthMeshRef = useRef<THREE.Mesh | null>(null);
  const satellitesGroupRef = useRef<THREE.Group | null>(null);
  const debrisGroupRef = useRef<THREE.Group | null>(null);
  const orbitsGroupRef = useRef<THREE.Group | null>(null);
  const collisionMarkerRef = useRef<THREE.Mesh | null>(null);

  const allObjects = [...MOCK_SATELLITES, ...MOCK_DEBRIS];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x030712, 0.012);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 5, 12);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1e293b, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    sunLight.position.set(10, 10, 10);
    scene.add(sunLight);

    const backLight = new THREE.DirectionalLight(0x3b82f6, 1.2);
    backLight.position.set(-10, -5, -10);
    scene.add(backLight);

    // 1. Procedural 3D Earth Globe
    const earthRadius = 3.2;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#060f26';
      ctx.fillRect(0, 0, 1024, 512);

      ctx.fillStyle = '#13355c';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;

      ctx.fillRect(150, 100, 200, 140);
      ctx.fillRect(250, 260, 120, 180);
      ctx.fillRect(500, 80, 360, 180);
      ctx.fillRect(480, 220, 160, 200);
      ctx.fillRect(750, 320, 140, 110);

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 1024; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 512);
        ctx.stroke();
      }
      for (let y = 0; y <= 512; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1024, y);
        ctx.stroke();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 25,
      specular: new THREE.Color(0x00f0ff),
      emissive: new THREE.Color(0x030d22),
    });

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);
    earthMeshRef.current = earthMesh;

    // 2. Atmosphere Glow Rim
    const atmosphereGeo = new THREE.SphereGeometry(earthRadius * 1.08, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    scene.add(atmosphereMesh);

    // Groups
    const satellitesGroup = new THREE.Group();
    const debrisGroup = new THREE.Group();
    const orbitsGroup = new THREE.Group();

    scene.add(satellitesGroup);
    scene.add(debrisGroup);
    scene.add(orbitsGroup);

    satellitesGroupRef.current = satellitesGroup;
    debrisGroupRef.current = debrisGroup;
    orbitsGroupRef.current = orbitsGroup;

    // Objects & Orbits
    const objectMeshes: { mesh: THREE.Mesh; data: SpaceObject; angle: number; speed: number; orbitR: number }[] = [];

    allObjects.forEach((obj, idx) => {
      const isSat = obj.type !== 'DEBRIS';
      const orbitR = earthRadius + (obj.altitudeKm / 500) * 0.8;
      const angleSpeed = 0.005 + (idx % 3) * 0.002;
      const inclination = (obj.inclinationDeg * Math.PI) / 180;

      const points: THREE.Vector3[] = [];
      const numSegments = 128;
      for (let i = 0; i <= numSegments; i++) {
        const theta = (i / numSegments) * Math.PI * 2;
        const x = orbitR * Math.cos(theta);
        const z = orbitR * Math.sin(theta);
        const y = Math.sin(theta) * Math.sin(inclination) * 0.8;
        points.push(new THREE.Vector3(x, y, z));
      }
      const orbitGeo = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMat = new THREE.LineBasicMaterial({
        color: isSat ? 0x38bdf8 : 0xef4444,
        transparent: true,
        opacity: isSat ? 0.35 : 0.45,
      });
      const orbitLine = new THREE.Line(orbitGeo, orbitMat);
      orbitsGroup.add(orbitLine);

      const objGeo = isSat
        ? new THREE.OctahedronGeometry(0.12)
        : new THREE.TetrahedronGeometry(0.1);
      const objMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(obj.orbitColor),
      });
      const objMesh = new THREE.Mesh(objGeo, objMat);
      objMesh.userData = { spaceObject: obj };

      if (isSat) {
        satellitesGroup.add(objMesh);
      } else {
        debrisGroup.add(objMesh);
      }

      objectMeshes.push({
        mesh: objMesh,
        data: obj,
        angle: (idx * Math.PI) / 3,
        speed: angleSpeed,
        orbitR: orbitR,
      });
    });

    // Collision Conjunction Pulse Marker Ring
    const collisionGeo = new THREE.RingGeometry(0.25, 0.35, 32);
    const collisionMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const collisionMesh = new THREE.Mesh(collisionGeo, collisionMat);
    const conjR = earthRadius + 0.85;
    collisionMesh.position.set(conjR * Math.cos(1.2), 0.4, conjR * Math.sin(1.2));
    collisionMesh.lookAt(camera.position);
    scene.add(collisionMesh);
    collisionMarkerRef.current = collisionMesh;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targets = [...satellitesGroup.children, ...debrisGroup.children];
      const intersects = raycaster.intersectObjects(targets);

      if (intersects.length > 0) {
        const clickedObj = intersects[0].object.userData.spaceObject as SpaceObject;
        if (clickedObj) {
          setSelectedObject(clickedObj);
        }
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('click', handleCanvasClick);

    // Orbit Controls simulation via drag
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      if (earthMesh) {
        earthMesh.rotation.y += deltaX * 0.005;
        earthMesh.rotation.x += deltaY * 0.005;
      }
      satellitesGroup.rotation.y += deltaX * 0.005;
      debrisGroup.rotation.y += deltaX * 0.005;
      orbitsGroup.rotation.y += deltaX * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      camera.position.z += e.deltaY * 0.008;
      camera.position.z = Math.max(5, Math.min(25, camera.position.z));
    };

    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      if (isRotating && earthMesh) {
        earthMesh.rotation.y += 0.0015;
      }

      objectMeshes.forEach((item) => {
        item.angle += item.speed * 0.5;
        const inc = (item.data.inclinationDeg * Math.PI) / 180;
        const x = item.orbitR * Math.cos(item.angle);
        const z = item.orbitR * Math.sin(item.angle);
        const y = Math.sin(item.angle) * Math.sin(inc) * 0.8;
        item.mesh.position.set(x, y, z);
      });

      if (collisionMesh) {
        const scale = 1 + Math.sin(clock.getElapsedTime() * 4) * 0.2;
        collisionMesh.scale.set(scale, scale, scale);
        collisionMesh.lookAt(camera.position);
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener('click', handleCanvasClick);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [isRotating]);

  useEffect(() => {
    if (satellitesGroupRef.current) satellitesGroupRef.current.visible = showSatellites;
    if (debrisGroupRef.current) debrisGroupRef.current.visible = showDebris;
    if (orbitsGroupRef.current) orbitsGroupRef.current.visible = showOrbits;
  }, [showSatellites, showDebris, showOrbits]);

  const resetCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 5, 12);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const focusSat01 = () => {
    if (cameraRef.current) {
      cameraRef.current.position.set(2, 3, 7);
      const sat01 = MOCK_SATELLITES[0];
      setSelectedObject(sat01);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-2xl overflow-hidden glass-panel border border-cyan-500/30">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Title */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="bg-space-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Eye className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-sm text-white">ORBITAL MAP VIEW</h2>
            <p className="text-[11px] font-telemetry text-cyan-400/80">3D REAL-TIME TRACKING ENGINE</p>
          </div>
        </div>
      </div>

      {/* Map Control Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-space-950/85 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30">
        <button
          onClick={() => setShowSatellites(!showSatellites)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition ${
            showSatellites ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Satellites</span>
        </button>

        <button
          onClick={() => setShowDebris(!showDebris)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition ${
            showDebris ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Debris</span>
        </button>

        <button
          onClick={() => setShowOrbits(!showOrbits)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-telemetry flex items-center gap-1.5 transition ${
            showOrbits ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Orbits</span>
        </button>

        <div className="w-[1px] h-5 bg-slate-800 my-auto" />

        <button
          onClick={focusSat01}
          className="px-2.5 py-1.5 rounded-lg text-xs font-telemetry bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30 flex items-center gap-1"
          title="Focus High-Risk Conjunction (SAT-01)"
        >
          <Target className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>SAT-01 Focus</span>
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-space-800 transition"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Object Inspector Panel */}
      {selectedObject && (
        <div className="absolute bottom-4 right-4 z-20 w-80 sm:w-96 glass-panel p-5 rounded-2xl border border-cyan-500/40 shadow-2xl animate-fadeIn">
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <span className={`text-[10px] font-telemetry font-bold px-2 py-0.5 rounded border uppercase ${
                selectedObject.type === 'DEBRIS'
                  ? 'bg-red-950/60 text-red-400 border-red-500/40'
                  : 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40'
              }`}>
                {selectedObject.type}
              </span>
              <h3 className="font-heading font-extrabold text-lg text-white mt-1">
                {selectedObject.name}
              </h3>
              <p className="text-xs font-telemetry text-slate-400">
                NORAD ID: #{selectedObject.noradId} | {selectedObject.designator}
              </p>
            </div>
            <button
              onClick={() => setSelectedObject(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-space-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 text-xs font-telemetry">
            <div className="p-2.5 rounded-xl bg-space-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">ALTITUDE</span>
              <span className="text-white font-bold text-sm">{selectedObject.altitudeKm} km</span>
            </div>
            <div className="p-2.5 rounded-xl bg-space-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">VELOCITY</span>
              <span className="text-white font-bold text-sm">{selectedObject.velocityKms} km/s</span>
            </div>
            <div className="p-2.5 rounded-xl bg-space-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">INCLINATION</span>
              <span className="text-white font-bold text-sm">{selectedObject.inclinationDeg}°</span>
            </div>
            <div className="p-2.5 rounded-xl bg-space-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">RISK LEVEL</span>
              <span className={`font-bold text-sm ${
                selectedObject.riskLevel === 'HIGH' ? 'text-red-400' : selectedObject.riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {selectedObject.riskLevel}
              </span>
            </div>
          </div>

          {selectedObject.id === 'sat-01' && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400 animate-bounce" />
                <div>
                  <p className="text-xs font-bold text-red-300">ACTIVE CONJUNCTION RISK</p>
                  <p className="text-[11px] text-slate-300 font-telemetry">DEBRIS-482 in 18h 24m (14.2 km)</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {onSelectConjunction && (
              <button
                onClick={() => onSelectConjunction('conj-01')}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 hover:bg-cyan-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Analyze Risk</span>
              </button>
            )}

            {onOpenSimulator && selectedObject.type !== 'DEBRIS' && (
              <button
                onClick={() => onOpenSimulator(selectedObject.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulate Maneuver</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-4 bg-space-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/20 text-xs font-telemetry text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"></span>
          <span>Satellite Payload</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          <span>Space Debris</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-red-400 font-bold">Conjunction Point</span>
        </div>
        <span className="text-slate-500 text-[10px]">Drag to rotate • Scroll to zoom</span>
      </div>

    </div>
  );
};
