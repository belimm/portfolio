#!/usr/bin/env node
/**
 * Creates admin sign-in credentials.
 *
 *   npm run admin:credentials -- --email you@example.com [--password "..."] [--qr totp.png] [--no-totp]
 *
 * Prints the env vars to set (locally in .env.local, in production on Vercel). Only a hash of the
 * password is stored; if no password is given a strong one is generated and printed once.
 * The QR code is for Google Authenticator, 1Password, etc.
 */
import { randomBytes, randomInt, scrypt } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import QRCode from 'qrcode';

const args = process.argv.slice(2);
const arg = (name) => {
   const i = args.indexOf(`--${name}`);
   return i === -1 ? undefined : args[i + 1];
};

const email = arg('email')?.trim().toLowerCase();
if (!email) {
   console.error('Usage: npm run admin:credentials -- --email you@example.com [--password "..."] [--qr totp.png] [--no-totp]');
   process.exit(1);
}

// Same parameters and format as src/lib/auth/password.ts.
const N = 2 ** 15, R = 8, P = 1, KEY_LENGTH = 64;
const hash = (password) =>
   new Promise((resolve, reject) => {
      const salt = randomBytes(16);
      scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (err, key) =>
         err ? reject(err) : resolve(['scrypt', N, R, P, salt.toString('base64url'), key.toString('base64url')].join(':'))
      );
   });

// No look-alike characters (0/O, 1/l/I); no quotes, spaces or $.
const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%^*-_=+';
const generatePassword = (length = 24) => Array.from({ length }, () => CHARSET[randomInt(CHARSET.length)]).join('');

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const base32 = (buf) =>
   ([...buf].map((b) => b.toString(2).padStart(8, '0')).join('').match(/.{1,5}/g) ?? [])
      .map((c) => BASE32[parseInt(c.padEnd(5, '0'), 2)])
      .join('');

const givenPassword = arg('password');
const password = givenPassword ?? generatePassword();
if (password.length < 12) {
   console.error('Use a password of at least 12 characters.');
   process.exit(1);
}

const env = {
   ADMIN_EMAIL: email,
   ADMIN_PASSWORD_HASH: await hash(password),
   SESSION_SECRET: randomBytes(32).toString('base64url'),
};

let otpauth;
if (!args.includes('--no-totp')) {
   env.ADMIN_TOTP_SECRET = base32(randomBytes(20));
   const issuer = 'Portfolio admin';
   otpauth = `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${env.ADMIN_TOTP_SECRET}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
   const qrPath = arg('qr') ?? 'admin-totp.png';
   await writeFile(qrPath, await QRCode.toBuffer(otpauth, { width: 360, margin: 2 }));
   console.log(`Authenticator QR code written to ${qrPath} (delete it after scanning).`);
}

console.log('\n# Environment variables');
for (const [key, value] of Object.entries(env)) console.log(`${key}=${value}`);
if (!givenPassword) console.log(`\n# Generated password (shown once, save it in your password manager)\n${password}`);
if (otpauth) console.log(`\n# Authenticator setup key (if you can't scan the QR code)\n${env.ADMIN_TOTP_SECRET}`);
