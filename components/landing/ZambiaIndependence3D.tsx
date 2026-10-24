"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  Sparkles,
  Compass,
  Shield,
  MapPin,
  ExternalLink,
} from "lucide-react";

interface ZambiaIndependence3DProps {
  className?: string;
  theme?: "light" | "dark";
  onOpenHistory?: () => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

// Landmark nodes around Zambia for the 3D scene
const ZAMBIA_LANDMARKS = [
  {
    name: "Independence Stadium (Lusaka)",
    desc: "Midnight 24 Oct 1964 Flag Raising",
    angle: 0,
    r: 2.7,
    color: "#ef7d00",
  },
  {
    name: "Mosi-oa-Tunya (Victoria Falls)",
    desc: "The Smoke That Thunders (1,708m Wide)",
    angle: Math.PI * 0.5,
    r: 2.6,
    color: "#38bdf8",
  },
  {
    name: "The Freedom Statue (Lusaka)",
    desc: "The Chain Breaker • National Courage",
    angle: Math.PI,
    r: 2.8,
    color: "#22c55e",
  },
  {
    name: "The Copperbelt (Ndola & Kitwe)",
    desc: "World's Legendary Copper & Mineral Heart",
    angle: Math.PI * 1.5,
    r: 2.7,
    color: "#f97316",
  },
];

/**
 * Creates a high-resolution CanvasTexture representing the Zambia Independence Medallion.
 * Features:
 * - Rich Zambian Green field (#0f6b0f)
 * - Lower right quadrant featuring the 3 vertical stripes: Red, Black, Copper Orange
 * - The majestic African Fish Eagle (Haliaeetus vocifer) in flight with outspread wings, white head, and copper wings
 * - Outer copper/gold metallic bezel with embossed typography:
 *   "★ ZAMBIA INDEPENDENCE ★ 24 OCTOBER 1964 ★ ONE ZAMBIA, ONE NATION ★"
 */
function createZambiaMedallionTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // Background deep circular shield
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  // 1. Lush Emerald Green Base Field
  const greenGrad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  greenGrad.addColorStop(0, "#198a00");
  greenGrad.addColorStop(0.65, "#106300");
  greenGrad.addColorStop(1, "#073a00");
  ctx.fillStyle = greenGrad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Subtle circular sunburst / grain
  ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 36; i++) {
    const angle = (i * Math.PI) / 18;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.stroke();
  }

  // 2. The 3 Lower Fly Stripes: Red, Black, Copper Orange
  // We place them in the lower half of the medallion
  const stripeW = radius * 0.28;
  const stripeH = radius * 0.72;
  const startX = cx - (stripeW * 3) / 2;
  const startY = cy + radius * 0.15;

  // Red stripe (Freedom struggle)
  ctx.fillStyle = "#de2010";
  ctx.fillRect(startX, startY, stripeW, stripeH);

  // Black stripe (Zambian people)
  ctx.fillStyle = "#0c0d10";
  ctx.fillRect(startX + stripeW, startY, stripeW, stripeH);

  // Copper Orange stripe (Mineral wealth)
  ctx.fillStyle = "#ef7d00";
  ctx.fillRect(startX + stripeW * 2, startY, stripeW, stripeH);

  // Delicate metallic dividers between stripes
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, stripeW * 3, stripeH);
  ctx.beginPath();
  ctx.moveTo(startX + stripeW, startY);
  ctx.lineTo(startX + stripeW, startY + stripeH);
  ctx.moveTo(startX + stripeW * 2, startY);
  ctx.lineTo(startX + stripeW * 2, startY + stripeH);
  ctx.stroke();

  // 3. Central Soaring African Fish Eagle (Haliaeetus vocifer)
  // Positioned proudly above the stripes, with majestic outspread wings
  ctx.save();
  ctx.translate(cx, cy - 80);

  // Eagle Wing Glow
  const eagleGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, 180);
  eagleGlow.addColorStop(0, "rgba(245, 158, 11, 0.45)");
  eagleGlow.addColorStop(0.6, "rgba(234, 88, 12, 0.15)");
  eagleGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = eagleGlow;
  ctx.beginPath();
  ctx.arc(0, 0, 180, 0, Math.PI * 2);
  ctx.fill();

  // Eagle Outspread Wings (Left Wing)
  ctx.beginPath();
  ctx.moveTo(-15, 20);
  ctx.quadraticCurveTo(-70, -30, -180, -75);
  ctx.quadraticCurveTo(-150, -40, -165, -15);
  ctx.quadraticCurveTo(-135, -5, -145, 15);
  ctx.quadraticCurveTo(-115, 20, -120, 38);
  ctx.quadraticCurveTo(-80, 45, -15, 40);
  ctx.closePath();
  const leftWingGrad = ctx.createLinearGradient(-180, -75, -15, 40);
  leftWingGrad.addColorStop(0, "#f59e0b");
  leftWingGrad.addColorStop(0.4, "#ea580c");
  leftWingGrad.addColorStop(1, "#c2410c");
  ctx.fillStyle = leftWingGrad;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Eagle Outspread Wings (Right Wing)
  ctx.beginPath();
  ctx.moveTo(15, 20);
  ctx.quadraticCurveTo(70, -30, 180, -75);
  ctx.quadraticCurveTo(150, -40, 165, -15);
  ctx.quadraticCurveTo(135, -5, 145, 15);
  ctx.quadraticCurveTo(115, 20, 120, 38);
  ctx.quadraticCurveTo(80, 45, 15, 40);
  ctx.closePath();
  const rightWingGrad = ctx.createLinearGradient(180, -75, 15, 40);
  rightWingGrad.addColorStop(0, "#f59e0b");
  rightWingGrad.addColorStop(0.4, "#ea580c");
  rightWingGrad.addColorStop(1, "#c2410c");
  ctx.fillStyle = rightWingGrad;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wing Primary Feather Highlights
  ctx.strokeStyle = "#fef08a";
  ctx.lineWidth = 3;
  for (let f = -5; f <= 5; f++) {
    if (f === 0) continue;
    const sign = f > 0 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(sign * 25, 20 + Math.abs(f) * 2);
    ctx.lineTo(sign * (70 + Math.abs(f) * 18), -15 + Math.abs(f) * 8);
    ctx.stroke();
  }

  // Eagle Torso & Tail Feathers
  ctx.beginPath();
  ctx.moveTo(-22, 15);
  ctx.lineTo(-12, 85);
  ctx.lineTo(0, 95);
  ctx.lineTo(12, 85);
  ctx.lineTo(22, 15);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Torso Chest (Chestnut/Brown plumage)
  ctx.beginPath();
  ctx.ellipse(0, 25, 24, 32, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#9a3412";
  ctx.fill();

  // Iconic White Head & Neck
  ctx.beginPath();
  ctx.moveTo(-16, 5);
  ctx.quadraticCurveTo(-14, -25, -12, -45);
  ctx.quadraticCurveTo(0, -60, 12, -45);
  ctx.quadraticCurveTo(14, -25, 16, 5);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.4)";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Sharp Hooked Golden Beak
  ctx.beginPath();
  ctx.moveTo(-4, -48);
  ctx.lineTo(0, -65);
  ctx.lineTo(14, -54);
  ctx.quadraticCurveTo(8, -48, -4, -48);
  ctx.closePath();
  ctx.fillStyle = "#facc15";
  ctx.fill();

  // Eye
  ctx.beginPath();
  ctx.arc(3, -48, 3, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  ctx.restore(); // end eagle translate

  // Radial metallic shading for curved depth
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.22)");
  grad.addColorStop(0.6, "rgba(0, 0, 0, 0.05)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.7)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore(); // end clip

  // 4. Outer Copper & Gold Bezel Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 36;
  const copperStroke = ctx.createLinearGradient(0, 0, size, size);
  copperStroke.addColorStop(0, "#ffedd5");
  copperStroke.addColorStop(0.25, "#fb923c");
  copperStroke.addColorStop(0.5, "#ea580c");
  copperStroke.addColorStop(0.75, "#c2410c");
  copperStroke.addColorStop(1, "#7c2d12");
  ctx.strokeStyle = copperStroke;
  ctx.stroke();

  // Inner and outer rim grooves
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius + 18, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // 5. Circular Typography along the outer rim
  ctx.save();
  ctx.translate(cx, cy);
  const textRadius = radius;
  const bannerText = "★  ZAMBIA INDEPENDENCE  ★  24 OCTOBER 1964  ★  ONE ZAMBIA, ONE NATION  ";
  ctx.font = "bold 20px 'Courier New', monospace, sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const totalAngle = Math.PI * 2;
  const charStep = totalAngle / bannerText.length;
  for (let i = 0; i < bannerText.length; i++) {
    const angle = i * charStep - Math.PI / 2;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -textRadius);
    ctx.fillText(bannerText[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Creates a reverse-side texture for the 3D coin.
 * Features:
 * - Brushed warm copper plate
 * - Victoria Falls (Mosi-oa-Tunya) water cascades motif
 * - The Freedom Torch & Chain Breaker homage
 * - Text: "REPUBLIC OF ZAMBIA • 1964-2026 • 62 YEARS OF SOVEREIGNTY"
 */
function createZambiaReverseTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // Background brushed copper plate
  const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  bgGrad.addColorStop(0, "#fed7aa");
  bgGrad.addColorStop(0.4, "#fb923c");
  bgGrad.addColorStop(0.75, "#ea580c");
  bgGrad.addColorStop(1, "#7c2d12");

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Inner decorative engraved rings
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
  ctx.strokeStyle = "#7c2d12";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.84, 0, Math.PI * 2);
  ctx.strokeStyle = "#c2410c";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center Emblem Content
  ctx.save();
  ctx.translate(cx, cy);

  // Commemorative 1964
  ctx.font = "900 86px system-ui, sans-serif";
  ctx.fillStyle = "#431407";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,255,255,0.5)";
  ctx.shadowOffsetY = 2;
  ctx.fillText("1964", 0, -100);

  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillStyle = "#7c2d12";
  ctx.fillText("24th OCTOBER", 0, -40);

  // Divider lines
  ctx.strokeStyle = "#9a3412";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-160, -10);
  ctx.lineTo(160, -10);
  ctx.stroke();

  // Motto
  ctx.font = "800 24px monospace, sans-serif";
  ctx.fillStyle = "#0c0a09";
  ctx.fillText("ONE ZAMBIA, ONE NATION", 0, 25);

  ctx.font = "600 20px system-ui, sans-serif";
  ctx.fillStyle = "#9a3412";
  ctx.fillText("62 YEARS OF SOVEREIGNTY", 0, 65);

  ctx.font = "bold 16px monospace, sans-serif";
  ctx.fillStyle = "#431407";
  ctx.fillText("MOSI-OA-TUNYA • THE SMOKE THAT THUNDERS", 0, 105);

  // Three Stars for Freedom, Unity, and Peace
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#431407";
  ctx.fillText("★   ★   ★", 0, 150);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function ZambiaIndependence3D({
  className = "",
  theme = "dark",
  onOpenHistory,
  isPlayingAudio,
  onToggleAudio,
}: ZambiaIndependence3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // Interaction States
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<"medallion" | "heritage">("medallion");
  const [isRotating, setIsRotating] = useState(true);

  // Web Audio Context & Oscillator Refs for Zambia Anthem Fallback Synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const anthemTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  // Stop Synthesizer Anthem safely
  const stopAnthem = useCallback(() => {
    anthemTimeoutRef.current.forEach((t) => clearTimeout(t));
    anthemTimeoutRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlayingAnthem(false);
  }, []);

  // Synthesize "Stand and Sing of Zambia" (Nkosi Sikelel' iAfrika melody) in G Major
  const toggleAnthemSynth = useCallback(() => {
    if (isPlayingAnthem) {
      stopAnthem();
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlayingAnthem(true);

      // Melody notes in G Major:
      // "Stand and sing of Zambia, proud and free"
      // "Land of work and joy in unity"
      // "Victors in the struggle for the right / We've won freedom's fight / All one, strong and free"
      const notes: { freq: number; dur: number; bassFreq?: number }[] = [
        // "Stand and sing of"
        { freq: 392.0, dur: 0.5, bassFreq: 196.0 }, // G4
        { freq: 392.0, dur: 0.5, bassFreq: 196.0 }, // G4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        // "Zambia,"
        { freq: 493.88, dur: 0.7, bassFreq: 246.94 }, // B4
        { freq: 392.0, dur: 0.6, bassFreq: 196.0 }, // G4
        // "proud and free"
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 523.25, dur: 0.5, bassFreq: 261.63 }, // C5
        { freq: 493.88, dur: 0.6, bassFreq: 246.94 }, // B4
        { freq: 440.0, dur: 0.6, bassFreq: 220.0 }, // A4
        { freq: 392.0, dur: 1.0, bassFreq: 196.0 }, // G4

        // "Land of work and joy in unity"
        { freq: 392.0, dur: 0.5, bassFreq: 196.0 }, // G4
        { freq: 392.0, dur: 0.5, bassFreq: 196.0 }, // G4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 493.88, dur: 0.7, bassFreq: 246.94 }, // B4
        { freq: 392.0, dur: 0.6, bassFreq: 196.0 }, // G4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 523.25, dur: 0.5, bassFreq: 261.63 }, // C5
        { freq: 493.88, dur: 0.6, bassFreq: 246.94 }, // B4
        { freq: 440.0, dur: 0.6, bassFreq: 220.0 }, // A4
        { freq: 392.0, dur: 1.1, bassFreq: 196.0 }, // G4

        // "Victors in the struggle for the right"
        { freq: 587.33, dur: 0.5, bassFreq: 293.66 }, // D5
        { freq: 587.33, dur: 0.5, bassFreq: 293.66 }, // D5
        { freq: 523.25, dur: 0.5, bassFreq: 261.63 }, // C5
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 523.25, dur: 0.8, bassFreq: 261.63 }, // C5

        // "We've won freedom's fight"
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 392.0, dur: 1.0, bassFreq: 196.0 }, // G4

        // "All one, strong and free"
        { freq: 392.0, dur: 0.5, bassFreq: 196.0 }, // G4
        { freq: 440.0, dur: 0.5, bassFreq: 220.0 }, // A4
        { freq: 493.88, dur: 0.6, bassFreq: 246.94 }, // B4
        { freq: 440.0, dur: 0.6, bassFreq: 220.0 }, // A4
        { freq: 392.0, dur: 1.6, bassFreq: 196.0 }, // G4
      ];

      let startTime = ctx.currentTime + 0.1;

      notes.forEach((note) => {
        // Lead Chime & Warm Harmonics
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, startTime);

        oscSub.type = "triangle";
        oscSub.frequency.setValueAtTime(note.freq * 0.5, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur - 0.05);

        osc.connect(gainNode);
        oscSub.connect(gainNode);

        // Rich warm bass undertone
        if (note.bassFreq) {
          const bassOsc = ctx.createOscillator();
          const bassGain = ctx.createGain();
          bassOsc.type = "sine";
          bassOsc.frequency.setValueAtTime(note.bassFreq, startTime);
          bassGain.gain.setValueAtTime(0.12, startTime);
          bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + note.dur - 0.05);
          bassOsc.connect(bassGain);
          bassGain.connect(ctx.destination);
          bassOsc.start(startTime);
          bassOsc.stop(startTime + note.dur);
        }

        gainNode.connect(ctx.destination);

        osc.start(startTime);
        oscSub.start(startTime);
        osc.stop(startTime + note.dur);
        oscSub.stop(startTime + note.dur);

        startTime += note.dur;
      });

      const totalDuration = (startTime - ctx.currentTime) * 1000;
      const timeoutId = setTimeout(() => {
        stopAnthem();
      }, totalDuration);
      anthemTimeoutRef.current.push(timeoutId);
    } catch (e) {
      console.warn("Web Audio API synthesis not supported:", e);
      setIsPlayingAnthem(false);
    }
  }, [isPlayingAnthem, stopAnthem]);

  // Clean up Audio on unmount
  useEffect(() => {
    return () => {
      stopAnthem();
    };
  }, [stopAnthem]);

  // Three.js Scene Setup & Render Loop
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x090b0e : 0xfcfcfd, 0.06);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.4, 4.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Master Group for 3D coin and landmarks
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Textures & Medallion Geometry
    const frontTex = createZambiaMedallionTexture();
    const backTex = createZambiaReverseTexture();

    // Cylindrical Medallion (radius: 1.35, height: 0.1, segments: 64)
    const coinGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.1, 64);

    // Rim material (brushed warm copper)
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xea580c,
      metalness: 0.85,
      roughness: 0.3,
    });

    // Face materials
    const faceMatFront = new THREE.MeshStandardMaterial({
      map: frontTex,
      metalness: 0.65,
      roughness: 0.35,
    });
    const faceMatBack = new THREE.MeshStandardMaterial({
      map: backTex,
      metalness: 0.75,
      roughness: 0.3,
    });

    // Cylinder material array: [side, top (front), bottom (back)]
    const coinMesh = new THREE.Mesh(coinGeo, [rimMat, faceMatFront, faceMatBack]);
    coinMesh.rotation.x = Math.PI / 2;
    coinMesh.castShadow = true;
    coinMesh.receiveShadow = true;

    const coinGroup = new THREE.Group();
    coinGroup.add(coinMesh);
    masterGroup.add(coinGroup);

    // 2. Alternative "Heritage Sphere" (Victoria Falls & African Fish Eagle Orb)
    const sphereGeo = new THREE.SphereGeometry(1.15, 48, 48);
    const sphereMat = new THREE.MeshStandardMaterial({
      map: frontTex,
      metalness: 0.75,
      roughness: 0.25,
      wireframe: false,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    sphereMesh.visible = false;
    masterGroup.add(sphereMesh);

    // 3. Orbiting Landmark Beacon Nodes
    const landmarkGroup = new THREE.Group();
    masterGroup.add(landmarkGroup);

    // Orbit Ring
    const orbitRingGeo = new THREE.RingGeometry(2.65, 2.7, 64);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x22c55e : 0x15803d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2.3;
    landmarkGroup.add(orbitRing);

    // Nodes
    const beaconMeshes: THREE.Mesh[] = [];
    ZAMBIA_LANDMARKS.forEach((lm) => {
      const beaconGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(lm.color),
        emissive: new THREE.Color(lm.color),
        emissiveIntensity: 0.8,
        metalness: 0.5,
        roughness: 0.2,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);

      const x = Math.cos(lm.angle) * lm.r;
      const z = Math.sin(lm.angle) * lm.r * 0.45;
      const y = Math.sin(lm.angle * 2) * 0.25;
      beacon.position.set(x, y, z);

      // Glow halo
      const glowGeo = new THREE.RingGeometry(0.12, 0.18, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(lm.color),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      beacon.add(glow);

      beaconMeshes.push(beacon);
      landmarkGroup.add(beacon);
    });

    // 4. Stardust Particles in Zambia Colors (Green, Red, Black/Zinc, Copper, Gold)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const flagPalette = [
      new THREE.Color("#15803d"), // Green
      new THREE.Color("#ea580c"), // Copper Orange
      new THREE.Color("#dc2626"), // Red
      new THREE.Color("#facc15"), // Gold
      new THREE.Color("#ffffff"), // White
    ];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const col = flagPalette[Math.floor(Math.random() * flagPalette.length)];
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(isDark ? 0xffffff : 0xfef3c7, isDark ? 1.2 : 1.4);
    scene.add(ambientLight);

    // Key Light (Warm Copper Golden Glow)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 2.5);
    keyLight.position.set(4, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    // Fill Light (Emerald Green Accent)
    const fillLight = new THREE.PointLight(0x22c55e, 2.2, 10);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    // Rim Light (Fiery Copper Accent)
    const rimLight = new THREE.PointLight(0xf97316, 2.5, 10);
    rimLight.position.set(0, 4, -4);
    scene.add(rimLight);

    // 6. Interactive Drag & Mouse Handling
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      targetRotY += deltaX * 0.01;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevMouseX;
      const deltaY = e.touches[0].clientY - prevMouseY;
      prevMouseX = e.touches[0].clientX;
      prevMouseY = e.touches[0].clientY;

      targetRotY += deltaX * 0.01;
      targetRotX += deltaY * 0.01;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Rotation
      if (isRotating && !isDragging) {
        targetRotY += delta * 0.5;
      }

      masterGroup.rotation.y += (targetRotY - masterGroup.rotation.y) * 0.08;
      masterGroup.rotation.x += (targetRotX - masterGroup.rotation.x) * 0.08;

      // Gentle floating bob
      masterGroup.position.y = Math.sin(elapsed * 1.5) * 0.06;

      // Pulse beacon halos
      beaconMeshes.forEach((b, idx) => {
        const glow = b.children[0] as THREE.Mesh;
        if (glow) {
          const s = 1 + Math.sin(elapsed * 3 + idx) * 0.25;
          glow.scale.set(s, s, s);
          glow.lookAt(camera.position);
        }
      });

      // Slowly drift starfield
      particleSystem.rotation.y = elapsed * 0.04;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(animate);
    };

    animate();

    // Mode Switcher Ref
    const updateDisplayMode = (mode: "medallion" | "heritage") => {
      if (mode === "medallion") {
        coinMesh.visible = true;
        sphereMesh.visible = false;
      } else {
        coinMesh.visible = false;
        sphereMesh.visible = true;
      }
    };
    updateDisplayMode(displayMode);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);

      if (container && dom && container.contains(dom)) {
        container.removeChild(dom);
      }

      frontTex.dispose();
      backTex.dispose();
      coinGeo.dispose();
      sphereGeo.dispose();
      particleGeo.dispose();
      orbitRingGeo.dispose();
      renderer.dispose();
    };
  }, [isDark, isRotating, displayMode]);

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setDisplayMode((prev) => (prev === "medallion" ? "heritage" : "medallion"))}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-all cursor-pointer backdrop-blur-md ${
              isDark
                ? "bg-zinc-950/80 border-emerald-500/40 text-emerald-300 hover:bg-zinc-900"
                : "bg-white/90 border-emerald-300 text-emerald-900 hover:bg-white"
            }`}
          >
            {displayMode === "medallion" ? "MEDALLION 3D" : "HERITAGE SPHERE"}
          </button>

          <button
            type="button"
            onClick={() => setIsRotating((prev) => !prev)}
            className={`p-1.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
              isRotating
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : isDark
                ? "bg-zinc-950/80 border-zinc-800 text-zinc-400"
                : "bg-white/90 border-zinc-300 text-zinc-600"
            }`}
            title={isRotating ? "Pause auto-rotation" : "Resume auto-rotation"}
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Synthesizer Melody Fallback (if real player toggle not supplied) */}
        {!onToggleAudio && (
          <button
            type="button"
            onClick={toggleAnthemSynth}
            className={`pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer backdrop-blur-md ${
              isPlayingAnthem
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 animate-pulse"
                : isDark
                ? "bg-zinc-950/80 border-zinc-800 text-zinc-300 hover:text-white"
                : "bg-white/90 border-zinc-200 text-zinc-700 hover:bg-white"
            }`}
          >
            {isPlayingAnthem ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                <span>Stop Synth</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Anthem Chime</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Floating Interactive Landmark Cards */}
      <div className="absolute top-14 left-3 flex flex-col gap-1.5 pointer-events-auto z-10 max-w-[210px]">
        {ZAMBIA_LANDMARKS.map((lm, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveLandmark(activeLandmark === idx ? null : idx)}
            className={`text-left p-1.5 px-2.5 rounded-xl border text-[10px] font-mono transition-all backdrop-blur-md cursor-pointer ${
              activeLandmark === idx
                ? "border-emerald-500 bg-emerald-950/90 text-white shadow-lg shadow-emerald-950/40"
                : isDark
                ? "border-zinc-800/80 bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                : "border-zinc-200 bg-white/75 text-zinc-600 hover:text-zinc-950 hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: lm.color }} />
              <span className="font-bold truncate">{lm.name}</span>
            </div>
            {activeLandmark === idx && (
              <p className="mt-1 text-[9px] font-sans leading-tight text-emerald-200 animate-in fade-in duration-150">
                {lm.desc}
              </p>
            )}
          </button>
        ))}
      </div>

      {/* Watermark / Drag Hint */}
      <div className="absolute bottom-20 right-3 pointer-events-none text-right font-mono text-[9px] text-zinc-500/70 select-none hidden sm:block">
        DRAG TO ROTATE &bull; 3D WEBGL
      </div>
    </div>
  );
}
