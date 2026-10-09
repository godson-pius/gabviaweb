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
  ExternalLink
} from "lucide-react";

interface UgandaIndependence3DProps {
  className?: string;
  theme?: "light" | "dark";
  onOpenHistory?: () => void;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

// Landmark nodes around Uganda for the 3D scene
const UGANDA_LANDMARKS = [
  { name: "Kololo Independence Grounds", desc: "Midnight 9 Oct 1962 Flag Raising", angle: 0, r: 2.7, color: "#FCDC04" },
  { name: "Source of the Nile (Jinja)", desc: "Longest River in the World", angle: Math.PI * 0.5, r: 2.6, color: "#38bdf8" },
  { name: "Lake Victoria (Nalubaale)", desc: "Africa's Largest Freshwater Lake", angle: Math.PI, r: 2.8, color: "#0ea5e9" },
  { name: "Rwenzori (Mountains of the Moon)", desc: "Snow-capped Equatorial Peaks (5,109m)", angle: Math.PI * 1.5, r: 2.7, color: "#f87171" },
];

/**
 * Creates a high-resolution CanvasTexture representing the Uganda Independence Medallion.
 * Features:
 * - The 6 horizontal bands of Uganda Flag: Black, Yellow, Red, Black, Yellow, Red
 * - The central white disc
 * - An intricately rendered Crested Crane silhouette with crown, wattle, and plumage
 * - Outer golden bezel with text: "UGANDA • 9 OCTOBER 1962 • FOR GOD AND MY COUNTRY"
 */
function createUgandaMedallionTexture(): THREE.CanvasTexture {
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

  // Flag stripes (6 equal height stripes)
  // Order: Black, Yellow, Red, Black, Yellow, Red
  const colors = [
    "#050505", // Black
    "#FCDC04", // Uganda Yellow / Gold
    "#D90000", // Uganda Post Office Red
    "#050505", // Black
    "#FCDC04", // Uganda Yellow / Gold
    "#D90000", // Uganda Post Office Red
  ];

  const stripeH = (radius * 2) / 6;
  const startY = cy - radius;

  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(cx - radius, startY + i * stripeH, radius * 2, stripeH + 1);
  }

