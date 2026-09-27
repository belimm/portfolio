import { ReadableStream as ReadableStreamPolyfill } from 'web-streams-polyfill';

/**
 * PDF.js (even its "legacy" build) calls APIs that only arrived in 2024-era browsers:
 * Promise.withResolvers (Safari 17.4, Chrome 119), URL.parse (Safari 18, Chrome 126), …
 * These small versions are installed only when missing: on the page before react-pdf loads,
 * and at the top of our PDF.js worker (see pdf.worker.ts), which has its own globals.
 */

type AnyFunction = (...args: never[]) => unknown;

// Older Safari releases expose a partial Streams API in workers: a stream exists but lacks
// getReader(). PDF.js uses that method for the document data channel, so supply the complete
// implementation only where it is missing. This file runs in both the page and PDF worker.
if (
   typeof globalThis.ReadableStream !== 'function' ||
   typeof globalThis.ReadableStream.prototype.getReader !== 'function'
) {
   Object.defineProperty(globalThis, 'ReadableStream', {
      value: ReadableStreamPolyfill,
      writable: true,
      configurable: true,
   });
}

function define(target: object, name: string, value: AnyFunction) {
   if (!(name in target)) {
      Object.defineProperty(target, name, { value, writable: true, configurable: true });
   }
}

define(Promise, 'withResolvers', function <T>(this: PromiseConstructor) {
   let resolve!: (value: T | PromiseLike<T>) => void;
   let reject!: (reason?: unknown) => void;
   const promise = new this<T>((res, rej) => {
      resolve = res;
      reject = rej;
   });
   return { promise, resolve, reject };
});

define(Promise, 'try', function (this: PromiseConstructor, fn: (...args: unknown[]) => unknown, ...args: unknown[]) {
   return new this((resolve) => resolve(fn(...args)));
});

define(URL, 'canParse', (url: string, base?: string) => {
   try {
      new URL(url, base);
      return true;
   } catch {
      return false;
   }
});

define(URL, 'parse', (url: string, base?: string) => {
   try {
      return new URL(url, base);
   } catch {
      return null;
   }
});

if (typeof AbortSignal !== 'undefined') {
   define(AbortSignal, 'any', (signals: AbortSignal[]) => {
      const controller = new AbortController();
      for (const signal of signals) {
         if (signal.aborted) {
            controller.abort(signal.reason);
            break;
         }
         signal.addEventListener('abort', () => controller.abort(signal.reason), { once: true });
      }
      return controller.signal;
   });
}

define(Array.prototype, 'findLast', function (this: unknown[], test: (v: unknown, i: number, a: unknown[]) => unknown) {
   for (let i = this.length - 1; i >= 0; i--) if (test(this[i], i, this)) return this[i];
   return undefined;
});

define(Array.prototype, 'findLastIndex', function (this: unknown[], test: (v: unknown, i: number, a: unknown[]) => unknown) {
   for (let i = this.length - 1; i >= 0; i--) if (test(this[i], i, this)) return i;
   return -1;
});

for (const Collection of [Map, WeakMap]) {
   define(Collection.prototype, 'getOrInsert', function (this: Map<unknown, unknown>, key: unknown, value: unknown) {
      if (!this.has(key)) this.set(key, value);
      return this.get(key);
   });
   define(
      Collection.prototype,
      'getOrInsertComputed',
      function (this: Map<unknown, unknown>, key: unknown, compute: (key: unknown) => unknown) {
         if (!this.has(key)) this.set(key, compute(key));
         return this.get(key);
      }
   );
}

export {};
