# Studio Backend Implementation Document

This document details the architectural decisions, database schema, and technical implementations for the Studio Backend REST API project.

## Architecture & Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQLite
- **ORM**: Prisma
- **Validation**: Zod
- **Logging**: Pino (with `pino-http` for request logging)
- **Formatting / Linting**: Prettier & ESLint

The application is structured using a standard Layered Architecture pattern, relying on **Dependency Injection**:
- **Controllers** (`src/controllers`): Handle HTTP request/response formatting.
- **Services** (`src/services`): Contain core business logic.
- **Repositories** (`src/repositories`): Handle all database interactions (Prisma).
- **Routes** (`src/routes`): Register Express routes with validation middlewares.

## Database Schema Design

We use SQLite via Prisma.

**Table:** `File`

| Column | Type | Attributes | Description |
| --- | --- | --- | --- |
| `id` | String | | The ID string generated from `relativePath + "/" + name`. |
| `projectId` | String | Indexed | The identifier for the project this file belongs to. |
| `name` | String | | File name (e.g., `photo.png`). |
| `relativePath` | String | | The path excluding the filename. |
| `updatedAt` | DateTime | Indexed | Client-provided timestamp of when the file was last updated. |
| `deleted` | Boolean | Indexed, Default: false | Soft deletion flag. |
| `createdAt` | DateTime | Default: `now()` | Database insertion time. |
| `modifiedAt` | DateTime | `@updatedAt` | Database auto-updated timestamp on any row modification. |

### Primary Key Design
To avoid collisions across different projects (where files could share the same relative path and name), a composite primary key is used:
```prisma
@@id([projectId, id])
```
This guarantees uniqueness of a file per project, effectively achieving native UPSERT capabilities.

## API Endpoints

### 1. Upsert a Single File
**`POST /projects/:projectId/files`**
Inserts a new file or updates an existing file if `(projectId, id)` already exists.
- **Request Body**:
  ```json
  {
      "name": "photo.jpg",
      "relativePath": "Vacation/Beach",
      "updatedAt": "2026-07-22T08:45:00Z",
      "deleted": false
  }
  ```
- **Process**: Generated `id` becomes `Vacation/Beach/photo.jpg`. The service checks the DB, updating the record natively via Prisma's `upsert` mechanism.

### 2. Bulk Upsert
**`POST /projects/:projectId/files/bulk`**
Upserts thousands of files efficiently.
- **Request Body**:
  ```json
  {
      "files": [ { ... } ]
  }
  ```
- **Process**: The repository executes an array of `.upsert()` promises wrapped in a Prisma `$transaction` array.

### 3. Get / Sync Files
**`GET /projects/:projectId/files`**
Retrieves files for a project. Supports delta sync.
- **Query Params**: `?updatedSince=2026-07-22T08:45:00Z` (optional)
- **Process**:
  - If `updatedSince` is provided, fetches only files where `updatedAt > updatedSince`.
  - **Soft Deletions**: Deleted files (`deleted=true`) are intentionally returned so the client can synchronize removal locally.
- **Response Format**:
  ```json
  {
      "projectId": "abc",
      "lastSync": "2026-07-22T11:00:00.000Z",
      "files": [ ... ]
  }
  ```

## Validation & Error Handling
- **Zod Middlewares**: All incoming payloads (body, query, params) are validated using Zod schemas (`src/api/validations.ts`).
- **Error Handler**: An Express error handling middleware (`src/middleware/errorHandler.ts`) catches standard errors and validation errors, returning structured `400 Bad Request` or `500 Internal Server Error` responses to the client while logging details via Pino.

## Performance Optimization
- **N+1 Avoided**: Uses native array aggregations and transactions instead of looping standalone SQL queries.
- **Database Indexes**: Created indexes on `projectId`, `(projectId, updatedAt)`, and `(projectId, deleted)` to ensure fast lookups on filtered sync requests.

## Containerization
The project includes a multi-stage `Dockerfile` to optimize the final image size, running the compiled JavaScript in a lightweight Node.js Alpine container. A `docker-compose.yml` is configured to spin up the API on port `3000`.

## Testing
Unit tests are written using **Jest** (`src/tests`).
- Repositories are tested with mocked Prisma calls (`jest-mock-extended`).
- Services are tested by passing mocked instances of repositories via Dependency Injection, ensuring isolated logic testing.
