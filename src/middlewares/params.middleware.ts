import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const paramSchemas: Record<string, z.ZodTypeAny> = {
  id: z.uuid({ message: 'ID must be a valid UUID' }),
  topicId: z.uuid({ message: 'TopicId must be a valid UUID' }),
  page: z.string().regex(/^\d+$/, 'Page must be a number').default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').default('10'),
  from: z.uuid({ message: 'From must be a valid UUID' }),
  to: z.uuid({ message: 'To must be a valid UUID' }),
};

export const validateRouteParams = (paramNames: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const name of paramNames) {
        const schema = paramSchemas[name];
        const value = req.params[name] ?? req.query[name];

        if (!schema) continue;
        schema.parse(value);
      }

      next();
    } catch (error: any) {
      const details = error.issues?.map((e: any) => e.message).join(', ') ?? error.message ?? 'Invalid value';

      return res.status(400).json({
        error: `Invalid parameter(s): ${paramNames.join(', ')}`,
        details,
      });
    }
  };
};
