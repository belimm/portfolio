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

const NEAR = 140; // px around the cursor where digits brighten a little

// The hero is the showpiece; behind the sections the field is sparser and fainter.
const VARIANTS = {
   hero: { density: 1 / 16000, minAlpha: 0.1, alphaRange: 0.18, maxDpr: 2 },
   // Section canvases are tall; drawing them at 1x keeps GPU memory low (phones included).
   section: { density: 1 / 22000, minAlpha: 0.09, alphaRange: 0.14, maxDpr: 1 },
};

type BinaryFieldProps = {
   /** 'up' drifts from the bottom edge to the top, 'down' the other way. */
   direction?: 'up' | 'down';
   variant?: keyof typeof VARIANTS;
};

/** Slowly drifting 0s and 1s behind a section. Sparse and faint on purpose. */
export default function BinaryField({ direction = 'up', variant = 'hero' }: BinaryFieldProps) {
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

      const { density, minAlpha, alphaRange, maxDpr } = VARIANTS[variant];
      const sign = direction === 'up' ? -1 : 1;

      const spawn = (y?: number): Digit => ({
         x: Math.random() * width,
         y: y ?? Math.random() * height,
         speed: 5 + Math.random() * 9,
         size: 11 + Math.random() * 5,
         alpha: minAlpha + Math.random() * alphaRange,
         char: Math.random() < 0.5 ? '0' : '1',
         flipAt: performance.now() + 2000 + Math.random() * 6000,
         lemon: Math.random() < 0.08,
      });

      const resize = () => {
         const rect = canvas.getBoundingClientRect();
         const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
         width = rect.width;
         height = rect.height;
         canvas.width = width * dpr;
         canvas.height = height * dpr;
         ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
         const count = Math.round(width * height * density);
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
               d.y += sign * d.speed * dt;
               // Leaving one edge: come back in from the opposite one.
               if (sign < 0 && d.y < -20) Object.assign(d, spawn(height + 20));
               if (sign > 0 && d.y > height + 20) Object.assign(d, spawn(-20));
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
   }, [direction, variant]);

   return <canvas ref={canvasRef} className={`${styles.field} ${styles[variant]}`} aria-hidden="true" />;
}
