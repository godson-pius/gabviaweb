"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface AppWorkflow3DProps {
  theme?: "light" | "dark";
  className?: string;
}

interface LanguageScenario {
  id: string;
  senderLang: string;
  senderFlag: string;
  recipientLang: string;
  recipientFlag: string;
  partnerName: string;
  partnerLocation: string;
  originalText: string;
  translatedText: string;
  audioDuration: string;
  audioTranscription: string;
  audioTranslation: string;
}

const SCENARIOS: LanguageScenario[] = [
  {
    id: "rwanda",
    senderLang: "English",
    senderFlag: "🇬🇧",
    recipientLang: "Kinyarwanda",
    recipientFlag: "🇷🇼",
    partnerName: "Keza Aline",
    partnerLocation: "Kigali, Rwanda",
    originalText: "Hello Keza! Are we still reviewing the summit presentation together today?",
    translatedText: "Muraho Keza! Turacyasuzumira hamwe iby'inama ikomeye uyu munsi?",
    audioDuration: "0:14",
    audioTranscription: "Audio note: 'I just uploaded the updated slides to the shared drive.'",
    audioTranslation: "Ijwi ryahinduwe: 'Maze gushyira amadosiye mashya muri sisitemu yacu.'",
  },
  {
    id: "swahili",
    senderLang: "English",
    senderFlag: "🇬🇧",
    recipientLang: "Swahili",
    recipientFlag: "🇹🇿",
    partnerName: "Juma Bakari",
    partnerLocation: "Dar es Salaam, Tanzania",
    originalText: "Good morning! The shipment has cleared customs and is on its way to the warehouse.",
    translatedText: "Habari za asubuhi! Mzigo umepita forodhani na sasa uko njiani kuelekea ghala.",
    audioDuration: "0:18",
    audioTranscription: "Audio note: 'Driver confirmed delivery for 3:00 PM today.'",
    audioTranslation: "Ijwi ryahinduwe: 'Dereva amethibitisha uwasilishaji saa tisa alasiri leo.'",
  },
  {
    id: "french",
    senderLang: "French",
    senderFlag: "🇫🇷",
    recipientLang: "English",
    recipientFlag: "🇬🇧",
    partnerName: "Claire Dubois",
    partnerLocation: "Paris, France",
    originalText: "Bonjour! Le contrat a été signé ce matin, nous pouvons démarrer dès lundi.",
    translatedText: "Hello! The contract was signed this morning, we can launch as early as Monday.",
    audioDuration: "0:11",
    audioTranscription: "Audio note: 'Tous les documents sont archivés dans l'espace sécurisé.'",
    audioTranslation: "Voice note: 'All documents are safely archived in the secure workspace.'",
  },
  {
    id: "spanish",
    senderLang: "Spanish",
    senderFlag: "🇪🇸",
    recipientLang: "English",
    recipientFlag: "🇺🇸",
    partnerName: "Mateo Silva",
    partnerLocation: "Madrid, Spain",
    originalText: "¿Podemos confirmar los detalles finales de la integración técnica esta tarde?",
    translatedText: "Can we confirm the final technical integration details this afternoon?",
    audioDuration: "0:16",
    audioTranscription: "Audio note: 'El servidor de pruebas ya está listo para la conexión.'",
    audioTranslation: "Voice note: 'The test server is already live and ready for connection.'",
  },
];

