# Task Manager (To-Do App)

A lightweight, mobile-friendly task manager built with React (Vite) and Supabase. The app provides user authentication, personal task CRUD (create/read/update/delete), and a responsive UI designed for both desktop and mobile.

## Problem statement

Many simple task managers mix personal and shared data, lack easy setup, or require running a full backend. This project provides a minimal, secure, and easy-to-run personal task manager that uses Supabase for authentication and data storage so you can get a private, realtime-capable app running in minutes.

## Tech stack

- Frontend: React + Vite (TypeScript)
- Styling: Tailwind CSS
- Components: shadcn/ui-inspired components and Radix primitives (in `src/components/ui`)
- Backend / Database: Supabase (Postgres) — Auth + Realtime + Storage if needed
- Optional server (experimental): Node.js + Express (server/)

## Features

- Email/password authentication (Supabase)
- Per-user task CRUD (title, description, completed, timestamps)
- Responsive UI and mobile-first layout
# Task Manager (To-Do App)

A lightweight, mobile-friendly task manager built with React (Vite) and Supabase. The app provides user authentication, personal task CRUD (create/read/update/delete), and a responsive UI designed for both desktop and mobile.

## Problem statement

Many simple task managers mix personal and shared data, lack easy setup, or require running a full backend. This project provides a minimal, secure, and easy-to-run personal task manager that uses Supabase for authentication and data storage so you can get a private, realtime-capable app running in minutes.

## Tech stack

- Frontend: React + Vite (TypeScript)
- Styling: Tailwind CSS
- Components: shadcn/ui-inspired components and Radix primitives (in `src/components/ui`)
- Backend / Database: Supabase (Postgres) — Auth + Realtime + Storage if needed
- Optional server (experimental): Node.js + Express (server/)

## Features

- Email/password authentication (Supabase)
- Per-user task CRUD (title, description, completed, timestamps)
- Responsive UI and mobile-first layout
- Realtime updates (can be enabled using Supabase Realtime)

## Deployment

- Live demo (Netlify): http://listhack.netlify.app

If you want me to deploy or update the Netlify site, tell me which branch to connect or whether to create a new deploy.

## Screenshots

<img width="1574" height="774" alt="Screenshot 2025-10-16 152702" src="https://github.com/user-attachments/assets/4d341876-448e-483f-a9ad-cf34db1b9665" />
<img width="1722" height="832" alt="Screenshot 2025-10-16 152718" src="https://github.com/user-attachments/assets/9248b6b1-61cc-4b3e-99fe-d7ad506fe250" />

## Getting started — quick setup

1. Create a Supabase project at https://app.supabase.com and note the Project URL and Project API keys.

2. From the project root copy the example env and fill in your values:

```powershell
cp .env.example .env
# or on Windows PowerShell
Copy-Item .env.example .env
```

Open `.env` and set:

- VITE_SUPABASE_URL — your Supabase project URL
- VITE_SUPABASE_PUBLISHABLE_KEY — your Supabase anon/public key

Important: Do NOT expose your Supabase service role key in the frontend. Keep it secret.

3. Install dependencies:

```powershell
npm install
```

4. Run the dev server:

```powershell
npm run dev
```

5. Open the app in your browser at http://localhost:5173

## Optional: local Express API (experimental)

An experimental Express server was added under `server/` to demonstrate how you could proxy requests server-side using a Supabase service role key. This server is optional—if you want to keep Supabase as the direct backend (recommended), you can ignore or remove `server/`.

If you want to try the server locally:

1. Add the service role key and URL to your `.env`:

- SUPABASE_URL — same as `VITE_SUPABASE_URL`
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (keep secret)

2. Start the server (it listens on port 4000 by default):

```powershell
npm run server:dev
```

Server endpoints:

- GET /tasks — lists tasks for the authenticated user (JWT required)
- POST /tasks — create a task
- PUT /tasks/:id — update a task
- DELETE /tasks/:id — delete a task

The server expects the frontend to forward the user's Supabase JWT in the `Authorization: Bearer <token>` header.

## Database schema (tasks)

Create a `tasks` table in Supabase with these columns (SQL/Postgres types):

- id: uuid PRIMARY KEY DEFAULT gen_random_uuid()
- user_id: uuid REFERENCES profiles(id)
- title: text NOT NULL
- description: text
- completed: boolean DEFAULT false
- created_at: timestamptz DEFAULT now()
- updated_at: timestamptz

You can find a sample migration in `supabase/migrations/` included in this repository.

## Environment variables

- VITE_SUPABASE_URL — public Supabase project URL (used by Vite frontend)
- VITE_SUPABASE_PUBLISHABLE_KEY — anon/public key (used by @supabase/supabase-js in the browser)
- SUPABASE_URL — (optional) same as above, used by the experimental server
- SUPABASE_SERVICE_ROLE_KEY — (optional) server-only service role key; never commit this to git

Use `.env.example` as a template. Add `.env` to `.gitignore` to avoid committing secrets.

## Security notes

- Never store or expose the Supabase service role key in frontend code or version control. If you accidentally commit secrets, rotate the keys immediately in the Supabase dashboard.
- Keep `.env` in `.gitignore`.

## Development tips

- To enable realtime task updates, wire Supabase Realtime or use the `on` listeners from `@supabase/supabase-js` in `src/pages/Index.tsx`.
- For production builds, run `npm run build` then `npm run preview` to verify the build locally before deploying.

## What changed during this session

- UI/UX improvements to the auth and dashboard pages (light theme, mobile responsiveness)
- Added `.env.example` and this updated `README.md`
- An optional experimental Express server was created under `server/` (can be removed if you want Supabase-only)

## Author

- M P Pranav Kumar


