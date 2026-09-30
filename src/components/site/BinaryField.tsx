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
   /** Displacement from the drifting position, sprung back to zero. */
   ox: number;
   oy: number;
   vx: number;
   vy: number;
   /** 0..1 glow left behind by the cursor or a ripple; fades out on its own. */
   heat: number;
   coolUntil: number;
};

type Ripple = { x: number; y: number; born: number };

// Pointer reaction
const RADIUS = 130; // px around the cursor that react
const PUSH = 520; // spring acceleration at the cursor's centre (px/s²)
const WAKE = 0.05; // how much of the cursor's own speed rubs off on nearby digits
const SPRING = 14;
const DAMPING = 6; // just under critical, so digits settle with a small overshoot
const HEAT_DECAY = 1.7; // per second: the trail lasts about half a second
const MAX_ALPHA = 0.55;

// Tap / click ripple
const RIPPLE_SPEED = 440; // px/s
const RIPPLE_LIFE = 0.85; // s
const RIPPLE_BAND = 46; // px: thickness of the wavefront that pushes digits
const RIPPLE_PUSH = 1500;
const MAX_RIPPLES = 3;

// Scroll: far (small) digits lag behind the page a little more than near ones.
const MAX_SCROLL_STEP = 60;

// Anything that carries content. The field stays quiet over these so it never competes with reading or clicking.
const CONTENT =
   'a, button, input, textarea, select, label, summary, p, h1, h2, h3, h4, li, pre, img, figure, aside, form, header, footer, nav, dl';

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

/**
 * Slowly drifting 0s and 1s behind a section. Sparse and faint on purpose.
 *
 * Mouse: digits near the cursor are pushed aside, glow lemon and flip, leaving a short trail.
 * Touch (no hover): a tap sends a ripple through the field, and scrolling gives it a little parallax.
 */
