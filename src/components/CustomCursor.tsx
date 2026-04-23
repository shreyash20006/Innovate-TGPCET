import React, { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ringPos, setRingPos] = useState({ x: 0, y: 0 });
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Check for touch device
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();

    if (isTouch) return;

    let rx = 0;
    let ry = 0;
    let dx = 0;
    let dy = 0;

    const onMouseMove = (e: MouseEvent) => {
      dx = e.clientX;
      dy = e.clientY;
      setPosition({ x: dx, y: dy });
    };

    let animationFrameId: number;
    const ringFollow = () => {
      rx += (dx - rx) * 0.12;
      ry += (dy - ry) * 0.12;
      setRingPos({ x: rx, y: ry });
      animationFrameId = requestAnimationFrame(ringFollow);
    };

    document.addEventListener('mousemove', onMouseMove);
    animationFrameId = requestAnimationFrame(ringFollow);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <>
      <div
        className="fixed pointer-events-none z-[9999]"
        style={{
          width: '8px', height: '8px',
          background: 'var(--color-cyber-pink)',
          borderRadius: '50%',
          left: position.x, top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.3s, height 0.3s, background 0.3s',
          boxShadow: '0 0 12px var(--color-cyber-pink), 0 0 30px rgba(255,0,102,0.4)',
        }}
        id="cursor-dot"
      />
      <div
        className="fixed pointer-events-none z-[9998]"
        style={{
          width: '36px', height: '36px',
          border: '1.5px solid rgba(255,0,102,0.6)',
          borderRadius: '50%',
          left: ringPos.x, top: ringPos.y,
          transform: 'translate(-50%, -50%)',
          transition: 'width 0.12s ease, height 0.12s ease',
        }}
        id="cursor-ring"
      />
    </>
  );
}
