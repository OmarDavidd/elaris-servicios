# AGENTS.md

## Stack
- Single-package Vite 8 + React 19 + TypeScript ~6 + Tailwind CSS 4 app
- Package manager: **npm** (not pnpm)
- Router: React Router DOM v7 (`BrowserRouter` in `src/App.tsx`)
- Backend: Supabase (shared DB with separate "Elaris" Astro project)

## Commands
- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — `tsc -b && vite build` (TypeScript project references: `tsconfig.app.json` + `tsconfig.node.json`)
- `npm run lint` — ESLint (config in `package.json`, no separate eslint config file)

No test framework is configured.

## Env
Requires `.env` with:
```
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_ANON_KEY=<key>
```
Copy `.env.example` to `.env` to start.

## Conventions
- Entry: `src/main.tsx` → `src/App.tsx` (React Router v7 routes)
- Primary color: `#1D7B43` (green), hover `#155f32` — see `src/lib/colors.ts`
- Changing ficha status triggers Supabase Function `resend-email` automatically
- React 19 + TypeScript ~6 — uses `react-dom/client` `createRoot`, not legacy `ReactDOM.render`
