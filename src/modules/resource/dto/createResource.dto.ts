import { z } from 'zod';
import { ResourceType } from '../resource.entity';

export const CreateResourceDto = z.object({
  topicId: z.uuid('Topic ID must be a valid UUID'),
  url: z.url('URL must be valid'),
  description: z.string().min(1, 'Description is required'),
  type: z.enum(ResourceType, { error: `Role must be one of: ${Object.values(ResourceType).join(', ')}` }),
});

export type ICreateResourceDto = z.infer<typeof CreateResourceDto>;
