# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Mizhiv" — a photo-proofing + portfolio-builder platform for wedding/event photography studios. React 19 + Vite 7 + TypeScript, backed by Firebase (Firestore/Storage/Auth) and Firebase Cloud Functions (`functions/`), with Google Gemini for AI features. Firebase project: `studio-407109`.

## Commands

- Dev server: `npm run dev`
- Build: `npm run build`
- Typecheck (no test suite exists — use this to catch breakage): `npx tsc --noEmit`
- Deploy hosting: `npm run deploy` (runs `vite build && firebase deploy --only hosting`)
- Deploy functions: `cd functions && npm run deploy`
- Functions emulator: `cd functions && npm run serve`

There are **no tests** and **no formatter** (no Prettier/Biome). Don't assume `npm test` or `prettier` exist.

## Stack rules (differ from defaults — get these wrong and it breaks conventions)

- **Do NOT use Tailwind.** `tailwind.config.js`/`postcss.config.js` are empty stubs. Style with **MUI v7** (`sx` prop) + `@emotion`. Global theme/CSS lives in `src/index.css`.
- **State is Zustand v5**, not Redux/Context. Stores live at `src/features/*/store/*.ts` and `src/shared/hooks/`. (Some older docs mention a Portfolio Builder React Context — the real implementation is a Zustand store; trust the code.)
- **Routing** is `react-router-dom` v7; routes in `src/router.tsx`, protected routes under `/private` via `ProtectedRoute`.
- Codebase is 100% TypeScript (`.ts`/`.tsx`). Do not add `.js`/`.jsx` source files.

## Architecture (enforce for new feature code)

Feature-first layout under `src/features/{auth, photoproofing, portfoliobuilder, studio-management}`. Each feature follows the strict 3-layer pattern from `@ARCHITECTURE.md` — follow it for new code:

- `api/` — raw data access (Firebase calls). No hooks, no React state.
- `hooks/` — logic and state (Zustand stores, `use*` hooks).
- `components/` / `pages/` — UI only; consume hooks.
- Export the feature's public surface via its `index.ts` barrel; keep `types.ts` per feature.

Shared code: `src/core/` (app shell — navbar, footer, global loader), `src/shared/` (reusable components/hooks/utils), `src/config/` (`firebase.ts`, `gemini.ts`).

## Environment

Copy `.env.example` → `.env` (gitignored). All vars are `VITE_`-prefixed (client-exposed, expected for Firebase web): `VITE_FIREBASE_*` (7 keys) and `VITE_GEMINI_API_KEY`. Functions have their own separate `dotenv` env.

## Git etiquette

Always branch off `main` and open a PR — do not commit directly to `main`.

## Gotchas

- `npm run lint` covers `.ts/.tsx` via `typescript-eslint`. `no-explicit-any` is a **warning** (pervasive in Firebase code), not an error. There is a pre-existing backlog of lint errors/warnings — don't try to clear it wholesale; keep your own edits clean. Lint does not typecheck — use `npx tsc --noEmit` for type errors.
- `functions/` is a separate npm package (own `node_modules`, own ESLint 8 + Node 22). Run its commands from inside `functions/`.
- `vite.config.ts` hardcodes a stale ngrok host in `allowedHosts` — a dev artifact, ignore it.
