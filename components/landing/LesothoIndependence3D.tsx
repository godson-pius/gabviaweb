"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface LesothoIndependence3DProps {
  className?: string;
  theme?: "light" | "dark";
}

const BLUE = "#00209F";
const GREEN = "#009543";

/** Draws the Mokorotlo (traditional Basotho hat) centred at (0,0). */
function drawMokorotlo(ctx: CanvasRenderingContext2D, scale: number) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.fillStyle = "#0a0a0a";

  // Conical body with concave sides
  ctx.beginPath();
  ctx.moveTo(0, -105);
  ctx.quadraticCurveTo(14, -40, 105, 62);
  ctx.lineTo(-105, 62);
  ctx.quadraticCurveTo(-14, -40, 0, -105);
  ctx.closePath();
  ctx.fill();

  // Finial knob and neck
  ctx.beginPath();
  ctx.arc(0, -118, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-5, -108, 10, 14);

  // Broad brim
  ctx.beginPath();
  ctx.ellipse(0, 64, 118, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Woven bands cut into the cone (negative space)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) {
    const y = -50 + i * 28;
    const half = 18 + i * 24;
    ctx.beginPath();
    ctx.moveTo(-half, y);
    ctx.quadraticCurveTo(0, y + 10, half, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Front face: the Lesotho flag (blue / white / green + Mokorotlo) in a gold bezel. */
function createFrontTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const r = size * 0.46;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.clip();

  // Flag proportions 3 : 4 : 3
  const unit = (r * 2) / 10;
  const top = cx - r;
  ctx.fillStyle = BLUE;
  ctx.fillRect(cx - r, top, r * 2, unit * 3 + 1);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(cx - r, top + unit * 3, r * 2, unit * 4 + 1);
  ctx.fillStyle = GREEN;
  ctx.fillRect(cx - r, top + unit * 7, r * 2, unit * 3 + 1);

  ctx.translate(cx, cx + 6);
  drawMokorotlo(ctx, 1.55);
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Sheen
  const sheen = ctx.createRadialGradient(cx - 120, cx - 160, 20, cx, cx, r);
  sheen.addColorStop(0, "rgba(255,255,255,0.28)");
  sheen.addColorStop(0.5, "rgba(255,255,255,0)");
  sheen.addColorStop(1, "rgba(0,0,0,0.38)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Gold bezel
  const gold = ctx.createLinearGradient(0, 0, size, size);
  gold.addColorStop(0, "#fef3c7");
  gold.addColorStop(0.35, "#eab308");
  gold.addColorStop(0.7, "#b45309");
  gold.addColorStop(1, "#78350f");
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.lineWidth = 34;
  ctx.strokeStyle = gold;
  ctx.stroke();

  // Rim lettering
  ctx.save();
  ctx.translate(cx, cx);
  const text = "★ LESOTHO ★ 4 OCTOBER 1966 ★ KHOTSO · PULA · NALA ★ ";
  ctx.font = "bold 22px 'Courier New', monospace";
  ctx.fillStyle = "#3b1d05";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const step = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    ctx.save();
    ctx.rotate(i * step - Math.PI / 2);
    ctx.translate(0, -(r - 1));
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/** Back face: commemorative "60 years" gold plate. */
function createBackTexture(): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const r = size * 0.46;

  const bg = ctx.createRadialGradient(cx, cx, 40, cx, cx, r);
  bg.addColorStop(0, "#fef9c3");
  bg.addColorStop(0.55, "#facc15");
  bg.addColorStop(0.9, "#b45309");
  bg.addColorStop(1, "#713f12");
  ctx.beginPath();
  ctx.arc(cx, cx, r, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();

  ctx.strokeStyle = "#78350f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cx, r * 0.86, 0, Math.PI * 2);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#3b1d05";
  ctx.font = "900 250px system-ui, sans-serif";
  ctx.fillText("60", cx, cx - 70);
  ctx.font = "bold 44px system-ui, sans-serif";
  ctx.fillText("YEARS OF FREEDOM", cx, cx + 80);
  ctx.font = "bold 32px 'Courier New', monospace";
  ctx.fillStyle = BLUE;
  ctx.fillText("1966 — 2026", cx, cx + 140);
  ctx.fillStyle = GREEN;
  ctx.font = "bold 28px system-ui, sans-serif";
  ctx.fillText("KINGDOM IN THE SKY", cx, cx + 200);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function LesothoIndependence3D({ className = "", theme = "dark" }: LesothoIndependence3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = container.clientWidth || 500;
    let height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.replaceChildren(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 1.5 : 1.9));
    const key = new THREE.DirectionalLight(0xfff7ed, 2.6);
    key.position.set(5, 6, 8);
    scene.add(key);
    const blueLight = new THREE.PointLight(0x2f5bff, 40, 14);
    blueLight.position.set(-4, 3, 4);
    scene.add(blueLight);
    const greenLight = new THREE.PointLight(0x10c060, 35, 14);
    greenLight.position.set(4, -3, 4);
    scene.add(greenLight);

    // Medallion: two faces + metallic rim
    const group = new THREE.Group();
    scene.add(group);
    const R = 2;
    const frontTex = createFrontTexture();
    const backTex = createBackTexture();

    const faceGeo = new THREE.CircleGeometry(R, 96);
    const front = new THREE.Mesh(
      faceGeo,
      new THREE.MeshStandardMaterial({ map: frontTex, metalness: 0.3, roughness: 0.3 })
    );
    front.position.z = 0.1;
    const back = new THREE.Mesh(
      faceGeo,
      new THREE.MeshStandardMaterial({ map: backTex, metalness: 0.5, roughness: 0.3 })
    );
    back.position.z = -0.1;
    back.rotation.y = Math.PI;

    const goldMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.22 });
    const rimGeo = new THREE.CylinderGeometry(R, R, 0.2, 96, 1, true);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.rotation.x = Math.PI / 2;
    const bezelGeo = new THREE.TorusGeometry(R + 0.02, 0.09, 24, 120);
    const bezel = new THREE.Mesh(bezelGeo, goldMat);
    group.add(front, back, rim, bezel);

    // Orbit rings in flag colours
    const makeRing = (radius: number, color: number, rx: number, ry: number) => {
      const geo = new THREE.TorusGeometry(radius, 0.022, 16, 140);
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        metalness: 0.8,
        roughness: 0.25,
      });
      const m = new THREE.Mesh(geo, mat);
      m.rotation.set(rx, ry, 0);
      scene.add(m);
      return { m, geo, mat };
    };
    const ring1 = makeRing(2.9, 0x2f5bff, Math.PI / 3.2, Math.PI / 6);
    const ring2 = makeRing(3.3, 0x10c060, -Math.PI / 4, -Math.PI / 5);
    const ring3 = makeRing(3.7, 0xfacc15, Math.PI / 2.2, Math.PI / 3);

    // Maloti-style mountain peaks (low-poly cones) at the base
    const peakGeo = new THREE.ConeGeometry(0.5, 1, 5);
    const peakMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, flatShading: true, metalness: 0.2, roughness: 0.7 });
    const peaks = new THREE.Group();
    [
      [-1.2, 0.55, 0.9],
      [0, 0.8, 1.2],
      [1.2, 0.5, 0.85],
    ].forEach(([x, s, h]) => {
      const p = new THREE.Mesh(peakGeo, peakMat);
      p.position.set(x, -3.1 + (h * s) / 2, 0);
      p.scale.set(s * 1.4, h * s * 1.4, s * 1.4);
      peaks.add(p);
    });
    scene.add(peaks);

    // Confetti-like particle field in flag colours
    const count = 320;
    const pGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [0x2f5bff, 0xffffff, 0x10c060, 0xfacc15].map((c) => new THREE.Color(c));
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rr = 2.6 + Math.random() * 2.8;
      pos[i * 3] = rr * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = rr * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = rr * Math.cos(phi);
      const c = palette[i % palette.length];
      col.set([c.r, c.g, c.b], i * 3);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Pointer parallax + drag spin
    let mx = 0;
    let my = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let targetY = 0;
    let targetX = 0;
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mx = (((e.clientX - rect.left) / rect.width) * 2 - 1) * 0.4;
      my = -(((e.clientY - rect.top) / rect.height) * 2 - 1) * 0.3;
      if (dragging) {
        targetY += (e.clientX - lastX) * 0.01;
        targetX += (e.clientY - lastY) * 0.01;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onUp = () => {
      dragging = false;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.elapsedTime;
      if (!reduceMotion && !dragging) {
        targetY += dt * 0.5;
        targetX = Math.sin(t * 0.8) * 0.12;
      }
      group.rotation.y += (targetY + mx - group.rotation.y) * 0.08;
      group.rotation.x += (targetX - my - group.rotation.x) * 0.08;
      group.position.y = reduceMotion ? 0 : Math.sin(t * 1.5) * 0.08;
      if (!reduceMotion) {
        ring1.m.rotation.z += dt * 0.3;
        ring2.m.rotation.z -= dt * 0.22;
        ring3.m.rotation.z += dt * 0.15;
        particles.rotation.y = t * 0.06;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      width = container.clientWidth || 500;
      height = container.clientHeight || 460;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerup", onUp);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerdown", onDown);
      [faceGeo, rimGeo, bezelGeo, peakGeo, pGeo, ring1.geo, ring2.geo, ring3.geo].forEach((g) => g.dispose());
      [goldMat, peakMat, pMat, ring1.mat, ring2.mat, ring3.mat].forEach((m) => m.dispose());
      (front.material as THREE.Material).dispose();
      (back.material as THREE.Material).dispose();
      frontTex.dispose();
      backTex.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Rotating 3D commemorative medallion showing the Lesotho flag and the Mokorotlo hat, marking 60 years of independence"
      className={`w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing select-none touch-pan-y ${className}`}
    />
  );
}
