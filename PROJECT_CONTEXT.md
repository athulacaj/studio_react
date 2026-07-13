# PROJECT_CONTEXT.md — Mizhiv (studio_react)

> Paste-in context for any new task/prompt. This is a distilled map of the codebase as it actually
> exists in code (not aspirational docs). When in doubt, trust the code over the older `*.md` files.

---

## 1. What this is

**Mizhiv** — a photo-proofing + portfolio-builder SaaS for wedding/event photography studios.

Two products in one app:
1. **Photo proofing** — studios sync Google Drive folders of event photos; clients view them via a
   share link, "like"/select favourites, sort them into albums/categories, and download.
2. **Portfolio builder** — studios build a public wedding/event microsite (hero, story, event
   details, gallery) from templates and publish it at a shareable path.

Firebase project: `studio-407109`.

---

## 2. Stack (⚠️ differs from common defaults)

| Concern | Choice | Notes |
|---|---|---|
| Framework | **React 19** + **Vite 7** + **TypeScript** | 100% `.ts`/`.tsx`. Never add `.js`/`.jsx` source. |
| UI / styling | **MUI v7** (`sx` prop) + **@emotion** | **DO NOT use Tailwind.** `tailwind.config.js`/`postcss.config.js` are empty stubs. Global theme in `src/App.tsx`, global CSS in `src/index.css`. |
| State | **Zustand v5** | No Redux. Some legacy React Contexts still exist (auth, photoproofing) but new state → Zustand stores. |
| Routing | **react-router-dom v7** | Routes in `src/router.tsx`. |
| Backend | **Firebase** — Firestore, Storage, Auth, Cloud Functions | Config `src/config/firebase.ts`. |
| Cloud Functions | `functions/` — **separate npm package**, ESLint 8, Node 22, **plain JS (`index.js`)** | Own `node_modules`. Run commands from inside `functions/`. |
| AI | **Google Gemini** (`gemini-2.5-flash`) via `@google/genai` | `src/config/gemini.ts`. Used for portfolio content/design suggestions. |
| Animation | `framer-motion` | |
| Zip/download | `client-zip`, `jszip`, `file-saver` | Client-side bulk photo download. |
| Image viewer | `react-zoom-pan-pinch` | Fullscreen proofing viewer. |

Theme: **dark mode**, primary purple `#9D4EDD` (gradient buttons), `background.default #030912`,
`paper #0F1A2E`, `borderRadius: 16`, fonts Sora/Plus Jakarta Sans/Inter.

---

## 3. Commands

```bash
npm run dev            # Vite dev server
npm run build          # vite build
npx tsc --noEmit       # TYPECHECK — the only way to catch type breakage (NO test suite exists)
npm run lint           # eslint (.ts/.tsx). no-explicit-any is a WARNING. Pre-existing backlog — keep own edits clean.
npm run deploy         # vite build && firebase deploy --only hosting
cd functions && npm run deploy   # deploy cloud functions
cd functions && npm run serve    # functions emulator
```

**No tests. No Prettier/Biome.** Don't assume `npm test` or `prettier` exist. Lint ≠ typecheck.

---

## 4. Architecture — strict 3-layer, feature-first

Code is organised by **business feature** under `src/features/{auth, photoproofing, portfoliobuilder,
studio-management}`. Each feature follows a 3-layer separation (from `ARCHITECTURE.md`) — **enforce
for new code**:

```
src/features/<feature>/
  api/         # Data layer — raw Firebase calls only. NO hooks, NO React state. Pure async fns.
  hooks/       # Logic layer — Zustand stores + use* hooks. Business logic, loading/error state.
  store/       # Zustand stores (this feature's state)
  components/  # UI only — consume hooks. No useEffect / complex state (UI-only state like isOpen ok).
  pages/       # UI views (routed)
  types.ts     # per-feature types
  index.ts     # public barrel — export the feature's public surface here
```

**Workflow for a new feature/fix:** add data fn in `api/` → add logic/handler in `hooks/` or
`store/` → wire UI in `components/`/`pages/`. Don't put logic in components. Catch+log errors in the
data layer and re-throw so the hook sets error state for the UI.

**Shared code:**
- `src/core/` — app shell: `GlobalNavbar`, `Footer`, `globalLoader` context, shared grid components.
- `src/shared/` — reusable components (`GlobalToast`, `Header`, `Hero`), hooks (`useToastStore`), utils.
- `src/config/` — `firebase.ts`, `gemini.ts`.
- `src/pages/` — top-level non-feature pages (`Home`, `About`, `NotFound`).
- `src/services/` — cross-cutting services (`googleDrive.ts`).

