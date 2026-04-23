import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const isMobile = window.innerWidth < 768;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.5));
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.z = 90;

    // Grid plane
    const gridHelper = new THREE.GridHelper(400, isMobile ? 20 : 40, 0xff0066, 0xff0066);
    if ((gridHelper.material as THREE.Material)) {
      (gridHelper.material as THREE.Material).opacity = 0.06;
      (gridHelper.material as THREE.Material).transparent = true;
    }
    gridHelper.position.y = -40;
    gridHelper.rotation.x = 0.15;
    scene.add(gridHelper);

    // Particles
    const N = isMobile ? 80 : 320;
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const vel: number[] = [];
    const c1 = new THREE.Color('#ff0066');
    const c2 = new THREE.Color('#00cfff');
    const c3 = new THREE.Color('#aaff00');

    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 220;
      pos[i * 3 + 1] = (Math.random() - .5) * 180;
      pos[i * 3 + 2] = (Math.random() - .5) * 120;
      vel.push((Math.random() - .5) * 0.05, (Math.random() - .5) * 0.04, (Math.random() - .5) * 0.03);
      const r = Math.random();
      const c = r < 0.5 ? c1.clone().lerp(c2, Math.random()) : c3;
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.PointsMaterial({ size: isMobile ? 1.8 : 1.4, vertexColors: true, transparent: true, opacity: 0.7, sizeAttenuation: true });
    scene.add(new THREE.Points(pGeo, pMat));

    // Lines (Disable on mobile for significant boost)
    const LDIST = 26;
    const lGeo = new THREE.BufferGeometry();
    const lMat = new THREE.LineBasicMaterial({ color: 0xff0066, transparent: true, opacity: 0.09 });
    const lines = new THREE.LineSegments(lGeo, lMat);
    if (!isMobile) scene.add(lines);

    function updateLines() {
      if (isMobile) return;
      const lp = [];
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = pos[i * 3] - pos[j * 3];
          const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
          const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < LDIST * LDIST) {
            lp.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]);
          }
        }
      }
      lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(lp), 3));
    }

    // Torus rings (Fewer on mobile)
    const ringMeshes: any[] = [];
    const ringRadii = isMobile ? [18, 30] : [14, 22, 32];
    ringRadii.forEach((r, i) => {
      const g = new THREE.TorusGeometry(r, 0.07, 8, 72);
      const m = new THREE.MeshBasicMaterial({ color: i === 0 ? 0xff0066 : i === 1 ? 0x00cfff : 0xaaff00, transparent: true, opacity: 0.05 + i * 0.02 });
      const mesh = new THREE.Mesh(g, m);
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.userData = { rx: (Math.random() - .5) * 0.003, ry: (Math.random() - .5) * 0.002 };
      scene.add(mesh);
      ringMeshes.push(mesh);
    });

    let mx = 0, my = 0, frame = 0;
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - .5) * 2;
      my = (e.clientY / window.innerHeight - .5) * 2;
    };
    if (!isMobile) document.addEventListener('mousemove', onMouseMove);

    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      frame++;
      for (let i = 0; i < N; i++) {
        pos[i * 3] += vel[i * 3]; pos[i * 3 + 1] += vel[i * 3 + 1]; pos[i * 3 + 2] += vel[i * 3 + 2];
        if (Math.abs(pos[i * 3]) > 110) vel[i * 3] *= -1;
        if (Math.abs(pos[i * 3 + 1]) > 90) vel[i * 3 + 1] *= -1;
        if (Math.abs(pos[i * 3 + 2]) > 60) vel[i * 3 + 2] *= -1;
      }
      pGeo.attributes.position.needsUpdate = true;
      if (!isMobile && frame % 4 === 0) updateLines();
      
      ringMeshes.forEach(obj => {
        if (obj.userData.rx) {
          obj.rotation.x += obj.userData.rx;
          obj.rotation.y += obj.userData.ry;
        }
      });

      gridHelper.rotation.z += 0.0005;
      if (!isMobile) {
        camera.position.x += (mx * 10 - camera.position.x) * 0.015;
        camera.position.y += (-my * 6 - camera.position.y) * 0.015;
      } else {
        // Subtle auto-float for mobile
        camera.position.x = Math.sin(frame * 0.005) * 5;
        camera.position.y = Math.cos(frame * 0.005) * 3;
      }
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationId);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Cleanup three
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" />;
}
