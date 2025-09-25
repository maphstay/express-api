import { z } from 'zod';

export const AuthLoginDto = z
  .object({
    email: z
      .string()
      .email('Invalid email format')
      .transform((val) => val.toLowerCase())
      .meta({
        description: "User's email address",
        example: 'johndoe@contoso.com',
      }),
    password: z.string({ error: 'Password is required' }).min(1, 'Password is required').meta({
      description: "User's password",
      example: 'test2025',
    }),
  })
  .meta({
    id: 'AuthLoginDto',
    description: 'Schema for user login request',
  });

export type IAuthLoginDto = z.infer<typeof AuthLoginDto>;
