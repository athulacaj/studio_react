
# Gen Photo Proofing App Blueprint

## Overview

This document outlines the development plan for a modern, responsive photo proofing application. The app will allow users to view a gallery of images, select their favorites, and organize them into albums. The user interface will be built with React and Material-UI (MUI), following the design principles and best practices outlined in the project's development guidelines.

## Core Features & Design

### Implemented Features
*   **Initial Project Setup:** The application is initialized as a standard Vite + React project.
*   **Dependency Installation:** Material-UI and `lucide-react` are installed.
*   **Basic UI Structure:**
    *   `Header`, `PhotoGrid`, and `Footer` components are created.
    *   A dark theme is implemented using MUI's `createTheme`.
    *   The `PhotoGrid` displays a grid of selectable placeholder images.
*   **Folder Tree Select All Checkbox:**
    *   Added a "Select All / Unselect All" checkbox at the top of the `FolderTree` component.
    *   Supports indeterminate state, displaying how many folders are currently selected.
    *   Integrated across `FolderSelectionDialog`, `CreateShareLinkModal`, and `ManageShareLinksModal`.
*   **Project Update API Integration:**
    *   Implemented the `updateProject` API function in [projectService.ts](file:///Users/abinjosepph/develop/projects/studio_react/src/features/studio-management/api/projectService.ts) targeting the PUT `/projects/projects/:id` endpoint.
    *   Configured the endpoint URL mapping in [apiEndpoints.ts](file:///Users/abinjosepph/develop/projects/studio_react/src/config/apiEndpoints.ts).
    *   Fully integrated the `updateProject`, `updateProjectLocalState`, and `updateShareLink` store actions in [studioManagementStore.ts](file:///Users/abinjosepph/develop/projects/studio_react/src/features/studio-management/store/studioManagementStore.ts) to handle backend synchronization, resolving existing compilation warnings and type mismatches.

### Current Development Plan

#### Iteration 2: Album Management

1.  **Toolbar:**
    *   Add a `Toolbar` to the `PhotoGrid` component that becomes visible when one or more photos are selected.
    *   The toolbar will display the number of selected photos and an "Add to Album" button.
2.  **Album Creation Dialog:**
    *   Create a `Dialog` component that opens when the "Add to Album" button is clicked.
    *   The dialog will contain a text field for the new album name and "Create" and "Cancel" buttons.
3.  **Album State Management:**
    *   Implement state management to keep track of the created albums and the photos within each album.
4.  **Album Filtering:**
    *   Add a `Select` component to the `Header` or `PhotoGrid` to allow users to filter the displayed photos by album.


#### Iteration 3: Advanced Image Caching

1.  **Image Caching Utility:**
    *   Implement `fetchWithCache` utility using the browser's Cache API.
    *   Bypass standard HTTP caching using `cache: "no-store"` to handle headers manually.
    *   Use LocalStorage to track cache timestamps and enforce a 2-minute TTL.
2.  **useCachedImage Hook:**
    *   Create a custom hook to fetch images and manage blob URL lifecycles (including cleanup with `URL.revokeObjectURL`).
3.  **UI Integration:**
    *   Update `ImageViewer` to use the caching hook.

#### Iteration 4: Responsive Mobile Header

1.  **Mobile Layout Detection:**
    *   Utilize MUI's `useTheme` and `useMediaQuery` to detect mobile viewports (screens smaller than `md` breakpoint).
2.  **Adaptive Navigation:**
    *   **Desktop:** Retain the full toolbar with direct access to "About", "Download", and "Album Selector".
    *   **Mobile:** Consolidate navigation items into a `Drawer` accessible via a hamburger menu icon.
3.  **Mobile Drawer Components:**
    *   **Album Selector:** Adapted full-width selector for easier touch interaction.
    *   **Download Actions:** Integrated the download button and its options menu into the drawer flow.
    *   **Navigation Links:** Full-width layout for "About" and other future links.
4.  **Styling Enhancements:**
    *   Responsive font sizes for the logo.
    *   Blur-backed App Bar for a modern, glassmorphism feel on both mobile and desktop.

#### Iteration 5: Google Drive Client Integration

1.  **Architecture:**
    *   Implemented a dedicated `drive-integration` feature following the 3-layer architecture (`api/`, `store/`, `components/`).
    *   For a detailed technical breakdown, see `docs/google_drive_integration.md`.
2.  **Client Flow:**
    *   Embedded a connection prompt (`DriveConnectPrompt`) in `PublicProjectView` for unlinked projects sourced from Google Photos.
    *   Created an OAuth callback page (`DriveConnectPage`) to handle token exchange and user redirection.
3.  **Admin UI:**
    *   Added a `DriveFileBrowser` component to `ProjectDetailView` allowing admins to view, create folders, and upload photos directly to the client's connected Google Drive.
4.  **Backend Security:**
    *   Tokens are securely encrypted in Firestore using `AES-256-CBC` within Firebase Cloud Functions.
    *   Added Cloud Functions to handle all Drive API requests (folder creation, file listing, Base64 multipart file uploads, token revocation).


#### Iteration 7: Manage Portfolio View Refactoring

1. **Extract Custom Hooks:**
   - `useSidebarResizer`: Extract sidebar dragging & resizer width calculations.
   - `usePortfolioIframe`: Extract iframe message postMessage synchronization and element scroll handling.
2. **Decompose Page Components:**
   - `UploadTemplateStep`: Modularize HTML template upload initial step UI.
   - `ManagePortfolioHeader`: Modularize header with Back button, Title & Desktop/Mobile toggles.
   - `AssetsTabContent`: Modularize asset list, compression, upload progress bar & dialog.
   - `SettingsTabContent`: Modularize Publish card & Version History selection menu.
   - `PortfolioPreview`: Modularize iframe preview container with desktop/mobile device framing.
3. **Refactor ManagePortfolioView:**
   - Simplify main container component from 924 lines to concise, readable orchestration of hooks and components.

#### Iteration 8: Template Library Selection Dialog & Step 1 Redesign

1. **Template Selection Dialog (`TemplateSelectionDialog.tsx`):**
   - Modal interface allowing users to browse and search website templates from `templatesDataList`.
   - Real-time search filter across template ID, type, and URLs.
   - Glassmorphism dark aesthetic styling with desktop/mobile screenshot previews and fallback cards.
   - Smooth selection feedback and loading indicators.
2. **Step 1 UI Redesign (`UploadTemplateStep.tsx`):**
   - Dual-card selection layout: Browse Template Library vs. Upload Custom HTML.
   - Embedded dialog state management and selection callbacks.
3. **Template Loader Handler (`useManagePortfolio.ts`):**
   - `handleSelectTemplate`: Asynchronously fetches template HTML from R2/URL, parses embedded `websiteData`, initializes portfolio state, and transitions directly to Step 2.


#### Iteration 9: Horizontal Step 1 Page UI & Browser Mockup Upgrade

1. **Wide Horizontal Layout (`UploadTemplateStep.tsx`):**
   - Expand page container to `maxWidth="xl"` with full horizontal side-by-side layout on large screens (`lg={6}`).
   - Enhance grid card dimensions, balance, spacing, and glassmorphism depth.
2. **Interactive Browser Preview Card (Browse Templates):**
   - Embedded macOS-style browser top bar with search pill and live template thumbnails preview.
   - Dynamic template counter chip, badge highlights, and vibrant gradient CTA.
3. **Dropzone File Visual Card (Upload HTML):**
   - Sleek interactive file upload dropzone UI with drag-and-drop feedback, file spec tags, and gradient outlined button.
4. **Atmospheric Styling & Polish:**
   - Hero header with step indicator badge, ambient background lighting, and glassmorphic navigation button.


#### Iteration 10: Convert Admin Users Dashboard to Table Layout

1. **Table View Design:**
   - Redesigned the Super Admin user dashboard list from a card grid layout to a glassmorphic table.
   - Table columns include: User (Avatar + Name + UID), Email (with icon), Role Chip (with styled indicators for Admin and User), Joined Date, and Action controls.
   - Built with MUI `Table`, `TableBody`, `TableCell`, `TableContainer`, `TableHead`, and `TableRow` components styled to match the dark theme and neon details of Mizhiv.
2. **TableRow Click Actions:**
   - Make the entire row clickable to seamlessly navigate to `/private/studio/:userId`.
   - Included a distinct "View Dashboard" button inside a tooltip in the action column.
3. **Table Skeleton Loading State:**
   - Created a modern table row skeleton matching the table structure to replace card-based skeletons.
4. **Codebase Cleanup:**
   - Cleaned up unused legacy components `UserCard` and `UserCardSkeleton`.


#### Iteration 11: Add Option for Add/Edit Users with Modal Dialog & API Integration

1. **API Integration in userService:**
   - Added `createUser` (POST `/users`) and `updateUser` (PATCH `/users/:id`) to the `userService.ts` layer.
   - Updated the central `apiEndpoints.ts` config to register user create and update endpoints.
2. **Dashboard Controls Integration:**
   - Added an "Add User" button in the Super Admin dashboard header.
   - Added an "Edit" icon button in the actions column of the users table.
3. **Add/Edit User Dialog:**
   - Designed a glassmorphic modal dialog component that supports both create and update operations.
   - Form fields include: Email (required, text), Name (text), Role (Admin/User select), Approved status (boolean toggle), and Password (optional/override, password text).
   - Styled to match the neon accents and dark background details of Mizhiv.
   - Handled server errors, form loading states, and dynamic form reset on successful submit.


#### Iteration 17: Interactive Contact Section & Social Community Channels

1. **Contact Section Component (`ContactSection.tsx`):**
   - Created a dedicated, glassmorphic contact section (`#contact-section`) on the Home page.
   - **Direct Email Card**: Displays `studio.mizhiv@gmail.com` with a one-click clipboard copy button (with snackbar alert feedback) and a "Compose Email" `mailto:` launcher.
   - **Instagram Community Card**: Displays `@mizhiv_app` with an "Official" badge and a direct link to `https://www.instagram.com/mizhiv_app`.
   - **Studio Response Guarantee**: Highlighted fast support turnaround note for photographers and studios.
2. **Navigation & Footer Updates:**
   - Linked `#contact-section` into `GlobalNavbar.tsx` (desktop nav & mobile drawer) with active scroll spy tracking.
   - Updated `Footer.tsx` with `studio.mizhiv@gmail.com` and the official Instagram link.

#### Iteration 18: Enhanced Bottom CTA Banner with Cameraman Illustration

1. **Dedicated CTA Section Component (`CtaSection.tsx`):**
   - Redesigned the bottom CTA banner from a plain centered box into a vibrant, high-conversion two-column showcase banner.
   - Built with MUI and dark cyber glassmorphism design tokens matching Mizhiv's visual identity.
   - **Showcase Visual**: Embedded the high-resolution `/images/illustrations/cameraman.png` illustration showing modern studio workflows (Google Drive proofing, AI wedding invitations, custom studio domain websites) with an ambient radial glow and floating platform badge.
   - **Feature Highlights**: Included interactive micro-badges highlighting Custom Domain branding, Zero Client Downloads, and AI-Powered Invitations.
   - **Action Area**: High-impact gradient button ("Get Started Now" / "Go to Studio Dashboard") with trust signals ("Instant setup • No credit card required").
2. **Integration (`Home/index.tsx`):**
   - Replaced inline CTA code with the modularized `<CtaSection />` component.

#### Iteration 19: Remove About Section from Navigation & Remove Legacy About Page

1. **Navbar Navigation Updates (`GlobalNavbar.tsx`):**
   - Removed the 'About' link and `Info` icon from desktop navigation pills and mobile drawer menus.
   - Cleaned up `/about` route detection in scroll spy logic.
2. **Route and Page Cleanup:**
   - Removed `/about` route and unused imports from [router.tsx](file:///Users/abinjosepph/develop/projects/studio_react/src/router.tsx).
   - Removed `About.tsx` page to keep the codebase lean and free of legacy placeholder details.

#### Iteration 20: Mobile Responsiveness & Enhanced UX for Portfolio Management

1. **Adaptive Mobile Layout & View Switcher (`ManagePortfolioView.tsx`, `ManagePortfolioHeader.tsx`):**
   - Implemented responsive viewport detection using MUI `useTheme` and `useMediaQuery(theme.breakpoints.down('md'))`.
   - On desktop: preserved the split-screen resizable layout with drag splitter.
   - On mobile/tablet: introduced a seamless [Edit | Live Preview] mode switcher in the header along with a floating quick-toggle action button in preview mode.
   - Replaced fixed sidebar width with 100% viewport width on mobile and dynamic height (`100dvh` / `100vh`) to prevent address bar clipping.
   - Configured scrollable tabs with mobile touch navigation.
2. **Responsive Live Preview & OG Graph Preview (`PortfolioPreview.tsx`, `OgGraphPreview.tsx`):**
   - Eliminated hardcoded min-width constraints that broke mobile viewports.
   - Enabled native full-width and full-height interactive iframe rendering on mobile screens.
   - Scaled social media mockup cards cleanly for mobile displays.
3. **Form & Tab Content Optimization (`DynamicPortfolioForm.tsx`, `AssetsTabContent.tsx`, `SettingsTabContent.tsx`):**
   - Added touch-friendly padding, responsive leaf input fields, and spacious accordion action controls.
   - Optimized asset list items with text truncation, compression badges, and safe delete buttons.
   - Adjusted settings cards and action buttons (Publish, Browse Templates, Download HTML) to full-width on mobile.
4. **Step 1 & Template Selection Dialog Mobile Upgrades (`UploadTemplateStep.tsx`, `TemplateSelectionDialog.tsx`):**
   - Responsive button stacking for upload & template browsing.
   - Fullscreen/adaptive dialog modal on mobile with touch-accessible selection controls and horizontally scrollable category filter pills.

#### Iteration 21: Content Form Search & Breadcrumb Path Filtering

1. **Instant Search Bar (`DynamicPortfolioForm.tsx`):**
   - Added a sticky search input bar at the top of the Content customization form.
   - Supports real-time text querying across field keys, text/number values, array item titles, section names, and nested paths.
   - Includes quick clear action and live matched fields counter.
2. **Parent Section & Breadcrumb Path Hierarchy:**
   - When searching, fields are grouped by parent section with styled breadcrumb tags (e.g. `Hero › Content › Subtitle` or `Gallery › Images › Item 1 › Url`).
   - Retains direct `LeafField` editable state, instant iframe live preview postMessage synchronization, and click-to-scroll targeting via `scrollToJsonPath`.
   - Provides section filter pills for multi-section search results and a dedicated empty state when no matching fields are found.

#### Iteration 22: Live Preview Element Selection & In-Place Quick Edit

1. **Click-to-Select Element Recognition (`usePortfolioIframe.ts`):**
   - Injected interactive click interceptor into live preview HTML content.
   - Resolves clicked elements to exact `jsonPath` and `portfolioData` leaf properties (or content text fallback lookup).
   - Extracts human-friendly breadcrumbs (e.g. `Hero › Content › Title`, `Services › Item 1 › Title`), field keys, and image asset indicators.
2. **Floating Bottom Selection Bar (`PortfolioPreview.tsx`):**
   - Renders a glassmorphic floating action pill at bottom center when an element is clicked.
   - Displays section/breadcrumb tag, preview value text (e.g. `"Wedding"`), a glowing **[Edit]** button, and dismiss action (`✕`).
3. **In-Place Quick Edit Dialog (`QuickEditElementDialog.tsx`):**
   - Clicking Edit opens a focused modal over the preview to update values directly.
   - Supports text/multiline editing and image asset picker integration (choosing from uploaded assets or pasting image URLs).
   - On "Apply Changes", immutably updates `portfolioData` via `setByPath`, triggers live `UPDATE_DATA` postMessage to iframe, and syncs form state.
   - **Mobile UX & Action Bar Optimization**: Sized modal paper dynamically on mobile (`maxWidth: 'xs'`, responsive margin/padding), applied `whiteSpace: 'nowrap'` with balanced typography (`0.8125rem`–`0.875rem`, `fontWeight: 600`) to prevent awkward button line breaks, and aligned "Cancel" & "Apply Changes" cleanly across small viewports.

#### Iteration 23: Refined Design System Border Radius Scale

1. **Global Theme Standardization (`src/App.tsx`):**
   - Reduced maximum curves and pill-shaped geometry across the application to achieve a sleek, modern, professional aesthetic.
   - **Base Theme `shape.borderRadius`**: Reduced from `16px` to `8px`.
   - **Buttons (`MuiButton`)**: Standardized to `8px` (`borderRadius: 8`, down from `16px` / `50px` pills).
   - **Cards & Dialogs (`MuiCard`, `MuiDialog`, `MuiPaper`)**: Standardized to `10px` (`borderRadius: 10`, down from `24px` / `20px`).
   - **Chips & Badges (`MuiChip`)**: Standardized to `6px` (`borderRadius: 6`, down from `999` pill shapes).
   - **Inputs (`MuiOutlinedInput`)**: Standardized to `8px` (`borderRadius: 8`).
2. **Portfolio Management Component Upgrades:**
   - **`PortfolioPreview.tsx`**: Reduced floating selection pill and mobile action button from `50px` / `30px` pills to `2.5` (`10px`) / `1.5` (`6px`). Reduced mockup frame radius to `16px`.
   - **`QuickEditElementDialog.tsx`**: Reduced modal dialog, preview frames, inputs, and action buttons to `1.5`–`2.5` (`6px`–`10px`) with mobile-optimized button layout and nowrap protection.
   - **`DynamicPortfolioForm.tsx`**: Refined search bar, accordions, nested cards, chips, and asset dialog from `12px`/`16px` to sleek `8px` / `6px` (`borderRadius: 1.5`–`2`).
   - **`UploadTemplateStep.tsx` & `TemplateSelectionDialog.tsx`**: Updated template cards, dropzone, lightbox, and navigation action buttons to `1.5`–`2.5` (`6px`–`10px`).
   - **`SettingsTabContent.tsx`, `AssetsTabContent.tsx`, `OgGraphTabContent.tsx` & `OgGraphPreview.tsx`**: Standardized all cards, mockups, and button elements to the refined border-radius scale.

#### Iteration 24: Fix Form Field Selection Indicator Sticking on Multiple Clicks

1. **Root Cause Resolution (`usePortfolioIframe.ts`):**
   - Eliminated race condition where capturing `element.style.backgroundColor` during an active highlight saved the purple indicator color into `originalBg`, permanently locking inline background color on multiple or rapid clicks.
   - Replaced direct inline style mutation with class-based animation (`.form-field-highlight`).
   - Added automatic inline style cleanup (`removeProperty('background-color')` and `removeProperty('transition')`) to strip any stale styles from previous interactions.
2. **Animation Keyframes (`src/index.css`):**
   - Added `@keyframes formFieldHighlightFade` with smooth cubic-bezier easing to gracefully pulse the field highlight and return to transparent without mutating DOM element inline styles.
   - Reflow-forced restart (`void element.offsetWidth`) ensures multiple successive clicks reliably restart the pulse effect every time without lingering state.
