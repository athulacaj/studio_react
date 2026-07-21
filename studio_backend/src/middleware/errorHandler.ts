import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    logger.warn({ error: err.format() }, 'Validation Error');
    return res.status(400).json({
      error: 'Validation Error',
      details: err.format(),
    });
  }

  logger.error({ err }, 'Unhandled Error');
  return res.status(500).json({
    error: 'Internal Server Error',
  });
};
