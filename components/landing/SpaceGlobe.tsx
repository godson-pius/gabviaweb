"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface SpaceGlobeProps {
  className?: string;
}

interface CountryNode {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  isRwanda?: boolean;
  region: "africa" | "europe" | "americas" | "asia" | "oceania";
  offsetY?: number; // custom pixel offset to prevent collision
  offsetX?: number;
}

const COUNTRIES: CountryNode[] = [
  // --- RWANDA (Highlighted with elevated callout stem) ---
  { id: "rwanda", name: "Rwanda", flag: "🇷🇼", lat: -1.94, lng: 30.06, isRwanda: true, region: "africa" },

  // --- AFRICA ---
  { id: "kenya", name: "Kenya", flag: "🇰🇪", lat: -1.29, lng: 36.82, region: "africa", offsetX: 18, offsetY: -2 },
  { id: "tanzania", name: "Tanzania", flag: "🇹🇿", lat: -6.79, lng: 39.28, region: "africa", offsetX: 14, offsetY: 12 },
  { id: "uganda", name: "Uganda", flag: "🇺🇬", lat: 0.34, lng: 32.58, region: "africa", offsetX: -16, offsetY: -14 },
  { id: "nigeria", name: "Nigeria", flag: "🇳🇬", lat: 9.08, lng: 7.4, region: "africa", offsetX: 0, offsetY: 0 },
  { id: "ghana", name: "Ghana", flag: "🇬🇭", lat: 5.60, lng: -0.18, region: "africa", offsetX: -12, offsetY: 8 },
  { id: "south-africa", name: "South Africa", flag: "🇿🇦", lat: -29.0, lng: 25.0, region: "africa", offsetX: 0, offsetY: 10 },
  { id: "egypt", name: "Egypt", flag: "🇪🇬", lat: 26.8, lng: 30.8, region: "africa", offsetX: 0, offsetY: -8 },
  { id: "ethiopia", name: "Ethiopia", flag: "🇪🇹", lat: 9.03, lng: 38.74, region: "africa", offsetX: 16, offsetY: -6 },
  { id: "senegal", name: "Senegal", flag: "🇸🇳", lat: 14.71, lng: -17.46, region: "africa", offsetX: -16, offsetY: 0 },
  { id: "morocco", name: "Morocco", flag: "🇲🇦", lat: 31.79, lng: -7.09, region: "africa", offsetX: 0, offsetY: -8 },
  { id: "drc", name: "DR Congo", flag: "🇨🇩", lat: -4.03, lng: 21.75, region: "africa", offsetX: -16, offsetY: 8 },

  // --- EUROPE ---
  { id: "uk", name: "United Kingdom", flag: "🇬🇧", lat: 53.0, lng: -2.0, region: "europe", offsetX: -10, offsetY: -8 },
  { id: "france", name: "France", flag: "🇫🇷", lat: 46.6, lng: 2.2, region: "europe", offsetX: 10, offsetY: 4 },
  { id: "germany", name: "Germany", flag: "🇩🇪", lat: 51.1, lng: 10.4, region: "europe", offsetX: 12, offsetY: -8 },
  { id: "spain", name: "Spain", flag: "🇪🇸", lat: 40.4, lng: -3.7, region: "europe", offsetX: -12, offsetY: 6 },
  { id: "italy", name: "Italy", flag: "🇮🇹", lat: 41.8, lng: 12.5, region: "europe", offsetX: 10, offsetY: 8 },

  // --- AMERICAS ---
  { id: "usa", name: "USA", flag: "🇺🇸", lat: 38.0, lng: -97.0, region: "americas", offsetX: 0, offsetY: -8 },
  { id: "canada", name: "Canada", flag: "🇨🇦", lat: 56.1, lng: -106.3, region: "americas", offsetX: 0, offsetY: -12 },
  { id: "brazil", name: "Brazil", flag: "🇧🇷", lat: -14.2, lng: -51.9, region: "americas", offsetX: 0, offsetY: 8 },
  { id: "mexico", name: "Mexico", flag: "🇲🇽", lat: 23.6, lng: -102.5, region: "americas", offsetX: -10, offsetY: 6 },
  { id: "argentina", name: "Argentina", flag: "🇦🇷", lat: -38.4, lng: -63.6, region: "americas", offsetX: 0, offsetY: 12 },
  { id: "colombia", name: "Colombia", flag: "🇨🇴", lat: 4.57, lng: -74.29, region: "americas", offsetX: -12, offsetY: 0 },

  // --- ASIA & MIDDLE EAST ---
  { id: "japan", name: "Japan", flag: "🇯🇵", lat: 36.2, lng: 138.2, region: "asia", offsetX: 10, offsetY: -6 },
  { id: "south-korea", name: "S. Korea", flag: "🇰🇷", lat: 35.9, lng: 127.7, region: "asia", offsetX: -12, offsetY: -4 },
  { id: "china", name: "China", flag: "🇨🇳", lat: 35.8, lng: 104.1, region: "asia", offsetX: 0, offsetY: -8 },
  { id: "india", name: "India", flag: "🇮🇳", lat: 20.5, lng: 78.9, region: "asia", offsetX: 0, offsetY: 6 },
  { id: "uae", name: "UAE", flag: "🇦🇪", lat: 23.4, lng: 53.8, region: "asia", offsetX: 10, offsetY: -6 },
  { id: "saudi", name: "Saudi Arabia", flag: "🇸🇦", lat: 23.8, lng: 45.0, region: "asia", offsetX: -10, offsetY: 8 },
  { id: "singapore", name: "Singapore", flag: "🇸🇬", lat: 1.35, lng: 103.8, region: "asia", offsetX: 12, offsetY: 6 },

  // --- OCEANIA ---
  { id: "australia", name: "Australia", flag: "🇦🇺", lat: -25.2, lng: 133.7, region: "oceania", offsetX: 0, offsetY: 8 },
];

