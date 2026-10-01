# berklimoncu.com

My personal site, with a built-in admin at `/admin` for editing the content (profile, projects, experience, skills, CVs) in English and Turkish, without touching code or redeploying. It's one Next.js app: no separate backend and no database server.

- [How it works](#how-it-works)
- [Run it locally](#run-it-locally)
- [Admin sign-in and security](#admin-sign-in-and-security)
- [Editing content](#editing-content)
- [Contact form notifications](#contact-form-notifications)
- [Languages and theme](#languages-and-theme)
- [Deploying on Vercel](#deploying-on-vercel)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## How it works

```
Browser ──▶ Next.js (Vercel)
             ├─ /, /tr                 pages, cached (ISR) and refreshed on every admin save
             ├─ /cv/en.pdf, /cv/tr.pdf the live CV for each language
             ├─ /files/uploads/...     uploaded images and PDFs
             ├─ /api/contact           contact form  ──▶ messages/<time>.json
             └─ /admin, /api/admin/*   editor (signed session)
                                              │
                                              ▼
                               Vercel Blob (or .data/ locally)
                               ├─ content/<time>.json   one snapshot per save; newest is live
                               ├─ uploads/images, uploads/cv
                               └─ messages/
```

- **Content is JSON.** Every save writes a new snapshot file instead of overwriting one. The newest is live, and the last 40 are the history you can restore from `/admin/history`. Everything is validated with zod before it's saved (`src/lib/cms/schema.ts`).
- **Until the first save**, the site shows `src/lib/cms/seed.json`.
- **Files are served through the app** (`/files/...`, `/cv/...`), so URLs stay on your domain and the Blob store can be private.
- **Storage is switchable.** With `BLOB_READ_WRITE_TOKEN` set, everything goes to Vercel Blob. Without it, everything goes to the git-ignored `.data/` folder, so local development needs no account.

## Run it locally

```bash
npm install
cp .env.example .env.local
npm run admin:credentials -- --email you@example.com --qr admin-totp.png
```

The last command prints `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` and `ADMIN_TOTP_SECRET`, plus a generated password (shown once). Paste the variables into `.env.local`, save the password in your password manager, scan `admin-totp.png` with an authenticator app (Google Authenticator, 1Password, …), then delete the PNG.

```bash
npm run dev
```

- Site: http://localhost:3000 (English), http://localhost:3000/tr (Turkish)
- Admin: http://localhost:3000/admin

Content, uploads and messages are written to `.data/`. Delete that folder to start over from the seed.

## Admin sign-in and security

| Layer | What it does |
| --- | --- |
| Email + password | Only a scrypt hash of the password is stored (`ADMIN_PASSWORD_HASH`). |
| Two-step codes | With `ADMIN_TOTP_SECRET` set, a 6-digit authenticator code is required too. Each code works once. |
| Session | HS256-signed JWT in an `httpOnly`, `SameSite=Strict` cookie (`__Host-` prefixed in production), valid for 8 hours. Checked in middleware **and** in every admin route. |
| Rate limits | Sign-in: 10 attempts per IP per 15 minutes, and a lock after 20 failed attempts per hour from anywhere. Contact form: 5 messages per IP per 10 minutes. |
| Requests | Admin writes must come from the site's own origin. Uploads are limited to 4 MB, and a file's first bytes must match its type (a renamed file won't pass as a PDF). Links must be `https://` or site paths. |
| Headers | `noindex`, `no-store` and `X-Frame-Options: DENY` on the admin; `nosniff`, a referrer policy and a permissions policy site-wide. |

**Rate limits on Vercel need Upstash Redis.** Serverless instances don't share memory, so without Redis each instance counts on its own. Add Upstash Redis from the Vercel Marketplace (the free plan is plenty); it sets the environment variables automatically. Locally, the in-memory counters are fine.

**To change the password or re-issue the codes**, run `npm run admin:credentials` again and replace the variables. A new `SESSION_SECRET` signs everyone out.

## Editing content

| Page | What it controls |
| --- | --- |
| **Profile** | Name, role, headline, about text, links, availability note |
| **Projects** | The *Work* list: order (↑ ↓), visibility, image, tags, link |
| **Experience** | Jobs and education (education gets its own heading) |
| **Skills** | Skill groups and their items |
| **CV** | One CV per language, with every uploaded version kept. "Make live" switches which one `/cv/<lang>.pdf` serves. |
| **Messages** | Contact form inbox. The unread count is per browser. |
| **History** | Every save with a note. Restore any of the last 40. |

- To highlight words in the headline, wrap them in double equals signs: `I build ==software that has to work==.`
- Every editor has a **Türkçe** section. Empty Turkish fields show the English text on `/tr`.
- `/cv/tr.pdf` falls back to the English CV. Until a CV is uploaded, `/cv/en.pdf` serves `public/BerkLimoncu_CV.pdf`.

## Contact form notifications

Every message is saved to the admin inbox (`/admin/messages`). To also hear about it right away, set up one or both server-side channels. They run after the response is sent, and if saving to the inbox ever fails, the notification is sent before answering so the message isn't lost.

**Telegram**
1. In Telegram, open [@BotFather](https://t.me/BotFather), send `/newbot` and follow the steps. Copy the token.
2. Put `TELEGRAM_BOT_TOKEN=<token>` in `.env.local`, open your new bot in Telegram and send it any message.
3. Run `npm run telegram:setup`. It prints your `TELEGRAM_CHAT_ID`. Add it to `.env.local` and run the command again to get a test message.
4. Add both variables to Vercel (Settings → Environment Variables, Production) and redeploy.

To notify a group instead, add the bot to the group, send a message there, and use the group's (negative) chat id.

**Webhook**: set `CONTACT_WEBHOOK_URL` and the site POSTs JSON like this:

```json
{ "type": "contact_message", "name": "Ada", "email": "ada@example.com", "body": "Hello!",
  "createdAt": "2026-10-01T09:30:00.000Z", "savedToInbox": true, "inboxUrl": "https://www.belim.dev/admin/messages" }
```

With `CONTACT_WEBHOOK_SECRET` set, the request carries `X-Signature-256: sha256=<HMAC-SHA256 of the body>` so the receiver can check it came from the site.

**EmailJS** (the old email notification) still works if its `NEXT_PUBLIC_EMAILJS_*` keys are set, but it runs in the visitor's browser and fails silently. If emails stop, check the EmailJS dashboard (the Gmail connection needs reconnecting from time to time, and the free plan has a monthly limit).

## Languages and theme

- **Languages.** English at `/`, Turkish at `/tr`, with an EN / TR switch in the header. Interface text lives in `src/lib/i18n.ts`; content translations are stored per field under `translations.tr`.
- **Theme.** Dark by default, whatever the visitor's system setting. The sun/moon button switches it and the choice is remembered. A tiny script in `<head>` (`src/lib/theme.ts`) applies it before the first paint, so there's no flash.

## Deploying on Vercel

1. **Blob.** In the Vercel project, open **Storage → Create → Blob**, choose **Private** access and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN`. (If you create a public store instead, also set `BLOB_ACCESS=public`.)
2. **Upstash Redis.** Open **Storage → Marketplace → Upstash (Redis)**, create a free database and connect it. This adds the Redis variables used for rate limiting.
3. **Admin variables.** Under **Settings → Environment Variables**, add `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` and `ADMIN_TOTP_SECRET` from `npm run admin:credentials`. Optionally add the `NEXT_PUBLIC_EMAILJS_*` keys.
4. **Redeploy.** Environment changes apply to new deployments.

The first time you save in `/admin` on the live site, the content moves from the bundled seed into Blob. Local `.data/` content is not uploaded; make your edits on the live admin.

The `Dockerfile` builds a standalone image if you ever move to Coolify or another host. There, either set a Blob token or mount a persistent volume at `/app/.data`.

## Project structure

```
src/
├─ app/
│  ├─ page.tsx, tr/page.tsx     homepage in English and Turkish (ISR)
│  ├─ admin/                    login + editor pages
│  ├─ api/admin/                content, cv, upload, messages, history, login, logout
│  ├─ api/contact/              contact form
│  ├─ cv/[file]/                /cv/en.pdf, /cv/tr.pdf
│  └─ files/[...path]/          uploaded files
├─ components/
│  ├─ site/                     homepage sections, header, background digits
│  ├─ admin/                    editors, CV manager, history, inbox, login form
│  └─ CvViewer/                 PDF viewer (react-pdf) with a custom frame
├─ lib/
│  ├─ cms/                      schema (zod), repository (snapshots), storage (Blob / .data), uploads, messages, seed
│  ├─ auth/                     password (scrypt), totp, session (JWT), admin route wrapper
│  ├─ ratelimit.ts              Upstash Redis or in-memory limits
│  ├─ content.ts                cached, localized content for the pages
│  └─ i18n.ts, theme.ts         languages and theme
└─ middleware.ts                verifies the admin session
scripts/admin-credentials.mjs   generates sign-in credentials
```

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| "Admin sign-in is not configured" | `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` or `SESSION_SECRET` is missing. |
| "Wrong email, password or code" | Check your authenticator app's clock is set automatically, and wait for a fresh code (each code works once). |
| "Sign-in is locked…" | 20 failed attempts in the last hour. Wait, or restart `npm run dev` locally (in-memory counters). |
| Saving fails on Vercel with "Blob is not configured" | Connect a Blob store (step 1 above) and redeploy. |
| Uploaded image or CV shows 404 | The store's access mode must match `BLOB_ACCESS` (default `private`). |