export function AppWorkflow3D({ theme = "light", className = "" }: AppWorkflow3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("rwanda");
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<"isometric" | "front" | "side">("isometric");

  const isDark = theme === "dark";
  const scenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  // Auto-play steps sequencer
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Audio simulation timer
  useEffect(() => {
    if (activeStep === 2) {
      setIsPlayingAudio(true);
      const timer = setTimeout(() => setIsPlayingAudio(false), 3800);
      return () => clearTimeout(timer);
    } else {
      setIsPlayingAudio(false);
    }
  }, [activeStep]);

  // Three.js interactive 3D scene
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth || 600;
    let height = container.clientHeight || 520;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.5, 7.8);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Colors according to theme
    const chassisColor = isDark ? 0x18181b : 0xe4e4e7;
    const edgeColor = isDark ? 0x27272a : 0xd4d4d8;
    const screenColor = isDark ? 0x09090b : 0xfcfcfd;
    const accentColor = 0x00d2ff; // Brand Electric Cyan

    // Root 3D device group
    const deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    // 1. Phone / Tablet Chassis (Beveled box)
    const phoneWidth = 3.6;
    const phoneHeight = 5.2;
    const phoneDepth = 0.22;

    const chassisGeo = new THREE.BoxGeometry(phoneWidth, phoneHeight, phoneDepth);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: chassisColor,
      roughness: 0.35,
      metalness: 0.65,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, chassisMat);
    deviceGroup.add(chassisMesh);

    // Bevel frame edge
    const edgeGeo = new THREE.BoxGeometry(phoneWidth + 0.04, phoneHeight + 0.04, phoneDepth * 0.7);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: edgeColor,
      roughness: 0.2,
      metalness: 0.8,
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.z = -0.02;
    deviceGroup.add(edgeMesh);

    // 2. Front Glass Screen
    const screenGeo = new THREE.PlaneGeometry(phoneWidth - 0.22, phoneHeight - 0.26);
    const screenMat = new THREE.MeshStandardMaterial({
      color: screenColor,
      roughness: 0.2,
      metalness: 0.1,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.z = phoneDepth / 2 + 0.01;
    deviceGroup.add(screenMesh);

    // Dynamic Island / Speaker notch at top
    const notchGeo = new THREE.BoxGeometry(0.85, 0.14, 0.04);
    const notchMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x040405 : 0x18181b,
      roughness: 0.5,
      metalness: 0.3,
    });
    const notchMesh = new THREE.Mesh(notchGeo, notchMat);
    notchMesh.position.set(0, phoneHeight / 2 - 0.28, phoneDepth / 2 + 0.02);
    deviceGroup.add(notchMesh);

    // 3. Floating 3D Audio Frequency Waveform Bars
    const barCount = 20;
    const barsGroup = new THREE.Group();
    const barWidth = 0.08;
    const barGeo = new THREE.BoxGeometry(barWidth, 1, 0.06);

    const bars: THREE.Mesh[] = [];
    for (let i = 0; i < barCount; i++) {
      const barMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? accentColor : isDark ? 0x38bdf8 : 0x2563eb,
        emissive: i % 2 === 0 ? 0x0369a1 : 0x1d4ed8,
        roughness: 0.3,
        metalness: 0.4,
      });
      const bar = new THREE.Mesh(barGeo, barMat);
      const x = (i - barCount / 2) * (barWidth + 0.04);
      bar.position.set(x, -0.65, phoneDepth / 2 + 0.08);
      bar.scale.y = 0.15;
      barsGroup.add(bar);
      bars.push(bar);
    }
    deviceGroup.add(barsGroup);

    // 4. Floating 3D Translation Neural Particles
    const particleCount = 48;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.0;
      positions[i * 3 + 2] = phoneDepth / 2 + 0.12 + Math.random() * 0.4;

      // Cyan & Royal Blue gradient
      colors[i * 3] = 0.0 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.75 + Math.random() * 0.15;
      colors[i * 3 + 2] = 0.95 + Math.random() * 0.05;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    deviceGroup.add(particles);

    // 5. Encrypted Shield Halo (Subtle rotating ring around device)
    const haloGeo = new THREE.RingGeometry(3.2, 3.25, 64);
    const haloMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x27272a : 0xe4e4e7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.z = -0.1;
    deviceGroup.add(haloMesh);

    // 6. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.7 : 1.1);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, isDark ? 1.4 : 1.8);
    dirLight1.position.set(4, 6, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(accentColor, isDark ? 0.8 : 0.4);
    dirLight2.position.set(-4, -2, 4);
    scene.add(dirLight2);

    // Interaction controls
    let targetRotX = 0.15;
    let targetRotY = -0.25;
    let currentRotX = 0.15;
    let currentRotY = -0.25;

    // Apply camera presets
    if (cameraPreset === "isometric") {
      targetRotX = 0.18;
      targetRotY = -0.32;
    } else if (cameraPreset === "front") {
      targetRotX = 0.0;
      targetRotY = 0.0;
    } else if (cameraPreset === "side") {
      targetRotX = 0.08;
      targetRotY = -0.75;
    }

    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousPointerX = x;
      previousPointerY = y;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const x = "touches" in e ? e.touches[0].clientX : e.clientX;
      const y = "touches" in e ? e.touches[0].clientY : e.clientY;

      if (isDragging) {
        const deltaX = x - previousPointerX;
        const deltaY = y - previousPointerY;
        targetRotY += deltaX * 0.007;
        targetRotX += deltaY * 0.007;
        // Clamp vertical angle to prevent flipping
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
        previousPointerX = x;
        previousPointerY = y;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    canvas.addEventListener("touchstart", onPointerDown, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth rotation damping
      if (!isDragging) {
        // Floating gentle breathing motion
        const floatY = Math.sin(elapsedTime * 1.4) * 0.05;
        const floatRot = Math.cos(elapsedTime * 1.1) * 0.03;
        deviceGroup.position.y = floatY;
        targetRotY += (floatRot * 0.005);
      }

      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      deviceGroup.rotation.x = currentRotX;
      deviceGroup.rotation.y = currentRotY;

      // Halo subtle spinning
      haloMesh.rotation.z = elapsedTime * 0.15;

      // Waveform animation
      bars.forEach((bar, idx) => {
        if (isPlayingAudio) {
          const freq = Math.sin(elapsedTime * 12 + idx * 0.6) * 0.5 + 0.5;
          bar.scale.y = 0.2 + freq * 0.7;
          bar.position.y = -0.65 + (bar.scale.y * 0.5);
        } else {
          // Resting pulse
          const rest = Math.sin(elapsedTime * 3 + idx * 0.4) * 0.1 + 0.15;
          bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, rest, 0.1);
          bar.position.y = -0.65 + (bar.scale.y * 0.5);
        }
      });

      // Neural particle flow
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        // Translate downward towards recipient bubble
        arr[i * 3 + 1] -= 0.012;
        if (arr[i * 3 + 1] < -1.4) {
          arr[i * 3 + 1] = 1.4;
          arr[i * 3] = (Math.random() - 0.5) * 2.6;
        }
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      canvas.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      canvas.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);

      chassisGeo.dispose();
      chassisMat.dispose();
      edgeGeo.dispose();
      edgeMat.dispose();
      screenGeo.dispose();
      screenMat.dispose();
      notchGeo.dispose();
      notchMat.dispose();
      barGeo.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [isDark, cameraPreset, isPlayingAudio]);

  return (
    <div className={`w-full ${className}`}>
      {/* 1. Header & Live Scenario Language Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-mono mb-2 ${
            isDark ? "border-sky-800/80 bg-sky-950/40 text-sky-400" : "border-sky-300 bg-sky-50 text-blue-700"
          }`}>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>INTERACTIVE 3D PLATFORM DEMO</span>
          </div>
          <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
            Experience real-time multilingual communication.
          </h3>
          <p className={`text-sm sm:text-base mt-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            Interact with the 3D model below to see how Gabvia eliminates language barriers across text and voice.
          </p>
        </div>

        {/* Live Language Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs font-mono font-semibold mr-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>TRY LANGUAGE:</span>
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedScenarioId === sc.id
                  ? isDark
                    ? "bg-zinc-100 text-zinc-950 border-white shadow-sm"
                    : "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                  : isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                  : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:border-zinc-300"
              }`}
            >
              <span>{sc.recipientFlag}</span>
              <span>{sc.recipientLang}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main 3D Stage & Interactive Step Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 4 Interactive Step Cards */}
        <div className="lg:col-span-5 space-y-3">
          {[
            {
              step: 1,
              tag: "CONNECT",
              title: "Pick Your Recipient & Language",
              desc: "Open Gabvia in your browser or on Android. Select who you want to communicate with and set your desired native output language.",
              badge: `${scenario.senderFlag} ${scenario.senderLang} ➔ ${scenario.recipientFlag} ${scenario.recipientLang}`,
            },
            {
              step: 2,
              tag: "COMPOSE",
              title: "Speak or Type in Your Tongue",
              desc: "Express yourself naturally in your language. Type a normal message or record a hands-free audio note with real-time waveform capture.",
              badge: isPlayingAudio ? "🎙️ RECORDING VOICE NOTE..." : "✍️ TYPING MESSAGE",
            },
            {
              step: 3,
              tag: "NEURAL AI",
              title: "Contextual Translation in Real-Time",
              desc: "Our neural translation engine analyzes nuance, idioms, and voice phonetics to deliver high-precision translations in milliseconds.",
              badge: "⚡ ~180MS LATENCY",
            },
            {
              step: 4,
              tag: "SECURE",
              title: "100% Encrypted & Delivered",
              desc: "Encrypted end-to-end so nobody in between can ever view or eavesdrop on your personal conversations or business files.",
              badge: "🔒 VERIFIED END-TO-END",
            },
          ].map((item) => {
            const isCurrent = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => {
                  setActiveStep(item.step);
                  setIsAutoPlaying(false);
                }}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all relative overflow-hidden group ${
                  isCurrent
                    ? isDark
                      ? "border-sky-500/80 bg-zinc-900/90 shadow-lg shadow-sky-950/30"
                      : "border-zinc-950 bg-white shadow-md shadow-zinc-200"
                    : isDark
                    ? "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700"
                    : "border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-zinc-300"
                }`}
              >
                {/* Active indicator bar */}
                {isCurrent && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-500 to-blue-600" />
                )}

                <div className="flex items-center justify-between mb-1.5 pl-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                        isCurrent
                          ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-xs"
                          : isDark
                          ? "bg-zinc-800 text-zinc-400"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      STEP 0{item.step}
                    </span>
                    <span className="font-mono text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] px-2 py-0.5 rounded border ${
                      isCurrent
                        ? isDark
                          ? "border-sky-800/60 text-sky-400 bg-sky-950/40"
                          : "border-sky-300 text-blue-700 bg-sky-50"
                        : isDark
                        ? "border-zinc-800 text-zinc-500"
                        : "border-zinc-200 text-zinc-500"
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>

                <div className="pl-2">
                  <h4 className={`text-base font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>
                    {item.title}
                  </h4>
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Auto-Play Toggle & Speed Indicator */}
          <div className="flex items-center justify-between pt-2 px-1 text-xs font-mono">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                isAutoPlaying
                  ? isDark
                    ? "border-sky-800 bg-sky-950/50 text-sky-400"
                    : "border-sky-300 bg-sky-50 text-blue-700"
                  : isDark
                  ? "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-950"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAutoPlaying ? "bg-sky-500 animate-pulse" : "bg-zinc-400"}`} />
              <span>{isAutoPlaying ? "Auto-Play Active (Pause)" : "Resume Auto-Play"}</span>
            </button>
            <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>DRAG 3D MODEL TO ROTATE</span>
          </div>
        </div>

        {/* Right Column: Interactive 3D Three.js Device Stage & Live Message Projection */}
        <div className="lg:col-span-7">
          <div
            className={`relative rounded-3xl border overflow-hidden shadow-xl transition-colors ${
              isDark ? "border-zinc-800 bg-[#0c0d12]" : "border-zinc-200 bg-[#f8f9fa]"
            }`}
          >
            {/* Top Toolbar Telemetry */}
            <div
              className={`flex items-center justify-between px-5 py-3 border-b font-mono text-xs ${
                isDark ? "border-zinc-800 text-zinc-400 bg-zinc-950/50" : "border-zinc-200 text-zinc-700 bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className={`font-semibold ${isDark ? "text-zinc-300" : "text-zinc-900"}`}>GABVIA 3D PLATFORM SIMULATOR</span>
              </div>

              {/* 3D Camera Angles */}
              <div className="flex items-center gap-1.5">
                <span className={`hidden sm:inline text-[10px] mr-1 ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>PERSPECTIVE:</span>
                {(["isometric", "front", "side"] as const).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setCameraPreset(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] uppercase transition-colors ${
                      cameraPreset === preset
                        ? isDark
                          ? "bg-zinc-800 text-white border border-zinc-700 font-bold"
                          : "bg-zinc-950 text-white font-bold"
                        : isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Container */}
            <div
              ref={containerRef}
              className="relative w-full h-[480px] sm:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
            >
              <canvas ref={canvasRef} className="w-full h-full block" />

              {/* Live High-Fidelity UI Overlay Projected Directly over 3D Stage */}
              <div className="absolute inset-x-6 top-6 bottom-6 pointer-events-none flex flex-col justify-between max-w-sm sm:max-w-md mx-auto">
                {/* 1. App Header in 3D */}
                <div
                  className={`pointer-events-auto rounded-2xl border p-3 shadow-md backdrop-blur-md transition-all ${
                    isDark ? "bg-zinc-900/90 border-zinc-800 text-white" : "bg-white/95 border-zinc-200 text-zinc-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                          {scenario.partnerName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-sky-400 ring-2 ring-zinc-950" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm">{scenario.partnerName}</span>
                          <span className="text-xs">{scenario.recipientFlag}</span>
                        </div>
                        <span className={`text-[10px] block font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          {scenario.partnerLocation}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isDark
                            ? "bg-zinc-950/70 border-zinc-800 text-zinc-300"
                            : "bg-zinc-100 border-zinc-200 text-zinc-700"
                        }`}
                      >
                        <span className="text-sky-400">🔒</span>
                        <span>E2EE</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Messages Bubble Stream */}
                <div className="space-y-3 pointer-events-auto my-auto py-2">
                  {/* Outgoing Message (Sender in their native tongue) */}
                  <div className="flex flex-col items-end">
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-tr-sm p-3.5 shadow-sm transition-all border ${
                        isDark
                          ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white border-sky-500/50"
                          : "bg-zinc-950 text-white border-zinc-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] font-mono opacity-80 mb-1">
                        <span>YOU ({scenario.senderLang} {scenario.senderFlag})</span>
                        <span>10:42 AM</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium">
                        {scenario.originalText}
                      </p>
                    </div>
                  </div>

                  {/* Incoming Translation Bubble (Instant In-Flow Translation) */}
                  <div className={`flex flex-col items-start transition-all duration-500 ${
                    activeStep >= 3 ? "opacity-100 translate-y-0" : "opacity-30 translate-y-2"
                  }`}>
                    <div
                      className={`max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 shadow-sm border ${
                        isDark
                          ? "bg-zinc-900/95 text-zinc-100 border-zinc-700/80"
                          : "bg-white/95 text-zinc-950 border-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono mb-1 text-sky-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <span>⚡ IN-FLOW AI TRANSLATION</span>
                          <span>({scenario.recipientLang} {scenario.recipientFlag})</span>
                        </span>
                        <span className="text-zinc-400">✓✓</span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed font-medium">
                        {scenario.translatedText}
                      </p>

                      {/* Real-time Voice Note Transcription Preview */}
                      <div
                        className={`mt-2.5 pt-2 border-t text-[11px] leading-relaxed font-mono ${
                          isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-100 text-zinc-600"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1">
                          <button
                            onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                            className="text-sky-400 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>{isPlayingAudio ? "⏸ PAUSE AUDIO" : "▶ PLAY VOICE NOTE"}</span>
                            <span>({scenario.audioDuration})</span>
                          </button>
                          <span className={`text-[10px] ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>40+ LANGUAGES</span>
                        </div>
                        <div className="italic">
                          {isPlayingAudio ? scenario.audioTranslation : scenario.audioTranscription}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Chat Input Bar with Voice Record Button */}
                <div
                  className={`pointer-events-auto rounded-2xl border p-2 shadow-md backdrop-blur-md transition-all flex items-center justify-between gap-2 ${
                    isDark ? "bg-zinc-900/90 border-zinc-800 text-white" : "bg-white/95 border-zinc-200 text-zinc-950"
                  }`}
                >
                  <div className={`flex items-center gap-2 pl-2 text-xs flex-1 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span className="truncate">Type or record in {scenario.senderLang}...</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className={`p-2 rounded-xl border text-xs font-mono transition-colors flex items-center gap-1 ${
                        isPlayingAudio
                          ? "bg-red-500 text-white border-red-400 animate-pulse"
                          : isDark
                          ? "bg-zinc-800 text-zinc-300 border-zinc-700"
                          : "bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                      title="Simulate Voice Note Recording"
                    >
                      <span>🎙️</span>
                      <span className="hidden sm:inline">{isPlayingAudio ? "Streaming" : "Mic"}</span>
                    </button>
                    <div
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        isDark ? "bg-white text-zinc-950" : "bg-zinc-950 text-white"
                      }`}
                    >
                      Send
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div
              className={`px-5 py-3 border-t flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] ${
                isDark ? "border-zinc-800 text-zinc-400 bg-zinc-950/60" : "border-zinc-200 text-zinc-700 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <span>STAGE: <strong className="text-sky-400">STEP 0{activeStep} / 04</strong></span>
                <span>STATUS: <strong className={isDark ? "text-zinc-300" : "text-zinc-900"}>ACTIVE SIMULATION</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <span className={isDark ? "text-zinc-400" : "text-zinc-700"}>ENCRYPTION: 100% PRIVATE</span>
                <span className={isDark ? "text-zinc-400" : "text-zinc-700"}>SUPPORT: 40+ LANGUAGES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
