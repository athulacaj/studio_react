# Google Drive Client Integration

## Overview
The Google Drive Client Integration enables clients to securely connect their own Google Drive accounts to a project (originating from a "Google Photos" source). Once connected, studio admins can directly push photos and manage folders inside a designated `Mizhiv/{ProjectName}` directory within the client's Google Drive.

## Architecture & Layers

This feature was implemented using a 3-layer architecture under `src/features/drive-integration/`:

### 1. API Layer (`api/`)
- **`driveAuthService.ts`**: Handles reading connection records directly from Firestore (`driveConnections` collection).
- **`driveFileService.ts`**: A wrapper around Firebase Cloud Functions (`httpsCallable`) for executing secure backend operations like token exchange, listing folder contents, creating folders, and uploading files.

### 2. State Management (`store/`)
- **`driveIntegrationStore.ts`**: A Zustand store that tracks:
  - The active Drive connection state (`activeConnection`).
  - Current browsing state (`currentFiles`, `breadcrumbs`, `currentFolderId`).
  - Loading/Uploading flags.
  - Actions to trigger API calls (e.g., `listContents`, `uploadFile`, `revokeAccess`).

### 3. UI Components (`components/` & `pages/`)
- **Client Facing**:
  - `DriveConnectPage.tsx`: The dedicated page where the client initiates the OAuth flow and handles the callback.
  - `DriveConnectPrompt.tsx`: A call-to-action card embedded in `PublicProjectView.tsx` when a Drive connection is missing.
