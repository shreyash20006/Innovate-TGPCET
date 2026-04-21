import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const [isLightMode, setIsLightMode] = React.useState(document.body.classList.contains('theme-light'));
    
    React.useEffect(() => {
      const observer = new MutationObserver(() => {
        setIsLightMode(document.body.classList.contains('theme-light'));
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }, []);
    
    const width = 480;
    const height = 480;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 5;

    // Main wireframe icosahedron
    const ico = new THREE.IcosahedronGeometry(1.8, 1);
    const wireframe = new THREE.WireframeGeometry(ico);
    const line = new THREE.LineSegments(
      wireframe, 
      new THREE.LineBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.7 })
    );
    scene.add(line);

    // Inner solid with glow material
    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.4, 0), 
      new THREE.MeshBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.04, wireframe: false })
    );
    scene.add(inner);

    // Outer ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.03, 8, 80), 
      new THREE.MeshBasicMaterial({ color: 0x00cfff, transparent: true, opacity: 0.5 })
    );
    ring.rotation.x = 0.4;
    scene.add(ring);

    // Outer ring 2
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(3.1, 0.02, 8, 80), 
      new THREE.MeshBasicMaterial({ color: 0xaaff00, transparent: true, opacity: 0.3 })
    );
    ring2.rotation.x = 1.0; 
    ring2.rotation.z = 0.5;
    scene.add(ring2);

    // Particles around it
    const N2 = 80;
    const pp = new Float32Array(N2 * 3);
    for (let i = 0; i < N2; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3.5 + Math.random() * 1.5;
      pp[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pp[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pp[i * 3 + 2] = r * Math.cos(phi);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xff0066, size: 0.05, transparent: true, opacity: 0.8 })));

    let hovered = false;
    const handleMouseEnter = () => hovered = true;
    const handleMouseLeave = () => hovered = false;
    
    renderer.domElement.addEventListener('mouseenter', handleMouseEnter);
    renderer.domElement.addEventListener('mouseleave', handleMouseLeave);

    let t = 0;
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      t += 0.008;
      const speed = hovered ? 0.025 : 0.008;
      line.rotation.y += speed; 
      line.rotation.x += speed * 0.4;
      inner.rotation.y -= speed * 0.5;
      ring.rotation.z += 0.004; 
      ring2.rotation.y += 0.003;
      
      // Breathe
      const s = 1 + Math.sin(t) * 0.05;
      line.scale.setScalar(s); 
      inner.scale.setScalar(s);
      
      renderer.render(scene, camera);
    };

    const applyTheme = () => {
      const isLight = document.body.classList.contains('theme-light');
      materialWire.color.setHex(isLight ? 0xCC0033 : 0xff0066);
      materialWire.opacity = isLight ? 0.9 : 0.7;
      
      materialRing.color.setHex(isLight ? 0x005577 : 0x00cfff);
    };
    
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mouseenter', handleMouseEnter);
        renderer.domElement.removeEventListener('mouseleave', handleMouseLeave);
        if (mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-[300px] h-[300px] md:w-[480px] md:h-[480px] block" />;
}
