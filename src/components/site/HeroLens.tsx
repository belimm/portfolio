'use client';

import { useEffect, useRef } from 'react';
import styles from './HeroLens.module.css';

const RADIUS = 72; // px, half of the lens size in HeroLens.module.css
const ZOOM = 1.45;
const FOLLOW = 18; // higher = the lens sticks closer to the cursor

/**
 * A magnifying glass that follows the cursor over the hero (mouse only). It shows a copy of the hero content
 * scaled up, so text really is magnified, plus the drifting 0s and 1s from the background canvas. The copy is
 * inert and hidden from assistive tech. It steps aside over links and buttons so their own hover effects
 * stay visible.
 */
export default function HeroLens() {
   const lensRef = useRef<HTMLDivElement>(null);
   const stageRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const lens = lensRef.current;
      const stage = stageRef.current;
      const hero = lens?.parentElement;
      const source = hero?.querySelector<HTMLElement>('[data-lens-source]');
      if (!lens || !stage || !hero || !source) return;

      const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (!finePointer.matches || reducedMotion.matches) return;

      const digitsSource = hero.querySelector<HTMLCanvasElement>('canvas');
      let digits: HTMLCanvasElement | null = null;
      let digitsCtx: CanvasRenderingContext2D | null = null;
      let active = false;
      let frame = 0;
      let last = 0;
      let client = { x: 0, y: 0 };
      let pos: { x: number; y: number } | null = null;

      // A fresh copy each time the pointer enters, so the terminal and any reflow are current.
      const copy = () => {
         const clone = source.cloneNode(true) as HTMLElement;
         clone.removeAttribute('data-lens-source');
         clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
         clone.setAttribute('inert', '');
         stage.style.width = `${source.offsetWidth}px`;
         stage.replaceChildren();

         // The background digits: a canvas the size of the hero, laid under the copy, with the same fade-out
         // mask as the real one so the lens only shows digits where they are visible.
         digits = null;
         digitsCtx = null;
         if (digitsSource) {
            const heroRect = hero.getBoundingClientRect();
            const sourceRect = source.getBoundingClientRect();
            digits = document.createElement('canvas');
            digits.className = styles.digits;
            digits.width = digitsSource.width;
            digits.height = digitsSource.height;
            Object.assign(digits.style, {
               left: `${heroRect.left - sourceRect.left}px`,
               top: `${heroRect.top - sourceRect.top}px`,
               width: `${heroRect.width}px`,
               height: `${heroRect.height}px`,
            });
            const mask = getComputedStyle(digitsSource).maskImage;
            if (mask && mask !== 'none') digits.style.maskImage = digits.style.webkitMaskImage = mask;
            digitsCtx = digits.getContext('2d');
            stage.append(digits);
         }
         stage.append(clone);
      };

      const tick = (now: number) => {
         const dt = Math.min(0.05, (now - last) / 1000);
         last = now;
         const heroRect = hero.getBoundingClientRect();
         const sourceRect = source.getBoundingClientRect();
         const target = { x: client.x - heroRect.left, y: client.y - heroRect.top };
         const k = 1 - Math.exp(-FOLLOW * dt);
         pos = pos ? { x: pos.x + (target.x - pos.x) * k, y: pos.y + (target.y - pos.y) * k } : target;

         lens.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

         // Only the patch of digits under the lens is copied, fresh every frame so they keep drifting.
         if (digits && digitsCtx && digitsSource) {
            const k = digitsSource.width / heroRect.width;
            const half = (RADIUS / ZOOM + 8) * k;
            const sx = Math.max(0, pos.x * k - half);
            const sy = Math.max(0, pos.y * k - half);
            const sw = Math.min(digits.width - sx, half * 2);
            const sh = Math.min(digits.height - sy, half * 2);
            digitsCtx.clearRect(0, 0, digits.width, digits.height);
            if (sw > 0 && sh > 0) digitsCtx.drawImage(digitsSource, sx, sy, sw, sh, sx, sy, sw, sh);
         }
         // Put the point of the copy under the lens centre, magnified around it.
         const px = pos.x + heroRect.left - sourceRect.left;
         const py = pos.y + heroRect.top - sourceRect.top;
         stage.style.transform = `translate(${RADIUS - px * ZOOM}px, ${RADIUS - py * ZOOM}px) scale(${ZOOM})`;

         if (active || Math.hypot(target.x - pos.x, target.y - pos.y) > 0.5) frame = requestAnimationFrame(tick);
      };

      const onMove = (e: PointerEvent) => {
         if (e.pointerType === 'touch') return;
         client = { x: e.clientX, y: e.clientY };
         if (!active) {
            active = true;
            pos = null;
            copy();
            last = performance.now();
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(tick);
         }
         const overControl = e.target instanceof Element && e.target.closest('a, button, [role="button"]') !== null;
         lens.classList.toggle(styles.on, !overControl);
      };

      const onLeave = () => {
         active = false;
         lens.classList.remove(styles.on);
      };

      hero.addEventListener('pointermove', onMove, { passive: true });
      hero.addEventListener('pointerleave', onLeave);
      return () => {
         cancelAnimationFrame(frame);
         hero.removeEventListener('pointermove', onMove);
         hero.removeEventListener('pointerleave', onLeave);
      };
   }, []);

   return (
      <div ref={lensRef} className={styles.lens} aria-hidden="true">
         <div className={styles.glass}>
            <div ref={stageRef} className={styles.stage} />
         </div>
      </div>
   );
}
