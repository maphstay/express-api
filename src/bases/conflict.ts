import z from 'zod';

export const ConflictResponse = (message: string) => {
  return {
    description: 'Conflict',
    content: {
      'application/json': {
        schema: z.object({
          status: z.number().default(409).meta({ description: 'HTTP status code' }),
          message: z.string().default(message).meta({ description: 'Error message' }),
        }),
      },
    },
  };
};
