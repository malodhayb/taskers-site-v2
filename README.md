# Taskers

A Saudi task marketplace: requesters post tasks with a price and an optional map pin, taskers
accept or counter-offer, both sides rate each other, and the platform takes a 30% service fee.
Bilingual UI in Arabic, English, and Urdu, sign-up/log-in built into the home page, an admin
dashboard with account suspension and task deletion, AI-powered task translation, and a Saudi
PDPL-aligned privacy policy.

## What's new in this version
- **Admin can delete any task**, from the Admin dashboard's Tasks tab or from the task page itself.
- **Users can delete their own tasks**, from the task's detail page.
- **AI task translation**: a "Translate" button on each task calls a secure server-side function
  (using Claude) to translate the title/description into the page's current language.
- **Admin can suspend or reinstate any account** (except its own), from the Admin dashboard's
  Users tab. Suspended accounts are blocked at login with a clear message.

---

## Step-by-step: where every file goes

You have **two ways** to run this: (A) instantly, with zero setup, using built-in demo-free
local accounts, or (B) fully "live" with real accounts, translation, and an admin who can
manage real users — which needs Vercel + Supabase. Both use the exact same files.

### Option A — Just see it running right now
1. Open `index.html` by double-clicking it. That's it — the whole app runs, using in-memory
   accounts (nothing persists after you refresh, and the AI translate button and real accounts
   won't work yet, since those need a real server — see Option B).

### Option B — Deploy it for real (Vercel + Supabase)

**1. Create the GitHub repo (or use your existing `taskers_1.0v` repo)**
Put these files at the **root** of the repository — not inside a subfolder:
```
your-repo/
├── index.html
├── bundle.js
├── config.js
├── src-App.jsx
├── supabase-schema.sql   (not deployed — just kept for reference)
├── SECURITY.md           (not deployed — just kept for reference)
├── README.md             (not deployed — just kept for reference)
└── api/
    └── translate.js
```
Upload via GitHub's web UI: go to your repo → **Add file → Upload files** → drag in
`index.html`, `bundle.js`, `config.js`, `src-App.jsx`, `SECURITY.md`, `README.md`,
`supabase-schema.sql` → commit. Then create the `api` folder: click **Add file → Create new
file**, type `api/translate.js` as the filename (typing the slash creates the folder), paste
in the contents of `translate.js`, and commit.

**2. Set up Supabase (for real accounts)**
1. Go to [supabase.com](https://supabase.com) → create a free project.
2. In the left sidebar: **SQL Editor** → **New query** → paste the entire contents of
   `supabase-schema.sql` → **Run**.
3. Go to **Project Settings → API** → copy the **Project URL** and the **anon public** key.
4. Back in your GitHub repo, open `config.js`, click the pencil (edit) icon, and paste your
   URL and key into `SUPABASE_URL` and `SUPABASE_ANON_KEY` → commit directly to `main`.

**3. Deploy to Vercel**
1. Go to [vercel.com/new](https://vercel.com/new) → **Import** your GitHub repo.
2. Framework preset: choose **"Other"** (it's a static site — no build command needed).
3. Click **Deploy**. Vercel automatically detects the `api/translate.js` file and turns it
   into a serverless function at `/api/translate` — no extra configuration needed for that part.

**4. Turn on AI translation**
1. In your Vercel project: **Settings → Environment Variables**.
2. Add a variable named `ANTHROPIC_API_KEY` with your Anthropic API key as the value (get one
   at [console.anthropic.com](https://console.anthropic.com) if you don't have one).
3. **Settings → Deployments** → redeploy (or just push any small change) so the new
   environment variable takes effect.

**5. Become the admin**
Visit your live site and sign up using **m.alodhayb@hotmail.com** — that email is hard-coded
as the admin account in `src-App.jsx` (look for `ADMIN_EMAIL`), so it automatically gets
access to the Admin dashboard, including task deletion and account suspension.

---

## File reference
| File | Purpose | Uploaded to |
|---|---|---|
| `index.html` | Page shell, loads everything else | Repo root |
| `bundle.js` | React + the whole app, pre-compiled | Repo root |
| `config.js` | Your Supabase URL/key go here | Repo root |
| `api/translate.js` | Serverless function powering the Translate button | Repo root, inside an `api` folder |
| `src-App.jsx` | Full readable source, for future edits | Repo root (reference only, not required to run) |
| `supabase-schema.sql` | Run once inside Supabase's SQL editor | Not deployed — paste into Supabase directly |
| `SECURITY.md` | Security review notes | Reference only |

## Known limitations
- Payment methods are selectable in the UI but not wired to a real payment processor — that
  needs a separate merchant integration with a Saudi PSP (mada, STC Pay, etc.).
- The AI translate feature requires the Vercel + `ANTHROPIC_API_KEY` setup above; without it,
  the Translate button shows a friendly "unavailable" message instead of breaking.
- I tested this extensively in a real Chromium browser (all flows pass with zero console
  errors), but don't have access to real Safari/WebKit in my environment — the Safari fixes
  applied are established best practices, not confirmed against the actual engine.
