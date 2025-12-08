# AI Agent Architecture & Coding Guidelines

This document serves as a guide for AI agents and developers working on this codebase. It defines the preferred architecture, patterns, and rules to ensure code consistency and maintainability.

## 🏛️ Core Architecture: 3-Layer Pattern

We follow a strict separation of concerns using a **3-Layer Architecture** (often referred to as the Repository Pattern in React).

### 1. Data Layer (`api/`)
*   **Purpose**: Handle **raw data fetching** only.
*   **Responsibility**: Communicate with Firebase Firestore, Storage, or external APIs.
*   **Rules**:
    *   No React state (`useState`).
    *   No Hooks.
    *   Pure async functions.
    *   **Location**: `src/features/[feature-name]/api/[serviceName].js`

### 2. Logic Layer (`hooks/`)
*   **Purpose**: Handle **business logic, state management, and side effects**.
*   **Responsibility**:
    *   Call the Data Layer.
    *   Manage loading and error states.
    *   Transform raw data into UI-ready formats.
    *   Handle user interactions logic.
*   **Rules**:
    *   Must be a Custom Hook (e.g., `useProject`, `useSelection`).
    *   Return only data and action functions (handlers) to the UI.
    *   **Location**: `src/features/[feature-name]/hooks/use[FeatureName].js`

### 3. Presentation Layer (`pages/` or `components/`)
*   **Purpose**: Handle **rendering** only.
*   **Responsibility**:
    *   Call the Logic Layer hook.
    *   Render UI based on the hook's returned data.
    *   Show loading spinners or error alerts.
*   **Rules**:
    *   **Zero Logic**: No `useEffect`, no complex `useState` (UI-only state like 'isMenuOpen' is allowed).
    *   **Location**: `src/features/[feature-name]/pages/` or `components/`

---

## 📂 Project Structure (Feature-Based)

Structure code by **business feature**, not technical type.

```text
src/
  features/
    studio-management/      # Feature Name
      api/                  # Data Layer
        projectService.js
      hooks/                # Logic Layer
        usePublicProject.js
      pages/                # Presentation Layer (Views)
        PublicProjectView.jsx
      components/           # Feature-specific Components
```

## 🤖 Rules for AI Agents

When asked to "implement a feature" or "fix a bug", follow these steps:

1.  **Analyze**: Does this require data fetching?
    *   **Yes**: Create/Update a function in the `api/` folder.
2.  **State**: Does this require new state or side effects?
    *   **Yes**: Update the custom hook in `hooks/`. **Do not add logic to the Component.**
3.  **UI**: Updates to the visual layer.
    *   **Action**: Update `pages/` or `components/` to consume the new hook data.

### Example Workflow

> **User**: "Add a button to delete the project."

1.  **API**: Add `deleteProject(id)` to `projectService.js`.
2.  **Hook**: Add `handleDelete()` to `usePublicProject.js`. This calls `deleteProject` and handles loading/toast state.
3.  **UI**: Add `<Button onClick={handleDelete} />` to `PublicProjectView.jsx`.

---

## ✅ Best Practices

*   **Imports**: Use absolute paths or consistent relative paths.
*   **Naming**:
    *   Services: `nounService.js` (e.g., `userService.js`)
    *   Hooks: `useNoun.js` (e.g., `useUser.js`)
    *   Components: `PascalCase.jsx`
*   **Error Handling**: always catch errors in the **Service** (log them) and re-throw them so the **Hook** can set the error state for the **UI**.
