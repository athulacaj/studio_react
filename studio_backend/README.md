# Studio Backend API

A production-ready REST API for syncing project file metadata. Built with Node.js, Express, TypeScript, Prisma, SQLite, and Zod.

## Features
- **Upsert Files**: Insert or update file metadata natively avoiding conflicts.
- **Bulk Upsert**: Process thousands of files efficiently using Prisma transactions.
- **Delta Sync**: Sync metadata updates natively using the `?updatedSince` query.
- **Soft Delete**: Keep track of deleted entries for local client synchronization.
- **OpenAPI/Swagger**: Interactive API documentation.

## Requirements
- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   The `.env` file should contain at least:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=3000
   NODE_ENV=development
   ```

3. Setup Database (SQLite):
   ```bash
   npx prisma db push
   npx prisma generate
   ```

4. Seed the database (optional):
   ```bash
   npx prisma db seed
   ```

## Running the Application

### Development
```bash
npm run dev
```

### Production
Build the TypeScript files:
```bash
npm run build
```
Run the application:
```bash
npm start
```

### Docker
Using `docker-compose`:
```bash
docker-compose up --build
```

## Testing
Run the Jest test suite:
```bash
npm run test
```

## API Documentation
Once the server is running, visit:
`http://localhost:3000/docs` to view the Swagger UI and test endpoints interactively.
