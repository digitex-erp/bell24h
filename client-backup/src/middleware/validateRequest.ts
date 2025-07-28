import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// This function takes a Zod schema and returns Express middleware
export const validate = 
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse and validate the request against the provided schema
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // If validation is successful, proceed to the next middleware (the controller)
      return next();
    } catch (error) {
      // If validation fails, send a 400 Bad Request response with the errors
      return res.status(400).json(error);
    }
  };
