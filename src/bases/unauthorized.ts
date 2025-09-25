import z from 'zod';

export const UnauthorizedResponse = {
  description: 'Unauthorized',
  content: {
    'application/json': {
      schema: z.object({
        status: z.number().default(401).meta({ description: 'HTTP status code' }),
        message: z.string().default('Unauthorized').meta({ description: 'Error message' }),
      }),
    },
  },
};
