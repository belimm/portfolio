# berklimoncu.com

My personal site. The content (profile, projects, experience, skills) comes from a small API in [belimm/coolify-test](https://github.com/belimm/coolify-test) and is edited from `/admin` here, without touching code or redeploying.

- [How it works](#how-it-works)
- [Run it locally](#run-it-locally)
- [Editing content](#editing-content)
- [Languages and theme](#languages-and-theme)
- [Project structure](#project-structure)
- [Deploying on Coolify](#deploying-on-coolify)
- [Troubleshooting](#troubleshooting)

## How it works

There are two apps in two repos:

| App | Tech | Repo | Port |
| --- | --- | --- | --- |
| **Portfolio**: the public site and the `/admin` editor | Next.js 15 | this repo | 3000 |
| **API**: stores the content and contact messages | FastAPI + SQLAlchemy + Alembic | [belimm/coolify-test](https://github.com/belimm/coolify-test), `backend/` | 8000 |

The API uses **Postgres** in production and **SQLite** locally (no setup needed).

```
             Visitor's browser
                    │
                    ▼
┌───────────────────────────────────────┐          ┌──────────────────────────┐
│ Portfolio (Next.js)                   │          │ API (FastAPI)            │
│                                       │          │                          │
│  /                 homepage ──────────┼─ GET ───▶│ /api/public/content      │
│  /api/contact      contact form ──────┼─ POST ──▶│ /api/public/messages     │
│  /admin/*          editor UI          │          │                          │
│  /api/admin/*      proxy ─────────────┼─ Bearer ▶│ /api/admin/*             │
│  /api/revalidate   ◀──────────────────┼── POST ──│ after every admin change │
└───────────────────────────────────────┘          └────────────┬─────────────┘
                                                                ▼
                                                        Postgres / SQLite
```

### The three flows

**1. Someone opens the homepage.**
The page is rendered on the server with content from `GET /api/public/content?lang=en|tr` and then cached (ISR). A cached page is served to everyone and rebuilt in the background at most once every 60 seconds. If the API is unreachable during a build, the page uses the snapshots in `src/lib/fallback-content.en.json` and `fallback-content.tr.json`. If the API goes down while the site is running, the last good page is kept.

**2. You edit something in `/admin`.**
1. You sign in at `/admin/login`. The portfolio forwards the password to the API (`POST /api/auth/login`), receives a signed token, and stores it in an **httpOnly cookie**, which JavaScript on the page can't read.
2. Every admin action calls the portfolio's own `/api/admin/*` route. That route reads the cookie and forwards the request to the API as `Authorization: Bearer <token>`. The browser never talks to the API directly, so the API needs no CORS setup for the admin.
3. The API checks the token, saves the change, then calls the portfolio's `/api/revalidate` with a shared secret (`PORTFOLIO_SECRET`). The homepage drops its cache, so the change is live within a second.

`src/middleware.ts` redirects signed-out visitors from `/admin/*` to the login page. The real security check is the API's token validation, which runs on every request.

**3. A visitor sends the contact form.**
The form posts to the portfolio's `/api/contact`, which forwards it to the API together with the visitor's IP for rate limiting (5 messages per 10 minutes per IP). The message lands in the **Messages** inbox in `/admin`. If EmailJS keys are configured, an email is sent too.

## Run it locally

You need **Node 20+** and **Python 3.12+**. Clone both repos side by side and use two terminals.

### Terminal 1: the API (with a virtual environment)

```bash
cd ../coolify-test/backend
python3 -m venv .venv            # once
source .venv/bin/activate        # every new terminal
pip install -r requirements.txt  # once, and again when requirements change
cp .env.example .env             # once; the defaults work as-is
alembic upgrade head             # creates or updates the database tables
uvicorn app.main:app --reload --port 8000
```

On the first start the API fills the empty database with the content from my CV (`app/seed.py`).

Check that it runs:

- http://localhost:8000/health should return `{"status":"ok","database":"up",...}`
- http://localhost:8000/docs has interactive API docs (Swagger)

Leave the virtual environment with `deactivate`.

### Terminal 2: the portfolio

```bash
npm install                  # once
cp .env.example .env.local   # once
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin (password `dev-password`, set by `ADMIN_PASSWORD` in the API's `backend/.env`)

`PORTFOLIO_SECRET` must be the same in the API's `backend/.env` and this repo's `.env.local`, or edits won't refresh the homepage right away. They'll still appear within 60 seconds.

### Against the deployed API

To test the local portfolio with the real data on Coolify, point `.env.local` at the deployed API and restart `npm run dev`:

```
API_URL=https://<your api domain>
PORTFOLIO_SECRET=<the PORTFOLIO_SECRET set on the API in Coolify>
```

The deployed API can't reach your laptop, so leave its `PORTFOLIO_REVALIDATE_URL` empty for this. Edits then show up after at most 60 seconds instead of instantly.

### API in Docker

The API repo has a `docker-compose.yml` that runs the API with Postgres: `cd ../coolify-test && docker compose up --build`.

## Editing content

In `/admin`:

| Page | What it controls |
| --- | --- |
| **Profile** | Name, role, headline, about text, links, CV file, availability note |
| **Projects** | The *Work* list: order (↑ ↓), visibility, image, tags, link |
| **Experience** | Jobs and education (education gets its own heading on the site) |
| **Skills** | Skill groups and their items |
| **Messages** | Contact form inbox. Unread messages show a count in the sidebar |

To highlight words in the headline, wrap them in double equals signs: `I build ==software that has to work==.`

Every editor has a **Türkçe** section below the English fields. Fill in what you want translated; anything left empty shows the English text on `/tr`.

Uploaded images and PDFs are stored by the API (`/app/uploads` on the server).

## Languages and theme

**Languages.** English is the default at `/`; Turkish lives at `/tr`. The EN / TR switch in the header links between them.

- Interface text (navigation, buttons, form labels, CV viewer) comes from `src/lib/i18n.ts`.
- Content comes from the API. Translatable fields store their Turkish version in a `translations` JSON column (`{"tr": {"intro": "..."}}`), and `GET /api/public/content?lang=tr` returns each field in Turkish when it has a value, otherwise in English.
- Translatable fields: profile role, location, headline, about and availability note; project subtitle and description; experience title, location, dates, summary and highlights; skill group names.

To add a language: add it to `LOCALES` and the dictionaries in `src/lib/i18n.ts`, add a page like `src/app/tr/page.tsx`, add it to `Language` and `TRANSLATION_LANGUAGES` in the API's `backend/app/schemas.py`, and add a fallback snapshot.

**Theme.** Dark by default, whatever the visitor's system setting. The sun/moon button switches to light, and the choice is stored in `localStorage`. A tiny script in `<head>` (`src/lib/theme.ts`) applies the saved choice before the first paint, so there's no flash. Colours are CSS variables in `src/app/globals.css`: `:root` is light and `:root[data-theme='dark']` is dark.

## Project structure

```
.
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                English homepage (ISR)
│  │  ├─ tr/page.tsx             Turkish homepage (ISR)
│  │  ├─ admin/                  login + editor pages
│  │  └─ api/                    contact, revalidate, admin proxy/login/logout
│  ├─ components/
│  │  ├─ site/                   homepage sections, header, background digits
│  │  ├─ admin/                  editor UI (generic collection editor, fields, inbox)
│  │  ├─ CvViewer/               PDF viewer (react-pdf) with a custom frame
│  │  └─ DeveloperTerminal/      terminal that logs what visitors click
│  ├─ lib/
│  │  ├─ content.ts              types + fetching content from the API
│  │  ├─ i18n.ts                 languages + interface text (EN/TR)
│  │  ├─ theme.ts                dark/light defaults and the no-flash boot script
│  │  ├─ fallback-content.*.json used when the API isn't reachable at build time
│  │  └─ server.ts               server-only helpers (API URL, cookie name, origin check)
│  └─ middleware.ts              /admin redirect for signed-out visitors
└─ Dockerfile                    standalone Next.js image for Coolify
```

The API's structure, migrations and tests are documented in its own README and `backend/CLAUDE.md`.

## Deploying on Coolify

Deploy the API first; its README has the steps ([belimm/coolify-test](https://github.com/belimm/coolify-test)). Then add the portfolio to the same Coolify project:

**Portfolio**: Application from this repo, build pack **Dockerfile**, base directory **`/`**, port **3000**.

| Variable | Value |
| --- | --- |
| `API_URL` | the API's internal URL (`http://<api service name>:8000`) or its public URL |
| `PORTFOLIO_SECRET` | same value as on the API |
| `NEXT_PUBLIC_EMAILJS_*` | optional build args for email notifications |

`API_URL` and `PORTFOLIO_SECRET` are read at runtime, so changing them needs only a restart. After the portfolio has a domain, set `PORTFOLIO_REVALIDATE_URL=https://<portfolio domain>/api/revalidate` on the API and add the domain to its `CORS_ORIGINS`.

To host the portfolio on Vercel instead, set the same two variables there.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Homepage shows old content | Check that `PORTFOLIO_SECRET` matches on both sides and that `PORTFOLIO_REVALIDATE_URL` points to the portfolio. Without it, changes still appear within 60s. |
| `Using bundled content` in the dev server log | The API isn't running or `API_URL` in `.env.local` is wrong. |
| Admin login says "Wrong password" | The password is the API's `ADMIN_PASSWORD` (`backend/.env` locally, env vars on Coolify). Restart the API after changing it. |
| Admin login says "Too many attempts" | 10 failed logins in 15 minutes from one IP. Wait, or restart the API. |
| `no such table` errors | Run `alembic upgrade head` in the API's `backend/` with the venv activated. |
| `ModuleNotFoundError` when starting uvicorn | The venv isn't active: `source .venv/bin/activate` in the API's `backend/`. |