---

## 5. Routing (`src/router.tsx`)

| Path | Component | Access |
|---|---|---|
| `/` | `Home` | public |
| `/login`, `/signup` | `LoginPage`, `SignupPage` | public |
| `/about` | `About` | public |
| `/private/studio` | `StudioDashboard` | protected (studio owner) |
| `/private/studio/:projectId` | `ProjectDetailView` | protected |
| `/private/admin` | `SuperAdminDashboard` | protected (admin) |
| `/private/admin/user/:userId` | `AdminUserView` | protected (admin) |
| `/private/admin/user/:userId/studio/:projectId` | `AdminProjectDetailWrapper` | protected (admin) |
| `/private/portfolio/builder/:projectId` | `EventPortfolioBuilder` | protected |
| `/view/:userId/:projectId` | `PublicProjectView` | public (client proofing) |
| `/share/:userId/:projectId/:linkId` | `PublicProjectView` | public (shared link, scoped folders) |
| `/p/:userId/:eventpath` | `EventPageViewer` | public (published portfolio microsite) |
| `*` | `NotFound` | |

Protected routes gate on `ProtectedRoute` under `/private`. Footer is hidden on `/portfolio` routes.
"Public routes" (no navbar chrome) detected by pathname in the router.

---

## 6. Features in detail

### auth (`src/features/auth`)
- Firebase Auth. `AuthContext` provides current user; `ProtectedRoute` guards `/private`.
- Stores: `authStore.ts`, `userStore.ts`. `userStore` is imported for side-effects in `App.tsx`.
- `UserProfile` type: `{ uid, email, name, photoURL?, isAdmin?, createdAt?, updatedAt? }`.
- Roles: **studio owner** vs **super-admin** (`isAdmin`). Admin can browse other users' projects.
- `UserDetailsModal` collects profile info.

### studio-management (`src/features/studio-management`) — the studio admin side
- **Projects**: a studio creates a Project, points it at a Google Drive folder/URL, and syncs it.
- **Share links**: `SharedLink` scopes which folders + categories a client sees; managed via
  `CreateShareLinkModal` / `ManageShareLinksModal`.
- Key UI: `StudioDashboard`, `ProjectDetailView`, `PublicProjectView`, `FolderTree`,
  `CreateProjectModal`, `ProjectList`, super-admin dashboards.
- API: `api/projectService.ts` (fetch project, shared link, gz file from Storage).
- Store: `studioManagementStore.ts` (imported for side-effects in `App.tsx`).

### photoproofing (`src/features/photoproofing`) — the client proofing side
- Largest feature. Client views synced photos, selects/likes, builds albums/categories, downloads.
- Store `usePhotoProofingStore.ts`: holds `userId/projectId/linkId`, `images`, `folders`,
  `breadcrumbs`, `albums` (Record<name, imageIds[]>), `categories`, `currentFolderId`, image cache.
- Hooks: `usePhotoProofing`, `useImageNavigation`, `useFullscreenControls`, `useSlideshow`,
  `useDownloadImages`, `useDoubleClick`.
- Services: `AlbumSyncService.ts` (syncs album selections to Firestore),
  `IndexedDBService.ts` (client-side caching of image data / selections).
- UI: `PhotoGrid/`, `FullScreenView/` (viewer, zoom, slideshow, like animation), `CategoryTabs`,
  `AlbumSelector`, `LocalDownloadModal`.

### portfoliobuilder (`src/features/portfoliobuilder`)
- Build/publish a wedding microsite. Store `portfolioBuilderStore.ts`.
- Types: `WeddingFormData` (nav_logo, name1/name2, heroImage, mainDate, story, invitation*,
  `details: EventDetail[]`, `gallery: GalleryItem[]`), each text field is `{ value, style?{color} }`.
- `EventPortfolio`: `{ eventType:'wedding', eventPath, templateId, data, published, ... }`.
- 3 templates: `template1` Classic Elegance, `template2` Midnight Gold, `template3` Garden Romance.
- `DEFAULT_WEDDING_DATA` seeds a new portfolio.
- Pages: `EventPortfolioBuilder` (editor, `/private/portfolio/builder/:projectId`),
  `EventPageViewer` (public render, `/p/:userId/:eventpath`).
- Service: `portfolioService.ts`.

