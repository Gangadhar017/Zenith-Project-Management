import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Validation failed.',
          errors: error.issues.map((e: any) => ({
            field: e.path.slice(1).join('.'), // Remove prefix like "body"
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ message: 'Internal server validation error.' });
    }
  };
};
