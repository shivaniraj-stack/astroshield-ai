import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Shield, Orbit, ArrowRight } from 'lucide-react';

interface SatelliteLandingViewProps {
  onEnterMissionControl: () => void;
}

// Procedural High-Res Equirectangular Earth Texture Generator (100% Offline Reliable)
const generateEarthTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Ocean Base (Deep Oceanic Blue gradient)
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGrad.addColorStop(0, '#06132b');
  oceanGrad.addColorStop(0.5, '#0a2550');
  oceanGrad.addColorStop(1, '#06132b');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper to draw realistic landmasses
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
  drawLandmass(500, 320, 220, 140, '#1b4332'); // North America
  drawLandmass(650, 650, 130, 200, '#2d6a4f'); // South America
  drawLandmass(1250, 300, 350, 160, '#2d6a4f'); // Eurasia
  drawLandmass(1100, 520, 180, 210, '#b5838d'); // Africa
  drawLandmass(1650, 680, 140, 110, '#d4a373'); // Australia
  drawLandmass(1400, 420, 120, 90, '#1b4332');  // SE Asia

  // Polar Ice Caps
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, 70); // North Pole
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80); // South Pole

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

// Procedural Cloud Formation Texture Generator
const generateCloudTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 20 + Math.random() * 40;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

export const SatelliteLandingView: React.FC<SatelliteLandingViewProps> = ({
  onEnterMissionControl,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isZooming, setIsZooming] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // WebGL Scene Setup (Full Viewport 100dvh)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.008);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.0, 12.0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // OrbitControls for Drag & Pan
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.minDistance = 6.0;
    controls.maxDistance = 30.0;
    controls.target.set(0, -2.0, 0);

    // Deep-Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let i = 0; i < 2500; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 350,
        (Math.random() - 0.5) * 350,
        (Math.random() - 0.5) * 350
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Realistic Sun Lighting (Day/Night Terminator)
    const ambientLight = new THREE.AmbientLight(0x0b172a, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 4.0);
    sunLight.position.set(18, 12, 16);
    scene.add(sunLight);

    const oceanGlowLight = new THREE.DirectionalLight(0x00f0ff, 1.5);
    oceanGlowLight.position.set(-18, -8, -12);
    scene.add(oceanGlowLight);

    // 1. Large Photorealistic 3D Earth Globe (Positioned in Lower Viewport Safe Zone)
    const earthRadius = 5.2;
    const earthTexture = generateEarthTexture();
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      specular: 0x00f0ff,
      shininess: 25,
      emissive: 0x020817,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earthMesh);

    // 2. Independent Cloud Layer Sphere
    const cloudTexture = generateCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(earthRadius * 1.02, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(cloudMesh);

    // 3. Thin Atmospheric Rim Halo
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.045, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmosMesh);

    // 4. Prominent 3D Satellite Model
    const satelliteGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(0.9, 0.9, 1.4);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    satelliteGroup.add(bodyMesh);

    const foilGeo = new THREE.BoxGeometry(0.92, 0.3, 1.42);
    const foilMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.1,
    });
    const foilMesh = new THREE.Mesh(foilGeo, foilMat);
    satelliteGroup.add(foilMesh);

    const wingGeo = new THREE.BoxGeometry(3.6, 0.04, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-2.4, 0, 0);
    satelliteGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(2.4, 0, 0);
    satelliteGroup.add(rightWing);

    const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 0, 0.8);
    satelliteGroup.add(beaconMesh);

    // Glowing Aura Ring around Satellite
    const ringGeo = new THREE.RingGeometry(1.8, 1.95, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    satelliteGroup.add(ringMesh);

    scene.add(satelliteGroup);

    // Dynamic Orbital Trajectory Line
    const orbitGeo = new THREE.BufferGeometry();
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Mouse Raycasting & Hover State
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(satelliteGroup.children);

      if (intersects.length > 0) {
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      } else {
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }
    };

    const handleCanvasClick = () => {
      if (isHovered) {
        setIsZooming(true);
        setTimeout(() => {
          onEnterMissionControl();
        }, 800);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousemove', handleMouseMove);
    domEl.addEventListener('click', handleCanvasClick);

    // DUAL-MOTION ANIMATION ENGINE
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Motion 1: Earth & Cloud Self-Axis Rotation
      earthMesh.rotation.y = elapsed * 0.05;
      cloudMesh.rotation.y = elapsed * 0.08;
      starField.rotation.y = elapsed * 0.002;

      // Motion 2: Earth Scene Orbital Position Translation (Lower Viewport Arc)
      const sceneOrbitTheta = elapsed * 0.12; // Slow 45-second cinematic loop
      const earthX = Math.sin(sceneOrbitTheta) * 3.8;
      const earthY = -5.4 + Math.cos(sceneOrbitTheta * 0.5) * 1.0;
      const earthZ = -3.5 + Math.cos(sceneOrbitTheta) * 1.5;

      earthMesh.position.set(earthX, earthY, earthZ);
      cloudMesh.position.set(earthX, earthY, earthZ);
      atmosMesh.position.set(earthX, earthY, earthZ);

      // Satellite continuous orbital revolution around moving Earth
      const satTheta = elapsed * 0.45;
      const satOrbitR = 6.8;

      satelliteGroup.position.x = earthX + Math.cos(satTheta) * satOrbitR;
      satelliteGroup.position.z = earthZ + Math.sin(satTheta) * satOrbitR;
      satelliteGroup.position.y = earthY + Math.sin(satTheta) * 2.2;
      satelliteGroup.rotation.y = elapsed * 0.5;

      // Update Dynamic Orbit Trajectory Line around Earth's Position
      const orbitPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const t = (i / 128) * Math.PI * 2;
        orbitPts.push(new THREE.Vector3(
          earthX + Math.cos(t) * satOrbitR,
          earthY + Math.sin(t) * 2.2,
          earthZ + Math.sin(t) * satOrbitR
        ));
      }
      orbitGeo.setFromPoints(orbitPts);

      controls.update();

      // Hover Glow Intensity
      if (isHovered) {
        ringMat.opacity = 0.85 + Math.sin(elapsed * 6) * 0.15;
        beaconMat.color.setHex(0x00f0ff);
      } else {
        ringMat.opacity = 0.4;
      }

      // Smooth Camera Zoom Transition on Click
      if (isZooming) {
        camera.position.z -= 0.18;
        satelliteGroup.scale.multiplyScalar(1.02);
      }

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
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
      cancelAnimationFrame(animId);
      domEl.removeEventListener('mousemove', handleMouseMove);
      domEl.removeEventListener('click', handleCanvasClick);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      document.body.style.cursor = 'default';
      if (container.contains(domEl)) {
        container.removeChild(domEl);
      }
    };
  }, [isHovered, isZooming, onEnterMissionControl]);

  return (
    <div className="relative w-full h-screen h-[100dvh] overflow-hidden bg-space-950 flex flex-col justify-between p-6 sm:p-10 select-none">
      
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Branding */}
      <div className="relative z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                ASTROSHIELD
              </span>
              <span className="text-xs font-telemetry bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 font-bold">
                AI
              </span>
            </div>
            <p className="text-[10px] font-telemetry text-slate-400 uppercase tracking-widest">
              SPACE SITUATIONAL AWARENESS PLATFORM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-space-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-cyan-500/30 text-cyan-300 text-xs font-telemetry">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>ORBITAL REPOSITORY LIVE</span>
        </div>
      </div>

      {/* Landing Text Header (Clean Safe Zone Center) */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto pointer-events-none">
        <div className={`transition-all duration-300 transform ${
          isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-90'
        }`}>
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl text-white tracking-tight leading-none drop-shadow-[0_0_35px_rgba(0,240,255,0.5)]">
            ASTROSHIELD AI
          </h1>
          
          <p className="font-heading text-base sm:text-xl text-cyan-300 font-semibold mt-2 tracking-wide">
            AI-POWERED ORBITAL SAFETY & SPACE SITUATIONAL AWARENESS
          </p>

          <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl mx-auto mt-2 italic">
            "Protecting satellites. Predicting risks. Securing tomorrow's missions."
          </p>

          {/* Click Satellite CTA */}
          <div className="mt-8 pointer-events-auto">
            <button
              onClick={() => {
                setIsZooming(true);
                setTimeout(() => onEnterMissionControl(), 800);
              }}
              className={`group relative py-4 px-8 rounded-2xl font-telemetry text-xs sm:text-sm font-extrabold tracking-wider transition-all duration-300 ${
                isHovered
                  ? 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-space-950 shadow-[0_0_35px_rgba(0,240,255,0.8)] scale-105'
                  : 'bg-space-900/90 text-cyan-300 border border-cyan-400/50 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Orbit className="w-5 h-5 text-cyan-400 group-hover:text-space-950 animate-orbit-rotate" />
                <span>CLICK THE SATELLITE TO ENTER</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="relative z-10 flex items-center justify-between text-xs font-telemetry text-slate-400 border-t border-slate-800/80 pt-3 pointer-events-none">
        <span>🛰️ TAP OR CLICK THE SATELLITE TO INITIALIZE ACCESS</span>
        <span className="hidden sm:inline">ESA / NASA / NORAD TELEMETRY SIMULATION</span>
      </div>

    </div>
  );
};