- **Admin Facing**:
  - `DriveFileBrowser.tsx`: A Google-Drive-like UI embedded in `ProjectDetailView.tsx` that allows admins to view folders, create subfolders, and initiate uploads.
  - `DriveUploadDialog.tsx`: A drag-and-drop dialog for uploading individual photos (files are converted to Base64 in the browser before being sent to the Cloud Function).
  - `DriveFolderUploadDialog.tsx`: A folder picker (Chrome `webkitdirectory`) for uploading an entire local folder — including its subfolders — in one action, with dedup preview and per-file progress. See [Folder Upload & Sync Tracking](#folder-upload--sync-tracking).
  - `CreateDriveFolderDialog.tsx`: Dialog for creating new subfolders.
- **Shared**:
  - `utils.ts`: Folder/path/MIME helpers (`fileRelPath`, `dirOfPath`, `isImageFile`, `guessMimeType`, `topFolderName`, `countSubfolders`) used by the folder-sync flow.

## Backend (Firebase Cloud Functions)
Located in `functions/index.js`, this integration relies on 8 core functions:

1. **`exchangeDriveToken`**: Exchanges the OAuth authorization code for an `access_token` and `refresh_token`. It then creates the `Mizhiv/{ProjectName}` folder structure in the user's Drive and saves the connection data to Firestore.
2. **`listDriveContents`**: Fetches the contents of a specific folder from the connected Drive.
3. **`createDriveFolder`**: Creates a new subfolder inside the connected Drive.
4. **`uploadToDrive`**: Accepts a Base64 string and uploads it to the Drive using a `multipart/related` request.
5. **`revokeDriveAccess`**: Revokes the Google OAuth token and marks the connection as revoked in Firestore.
6. **`ensureDriveFolderTree`**: Given a base folder and a list of relative folder paths, recreates the tree (reusing folders that already exist) and returns a `relativePath → folderId` map. Used to mirror a local folder's subfolder structure into Drive.
7. **`getDriveManifest`**: Returns the `syncedFiles` tracking records for a connection (used for client-side dedup).
8. **`recordDriveUploads`**: Batch-writes upload records to Firestore and regenerates the self-healing in-Drive `manifest.json`.

### Security (Token Encryption)
OAuth tokens (access and refresh tokens) are **never stored in plaintext**. 
Before being written to Firestore, they are encrypted using `AES-256-CBC` in the Cloud Functions using the `TOKEN_ENCRYPTION_KEY` environment variable. A helper function (`getValidAccessToken`) automatically decrypts the refresh token and fetches a new access token if the current one has expired (with a 5-minute buffer).

## Data Models

**Firestore Collection: `driveConnections`**
```json
{
  "studioUserId": "string",
  "projectId": "string",
  "googleEmail": "string",
  "accessToken": "string (iv:encrypted hex)",
  "refreshToken": "string (iv:encrypted hex)",
  "tokenExpiry": "timestamp",
  "rootFolderId": "string",
  "rootFolderName": "string",
  "status": "active | revoked",
  "lastSyncedAt": "timestamp (added on folder sync)",
  "syncedFileCount": "number (added on folder sync)"
}
```

**Firestore Subcollection: `driveConnections/{connectionId}/syncedFiles`**
One document per synced file — the authoritative record of what has been uploaded. The doc id is `sha1(relativePath)`, which keeps re-syncs idempotent.
```json
{
  "relativePath": "string (e.g. Wedding/Ceremony/img_001.jpg)",
  "name": "string",
  "driveFileId": "string",
  "folderId": "string (Drive folder the file was placed in)",
  "size": "number | null",
  "mimeType": "string | null",
  "syncedAt": "timestamp"
}
```

**Project Document Updates**
The `Project` model in `studio-management` was updated to include a `driveConnectionId` property. This directly links a studio project to its respective `driveConnections` document.

## Edge Case Handling implemented
- Fixed an issue where `undefined` field values were being pushed to Firestore when creating a project without a Drive URL or folder structure. The `CreateProjectModal` now dynamically constructs the object to omit undefined fields.

## Folder Upload & Sync Tracking

Admins can upload an entire local folder of photos in one action, preserving its subfolder structure, with per-file tracking so the app always knows what has (and hasn't) been synced.

### Client flow (`DriveFolderUploadDialog.tsx`)
1. **Folder picker** — uses the Chrome/Chromium `webkitdirectory` attribute on a hidden `<input>` (set imperatively since it isn't a typed React prop). Selecting a folder yields every file inside it recursively, each carrying a `webkitRelativePath` (e.g. `Wedding/Ceremony/img_001.jpg`).
2. **Filter & preview** — non-image files are dropped (by MIME *or* extension, so RAW/HEIC with a blank MIME type still qualify). The dialog fetches the manifest and shows a preview: photos found, new-to-upload, already-synced, subfolder count, total size.
3. **Sync** (`driveIntegrationStore.syncFolder`):
   - Skips files whose `relativePath` is already in the manifest (dedup).
   - Calls `ensureDriveFolderTree` to recreate the local subfolder tree under the folder the admin is currently browsing.
   - Uploads each new file into its mirrored folder via the existing `uploadToDrive` function (base64, sequential, with progress).
   - Calls `recordDriveUploads` to persist tracking.

### Tracking model ("DB" manifest)
Tracking is stored in **two places**, with Firestore as the source of truth:
- **Firestore** — a `syncedFiles` subcollection under each `driveConnections/{id}` document. Each doc id is `sha1(relativePath)` (idempotent re-syncs) and stores `{ relativePath, name, driveFileId, folderId, size, mimeType, syncedAt }`. The connection doc also tracks `lastSyncedAt` and `syncedFileCount`.
- **In-Drive manifest** — a JSON "db" file at `Mizhiv/{ProjectName}/.mizhiv/manifest.json` inside the client's Drive, mirroring the Firestore records. It is **self-healing**: if the admin/client deletes it (or the `.mizhiv` folder), the next sync recreates it from Firestore.

> **Note on "non-deletable / hidden":** Google Drive has no true hidden or delete-protected flag for files the owner can see. The practical approach used here: the file lives in a dot-prefixed `.mizhiv` system subfolder, is tagged with private `appProperties` (`mizhivSystem` / `mizhivManifest`), and is regenerated automatically if removed. Firestore remains the authoritative record regardless.

### New Cloud Functions
6. **`ensureDriveFolderTree`**: Given a base folder and a list of relative folder paths, recreates the tree (reusing existing folders) and returns a `relativePath → folderId` map.
7. **`getDriveManifest`**: Returns the `syncedFiles` records for a connection (used for client-side dedup).
8. **`recordDriveUploads`**: Batch-writes upload records to Firestore and regenerates the self-healing in-Drive `manifest.json`.

> Because the OAuth scope is `drive.file`, folder-reuse lookups only see folders **the app itself created** — this is expected since the whole `Mizhiv/{ProjectName}` tree is app-managed.
