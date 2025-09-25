import { z } from 'zod';

export enum RoleEnum {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export const User = z
  .object({
    id: z
      .uuid()
      .meta({ description: 'Unique identifier of the user', example: '550e8400-e29b-41d4-a716-446655440000' }),
    name: z.string().meta({ description: 'Full name of the user', example: 'John Doe' }),
    email: z.email().meta({ description: 'Email address of the user', example: 'johndoe@contoso.com' }),
    role: z
      .enum(RoleEnum, { error: `Role must be one of: ${Object.values(RoleEnum).join(', ')}` })
      .meta({ example: RoleEnum.ADMIN }),
    password: z.string().meta({ description: 'User password', example: 'test2025' }),
    createdAt: z.iso.date().meta({ description: 'Creation timestamp', example: '2025-09-24T12:00:00Z' }),
    updatedAt: z.iso.date().optional().meta({ description: 'Last update timestamp', example: '2025-09-25T12:00:00Z' }),
  })
  .meta({ id: 'UserEntity', description: 'User model' });

export type IUser = z.infer<typeof User>;