  // Radial shading for metallic curved medallion depth
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.1, cx, cy, radius);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  grad.addColorStop(0.6, "rgba(0, 0, 0, 0.05)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.65)");
  ctx.fillStyle = grad;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  // Central white disc for Crested Crane
  const discR = radius * 0.44;
  ctx.beginPath();
  ctx.arc(cx, cy, discR, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Subtle inner border on the disc
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Draw Crested Crane (Balearica regulorum gibbericeps) on the disc
  // Stylized artistic rendition facing forward/left, standing tall with crest
  ctx.save();
  ctx.translate(cx, cy);

  // Crane Legs & Feet
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  
  // Forward leg (bent standing proudly)
  ctx.beginPath();
  ctx.moveTo(10, 60);
  ctx.lineTo(8, 120);
  ctx.lineTo(6, 175);
  ctx.stroke();

  // Backward leg (slightly lifted / grounded)
  ctx.beginPath();
  ctx.moveTo(-10, 60);
  ctx.lineTo(-14, 115);
  ctx.lineTo(-12, 175);
  ctx.stroke();

  // Foot talons
  ctx.beginPath();
  ctx.moveTo(6, 175);
  ctx.lineTo(25, 175);
  ctx.moveTo(6, 175);
  ctx.lineTo(-10, 175);
  ctx.stroke();

  // Body plumage (Pearl Grey & Obsidian Black)
  ctx.beginPath();
  ctx.ellipse(0, 30, 48, 70, -0.15, 0, Math.PI * 2);
  ctx.fillStyle = "#334155";
  ctx.fill();

  // Wing feathers overlay (Gold & White wing accents)
  ctx.beginPath();
  ctx.ellipse(10, 35, 34, 48, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#FCDC04";
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(15, 38, 22, 36, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  // Slender elegant neck
  ctx.beginPath();
  ctx.moveTo(-12, -20);
  ctx.quadraticCurveTo(-18, -80, -2, -115);
  ctx.lineTo(14, -115);
  ctx.quadraticCurveTo(8, -80, 16, -20);
  ctx.closePath();
  ctx.fillStyle = "#475569";
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(6, -125, 18, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();

  // Cheek patch (White with vibrant red upper patch)
  ctx.beginPath();
  ctx.arc(2, -125, 9, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(2, -130, 5, 0, Math.PI);
  ctx.fillStyle = "#D90000";
  ctx.fill();

  // Beak
  ctx.beginPath();
  ctx.moveTo(-8, -124);
  ctx.lineTo(-30, -120);
  ctx.lineTo(-8, -116);
  ctx.closePath();
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  // Red throat wattle (gular sac)
  ctx.beginPath();
  ctx.ellipse(-2, -108, 6, 12, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#D90000";
  ctx.fill();

  // Golden Bristled Crest (The iconic Crown)
  // Fan of golden filaments
  ctx.strokeStyle = "#FCDC04";
  ctx.lineWidth = 3;
  for (let a = -0.8; a <= 0.8; a += 0.12) {
    const startX = 10 + Math.cos(a) * 14;
    const startY = -132 + Math.sin(a) * 14;
    const endX = 14 + Math.cos(a) * 36;
    const endY = -140 + Math.sin(a) * 36;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Little golden tip beads
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(endX, endY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // end crane translate

  ctx.restore(); // end clip

  // Outer Gold Bezel Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 34;
  const goldStroke = ctx.createLinearGradient(0, 0, size, size);
  goldStroke.addColorStop(0, "#fef08a");
  goldStroke.addColorStop(0.3, "#eab308");
  goldStroke.addColorStop(0.7, "#ca8a04");
  goldStroke.addColorStop(1, "#854d0e");
  ctx.strokeStyle = goldStroke;
  ctx.stroke();

  // Bezel notched rim
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Circular Typography along the outer rim
  ctx.save();
  ctx.translate(cx, cy);
  const textRadius = radius - 16;
  const bannerText = "★  UGANDA INDEPENDENCE  ★  9 OCTOBER 1962  ★  FOR GOD AND MY COUNTRY  ";
  ctx.font = "bold 20px 'Courier New', monospace, sans-serif";
  ctx.fillStyle = "#1e293b";
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
 * - 1962 Coat of Arms shield motif
 * - The Sun, Drums, and River Nile symbols
 * - Motto: "FOR GOD AND MY COUNTRY"
 */
function createUgandaReverseTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.46;

  // Background brushed gold plate
  const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, radius);
  bgGrad.addColorStop(0, "#fef9c3");
  bgGrad.addColorStop(0.5, "#facc15");
  bgGrad.addColorStop(0.85, "#ca8a04");
  bgGrad.addColorStop(1, "#713f12");

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // Inner decorative ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
  ctx.strokeStyle = "#854d0e";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.84, 0, Math.PI * 2);
  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Center Shield Emblem
  ctx.save();
  ctx.translate(cx, cy);

  // Large 1962 Commemorative Year
  ctx.font = "900 84px system-ui, sans-serif";
  ctx.fillStyle = "#451a03";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(255,255,255,0.6)";
  ctx.shadowOffsetY = 2;
  ctx.fillText("1962", 0, -85);

  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillStyle = "#78350f";
  ctx.fillText("9th OCTOBER", 0, -25);

  // Divider lines
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-160, 5);
  ctx.lineTo(160, 5);
  ctx.stroke();

  // Motto Banner
  ctx.font = "800 24px monospace, sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("FOR GOD AND MY COUNTRY", 0, 40);

  ctx.font = "600 20px system-ui, sans-serif";
  ctx.fillStyle = "#b45309";
  ctx.fillText("PEARL OF AFRICA", 0, 80);

  // Three Stars for Sovereignty, Unity, and Peace
  ctx.font = "28px sans-serif";
  ctx.fillStyle = "#0f172a";
  ctx.fillText("★   ★   ★", 0, 130);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
}

export function UgandaIndependence3D({
  className = "",
  theme = "dark",
  onOpenHistory,
  isPlayingAudio,
  onToggleAudio,
}: UgandaIndependence3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  // Interaction & Audio States
  const [isPlayingAnthem, setIsPlayingAnthem] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<number | null>(null);
  const [displayMode, setDisplayMode] = useState<"medallion" | "pearl">("medallion");
  const [isRotating, setIsRotating] = useState(true);

  // Web Audio Context & Oscillator Refs for Uganda National Anthem
  const audioCtxRef = useRef<AudioContext | null>(null);
  const anthemTimeoutRef = useRef<NodeJS.Timeout[]>([]);

  // Stop Anthem safely
  const stopAnthem = useCallback(() => {
    anthemTimeoutRef.current.forEach((t) => clearTimeout(t));
    anthemTimeoutRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlayingAnthem(false);
  }, []);

  // Synthesize "Oh Uganda, Land of Beauty" (Kakoma, 1962) with warm brass & chime polyphony
  const toggleAnthem = useCallback(() => {
    if (isPlayingAnthem) {
      stopAnthem();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlayingAnthem(true);

      // Melody: "Oh Uganda, Land of Beauty / We lay our future in thy hand / United, free, for liberty / Together we'll always stand"
      // Frequencies for Kakoma's anthem in G Major
      // Notes: G4(392), B4(493.88), D5(587.33), C5(523.25), B4(493.88), A4(440), G4(392)...
      const notes: { freq: number; dur: number; bassFreq?: number }[] = [
        // "Oh Uganda!"
        { freq: 392.00, dur: 0.6, bassFreq: 196.00 }, // G4
        { freq: 493.88, dur: 0.6, bassFreq: 196.00 }, // B4
        { freq: 587.33, dur: 0.9, bassFreq: 196.00 }, // D5
        
        // "may God uphold thee"
        { freq: 523.25, dur: 0.45, bassFreq: 261.63 }, // C5
        { freq: 493.88, dur: 0.45, bassFreq: 196.00 }, // B4
        { freq: 440.00, dur: 0.9, bassFreq: 220.00 }, // A4
        
        // "We lay our future"
        { freq: 440.00, dur: 0.45, bassFreq: 220.00 }, // A4
        { freq: 493.88, dur: 0.45, bassFreq: 246.94 }, // B4
        { freq: 523.25, dur: 0.45, bassFreq: 261.63 }, // C5
        { freq: 587.33, dur: 0.45, bassFreq: 293.66 }, // D5
        
        // "in thy hand"
        { freq: 493.88, dur: 0.5, bassFreq: 246.94 }, // B4
        { freq: 392.00, dur: 1.1, bassFreq: 196.00 }, // G4
        
        // "United, free"
        { freq: 587.33, dur: 0.6, bassFreq: 293.66 }, // D5
        { freq: 659.25, dur: 0.6, bassFreq: 329.63 }, // E5
        { freq: 587.33, dur: 0.8, bassFreq: 293.66 }, // D5

        // "for liberty"
        { freq: 523.25, dur: 0.45, bassFreq: 261.63 }, // C5
        { freq: 493.88, dur: 0.45, bassFreq: 246.94 }, // B4
        { freq: 440.00, dur: 0.8, bassFreq: 220.00 }, // A4

        // "Together we'll always stand"
        { freq: 392.00, dur: 0.45, bassFreq: 196.00 }, // G4
        { freq: 440.00, dur: 0.45, bassFreq: 220.00 }, // A4
        { freq: 493.88, dur: 0.6, bassFreq: 246.94 }, // B4
        { freq: 440.00, dur: 0.6, bassFreq: 220.00 }, // A4
        { freq: 392.00, dur: 1.6, bassFreq: 196.00 }, // G4
      ];

      let startTime = ctx.currentTime + 0.1;

      notes.forEach((note) => {
        // Lead Chime (warm sine + harmonic triangle)
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, startTime);

        oscSub.type = "triangle";
        oscSub.frequency.setValueAtTime(note.bassFreq || note.freq / 2, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.22, startTime + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

        osc.connect(gainNode);
        oscSub.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(startTime);
        oscSub.start(startTime);
        osc.stop(startTime + note.dur);
        oscSub.stop(startTime + note.dur);

        startTime += note.dur + 0.08;
      });

      const totalDuration = (startTime - ctx.currentTime) * 1000;
      const tId = setTimeout(() => {
        setIsPlayingAnthem(false);
      }, totalDuration);
      anthemTimeoutRef.current.push(tId);

    } catch (e) {
      console.warn("AudioContext error:", e);
      setIsPlayingAnthem(false);
    }
  }, [isPlayingAnthem, stopAnthem]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAnthem();
    };
  }, [stopAnthem]);

  // 3D Scene Initialization
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    let width = container.clientWidth || 500;
    let height = container.clientHeight || 460;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.replaceChildren(renderer.domElement);

    // 2. Lighting Setup for Metallic Gold Luster
    const ambientLight = new THREE.AmbientLight(isDark ? 0xffffff : 0x475569, isDark ? 1.4 : 1.8);
    scene.add(ambientLight);

    // Key Light (Warm gold highlight)
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    keyLight.position.set(5, 6, 8);
    scene.add(keyLight);

    // Rim Light (Vibrant Uganda Gold)
    const rimLight = new THREE.DirectionalLight(0xfacc15, 2.2);
    rimLight.position.set(-6, -4, -4);
    scene.add(rimLight);

    // Accent Light (Ruby Red for Uganda flag reflection)
    const rubyLight = new THREE.PointLight(0xd90000, 3.5, 12);
    rubyLight.position.set(-3, 3, 4);
    scene.add(rubyLight);

    // 3. Central Medallion Group
    const medallionGroup = new THREE.Group();
    scene.add(medallionGroup);

    // Textures
    const frontTexture = createUgandaMedallionTexture();
    const backTexture = createUgandaReverseTexture();

    // Cylinder / Coin Geometry
    const coinRadius = 2.0;
    const coinThickness = 0.18;
    const coinGeo = new THREE.CylinderGeometry(coinRadius, coinRadius, coinThickness, 80);

    // Materials: Gold rim edge, Obverse front, Reverse back
    const goldRimMaterial = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      metalness: 0.88,
      roughness: 0.22,
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      metalness: 0.35,
      roughness: 0.28,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Cylinder materials array: [Side, Top(Front), Bottom(Back)]
    const coinMesh = new THREE.Mesh(coinGeo, [goldRimMaterial, frontMaterial, backMaterial]);
    coinMesh.rotation.x = Math.PI / 2; // Face the camera
    medallionGroup.add(coinMesh);

    // Fluted Outer Gold Ring Bezel (Torus)
    const bezelGeo = new THREE.TorusGeometry(coinRadius + 0.08, 0.07, 24, 100);
    const bezelMesh = new THREE.Mesh(bezelGeo, goldRimMaterial);
    medallionGroup.add(bezelMesh);

    // 4. Gyroscopic Orbital Rings in Uganda Flag Colors
    // Ring 1: Uganda Black & Gold Orbit
    const orbit1Geo = new THREE.TorusGeometry(2.9, 0.022, 16, 120);
    const orbit1Mat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xca8a04,
      emissiveIntensity: 0.25,
    });
    const orbit1 = new THREE.Mesh(orbit1Geo, orbit1Mat);
    orbit1.rotation.x = Math.PI / 3.2;
    orbit1.rotation.y = Math.PI / 6;
    scene.add(orbit1);

    // Ring 2: Uganda Post Office Red Orbit
    const orbit2Geo = new THREE.TorusGeometry(3.3, 0.018, 16, 120);
    const orbit2Mat = new THREE.MeshStandardMaterial({
      color: 0xd90000,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x990000,
      emissiveIntensity: 0.3,
    });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = -Math.PI / 4;
    orbit2.rotation.y = -Math.PI / 5;
    scene.add(orbit2);

    // 5. Landmark Beacons orbiting the Medallion
    const landmarkMeshes: THREE.Mesh[] = [];
    UGANDA_LANDMARKS.forEach((lm) => {
      const beaconGeo = new THREE.OctahedronGeometry(0.12, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: lm.color,
        emissive: lm.color,
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.1,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.set(
        Math.cos(lm.angle) * lm.r,
        Math.sin(lm.angle) * lm.r * 0.4,
        Math.sin(lm.angle) * 0.9
      );
      scene.add(beaconMesh);
      landmarkMeshes.push(beaconMesh);
    });

    // 6. Particle Field (Golden, Ruby & Obsidian Stardust)
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0xfacc15), // Gold
      new THREE.Color(0xd90000), // Red
      new THREE.Color(0x38bdf8), // Nile Blue
      new THREE.Color(0xffffff), // Pearl
    ];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.4 + Math.random() * 2.8;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const color = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 7. Mouse Parallax & Drag Rotation
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.4;
      mouseY = y * 0.3;

      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        targetRotationY += deltaX * 0.01;
        targetRotationX += deltaY * 0.01;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous subtle coin float & auto-rotation
      if (isRotating && !isDragging) {
        targetRotationY += delta * 0.45;
        targetRotationX = Math.sin(elapsedTime * 0.8) * 0.15;
      }

      // Smooth dampening towards target rotation
      medallionGroup.rotation.y += (targetRotationY + mouseX - medallionGroup.rotation.y) * 0.08;
      medallionGroup.rotation.x += (targetRotationX - mouseY - medallionGroup.rotation.x) * 0.08;

      // Bobbing floating effect
      medallionGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.08;

      // Rotate orbital rings
      orbit1.rotation.z += delta * 0.3;
      orbit2.rotation.z -= delta * 0.22;

      // Animate Landmark Beacons
      landmarkMeshes.forEach((mesh, idx) => {
        const lm = UGANDA_LANDMARKS[idx];
        const currentAngle = lm.angle + elapsedTime * 0.25;
        mesh.position.x = Math.cos(currentAngle) * lm.r;
        mesh.position.y = Math.sin(currentAngle) * lm.r * 0.42;
        mesh.position.z = Math.sin(currentAngle) * 0.9;
        mesh.rotation.x += delta * 1.2;
        mesh.rotation.y += delta * 1.5;
      });

      // Slowly rotate particle field
      particles.rotation.y = elapsedTime * 0.06;
      particles.rotation.x = Math.sin(elapsedTime * 0.04) * 0.1;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 500;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose();
      coinGeo.dispose();
      bezelGeo.dispose();
      orbit1Geo.dispose();
      orbit2Geo.dispose();
      particleGeo.dispose();
      frontTexture.dispose();
      backTexture.dispose();
    };
  }, [isDark, isRotating]);

  return (
    <div className={`relative w-full h-full flex flex-col justify-between ${className}`}>
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={containerRef} 
        className="w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating HUD Top Overlay: 1962 Commemorative Telemetry */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 font-mono text-[11px]">
        {/* Left Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md pointer-events-auto transition-all ${
          isDark 
            ? "border-amber-500/30 bg-zinc-950/80 text-amber-300 shadow-lg shadow-amber-950/30" 
            : "border-amber-300 bg-white/90 text-amber-900 shadow-md"
        }`}>
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <span className="font-bold tracking-wider">UGANDA 1962</span>
          <span className="text-zinc-500">•</span>
          <span className={isDark ? "text-zinc-300" : "text-zinc-600"}>PEARL OF AFRICA</span>
        </div>

        {/* Right Controls: Auto-spin toggle & Anthem player */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Anthem Button */}
          <button
            onClick={onToggleAudio || toggleAnthem}
            title={(isPlayingAudio ?? isPlayingAnthem) ? "Pause National Anthem" : "Play 'Oh Uganda, Land of Beauty' (Trumpet & Brass Band)"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer ${
              (isPlayingAudio ?? isPlayingAnthem)
                ? "bg-gradient-to-r from-amber-500 to-red-600 text-white border-transparent shadow-amber-500/30 animate-pulse"
                : isDark
                ? "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white"
                : "border-zinc-200 bg-white/90 hover:bg-zinc-100 text-zinc-700"
            }`}
          >
            {(isPlayingAudio ?? isPlayingAnthem) ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" />
                <span className="text-[10px]">ANTHEM PLAYING</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                <span className="text-[10px]">PLAY ANTHEM</span>
              </>
            )}
          </button>

          {/* Spin toggle */}
          <button
            onClick={() => setIsRotating((prev) => !prev)}
            title={isRotating ? "Pause 3D Rotation" : "Resume 3D Rotation"}
            className={`p-1.5 rounded-full border transition-all ${
              isDark 
                ? "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white" 
                : "border-zinc-200 bg-white/90 hover:bg-zinc-100 text-zinc-600"
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} style={{ animationDuration: "6s" }} />
          </button>
        </div>
      </div>

      {/* Floating Interactive Landmark Anchors */}
      <div className="absolute left-3 bottom-[145px] hidden sm:flex flex-col gap-1.5 pointer-events-auto z-10">
        <span className={`text-[10px] font-mono tracking-wider font-semibold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
          HISTORICAL BEACONS:
        </span>
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {UGANDA_LANDMARKS.map((lm, idx) => (
            <button
              key={lm.name}
              onMouseEnter={() => setActiveLandmark(idx)}
              onMouseLeave={() => setActiveLandmark(null)}
              className={`text-[9px] font-mono px-2 py-1 rounded-md border transition-all ${
                activeLandmark === idx
                  ? "border-amber-400 bg-amber-500/20 text-white font-bold scale-105"
                  : isDark
                  ? "border-zinc-800 bg-zinc-950/70 text-zinc-400 hover:text-zinc-200"
                  : "border-zinc-200 bg-white/80 text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {lm.name.split(" ")[0]}
            </button>
          ))}
        </div>
        {activeLandmark !== null && (
          <div className={`p-2 rounded-lg border text-[10px] font-mono max-w-xs animate-in fade-in slide-in-from-bottom-1 duration-150 backdrop-blur-md ${
            isDark ? "border-amber-500/40 bg-zinc-950/90 text-zinc-200" : "border-amber-200 bg-white/95 text-zinc-800"
          }`}>
            <span className="font-bold text-amber-400 block">{UGANDA_LANDMARKS[activeLandmark].name}</span>
            <span className="text-zinc-400">{UGANDA_LANDMARKS[activeLandmark].desc}</span>
          </div>
        )}
      </div>
    </div>
  );
}
