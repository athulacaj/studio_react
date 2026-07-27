export class AppError extends Error {
    public readonly statusCode: number
    public readonly code: string
    public readonly isOperational: boolean

    constructor(
        message: string,
        statusCode: number,
        code: string,
        isOperational = true
    ) {
        super(message)
        this.name = 'AppError'
        this.statusCode = statusCode
        this.code = code
        this.isOperational = isOperational
        Object.setPrototypeOf(this, AppError.prototype)
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string, id?: string) {
        const message = id
            ? `${resource} with id '${id}' not found`
            : `${resource} not found`
        super(message, 404, 'NOT_FOUND')
    }
}

export class BadRequestError extends AppError {
    constructor(message: string) {
        super(message, 400, 'BAD_REQUEST')
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED')
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN')
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, 'CONFLICT')
    }
}