import z from 'zod';

export const ForbiddenResponse = (message: string) => {
  return {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: z.object({
          status: z.number().default(403).meta({ description: 'HTTP status code' }),
          message: z.string().default(message).meta({ description: 'Error message' }),
        }),
      },
    },
  };
};
