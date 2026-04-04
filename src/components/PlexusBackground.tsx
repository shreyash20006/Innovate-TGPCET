import React, { useEffect, useRef } from 'react';

export default function PlexusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- CONFIG ---
    const NODE_COUNT = 90;
    const MAX_DIST = 165;
    const DEPTH = 500;
    const SPEED = 1.0;
    const NODE_R = 245, NODE_G = 166, NODE_B = 35; // #f5a623

    let animationFrameId: number;

    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.parentElement.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.parentElement?.offsetWidth || window.innerWidth;
    const H = () => canvas.parentElement?.offsetHeight || window.innerHeight;

    class Node {
      x: number = 0;
      y: number = 0;
      z: number = 0;
      vx: number = 0;
      vy: number = 0;
      vz: number = 0;
      pulse: number = 0;
      pulseSpeed: number = 0;

      constructor() {
        this.reset(true);
      }

      reset(randomZ: boolean) {
        this.x = Math.random() * W();
        this.y = Math.random() * H();
        this.z = randomZ ? Math.random() * DEPTH : DEPTH;
        this.vx = (Math.random() - 0.5) * 0.28 * SPEED;
        this.vy = (Math.random() - 0.5) * 0.18 * SPEED;
        this.vz = (Math.random() - 0.5) * 0.4 * SPEED;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.012 + Math.random() * 0.016;
      }

      get scale() { return 1 - (this.z / DEPTH) * 0.70; }
      get alpha() { return 0.18 + this.scale * 0.82; }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.z += this.vz;
        this.pulse += this.pulseSpeed;
        if (this.x < -60) this.x = W() + 60;
        if (this.x > W() + 60) this.x = -60;
        if (this.y < -60) this.y = H() + 60;
        if (this.y > H() + 60) this.y = -60;
        if (this.z < 0) this.z = DEPTH;
        if (this.z > DEPTH) this.z = 0;
      }
    }

    const nodes = Array.from({ length: NODE_COUNT }, () => new Node());

    let mx = -9999, my = -9999;
    
    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    
    const handleMouseLeave = () => {
      mx = -9999; my = -9999;
    };

    canvas.parentElement?.addEventListener('mousemove', handleMouseMove);
    canvas.parentElement?.addEventListener('mouseleave', handleMouseLeave);

    const draw = () => {
      const w = W(), h = H();
      ctx.clearRect(0, 0, w, h);

      // Dark navy background gradient
      const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.88);
      bg.addColorStop(0, '#0d1428');
      bg.addColorStop(0.6, '#090d1e');
      bg.addColorStop(1, '#04070f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Sort nodes: far → near
      const sorted = [...nodes].sort((a, b) => b.z - a.z);

      // Draw connecting lines
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const a = sorted[i], b = sorted[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > MAX_DIST) continue;

          const avgScale = (a.scale + b.scale) * 0.5;
          const proximity = 1 - dist / MAX_DIST;
          const lineAlpha = proximity * proximity * avgScale * 0.82;

          // Mouse proximity boost
          const mpx = (a.x + b.x) * 0.5 - mx;
          const mpy = (a.y + b.y) * 0.5 - my;
          const md = Math.sqrt(mpx * mpx + mpy * mpy);
          const boost = md < 145 ? (1 - md / 145) * 0.55 : 0;

          const fa = Math.min(1, lineAlpha + boost);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${NODE_R},${NODE_G},${NODE_B},${fa})`;
          ctx.lineWidth = avgScale * 0.9 + boost * 0.75;
          ctx.stroke();
        }
      }

      // Draw nodes
      for (const n of sorted) {
        const pulse = 0.72 + Math.sin(n.pulse) * 0.28;
        const r = (2.3 + n.scale * 3.2) * pulse;

        const dxm = n.x - mx, dym = n.y - my;
        const md = Math.sqrt(dxm * dxm + dym * dym);
        const mb = md < 120 ? (1 - md / 120) : 0;

        // Outer glow
        const glowR = r * (3.5 + mb * 5);
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grd.addColorStop(0, `rgba(${NODE_R},${NODE_G},${NODE_B},${n.alpha * (0.55 + mb * 0.45)})`);
        grd.addColorStop(0.45, `rgba(${NODE_R},100,10,${n.alpha * (0.15 + mb * 0.15)})`);
        grd.addColorStop(1, `rgba(${NODE_R},60,0,0)`);
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        const dg = ctx.createRadialGradient(n.x - r * 0.3, n.y - r * 0.3, 0, n.x, n.y, r);
        dg.addColorStop(0, `rgba(255,225,160,${n.alpha})`);
        dg.addColorStop(0.5, `rgba(${NODE_R},${NODE_G},${NODE_B},${n.alpha})`);
        dg.addColorStop(1, `rgba(190,75,5,${n.alpha * 0.5})`);
        ctx.fillStyle = dg;
        ctx.fill();
      }

      // Vignette
      const vig = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.08, w * 0.5, h * 0.5, w * 0.75);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      nodes.forEach(n => n.update());
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.parentElement?.removeEventListener('mousemove', handleMouseMove);
      canvas.parentElement?.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full block z-0"
    />
  );
}
