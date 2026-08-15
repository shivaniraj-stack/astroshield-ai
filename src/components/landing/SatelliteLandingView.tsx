import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Shield, Orbit, ArrowRight } from 'lucide-react';

interface SatelliteLandingViewProps {
  onEnterMissionControl: () => void;
}

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

    // 1. WebGL 3D Scene Setup (Full Viewport 100dvh)
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.01);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. OrbitControls for Interactive Mouse/Touch Dragging around Scene
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.6;
    controls.zoomSpeed = 0.8;
    controls.minDistance = 4.5;
    controls.maxDistance = 20.0;
    controls.target.set(0, 0, 0);

    // 3. Dense 2,000+ Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCoords: number[] = [];
    for (let i = 0; i < 2000; i++) {
      starCoords.push(
        (Math.random() - 0.5) * 250,
        (Math.random() - 0.5) * 250,
        (Math.random() - 0.5) * 250
      );
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starCoords, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.85 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.8);
    scene.add(ambientLight);

    const cyanSun = new THREE.DirectionalLight(0x00f0ff, 3.2);
    cyanSun.position.set(10, 10, 10);
    scene.add(cyanSun);

    const amberLight = new THREE.DirectionalLight(0xf59e0b, 1.6);
    amberLight.position.set(-10, -5, -5);
    scene.add(amberLight);

    // 4. Rotating 3D Earth Globe
    const earthRadius = 6.0;
    const earthGeo = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      color: 0x071530,
      specular: 0x00f0ff,
      shininess: 35,
      emissive: 0x020714,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthMesh.position.set(0, -7.5, -2);
    scene.add(earthMesh);

    // Atmospheric Glow Halo
    const atmosGeo = new THREE.SphereGeometry(earthRadius * 1.05, 64, 64);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    atmosMesh.position.set(0, -7.5, -2);
    scene.add(atmosMesh);

    // 5. Revolving 3D Satellite Model
    const satelliteGroup = new THREE.Group();

    const bodyGeo = new THREE.BoxGeometry(1.2, 1.2, 1.8);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    satelliteGroup.add(bodyMesh);

    const foilGeo = new THREE.BoxGeometry(1.22, 0.4, 1.82);
    const foilMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.1,
    });
    const foilMesh = new THREE.Mesh(foilGeo, foilMat);
    satelliteGroup.add(foilMesh);

    const wingGeo = new THREE.BoxGeometry(4.5, 0.05, 1.0);
    const wingMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x0369a1,
      emissiveIntensity: 0.4,
    });
    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.set(-3.0, 0, 0);
    satelliteGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat);
    rightWing.position.set(3.0, 0, 0);
    satelliteGroup.add(rightWing);

    const dishGeo = new THREE.ConeGeometry(0.6, 0.4, 32);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.1,
    });
    const dishMesh = new THREE.Mesh(dishGeo, dishMat);
    dishMesh.rotation.x = Math.PI;
    dishMesh.position.set(0, 0.9, 0);
    satelliteGroup.add(dishMesh);

    const beaconGeo = new THREE.SphereGeometry(0.15, 16, 16);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    beaconMesh.position.set(0, 0, 1.0);
    satelliteGroup.add(beaconMesh);

    // Glowing Aura Ring around Satellite
    const ringGeo = new THREE.RingGeometry(2.4, 2.55, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    satelliteGroup.add(ringMesh);

    satelliteGroup.position.set(0, 0.5, 0);
    scene.add(satelliteGroup);

    // Glowing Tilted Orbital Trajectory Curve
    const orbitPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const theta = (i / 128) * Math.PI * 2;
      orbitPoints.push(
        new THREE.Vector3(
          Math.cos(theta) * 4.2,
          Math.sin(theta) * 1.5 + 0.5,
          Math.sin(theta) * 4.2
        )
      );
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    scene.add(orbitLine);

    // Cursor Parallax & Raycaster Setup
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

    // Animation & Parallax Render Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      // Satellite continuous orbital revolution & self-rotation
      const orbitTheta = elapsed * 0.4;
      satelliteGroup.position.x = Math.cos(orbitTheta) * 3.8;
      satelliteGroup.position.z = Math.sin(orbitTheta) * 3.8;
      satelliteGroup.position.y = 0.5 + Math.sin(orbitTheta * 1.5) * 0.4;

      satelliteGroup.rotation.y = elapsed * 0.4;
      satelliteGroup.rotation.x = Math.sin(elapsed * 0.5) * 0.15;

      earthMesh.rotation.y = elapsed * 0.05;
      ringMesh.rotation.z = elapsed * 0.8;
      starField.rotation.y = elapsed * 0.005;

      controls.update();

      // Glow Intensity on Hover
      if (isHovered) {
        ringMat.opacity = 0.85 + Math.sin(elapsed * 6) * 0.15;
        beaconMat.color.setHex(0x00f0ff);
      } else {
        ringMat.opacity = 0.4;
      }

      // Smooth Camera Zoom Transition on Click
      if (isZooming) {
        camera.position.z -= 0.18;
        camera.position.y -= 0.02;
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

      {/* Landing Text Header (Center) */}
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
