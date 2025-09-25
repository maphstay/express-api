import { z } from 'zod';
import { CreateUserDto } from './createUser.dto';

export const UpdateUserDto = CreateUserDto.omit({ email: true }).partial().meta({ id: 'UpdateUserDto' });

export type IUpdateUserDto = z.infer<typeof UpdateUserDto>;
