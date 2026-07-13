---
name: deploy
description: Build and deploy this app to Firebase. Deploys hosting by default; pass "functions" to also deploy Cloud Functions. User-triggered only.
disable-model-invocation: true
---

# Deploy to Firebase

Deploy target(s): `$ARGUMENTS` (empty = hosting only; `functions` = also deploy Cloud Functions; `all` = both).

## Pre-deploy checks (do these first, stop if any fail)

1. Confirm the working tree is clean or the user is aware of uncommitted changes: `git status --short`.
2. Confirm current branch — warn if not on the intended branch.
3. Typecheck: `npx tsc --noEmit`. If it errors, report and stop — do not deploy broken code.
4. Verify Firebase target: `cat .firebaserc` (expected project `studio-407109`). Confirm the user is authenticated (`firebase projects:list` succeeds).

## Deploy

- **Hosting** (default): `npm run deploy` (runs `vite build && firebase deploy --only hosting`).
- **Functions** (only if requested): `cd functions && npm run deploy`.
- **all**: hosting first, then functions.

## After

Report the deploy output including the hosting URL. If anything failed, surface the error and do not claim success.
