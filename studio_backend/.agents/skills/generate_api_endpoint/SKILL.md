---
name: generate_api_endpoint
description: Generates a new API endpoint handling route, validation, swagger docs, and architecture.
---

# Generate API Endpoint

When the user asks to generate a new API endpoint, follow this architectural pattern and implementation steps to ensure consistency with the existing codebase.

## Architecture Pattern
This backend follows a layered architecture pattern:
1. **Routes (`src/routes/*Routes.ts`)**: Defines the HTTP endpoints, attaches Swagger documentation (via inline JSDoc comments), adds validation middleware, adds authentication middleware, and maps the endpoint to a Controller method.
2. **Validators (`src/validators/*-validator.ts`)**: Defines schemas for request validation (e.g., using Zod or Joi, depending on existing validators).
3. **Controllers (`src/controllers/*Controller.ts`)**: Handles the HTTP request/response cycle. It extracts parameters/body, calls the appropriate Service for business logic, and sends the standardized HTTP response.
4. **Services (`src/services/*Service.ts`)**: Contains the core business logic, decoupled from HTTP concerns.
5. **Database (`src/db/schema.ts` or similar)**: Contains Drizzle ORM schemas and database access logic.

## Implementation Steps

### 1. Validator
If the endpoint expects a request body or specific query parameters, define a validation schema in the appropriate `src/validators` file. Export the schema so it can be used in the router.

### 2. Controller & Service
Add a new method in the appropriate controller file in `src/controllers`. 
If complex business logic or database interaction is required, implement it in the service layer (`src/services`) and call the service method from the controller.
The controller should return a standardized JSON response:
```typescript
res.status(200).json({
  success: true,
  data: resultData
})
```
Errors should be handled by throwing exceptions (which the global error handler catches) or by returning specific error responses.

### 3. Route & Swagger Documentation
Add the route definition to the appropriate router file in `src/routes`.
Always include comprehensive Swagger (OpenAPI 3.0) JSDoc comments directly above the route definition.
Include:
- `@swagger` directive
- The endpoint path and HTTP method (e.g., `/items/create`, `post`)
- `tags`, `summary`, and `description`
- `security` (e.g., `- cookieAuth: []`) if the route is protected using `requireAuth` middleware.
- `requestBody` defining the expected JSON structure (if applicable), including examples.
- `responses` covering success (e.g., 200, 201) and error (e.g., 400, 401, 409, 422) cases. Use `$ref: '#/components/schemas/ErrorResponse'` for error schemas.

**Example Route:**
```typescript
import { validate } from '../middleware/validate'
import { requireAuth } from '../middleware/auth-middleware'

/**
 * @swagger
 * /items/create:
 *   post:
 *     tags:
 *       - Items
 *     summary: Create a new item
 *     description: Creates a new item in the database
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "My Item"
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Item'
 *       422:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/create', requireAuth, validate(createItemSchema), itemController.create)
```

## Review & Refine
Verify all imports are correct, especially for middleware like `validate` and `requireAuth`. Ensure the router object is exported and registered in the main Express app entry point if you are creating a completely new router file.
