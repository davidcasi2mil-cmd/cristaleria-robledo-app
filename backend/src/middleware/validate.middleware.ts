import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validar = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};
