import { z } from 'zod';
import { RoleEnum } from '../user.entity';

export const CreateUserDto = z
  .object({
    name: z.string().min(1, 'Name is required').meta({ example: 'John Doe' }),
    email: z
      .email('Invalid email')
      .transform((val) => val.toLowerCase())
      .meta({ example: 'johndoe@contoso.com' }),
    role: z
      .enum(RoleEnum, { error: `Role must be one of: ${Object.values(RoleEnum).join(', ')}` })
      .meta({ example: RoleEnum.ADMIN }),
    password: z
      .string({ error: 'Password must be at least 8 characters long' })
      .min(8, 'Password must be at least 8 characters long')
      .meta({ example: 'test2025' }),
  })
  .meta({ id: 'CreateUserDto' });

export type ICreateUserDto = z.infer<typeof CreateUserDto>;
