# Auth Feature Documentation

This document describes the Authentication feature implemented in the application using Firebase Authentication.

## Overview

The Auth feature provides email and password authentication. It includes:
- **AuthContext**: Manages user state (`currentUser`) and provides auth methods (`login`, `signup`, `logout`).
- **Pages**: `LoginPage` and `SignupPage` for user interaction.
- **Integration**: Wrapped around the main application in `App.jsx`.

## Usage

### Accessing User State

To access the current user or auth methods in any component, use the `useAuth` hook:

```javascript
import { useAuth } from '../features/auth';

function MyComponent() {
  const { currentUser, logout } = useAuth();

  if (currentUser) {
    return (
      <div>
        <p>Welcome, {currentUser.email}</p>
        <button onClick={logout}>Log Out</button>
      </div>
    );
  }

  return <p>Please log in.</p>;
}
```

### Routes

The following routes are available:
- `/login`: The login page.
- `/signup`: The signup page.

## Implementation Details

- **Context**: `src/features/auth/context/AuthContext.jsx`
- **Pages**: `src/features/auth/pages/`
- **Firebase**: Uses the `auth` instance from `src/config/firebase.js`.

## Future Improvements

- Add password reset functionality.
- Implement protected routes (require login to access certain pages).
- Add Google Sign-In.
