'use client';

import { useEffect, useRef } from 'react';
import styles from './BinaryField.module.css';

type Digit = {
   x: number;
   y: number;
   speed: number;
   size: number;
   alpha: number;
   char: '0' | '1';
   flipAt: number;
   lemon: boolean;
};

const DENSITY = 1 / 16000; // digits per px²
const NEAR = 140; // px around the cursor where digits brighten a little

/** Slowly drifting 0s and 1s behind the hero. Sparse and faint on purpose. */
export default function BinaryField() {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let digits: Digit[] = [];
      let width = 0;
      let height = 0;
      let inkColor = '';
      let lemonColor = '';
      let pointer = { x: -1e4, y: -1e4 };
      let frame = 0;
      let last = performance.now();
      let visible = true;

      const readColors = () => {
         const css = getComputedStyle(document.documentElement);
         inkColor = css.getPropertyValue('--muted').trim() || '#787266';
         lemonColor = css.getPropertyValue('--lemon').trim() || '#f1d94f';
      };

      const spawn = (y?: number): Digit => ({
         x: Math.random() * width,
         y: y ?? Math.random() * height,
         speed: 5 + Math.random() * 9,
         size: 11 + Math.random() * 5,
         alpha: 0.1 + Math.random() * 0.18,
         char: Math.random() < 0.5 ? '0' : '1',
         flipAt: performance.now() + 2000 + Math.random() * 6000,
         lemon: Math.random() < 0.08,
      });

      const resize = () => {
         const rect = canvas.getBoundingClientRect();
         const dpr = Math.min(window.devicePixelRatio || 1, 2);
         width = rect.width;
         height = rect.height;
         canvas.width = width * dpr;
         canvas.height = height * dpr;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
         const count = Math.round(width * height * DENSITY);
         digits = Array.from({ length: count }, () => spawn());
      };

      const draw = (now: number) => {
         const dt = Math.min(0.05, (now - last) / 1000);
         last = now;
         ctx.clearRect(0, 0, width, height);
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';

         for (const d of digits) {
            if (!reducedMotion) {
               d.y -= d.speed * dt;
               if (d.y < -20) Object.assign(d, spawn(height + 20));
               if (now > d.flipAt) {
                  d.char = d.char === '0' ? '1' : '0';
                  d.flipAt = now + 2000 + Math.random() * 6000;
               }
            }
            const distance = Math.hypot(d.x - pointer.x, d.y - pointer.y);
            const boost = distance < NEAR ? (1 - distance / NEAR) * 0.35 : 0;
            ctx.globalAlpha = Math.min(0.6, d.alpha + boost);
            ctx.fillStyle = d.lemon ? lemonColor : inkColor;
            ctx.font = `${d.size}px ui-monospace, Menlo, monospace`;
            ctx.fillText(d.char, d.x, d.y);
         }
      };

      const loop = (now: number) => {
         draw(now);
         if (visible && !document.hidden) frame = requestAnimationFrame(loop);
      };

      const start = () => {
         cancelAnimationFrame(frame);
         last = performance.now();
         frame = requestAnimationFrame(loop);
      };

      readColors();
      resize();
      if (reducedMotion) draw(performance.now());
      else start();

      const resizeObserver = new ResizeObserver(() => {
         resize();
         if (reducedMotion) draw(performance.now());
      });
      resizeObserver.observe(canvas);

      const viewObserver = new IntersectionObserver(([entry]) => {
         visible = entry.isIntersecting;
         if (visible && !reducedMotion) start();
      });
      viewObserver.observe(canvas);

      const onVisibility = () => !document.hidden && visible && !reducedMotion && start();
      const onPointer = (e: PointerEvent) => {
         const rect = canvas.getBoundingClientRect();
         pointer = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };
      // Re-read the palette when the theme toggle flips <html data-theme>.
      const themeObserver = new MutationObserver(() => {
         readColors();
         if (reducedMotion) draw(performance.now());
      });
      themeObserver.observe(document.documentElement, { attributeFilter: ['data-theme'] });

      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('pointermove', onPointer, { passive: true });

      return () => {
         cancelAnimationFrame(frame);
         resizeObserver.disconnect();
         viewObserver.disconnect();
         document.removeEventListener('visibilitychange', onVisibility);
         window.removeEventListener('pointermove', onPointer);
         themeObserver.disconnect();
      };
   }, []);

   return <canvas ref={canvasRef} className={styles.field} aria-hidden="true" />;
}
