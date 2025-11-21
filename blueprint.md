
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