export default function BinaryField({ direction = 'up', variant = 'hero' }: BinaryFieldProps) {
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let digits: Digit[] = [];
      let ripples: Ripple[] = [];
      let width = 0;
      let height = 0;
      let inkColor = '';
      let lemonColor = '';
      let hotColor = '';
      const pointer = { x: -1e4, y: -1e4, vx: 0, vy: 0 };
      let lastMove = 0;
      // 0..1, eased: drops to 0 while the pointer is over content or has left the page.
      let strength = 0;
      let strengthTarget = 0;
      let scrollY = window.scrollY;
      let scrollPending = 0;
      let frame = 0;
      let last = performance.now();
      let visible = true;

      const readColors = () => {
         const css = getComputedStyle(document.documentElement);
         inkColor = css.getPropertyValue('--muted').trim() || '#787266';
         lemonColor = css.getPropertyValue('--lemon').trim() || '#f1d94f';
         hotColor = css.getPropertyValue('--lemon-text').trim() || '#6a5800';
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
         ox: 0,
         oy: 0,
         vx: 0,
         vy: 0,
         heat: 0,
         coolUntil: 0,
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

      const flip = (d: Digit, now: number) => {
         d.char = d.char === '0' ? '1' : '0';
         d.flipAt = now + 2000 + Math.random() * 6000;
      };

      const draw = (now: number) => {
         const dt = Math.min(0.05, (now - last) / 1000);
         last = now;
         ctx.clearRect(0, 0, width, height);
         ctx.textAlign = 'center';
         ctx.textBaseline = 'middle';

         // The wake only matters while the pointer is moving.
         if (now - lastMove > 80) pointer.vx = pointer.vy = 0;
         strength += (strengthTarget - strength) * Math.min(1, dt * 9);
         const pointerOn = !reducedMotion && strength > 0.01;

         const scrollStep = Math.max(-MAX_SCROLL_STEP, Math.min(MAX_SCROLL_STEP, scrollPending));
         scrollPending = 0;

         ripples = ripples.filter((r) => (now - r.born) / 1000 < RIPPLE_LIFE);

         for (const d of digits) {
            if (!reducedMotion) {
               d.y += sign * d.speed * dt + scrollStep * (0.12 + ((16 - d.size) / 5) * 0.2);
               // Leaving an edge: come back in from the opposite one.
               if (d.y < -20) Object.assign(d, spawn(height + 20));
               else if (d.y > height + 20) Object.assign(d, spawn(-20));
               if (now > d.flipAt) flip(d, now);

               let ax = -SPRING * d.ox - DAMPING * d.vx;
               let ay = -SPRING * d.oy - DAMPING * d.vy;

               if (pointerOn) {
                  const dx = d.x + d.ox - pointer.x;
                  const dy = d.y + d.oy - pointer.y;
                  const dist = Math.hypot(dx, dy);
                  if (dist < RADIUS) {
                     const near = 1 - dist / RADIUS;
                     const push = (near * near * PUSH * strength) / (dist || 1);
                     ax += dx * push;
                     ay += dy * push;
                     d.vx += pointer.vx * WAKE * near * strength * dt * 10;
                     d.vy += pointer.vy * WAKE * near * strength * dt * 10;
                     d.heat = Math.max(d.heat, near * strength);
                     if (near > 0.55 && now > d.coolUntil) {
                        flip(d, now);
                        d.coolUntil = now + 450;
                     }
                  }
               }

               for (const r of ripples) {
                  const age = (now - r.born) / 1000;
                  const dx = d.x + d.ox - r.x;
                  const dy = d.y + d.oy - r.y;
                  const dist = Math.hypot(dx, dy);
                  const band = 1 - Math.abs(dist - age * RIPPLE_SPEED) / RIPPLE_BAND;
                  if (band > 0) {
                     const fade = 1 - age / RIPPLE_LIFE;
                     const push = (band * fade * RIPPLE_PUSH) / (dist || 1);
                     ax += dx * push;
                     ay += dy * push;
                     d.heat = Math.max(d.heat, band * fade);
                     if (band > 0.6 && now > d.coolUntil) {
                        flip(d, now);
                        d.coolUntil = now + 450;
                     }
                  }
               }

               d.vx += ax * dt;
               d.vy += ay * dt;
               d.ox += d.vx * dt;
               d.oy += d.vy * dt;
               d.heat = Math.max(0, d.heat - HEAT_DECAY * dt);
            }

            ctx.globalAlpha = Math.min(MAX_ALPHA, d.alpha + d.heat * 0.4);
            ctx.fillStyle = d.heat > 0.25 ? hotColor : d.lemon ? lemonColor : inkColor;
            ctx.font = `${d.size * (1 + d.heat * 0.22)}px ui-monospace, Menlo, monospace`;
            ctx.fillText(d.char, d.x + d.ox, d.y + d.oy);
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

      const overContent = (e: PointerEvent) => e.target instanceof Element && e.target.closest(CONTENT) !== null;

      const onPointerMove = (e: PointerEvent) => {
         // Touch has no hover; a finger dragging is a scroll.
         if (e.pointerType === 'touch') return;
         const rect = canvas.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         const now = performance.now();
         const elapsed = Math.max(16, now - lastMove) / 1000;
         // Smoothed so one jumpy event doesn't fling the digits.
         pointer.vx += ((x - pointer.x) / elapsed - pointer.vx) * 0.3;
         pointer.vy += ((y - pointer.y) / elapsed - pointer.vy) * 0.3;
         pointer.x = x;
         pointer.y = y;
         lastMove = now;
         strengthTarget = overContent(e) ? 0 : 1;
      };

      const onPointerDown = (e: PointerEvent) => {
         if (reducedMotion || overContent(e)) return;
         const rect = canvas.getBoundingClientRect();
         const x = e.clientX - rect.left;
         const y = e.clientY - rect.top;
         if (x < -RIPPLE_SPEED || y < -RIPPLE_SPEED || x > width + RIPPLE_SPEED || y > height + RIPPLE_SPEED) return;
         ripples = [...ripples.slice(-(MAX_RIPPLES - 1)), { x, y, born: performance.now() }];
         if (visible) start();
      };

      const onLeave = () => {
         strengthTarget = 0;
      };

      const onScroll = () => {
         scrollPending += window.scrollY - scrollY;
         scrollY = window.scrollY;
      };

      // Re-read the palette when the theme toggle flips <html data-theme>.
      const themeObserver = new MutationObserver(() => {
         readColors();
         if (reducedMotion) draw(performance.now());
      });
      themeObserver.observe(document.documentElement, { attributeFilter: ['data-theme'] });

      document.addEventListener('visibilitychange', onVisibility);
      document.documentElement.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
      if (!reducedMotion) window.addEventListener('scroll', onScroll, { passive: true });

      return () => {
         cancelAnimationFrame(frame);
         resizeObserver.disconnect();
         viewObserver.disconnect();
         themeObserver.disconnect();
         document.removeEventListener('visibilitychange', onVisibility);
         document.documentElement.removeEventListener('pointerleave', onLeave);
         window.removeEventListener('blur', onLeave);
         window.removeEventListener('pointermove', onPointerMove);
         window.removeEventListener('pointerdown', onPointerDown);
         window.removeEventListener('scroll', onScroll);
      };
   }, [direction, variant]);

   return <canvas ref={canvasRef} className={`${styles.field} ${styles[variant]}`} aria-hidden="true" />;
}
