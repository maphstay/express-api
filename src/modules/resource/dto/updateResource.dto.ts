import { z } from 'zod';
import { CreateResourceDto } from './createResource.dto';

export const UpdateResourceDto = CreateResourceDto.omit({ topicId: true }).partial();

export type IUpdateResourceDto = z.infer<typeof UpdateResourceDto>;
