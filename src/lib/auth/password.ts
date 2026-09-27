import 'server-only';
import { randomBytes, scrypt, timingSafeEqual } from 'crypto';

/**
 * scrypt password hashes, stored as `scrypt:N:r:p:salt:hash` (base64url).
 * No `$` in the format: Next's .env loader would try to expand it as a variable.
 */
const N = 2 ** 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEM = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, n: number, r: number, p: number) {
   return new Promise<Buffer>((resolve, reject) =>
      scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N: n, r, p, maxmem: MAX_MEM }, (err, key) =>
         err ? reject(err) : resolve(key)
      )
   );
}

export async function hashPassword(password: string) {
   const salt = randomBytes(16);
   const key = await derive(password, salt, N, R, P);
   return ['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join(':');
}

export async function verifyPassword(password: string, stored: string) {
   const [scheme, n, r, p, salt, hash] = stored.split(':');
   if (scheme !== 'scrypt' || !salt || !hash) return false;
   const expected = Buffer.from(hash, 'base64url');
   const actual = await derive(password, Buffer.from(salt, 'base64url'), Number(n), Number(r), Number(p));
   return actual.length === expected.length && timingSafeEqual(actual, expected);
}
