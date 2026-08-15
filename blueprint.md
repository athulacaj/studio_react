
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
   - Make the entire row clickable to seamlessly navigate to `/private/user/:userId`.
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
