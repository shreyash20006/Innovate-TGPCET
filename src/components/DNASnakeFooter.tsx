import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Youtube, Video, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DNASnakeFooter() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const isMobile = window.innerWidth < 768;
    // --- Scene Setup ---
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 22;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    renderer.setClearColor(0x000000, 0); // Transparent
    mountRef.current.appendChild(renderer.domElement);

    renderer.domElement.style.opacity = '0.72';

    // --- DNA Group ---
    const dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    // --- DNA Math & Config ---
    const TEXT_HALF_W = isMobile ? 10 : 13.5;
    const WRAP_R = isMobile ? 2 : 2.5;
    const TURNS = isMobile ? 5 : 7;
    const SAMPLES = isMobile ? 120 : 340;

    const colorA = 0xFF2D55; // Hot Pink
    const colorB = 0x00FFFF; // Cyan
    const colorRung = 0xBFFF00; // Lime

    // Helper: Create a strand
    const createStrandPoints = (offset: number) => {
      const pts = [];
      for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES;
        const x = (t - 0.5) * TEXT_HALF_W * 2;
        const theta = t * 2 * Math.PI * TURNS + offset;
        const y = Math.sin(theta) * WRAP_R;
        const z = Math.cos(theta) * WRAP_R;
        pts.push(new THREE.Vector3(x, y, z));
      }
      return pts;
    };

    const addStrand = (offset: number, hexColor: number) => {
      const pts = createStrandPoints(offset);
      const curve = new THREE.CatmullRomCurve3(pts);
      
      // Core tube
      const coreGeom = new THREE.TubeGeometry(curve, SAMPLES, 0.038, 8, false);
      const coreMat = new THREE.MeshBasicMaterial({ color: hexColor });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      dnaGroup.add(coreMesh);

      // Glow shell (Skip on mobile)
      if (!isMobile) {
        const glowGeom = new THREE.TubeGeometry(curve, SAMPLES, 0.11, 8, false);
        const glowMat = new THREE.MeshBasicMaterial({ 
          color: hexColor, 
          transparent: true, 
          opacity: 0.07,
          blending: THREE.AdditiveBlending 
        });
        const glowMesh = new THREE.Mesh(glowGeom, glowMat);
        dnaGroup.add(glowMesh);
      }
    };

    addStrand(0, colorA);
    addStrand(Math.PI, colorB);

    // --- Rungs ---
    const numRungs = isMobile ? TURNS * 5 : TURNS * 9;
    const rungGeom = new THREE.CylinderGeometry(0.022, 0.022, 1, 8);
    // Rotate cylinder so it points along Y, we will align it later
    rungGeom.rotateX(Math.PI / 2);
    
    const rungMat = new THREE.MeshBasicMaterial({ 
      color: colorRung, 
      transparent: true, 
      opacity: 0.65 
    });

    const nodeGeom = new THREE.SphereGeometry(0.10, 8, 8);
    const nodeMatA = new THREE.MeshBasicMaterial({ color: colorA });
    const nodeMatB = new THREE.MeshBasicMaterial({ color: colorB });

    const nodeGlowGeom = new THREE.SphereGeometry(0.20, 12, 12);
    const nodeGlowMatA = new THREE.MeshBasicMaterial({ color: colorA, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
    const nodeGlowMatB = new THREE.MeshBasicMaterial({ color: colorB, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });

    for (let i = 0; i < numRungs; i++) {
        const t = i / (numRungs - 1);
        const x = (t - 0.5) * TEXT_HALF_W * 2;
        const theta = t * 2 * Math.PI * TURNS;
        
        const ptA = new THREE.Vector3(x, Math.sin(theta) * WRAP_R, Math.cos(theta) * WRAP_R);
        const ptB = new THREE.Vector3(x, Math.sin(theta + Math.PI) * WRAP_R, Math.cos(theta + Math.PI) * WRAP_R);
        
        const dist = ptA.distanceTo(ptB);
        const center = ptA.clone().lerp(ptB, 0.5);

        // Rung cylinder
        const rungMesh = new THREE.Mesh(rungGeom, rungMat);
        rungMesh.position.copy(center);
        rungMesh.lookAt(ptB);
        rungMesh.scale.z = dist; // scale along Z because we rotated X by 90 deg
        dnaGroup.add(rungMesh);

        // Nodes A
        const nA = new THREE.Mesh(nodeGeom, nodeMatA);
        nA.position.copy(ptA);
        dnaGroup.add(nA);
        if (!isMobile) {
          const ngA = new THREE.Mesh(nodeGlowGeom, nodeGlowMatA);
          ngA.position.copy(ptA);
          dnaGroup.add(ngA);
        }

        // Nodes B
        const nB = new THREE.Mesh(nodeGeom, nodeMatB);
        nB.position.copy(ptB);
        dnaGroup.add(nB);
        if (!isMobile) {
          const ngB = new THREE.Mesh(nodeGlowGeom, nodeGlowMatB);
          ngB.position.copy(ptB);
          dnaGroup.add(ngB);
        }
    }

    // --- Scan Ring ---
    const ringGeom = new THREE.TorusGeometry(WRAP_R * 1.25, 0.028, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFFF, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending 
    });
    const scanRing = new THREE.Mesh(ringGeom, ringMat);
    scanRing.rotation.y = Math.PI / 2; // Face sideways so it sweeps over the tube
    dnaGroup.add(scanRing);

    // --- Particles ---
    const numParticles = isMobile ? 40 : 120;
    const partGeom = new THREE.BufferGeometry();
    const partPos = new Float32Array(numParticles * 3);
    const partColors = new Float32Array(numParticles * 3);
    
    const palette = [
      new THREE.Color(colorA),
      new THREE.Color(colorB),
      new THREE.Color(colorRung)
    ];

    for (let i = 0; i < numParticles; i++) {
      partPos[i * 3] = (Math.random() - 0.5) * 35;
      partPos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      partPos[i * 3 + 2] = (Math.random() - 0.5) * 15;

      const c = palette[Math.floor(Math.random() * palette.length)];
      partColors[i * 3] = c.r;
      partColors[i * 3 + 1] = c.g;
      partColors[i * 3 + 2] = c.b;
    }
    partGeom.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    partGeom.setAttribute('color', new THREE.BufferAttribute(partColors, 3));

    const partMat = new THREE.PointsMaterial({
      size: isMobile ? 0.15 : 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(partGeom, partMat);
    scene.add(particles);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      dnaGroup.rotation.x = time * 0.22;
      dnaGroup.position.y = Math.sin(time * 0.5) * 0.18;
      
      scanRing.position.x = Math.sin(time * 0.65) * TEXT_HALF_W * 0.82;

      particles.rotation.y = time * 0.05;
      particles.rotation.x = time * 0.02;

      camera.position.z = 22 + Math.sin(time * 0.3) * 0.6;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <footer className="relative w-full overflow-hidden mt-10 md:mt-20 print:hidden" style={{ minHeight: window.innerWidth < 768 ? '450px' : '600px' }}>
      {/* --- LAYER 0-3: BACKGROUND --- */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ background: 'linear-gradient(180deg, #0a0208, #050108, #020508)' }} 
      />
      
      {/* Dot Grid */}
      <div 
        className="absolute inset-0 z-1" 
        style={{
          backgroundImage: 'radial-gradient(rgba(255,45,85,0.22) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          WebkitMaskImage: 'radial-gradient(ellipse at center, white 20%, transparent 70%)',
          maskImage: 'radial-gradient(ellipse at center, white 20%, transparent 70%)'
        }} 
      />
      
      {/* Scanlines */}
      <div 
        className="absolute inset-0 z-2 pointer-events-none" 
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />
      
      {/* Top Border Gradient */}
      <div 
        className="absolute top-0 left-0 w-full h-[2px] z-3 opacity-55" 
        style={{ background: 'linear-gradient(90deg, transparent, #FF2D55, #00FFFF, transparent)' }}
      />

      {/* --- LAYER 4: THREE.JS DNA BACKGROUND --- */}
      <div 
        ref={mountRef} 
        className="absolute inset-0 z-4 pointer-events-none" 
      />

      {/* --- LAYER 5: FOREGROUND TEXT & CONTENT --- */}
      <div className="relative z-5 w-full h-full min-h-[450px] md:min-h-[600px] flex flex-col items-center justify-center pt-16 md:pt-24 pb-12 md:pb-16 px-6">
        
        {/* Main Logo Text wrapped by DNA */}
        <div className="flex-grow flex items-center justify-center text-center">
          <div 
            className="whitespace-nowrap font-[900] pointer-events-none"
            style={{
              fontFamily: '"Space Mono", monospace',
              fontSize: 'clamp(32px, 8vw, 115px)',
              letterSpacing: '-0.05em',
              color: 'transparent',
              WebkitTextStroke: '1.2px rgba(255,45,85,0.75)',
              filter: `
                drop-shadow(0 0 8px rgba(255,45,85,0.8))
                drop-shadow(0 0 24px rgba(255,45,85,0.5))
              `,
            }}
          >
            innovate tgpcet
          </div>
        </div>

        {/* Footer Bottom Content */}
        <div className="w-full max-w-[1200px] mt-12 md:mt-24">
          <div 
            className="w-full h-[1px] mb-8"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,45,85,0.5), rgba(0,255,255,0.5), transparent)' }}
          />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-center">
              <a 
                href="https://www.youtube.com/channel/UCklqMwCH9yn4KngY6SXyeAQ" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 text-[#888888] hover:text-[#FF2D55] transition-colors"
              >
                <Youtube size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest font-bold">Subscribe</span>
              </a>
              <a 
                href="https://youtu.be/TAXVZTU2BZg" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group flex items-center gap-2 text-[#888888] hover:text-[#FF2D55] transition-colors"
              >
                <Video size={18} className="group-hover:scale-110 transition-transform" />
                <span className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest font-bold">Latest Video</span>
              </a>
            </div>

            <div className="text-center md:text-right">
              <div className="font-mono text-[11px] md:text-[12px] text-[#888888] tracking-widest mb-1.5">
                © 2026 <span style={{ color: '#FF2D55' }}>innovate.tgpcet</span>
              </div>
              <div 
                className="font-mono text-[9px] uppercase font-bold tracking-widest text-white/20 mx-auto md:ml-auto md:mr-0 max-w-[300px] md:max-w-[400px]"
              >
                Unofficial hub created by students. Not affiliated with any corporate entity.
              </div>
            </div>

          </div>
        </div>
      </div>

    </footer>
  );
}