function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

interface SpaceGlobeProps {
  className?: string;
  theme?: "light" | "dark";
}

export function SpaceGlobe({ className = "", theme = "light" }: SpaceGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersContainerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    const markersContainer = markersContainerRef.current;
    if (!container || !markersContainer) return;

    let animId: number;
    let width = container.clientWidth || 500;
    let height = container.clientHeight || 500;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 240;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    // Rotate initially so Africa and Rwanda face forward prominently
    rootGroup.rotation.y = -Math.PI * 0.65;
    rootGroup.rotation.x = 0.12;
    scene.add(rootGroup);

    const GLOBE_RADIUS = 66;

    // 2. Wireframe Sphere
    const icoGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS, 2);
    const wireframeGeo = new THREE.WireframeGeometry(icoGeo);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x52525b : 0x18181b,
      transparent: true,
      opacity: isDark ? 0.32 : 0.18,
    });
    const wireframe = new THREE.LineSegments(wireframeGeo, wireframeMat);
    rootGroup.add(wireframe);

    // Inner Translucent Core
    const innerGeo = new THREE.IcosahedronGeometry(GLOBE_RADIUS * 0.88, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x18181b : 0xf4f4f5,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.5 : 0.35,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    rootGroup.add(innerMesh);

    // Center Core Nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(18, 1);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x00d2ff,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    rootGroup.add(nucleus);

    // 3. Technical Rings
    const ringMat1 = new THREE.LineBasicMaterial({
      color: 0x71717a,
      transparent: true,
      opacity: 0.22,
    });
    const ringGeo1 = new THREE.RingGeometry(88, 88.5, 64);
    const ring1 = new THREE.LineLoop(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2.3;
    ring1.rotation.y = Math.PI / 6;
    rootGroup.add(ring1);

    const ringMat2 = new THREE.LineBasicMaterial({
      color: 0x00d2ff,
      transparent: true,
      opacity: 0.45,
    });
    const ringGeo2 = new THREE.RingGeometry(104, 104.5, 64);
    const ring2 = new THREE.LineLoop(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 3;
    ring2.rotation.z = Math.PI / 4;
    rootGroup.add(ring2);

    // 4. Country 3D Positions & Rwanda Beacon
    const country3DData: {
      id: string;
      position: THREE.Vector3;
      isRwanda: boolean;
      rippleMesh?: THREE.Mesh;
    }[] = [];

    COUNTRIES.forEach((c) => {
      const pos = latLngToVector3(c.lat, c.lng, GLOBE_RADIUS);

      if (c.isRwanda) {
        // Glowing base dot on Rwanda
        const markerGeo = new THREE.SphereGeometry(2.8, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x00d2ff });
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(pos);
        rootGroup.add(markerMesh);

        // Stalk sticking outwards to lift the badge above neighbors
        const stalkDir = pos.clone().normalize();
        const stalkEnd = pos.clone().add(stalkDir.clone().multiplyScalar(9));
        const stalkGeo = new THREE.BufferGeometry().setFromPoints([pos, stalkEnd]);
        const stalkMat = new THREE.LineBasicMaterial({ color: 0x00d2ff, linewidth: 2 });
        const stalk = new THREE.Line(stalkGeo, stalkMat);
        rootGroup.add(stalk);

        // Radar Ripple on ground
        const rippleGeo = new THREE.RingGeometry(1.8, 4.2, 32);
        const rippleMat = new THREE.MeshBasicMaterial({
          color: 0x00d2ff,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        });
        const ripple = new THREE.Mesh(rippleGeo, rippleMat);
        ripple.position.copy(pos.clone().add(stalkDir.clone().multiplyScalar(0.4)));
        ripple.lookAt(pos.clone().add(stalkDir));
        rootGroup.add(ripple);

        country3DData.push({ id: c.id, position: stalkEnd, isRwanda: true, rippleMesh: ripple });
      } else {
        // Sleek 3D pin point on globe surface
        const pinSize = c.region === "africa" ? 1.8 : 1.4;
        const pinColor = c.region === "africa" ? (isDark ? 0xffffff : 0x09090b) : (isDark ? 0x71717a : 0xa1a1aa);
        const markerGeo = new THREE.SphereGeometry(pinSize, 10, 10);
        const markerMat = new THREE.MeshBasicMaterial({ color: pinColor });
        const markerMesh = new THREE.Mesh(markerGeo, markerMat);
        markerMesh.position.copy(pos);
        rootGroup.add(markerMesh);

        country3DData.push({ id: c.id, position: pos, isRwanda: false });
      }
    });

    // 5. Connecting Translation Arcs across Continents
    const rwandaPos = country3DData.find((c) => c.isRwanda)?.position || new THREE.Vector3(0, 0, GLOBE_RADIUS);
    const destIds = ["kenya", "nigeria", "south-africa", "egypt", "france", "uk", "usa", "japan", "brazil", "india"];

    interface ArcTrack {
      curve: THREE.QuadraticBezierCurve3;
      packet: THREE.Mesh;
      speed: number;
      progress: number;
    }
    const arcTracks: ArcTrack[] = [];

    destIds.forEach((destId, i) => {
      const dest = country3DData.find((c) => c.id === destId);
      if (!dest) return;

      const p1 = rwandaPos;
      const p2 = dest.position;

      const mid = p1.clone().add(p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + Math.min(34, distance * 0.32));

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(36);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x00d2ff : 0x2c6bed,
        transparent: true,
        opacity: 0.35,
      });
      const arcLine = new THREE.Line(lineGeo, lineMat);
      rootGroup.add(arcLine);

      // Packet
      const packetGeo = new THREE.SphereGeometry(1.3, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00d2ff : 0x2c6bed,
      });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      rootGroup.add(packet);

      arcTracks.push({
        curve,
        packet,
        speed: 0.005 + (i % 3) * 0.002,
        progress: (i * 0.12) % 1,
      });
    });

    // 6. Ambient Constellation Particles
    const particleCount = 130;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 95 + Math.random() * 45;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.cos(phi);
      particlePositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xa1a1aa,
      size: 1.8,
      transparent: true,
      opacity: 0.35,
    });
    const ambientParticles = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(ambientParticles);

    // 7. Mouse / Touch Drag Interaction
    let targetRotX = rootGroup.rotation.x;
    let targetRotY = rootGroup.rotation.y;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        targetRotY += deltaX * 0.007;
        targetRotX += deltaY * 0.007;
        targetRotX = Math.max(-Math.PI * 0.42, Math.min(Math.PI * 0.42, targetRotX));
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = entry.contentRect.width || 400;
        height = entry.contentRect.height || 400;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // 9. Animation Loop
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();
    const cameraWorldPos = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation when user isn't dragging
      if (!isDragging) {
        targetRotY += 0.0022;
      }

      rootGroup.rotation.y += (targetRotY - rootGroup.rotation.y) * 0.06;
      rootGroup.rotation.x += (targetRotX - rootGroup.rotation.x) * 0.06;

      innerMesh.rotation.y = -elapsedTime * 0.07;
      nucleus.rotation.y = elapsedTime * 0.2;
      ring1.rotation.z = elapsedTime * 0.1;
      ring2.rotation.y = -elapsedTime * 0.09;

      const rwandaItem = country3DData.find((c) => c.isRwanda);
      if (rwandaItem?.rippleMesh) {
        const rippleScale = 1 + (Math.sin(elapsedTime * 3) + 1) * 0.35;
        rwandaItem.rippleMesh.scale.set(rippleScale, rippleScale, 1);
      }

      arcTracks.forEach((arc) => {
        arc.progress = (arc.progress + arc.speed) % 1;
        const pt = arc.curve.getPoint(arc.progress);
        arc.packet.position.copy(pt);
      });

      renderer.render(scene, camera);

      // Project Country Markers
      camera.getWorldPosition(cameraWorldPos);

      country3DData.forEach((c) => {
        const markerEl = document.getElementById(`country-marker-${c.id}`);
        if (!markerEl) return;

        tempVec.copy(c.position);
        tempVec.applyMatrix4(rootGroup.matrixWorld);

        const toCamera = cameraWorldPos.clone().sub(tempVec).normalize();
        const normal = tempVec.clone().normalize();
        const dot = normal.dot(toCamera);

        // Only show when on the front hemisphere
        const isFacing = dot > 0.08;

        if (isFacing) {
          tempVec.project(camera);
          const x = (tempVec.x * 0.5 + 0.5) * width;
          const y = (-(tempVec.y * 0.5) + 0.5) * height;

          markerEl.style.display = "flex";
          markerEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;

          if (c.isRwanda) {
            markerEl.style.opacity = "1";
            markerEl.style.zIndex = "30";
          } else {
            const opacity = Math.min(1, Math.max(0.2, (dot - 0.08) * 1.8));
            markerEl.style.opacity = `${opacity}`;
            markerEl.style.zIndex = "10";
          }
        } else {
          markerEl.style.display = "none";
        }
      });
    };

    animate();

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      renderer.dispose();
      icoGeo.dispose();
      wireframeGeo.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none ${className}`}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full min-h-[400px] sm:min-h-[460px] md:min-h-[500px]" />

      {/* 2D Projected Markers Overlay */}
      <div
        ref={markersContainerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {COUNTRIES.map((country) => {
          if (country.isRwanda) {
            return (
              <div
                key={country.id}
                id={`country-marker-${country.id}`}
                className="absolute top-0 left-0 hidden pointer-events-auto"
                style={{ transformOrigin: "bottom center" }}
              >
                {/* Elevated Rwanda Callout Pin - Floats ABOVE the coordinate so neighbors remain fully visible */}
                <div className="flex flex-col items-center -translate-x-1/2 -translate-y-full pb-1">
                  {/* Glowing Badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white font-mono text-[11px] font-bold shadow-lg shadow-blue-500/35 border-2 border-white whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-sky-200 animate-ping inline-block" />
                    <span className="text-xs">🇷🇼</span>
                    <span className="tracking-wider">RWANDA</span>
                  </div>
                  {/* Delicate indicator pointer line down to Rwanda ground point */}
                  <div className="w-[2px] h-3 bg-sky-400 shadow-xs" />
                  <div className="w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white shadow-xs" />
                </div>
              </div>
            );
          }

          // Other countries: compact sleek micro-chips with smart offsets
          const ox = country.offsetX || 0;
          const oy = country.offsetY || 0;

          return (
            <div
              key={country.id}
              id={`country-marker-${country.id}`}
              className="absolute top-0 left-0 hidden pointer-events-auto"
            >
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[9px] whitespace-nowrap transition-transform backdrop-blur-xs border shadow-2xs ${
                  country.region === "africa"
                    ? isDark
                      ? "bg-zinc-900/95 text-zinc-100 border-zinc-700 font-bold -translate-x-1/2 -translate-y-1/2"
                      : "bg-white/95 text-zinc-950 border-zinc-300 font-bold -translate-x-1/2 -translate-y-1/2"
                    : isDark
                      ? "bg-zinc-900/80 text-zinc-400 border-zinc-800 -translate-x-1/2 -translate-y-1/2"
                      : "bg-white/80 text-zinc-700 border-zinc-200 -translate-x-1/2 -translate-y-1/2"
                }`}
                style={{
                  transform: `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`,
                }}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Header Badge */}
      <div
        className={`absolute top-4 left-4 pointer-events-none flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-xs backdrop-blur-sm ${
          isDark
            ? "bg-zinc-900/90 text-zinc-300 border-zinc-800"
            : "bg-white/90 text-zinc-600 border-zinc-200/80"
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
        <span>GLOBAL MULTILINGUAL NETWORK</span>
      </div>

      {/* Footer Tag */}
      <div
        className={`absolute bottom-4 right-4 pointer-events-none font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border backdrop-blur-xs ${
          isDark
            ? "bg-zinc-900/80 text-zinc-400 border-zinc-800"
            : "bg-white/95 text-zinc-700 border-zinc-300 font-medium"
        }`}
      >
        <span>DRAG TO EXPLORE ALL REGIONS</span>
      </div>
    </div>
  );
}
