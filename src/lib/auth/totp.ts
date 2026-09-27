import 'server-only';
import { createHmac, randomBytes } from 'crypto';

/** Time-based one-time codes (RFC 6238), compatible with Google Authenticator, 1Password, etc. */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP_SECONDS = 30;
const DIGITS = 6;

function base32Decode(input: string) {
   const clean = input.replace(/[\s=-]/g, '').toUpperCase();
   let bits = '';
   for (const char of clean) {
      const value = ALPHABET.indexOf(char);
      if (value === -1) throw new Error('Invalid base32 secret');
      bits += value.toString(2).padStart(5, '0');
   }
   const bytes = bits.match(/.{8}/g) ?? [];
   return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

function base32Encode(buffer: Buffer) {
   const bits = [...buffer].map((b) => b.toString(2).padStart(8, '0')).join('');
   return (bits.match(/.{1,5}/g) ?? []).map((chunk) => ALPHABET[parseInt(chunk.padEnd(5, '0'), 2)]).join('');
}

function codeAt(key: Buffer, counter: number) {
   const message = Buffer.alloc(8);
   message.writeBigUInt64BE(BigInt(counter));
   const digest = createHmac('sha1', key).update(message).digest();
   const offset = digest[digest.length - 1] & 0x0f;
   const binary = digest.readUInt32BE(offset) & 0x7fffffff;
   return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
}

export function generateTotpSecret() {
   return base32Encode(randomBytes(20));
}

export function totpUri(secret: string, account: string, issuer: string) {
   const label = encodeURIComponent(`${issuer}:${account}`);
   return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${STEP_SECONDS}`;
}

/** Returns the matching time step (for replay protection), or null. Accepts one step of clock drift. */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
   if (!/^\d{6}$/.test(code)) return null;
   const key = base32Decode(secret);
   const current = Math.floor(now / 1000 / STEP_SECONDS);
   for (const step of [current, current - 1, current + 1]) {
      if (codeAt(key, step) === code) return step;
   }
   return null;
}
