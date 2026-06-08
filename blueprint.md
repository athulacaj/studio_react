
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

