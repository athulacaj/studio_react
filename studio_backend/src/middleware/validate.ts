import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
    (req: Request, res: Response, next: NextFunction): void => {
      try {
        const parsed = schema.parse(req[source])
        Object.defineProperty(req, source, {
          value: parsed,
          configurable: true,
          writable: true,
          enumerable: true
        })
        next()
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(422).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Validation failed',
              details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
              })),
            },
          })
          return
        }
        next(error)
      }
    }