---

## 7. Data model

### Firestore paths (confirmed in code)
- **Project**: `projects/{userId}/projects/{projectId}`
- **Shared link**: `projects/{userId}/projects/{projectId}/shared_links/{linkId}`
- **Portfolio**: `eventPortfolios/users/{userId}/{eventPath}`  — query portfolios by `projectId` field.

### Storage paths (from Cloud Functions)
- Synced Drive tree (gzipped JSON): `{uid}/projects/{projectId}/{driveFolderId}.json.gz`
  (`contentEncoding: gzip`). Recorded back on the project doc under
  `syncedFolders.{folderId} = { filePath, syncTime, filesCount }`.

### Key types
- `Project`: `{ id, name, userId, driveData?:DriveNode, driveUrl?, selectedFolders?, syncedFolders?, status?, ... }`
- `DriveNode`: `{ id, name, folders?:Record<id,DriveNode>, files?:DriveFile[] }` (recursive tree)
- `DriveFile`: `{ id, name, thumbnailLink?, mimeType?, folderPathList[] }`
- `SharedLink`: `{ id, name, includedFolders[], categories?:LinkCategory[], sourceProjectId }`
- `AlbumCategory`: `{ id, name, images:string[] }`

---

## 8. Cloud Functions (`functions/index.js`, plain JS, Node 22)

Callable (`onCall`) functions that talk to the **Google Drive API** (needs `DRIVE_API_KEY` env):
- `getDriveTree` — fetch full recursive folder tree (files + folders) for a Drive URL/folderId.
- `getFolderStructure` — fetch folders-only structure (no files).
- `uploadDriveData` — fetch tree, gzip it, save to Storage at
  `{uid}/projects/{projectId}/{folderId}.json.gz`, and update the project's `syncedFolders`.

Functions have their **own `dotenv` env** (not the Vite `.env`). Client wraps these via
`src/services/googleDrive.ts`.

---

## 9. Environment

Copy `.env.example` → `.env` (gitignored). All client vars are `VITE_`-prefixed (Firebase web keys
are meant to be client-exposed):
- `VITE_FIREBASE_*` (7 keys: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId, measurementId)
- `VITE_GEMINI_API_KEY`

Functions env (separate): `DRIVE_API_KEY`.

---

## 10. Conventions & gotchas

- **Branch off `main`, open a PR.** Do not commit directly to `main`.
- Style with MUI `sx` + emotion — **never Tailwind**.
- New state → Zustand store in the feature's `store/`. Keep data access in `api/`, logic in `hooks/`.
- Typecheck with `npx tsc --noEmit` (no tests). Keep your own lint clean; ignore the pre-existing backlog.
- `no-explicit-any` is a warning and `any` is pervasive in Firebase code — acceptable, but prefer types in new code.
- `functions/` is a separate package — `cd functions` before running its npm scripts.
- `vite.config.ts` has a stale ngrok host in `allowedHosts` — dev artifact, ignore.
- Many `*.md` files at root are older/partly aspirational (`ARCHITECTURE_V2.md`, `PORTFOLIO_BUILDER_*.md`,
  `QUICK_*.md`, `SUMMARY.md`, `REFACTORING.md`, `blueprint.md`, `GEMINI.md`). **This file + `CLAUDE.md`
  are the source of truth; verify against code before trusting the others.**
- Gemini config file (`gemini.ts`) is JS-style (loosely typed) inside a `.ts` file — leave as-is unless refactoring.

---

## 11. Quick "where do I…" index

| I want to… | Go to |
|---|---|
| Add a Firestore read/write | `src/features/<feature>/api/*` |
| Add app state | `src/features/<feature>/store/*.ts` (Zustand) |
| Add a route | `src/router.tsx` |
| Change theme/colors | `mizhivTheme` in `src/App.tsx` |
| Change global CSS | `src/index.css` |
| Touch the proofing viewer | `src/features/photoproofing/components/FullScreenView/` |
| Touch album/category logic | `usePhotoProofingStore.ts`, `AlbumSyncService.ts` |
| Touch Drive sync | `functions/index.js` + `src/services/googleDrive.ts` |
| Touch portfolio editor/render | `portfoliobuilder/pages/EventPortfolioBuilder.tsx` / `EventPageViewer.tsx` |
| Add AI features | `src/config/gemini.ts` |
| Auth/roles | `src/features/auth/` (`AuthContext`, `ProtectedRoute`, `userProfile.ts`) |
