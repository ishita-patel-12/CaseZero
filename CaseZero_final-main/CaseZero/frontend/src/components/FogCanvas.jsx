import { useEffect, useRef } from 'react';

/**
 * Interactive fog. A low-resolution canvas of drifting soft puffs.
 *  - pointer / touch pushes puffs aside (they spring back)
 *  - `progressRef.current` (0..1) parts the fog and thins it as the visitor scrolls
 * Everything runs off refs + one rAF loop: no React re-renders per frame.
 * Falls back to a static gradient when prefers-reduced-motion is set.
 */
export function FogCanvas({ progressRef, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    const SCALE = coarse ? 0.4 : 0.5; // render low-res, CSS scales up (fog is soft anyway)

    let W = 0;
    let H = 0;
    let puffs = [];
    let raf = 0;
    let running = true;
    const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, active: false };
    let lastScrollY = window.scrollY;
    let scrollKick = 0;

    // Pre-rendered soft sprite so each puff is one drawImage call.
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 128;
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(96,106,114,0.34)');
    g.addColorStop(0.45, 'rgba(70,80,88,0.13)');
    g.addColorStop(1, 'rgba(80,90,98,0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 128, 128);

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(rect.width * SCALE));
      H = Math.max(1, Math.floor(rect.height * SCALE));
      canvas.width = W;
      canvas.height = H;
      const count = coarse ? 22 : 38;
      puffs = Array.from({ length: count }, () => {
        const r = (0.16 + Math.random() * 0.26) * Math.max(W, H);
        return {
          bx: Math.random() * W,
          by: Math.random() * H,
          r,
          ox: 0,
          oy: 0,
          vx: 0,
          vy: 0,
          drift: (Math.random() - 0.5) * 0.18,
          rise: (Math.random() - 0.5) * 0.06,
          phase: Math.random() * Math.PI * 2,
          a: 0.22 + Math.random() * 0.4,
          side: 0,
        };
      });
      puffs.forEach((p) => {
        p.side = p.bx < W / 2 ? -1 : 1;
      });
    };

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      const prog = Math.min(1, Math.max(0, progressRef?.current ?? 0));
      // Density thins as the visitor scrolls; fog parts left/right of centre.
      const density = 1 - prog * 0.92;
      const part = prog * W * 0.55;
      const reach = Math.max(W, H) * 0.2;

      for (const p of puffs) {
        p.bx += p.drift;
        p.by += p.rise;
        if (p.bx < -p.r) p.bx = W + p.r;
        if (p.bx > W + p.r) p.bx = -p.r;
        if (p.by < -p.r) p.by = H + p.r;
        if (p.by > H + p.r) p.by = -p.r;

        const sway = Math.sin(t * 0.0003 + p.phase) * 6;
        const px = p.bx + p.ox + p.side * part + sway;
        const py = p.by + p.oy + scrollKick * 0.4;

        if (pointer.active) {
          const dx = px - pointer.x;
          const dy = py - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < reach + p.r * 0.35 && d > 0.001) {
            const f = (1 - d / (reach + p.r * 0.35)) * 2.2;
            p.vx += (dx / d) * f + pointer.vx * 0.03;
            p.vy += (dy / d) * f + pointer.vy * 0.03;
          }
        }
        // spring back + damping
        p.vx += -p.ox * 0.012;
        p.vy += -p.oy * 0.012;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.ox += p.vx;
        p.oy += p.vy;

        ctx.globalAlpha = Math.min(1, p.a * density);
        ctx.drawImage(sprite, px - p.r, py - p.r, p.r * 2, p.r * 2);
      }
      ctx.globalAlpha = 1;
      scrollKick *= 0.9;
      pointer.vx *= 0.85;
      pointer.vy *= 0.85;
    };

    const loop = (t) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * SCALE;
      const y = (e.clientY - rect.top) * SCALE;
      pointer.vx = x - (pointer.x === -9999 ? x : pointer.x);
      pointer.vy = y - (pointer.y === -9999 ? y : pointer.y);
      pointer.x = x;
      pointer.y = y;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
      pointer.x = pointer.y = -9999;
    };
    // Touch / scroll gesture also disturbs the fog so mobile has a real interaction.
    const onScroll = () => {
      const y = window.scrollY;
      scrollKick = Math.max(-40, Math.min(40, (y - lastScrollY) * SCALE));
      lastScrollY = y;
    };
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(canvas);

    if (reduced) {
      draw(0); // one static frame
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerup', onLeave);
      window.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerup', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [progressRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block w-full h-full ${className}`}
    />
  );
}
