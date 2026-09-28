"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bug,
  Globe2,
  Lightbulb,
  Clock,
  Send,
} from "lucide-react";

interface SupportFeedback3DProps {
  theme?: "light" | "dark";
  className?: string;
}

export function SupportFeedback3D({ theme = "dark", className = "" }: SupportFeedback3DProps) {
  const isDark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse interaction state for 3D tilt
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Central 3D Group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Core Geometric Beacon (Icosahedron with wireframe)
    const coreColor = isDark ? 0x00e5ff : 0x0284c7;
    const innerColor = isDark ? 0x6366f1 : 0x4f46e5;
    const wireColor = isDark ? 0x38bdf8 : 0x0369a1;

    // Central faceted crystal
    const crystalGeo = new THREE.IcosahedronGeometry(3.6, 1);
    const crystalMat = new THREE.MeshPhongMaterial({
      color: coreColor,
      emissive: isDark ? 0x004d66 : 0x082f49,
      specular: 0xffffff,
      shininess: 90,
      flatShading: true,
      transparent: true,
      opacity: 0.65,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    mainGroup.add(crystalMesh);

    // Glowing Wireframe Cage
    const wireGeo = new THREE.IcosahedronGeometry(3.7, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: wireColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.7 : 0.45,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    mainGroup.add(wireMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(2.1, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: innerColor,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.4 : 0.25,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    mainGroup.add(innerMesh);

    // 4. Concentric Orbital Rings (3 intersecting rings)
    const ringConfigs = [
      { radius: 5.6, tube: 0.04, color: 0x06b6d4, rotX: Math.PI / 4, rotY: 0 },
      { radius: 6.4, tube: 0.04, color: 0x8b5cf6, rotX: -Math.PI / 5, rotY: Math.PI / 3 },
      { radius: 7.2, tube: 0.035, color: 0x10b981, rotX: Math.PI / 3, rotY: -Math.PI / 4 },
    ];

    const orbitalRings: THREE.Mesh[] = [];
    ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 90);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: isDark ? 0.65 : 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = cfg.rotX;
      ring.rotation.y = cfg.rotY;
      mainGroup.add(ring);
      orbitalRings.push(ring);
    });

    // 5. Data Packets (Orbiting Spheres along rings)
    interface Packet {
      mesh: THREE.Mesh;
      ringIndex: number;
      speed: number;
      angle: number;
      radius: number;
    }
    const packets: Packet[] = [];
    orbitalRings.forEach((ring, idx) => {
      const pCount = 2;
      for (let p = 0; p < pCount; p++) {
        const pGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const pMat = new THREE.MeshBasicMaterial({
          color: idx === 0 ? 0x67e8f9 : idx === 1 ? 0xc084fc : 0x6ee7b7,
        });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        mainGroup.add(pMesh);
        packets.push({
          mesh: pMesh,
          ringIndex: idx,
          speed: 0.015 + idx * 0.006 + p * 0.005,
          angle: (p * Math.PI) + idx * 1.2,
          radius: ringConfigs[idx].radius,
        });
      }
    });

    // 6. Floating Ambient Starfield/Dust Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 6 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: isDark ? 0x93c5fd : 0x0284c7,
      size: 0.18,
      transparent: true,
      opacity: isDark ? 0.7 : 0.45,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 7. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.9 : 1.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00f0ff, isDark ? 2.5 : 1.8, 50);
    pointLight.position.set(10, 10, 15);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0xa855f7, isDark ? 2.0 : 1.4, 50);
    secondaryLight.position.set(-10, -10, 10);
    scene.add(secondaryLight);

    // Mouse tracking handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.45;
      mouseRef.current.targetY = y * 0.45;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
      setIsHovered(false);
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseenter", handleMouseEnter);

    // Window Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerping
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Group rotation (continuous base + mouse tilt)
      mainGroup.rotation.y = elapsedTime * 0.28 + mouseRef.current.x;
      mainGroup.rotation.x = Math.sin(elapsedTime * 0.2) * 0.15 + mouseRef.current.y;

      // Crystal counter-pulsing
      const scale = 1 + Math.sin(elapsedTime * 1.8) * 0.035;
      crystalMesh.scale.set(scale, scale, scale);
      wireMesh.scale.set(scale, scale, scale);
      crystalMesh.rotation.y = -elapsedTime * 0.35;
      wireMesh.rotation.x = elapsedTime * 0.25;

      // Orbital rings rotation
      orbitalRings[0].rotation.z = elapsedTime * 0.4;
      orbitalRings[1].rotation.y = elapsedTime * -0.35;
      orbitalRings[2].rotation.x = elapsedTime * 0.3;

      // Packets orbiting
      packets.forEach((p) => {
        p.angle += p.speed;
        const ring = orbitalRings[p.ringIndex];
        const localX = Math.cos(p.angle) * p.radius;
        const localY = Math.sin(p.angle) * p.radius;

        const vec = new THREE.Vector3(localX, localY, 0);
        vec.applyEuler(ring.rotation);
        p.mesh.position.copy(vec);
      });

      // Background dust rotation
      particlePoints.rotation.y = elapsedTime * 0.03;
      particlePoints.rotation.x = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseenter", handleMouseEnter);

      // Memory cleanup
      crystalGeo.dispose();
      crystalMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      orbitalRings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <section
      className={`relative overflow-hidden py-24 sm:py-28 transition-colors border-b ${
        isDark
          ? "bg-[#08080c] border-zinc-800/80 text-white"
          : "bg-[#f8fafc] border-zinc-200/80 text-zinc-900"
      } ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[500px] bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-indigo-500/10 blur-3xl opacity-80" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Compelling CTA Copy & Quick Launchers (7 cols) */}
          <div className="lg:col-span-7 space-y-7 text-left">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-4">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>05 // Community & Direct Support Desk</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Have a Question, Feedback,{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  or Language Request?
                </span>
              </h2>

              <p
                className={`mt-4 text-base sm:text-lg leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                Gabvia is engineered directly with the people who talk across borders every day.
                Whether you noticed an issue, want a regional dialect prioritized, or have an idea to make
                translation even more natural — our engineering and support desk reads every message.
              </p>
            </div>

            {/* Quick Action Category Pills */}
            <div className="space-y-2.5">
              <span className={`text-xs font-mono uppercase tracking-wider block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                Quick Actions
              </span>
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    label: "Report an Issue",
                    topic: "Bug Report",
                    icon: Bug,
                    color: "hover:border-rose-500/40 hover:bg-rose-500/10 text-rose-300",
                  },
                  {
                    label: "Suggest a Feature",
                    topic: "Feature Suggestion",
                    icon: Lightbulb,
                    color: "hover:border-amber-500/40 hover:bg-amber-500/10 text-amber-300",
                  },
                  {
                    label: "Request a Language",
                    topic: "Language Request",
                    icon: Globe2,
                    color: "hover:border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-300",
                  },
                  {
                    label: "Account & Keys Help",
                    topic: "Account & Security",
                    icon: ShieldCheck,
                    color: "hover:border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-300",
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.label}
                      href={`/support?topic=${encodeURIComponent(action.topic)}`}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
                        isDark
                          ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300"
                          : "border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700"
                      } ${action.color}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Primary Action Button Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/support"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Send Support Query or Feedback</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 rounded-2xl ring-2 ring-white/20 group-hover:ring-white/40 transition-all pointer-events-none" />
              </Link>

              <a
                href="mailto:officialgabvia@gmail.com"
                className={`inline-flex items-center justify-center gap-2 px-5 py-4 rounded-2xl border text-sm font-semibold transition-all ${
                  isDark
                    ? "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white"
                    : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-700 hover:text-zinc-950"
                }`}
              >
                <Send className="w-4 h-4 text-cyan-400" />
                <span>officialgabvia@gmail.com</span>
              </a>
            </div>

            {/* Trust Metrics Bar */}
            <div
              className={`pt-4 flex flex-wrap items-center gap-6 text-xs font-mono ${
                isDark ? "text-zinc-400" : "text-zinc-600"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>&lt; 24h Review Window</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ticket Tracking ID</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>100+ Languages Covered</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Beacon with Holographic Callouts (5 cols) */}
          <div className="lg:col-span-5 relative w-full flex items-center justify-center">
            <div
              ref={containerRef}
              className={`relative w-full aspect-square max-w-[460px] rounded-3xl border overflow-hidden transition-all duration-300 ${
                isDark
                  ? "border-white/10 bg-gradient-to-b from-zinc-900/50 via-black/40 to-zinc-950/70 shadow-2xl shadow-cyan-950/20"
                  : "border-zinc-200 bg-gradient-to-b from-white via-sky-50/30 to-slate-100 shadow-xl"
              } ${isHovered ? "ring-2 ring-cyan-500/30 shadow-cyan-500/10" : ""}`}
            >
              {/* Three.js Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-full block cursor-grab active:cursor-grabbing"
              />

              {/* Floating Holographic Badge 1 (Top Left) */}
              <div className="absolute top-4 left-4 pointer-events-none animate-bounce duration-1000">
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg text-[11px] font-mono ${
                    isDark
                      ? "bg-zinc-900/80 border-cyan-500/30 text-cyan-300"
                      : "bg-white/80 border-cyan-400/40 text-cyan-700"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>SUPPORT DESK LIVE</span>
                </div>
              </div>

              {/* Floating Feedback Card Preview (Bottom Center) */}
              <div className="absolute bottom-4 inset-x-4 pointer-events-none">
                <div
                  className={`p-3.5 rounded-2xl border backdrop-blur-xl shadow-xl transition-transform duration-300 ${
                    isDark
                      ? "bg-zinc-900/85 border-white/10 text-zinc-200"
                      : "bg-white/90 border-zinc-200 text-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Recent Community Feedback</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-medium">
                      Status: Under Review
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 line-clamp-1 italic">
                    &ldquo;Can you add auto-translation for voice notes in Wolof and Bambara?&rdquo;
                  </p>
                </div>
              </div>

              {/* Interactive prompt hint */}
              <div className="absolute top-4 right-4 pointer-events-none">
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase">
                  3D INTERACTIVE
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
