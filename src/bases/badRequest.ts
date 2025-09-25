import z from 'zod';

export const BadRequestResponse = {
  description: 'Bad Request',
  content: {
    'application/json': {
      schema: z.object({
        status: z.number().default(400).meta({ description: 'HTTP status code' }),
        message: z.string().default('Bad Request').meta({ description: 'Error message' }),
      }),
    },
  },
};
