import z from 'zod';

export const NotFoundResponse = (message: string) => {
  return {
    description: 'Not Found',
    content: {
      'application/json': {
        schema: z.object({
          status: z.number().default(404).meta({ description: 'HTTP status code' }),
          message: z.string().default(message).meta({ description: 'Error message' }),
        }),
      },
    },
  };
};
